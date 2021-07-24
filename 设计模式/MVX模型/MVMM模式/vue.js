// 进阶版观察者
let observer = new class Observer {
    constructor() {
        //储存订阅者
        this.subscribes = {}
    }
    //订阅
    on(name, callback) {
        // 如果不存在这个订阅者就添加这个订阅者
        if (!this.subscribes[name]) {
            this.subscribes[name] = [];
        }
        this.subscribes[name].push(callback)
    }
    // 发布
    emit(name, msg) {
        // 如果不存在这个订阅者就打断函数执行
        if (!this.subscribes[name]) throw new Error('未找到订阅者');;
        this.subscribes[name].forEach(fn => fn(msg))
    }
    //解绑
    off(name, callback) {
        let callbackList = this.subscribes[name];
        if (!callbackList) throw new Error('未找到订阅者');
        // 找出对应订阅者的事件函数并从删除
        let index = callbackList.indexOf(callback);
        if (index === 1) return false;
        else callbackList.splice(index, 1)
    }
};
 function getVal(key, data) {
    return key.split('.').reduce((data, current) => {
        return data[current]
    }, data);
}
function getDeepProperty(data, p, val, result,obj) {
    for (let key of Object.keys(data)) {
        if (typeof data[key] === 'object') {
            result = result ? result + `.${key}` : key;
            return getDeepProperty(data[key], p, val, result,obj);
        }
        if (result) {
            let oldKey = key
            key = result + `.${key}`;
            let value = getVal(key, obj);
            if (value === val && oldKey === p) return key
        } else {
            let value = getVal(key, obj);
            if (val == value && p === key) {
                return key
            }
        }
    }
}
class Vue {
    constructor(options) {
        // 校验options的参数类型
        if (isObject(options) !== "[object Object]") throw new Error('type error');
        const {
            data,
            el,
            methods
        } = options;
        this.$data = data;
        this.methods = methods
        this.$el = document.querySelector(el);
        let self = this;
        this.$data = Vue.toDeepProxy(this.$data, {
            set(target, p, value) {
                target[p] = value;
                self[p] === value 
                    ? observer.emit(p,value) 
                    : observer.emit(getDeepProperty(self.$data, p, value, "",self.$data), value);
                return true
            },
            get(target, p) {
                return target[p]
            }
        }, {});
        this._proxyData(this.$data);
        new Compiler(this.$el, this)
    }
    static toDeepProxy(target, handler) {
        Object.keys(target).forEach(key => {
            if (typeof target[key] == 'object') {
                target[key] = Vue.toDeepProxy(target[key], handler);
            }
        });
        return new Proxy(target, handler)
    }
    _proxyData(data) {
        // 遍历data属性的key, 利用Object,definePrototype 进行数据劫持
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                set(newVal) {
                    if (newVal !== data[key]) data[key] = newVal;
                },
                get() {
                    return data[key]
                }
            })
        })
    }
}
class Compiler {
    static compilerUtil = {
        fnList: [ // 保存所有解析指令的函数
            function model(el, vm) { // 解析v-model指令
                let modelKey = el.getAttribute('v-model');
                if (modelKey) {
                    //利用reduce 获取实例对象深层的属性值
                    el.value = this.getVal(modelKey, vm);
                    el.removeAttribute("v-model")
                    //拼接处vm.xx.xx类型的字符串, 深层设置实例上的数据
                    let property = "vm." + modelKey;
                    el.addEventListener('input', ev => {
                        let value = ev.target.value;
                        // 通过eval函数将 vm.xx.xx=xx类型的字符串当做表达式调用
                        eval(`${property}='${value}'`);
                    });
                    observer.on(modelKey, (val) => {
                        el.value = val;
                    })
                }
            },
            function Bind(el, vm, attr) {
                // 将自定义的v-bind:xx==xx 属性的key和value解构出来, name即v-bind, value即xx
                const {
                    name,
                    value
                } = attr;
                if (name.includes('v-bind') || name.startsWith(":")) {
                    let [, key] = name.split(":");
                    let res = this.getVal(value, vm);
                    el.setAttribute(key, res);
                    // 订阅数据变化
                    observer.on(value, val => {
                        el.setAttribute(key, val);
                    })
                    // 删除指令
                    el.removeAttribute(name)
                }
            },
            //解析 mustache 语法
            function mustache(el, vm) {
                let reg = /{{(.+?)}}/g; // 匹配 {{xx.xx}}的正则
                if (!Compiler.isElement(el)) {
                    let matches = [... el.textContent.matchAll(reg)];
                    matches.forEach(item =>{
                        let key = item[1]
                        observer.on(key, val => {
                          el.textContent = val
                        });
                       this.setText(el, vm, key)
                    });
                    
                }
            },
            function onEvent(el, vm, property) {
                let {
                    name,
                    value
                } = property;
                if (name.includes('v-on') || name.startsWith("@")) {
                    let eventName = null
                    if (name.startsWith("@")) {
                        [, eventName] = name.split("@");
                    } else {
                        [, eventName] = name.split(":");
                    };
                    let fn = vm.methods[value];
                    let reg = /([a-z]+)\((.+?)\)/,
                        arg = null;
                    if (reg.test(value)) {
                        let res = value.match(reg),
                            key = res[1],
                            args = res[2];
                        let fn = vm.methods[key];
                        if (args.split(',').length > 1) {
                            args = args.split(",").reduce((total, arg) => {
                                let val = this.getVal(arg, vm)
                                if (val) {
                                    total.push(val)
                                } else {
                                    total.push(arg)
                                }
                                return total
                            }, [])
                            el.addEventListener(eventName, fn.bind(vm, ...args), false)
                        } else {
                            /*
                                如果只有一个参数时,获
                            
                            */
                            let res = this.getVal(args, vm)
                            args = res  !== undefined ? res : args;
                            el.addEventListener(eventName, fn.bind(vm, args), false)
                        }
                    } else {
                           // 当没有传递任何参数时, 直接绑定对应的事件处理函数, 
                        el.addEventListener(eventName, ev => {
                            fn.call(vm, ev)
                        })
                    }
                }

            },
            function handleFor(el, vm, attr) {
                const {
                    name,
                    value
                } = attr;
                if (name.includes('v-for')) {
                    let [val, key] = value.split("in");
                    key = key.replace(/\s+/g, "");
                    let reg = /{{(.+?)}}/
                    let parenChild = el.parentElement,
                        tagName = el.nodeName,
                        data = this.getVal(key, vm);
                    parenChild.removeChild(el);
                    let fragment = document.createDocumentFragment();
                    for (let p of Object.keys(data)) {
                        let ele = document.createElement(tagName);
                        ele.textContent = data[p];
                        observer.on(key + `.${p}`, (val) => {
                            if (!!val === false) {
                                ele.parentElement.removeChild(ele)
                            }
                            ele.textContent = val;
                        })
                        fragment.append(ele)
                    }
                    parenChild.appendChild(fragment)
                }
            }
        ],
        setText(el, vm, key) {
            let val = this.getVal(key, vm);
            el.textContent = val  !== undefined ? val : ''
        },
        init(el, vm) {
            let attrs = el.attributes;
            this.fnList.forEach(fn => {
                [...attrs].forEach(attr=> {
                    fn.call(this, el, vm, attr)
                })
            })
        },
        // 获取实例对象深层的属性值 例如xxx.xxx.xxx类似的值
        getVal(key, vm) {
            return key.split('.').reduce((data, current) => {
                return data[current]
            }, vm.$data);
        },
    };
    constructor(el, vm) {
        this.$el = el;
        this.vm = vm;
        // 解析文档碎片 减少文档重排重绘
        const fragment = this.createFragment();
        // 解析文档碎片
        this.compilerFragment([...fragment.childNodes]);
        this.$el.appendChild(fragment)
    }
    createFragment() {
        // 创建文档碎片
        let fragment = document.createDocumentFragment();
        [...this.$el.childNodes].forEach(child => {
            fragment.append(child);
        });
        // 返回文档碎片
        return fragment;
    }
    compilerFragment(nodeList) {
        nodeList.forEach(node => {

            // 如果为元素节点
            if (Compiler.isElement(node)) {
                Compiler.compilerUtil.init(node, this.vm)
            } else {
                this.compilerText(node, this.vm)
            }
            // 如果子节点还有子节点元素就递归遍历该子节点
            if (node.childNodes.length) {
                this.compilerFragment([...node.childNodes], this.vm);
            }
        })
    }
    compilerText(node, vm) {
        const text = node.textContent;
        let reg = /{{(.+?)}}/; // 匹配 {{xx.xx}}的正则
        const {
            fnList
        } = Compiler.compilerUtil;
        if (reg.test(text)) {
            fnList[2].call(Compiler.compilerUtil, node, vm)
        }
    }
    static isElement = (node) => {
        return node instanceof Element
    }
}
// 校验参数的类型是否为对象
function isObject(target) {
    return Function.prototype.call.bind(Object.prototype.toString)(target)
}