## 1. MVMM模式

### 1.1 定义

M（Model）模型 —— V（View）视图 —— VM（ViewModel）视图模型。

MVVM模式的工作特定和MVP比较类型，作用也是通过 VM 实现 M 与 V 的关联。与MVP不同的是，MVP中所有的主动权全部掌握在 P 中，合理调用 P 中的方法以控制视图更新与数据更新，而 MVVM 中，直接通过视图html内容实现视图与数据的绑定，并且也能保证 V 和 M 的分离。示意图：

![](C:/Users/86158/AppData/Roaming/Typora/typora-user-images/MVMM.png)

MVVM的关键点就是在于. 双向数据绑定与服务于V的定制的VM;

* Model视图模型.数据和业务逻辑都在Model层中定义
* View视图层. 负责视图的显示
* ViewModel赋值监听Model中的数据并且控制视图的更新,处理用户交互的操作

### 1.2MVMM的好处

Model和View并未关联, 他们通过ViewModel来进行联系, Model和ViewModel之间存在着双向数据绑定的联系, 每当Model中数据发生改变时,View中用于用户交互操作而改变数据的操作也会在Model中同步更新.

这种开发模式,实现了Model和View的数据自动同步,开发者只需要专注对数据的操作维护即可, 而不需要自己操作DOM,较大的提高了开发效率.

### 1.3 MVMM的简单实现原理

在主流框架中,Vue使用的是数据劫持的方法实现双向双向绑定, 在Vue3.0之前Vue.js采用的是Object.defineProperty()来劫持各个属性的setter. getter, 在数据变动时发布消息给订阅者,触发相应的监听回调.

要实现双向数据绑定必须实现以下几点

1. 实现一个数据的监听器,能够对数据对象的所有属性进行监听, 如果有对应的变动可拿到最新值并通知对应的订阅者,
2. 实现一个指令的解析器Compile, 对每个元素节点的指令进行扫描和更新, 根据指定模板更新视图,以及相应的事件绑定操作.
3. 实现一个观察者observer,作为连接数据监听器和Compile的桥梁,能够订阅收到每个属性变动的通知, 从而更新相应的视图

### 1.4 起步

####  实现基本的结构

```js

class MVVM {
    constructor(options) {
        // 校验options的参数类型
        if (isObject(options) !== "[object Object]") throw new Error('type error');
        const {data, el,methods={} } = options;
        this.$data = data;
        this.methods = methods;
        this._proxyData(this.$data);
        this.$el = document.querySelector(el);
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
// 校验参数的类型是否为对象
function isObject(target) {
    return Function.prototype.call.bind(Object.prototype.toString)(target)
}
```

#### 实现最基本的观察者

通过subscribes来存储对应的订阅者,我们在解析DOM模板时,对给定的key订阅对应的改变视图操作. 并在数据触发set时发布对应事件处理函数并传参.

```js
// 观察者
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
        if (!this.has(name)) throw new Error('未找到订阅者');;
        // 执行对应的回调,并传递定义的参数
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
    },
    // 判断是否存在对应的订阅者
     has(name){
          return Reflect.has(this.subscribes,name)
      }
};

```

我们都知道在Vue3.0中使用的是Proxy实现数据的劫持. Proxy是Es6的新特性,Proxy对象用于定义基本操作的自定义行为, 它可以定制对象的读写操作,实现适合实现对数据的劫持.

下面是一个简单的实例.

```js
let obj = {name:'张三'};
let proxy = new Proxy(obj,{
    set(target,key,val){
        console.log('属性name发生了改变')
        Reflect.set(target,key,val)
        return true
    },
    ge(target,key){
        return Reflect.get(target,key)
    }
})
proxy.name = "434"
```

当我们通过对Proxy构造函数返回的实例对象进行读写操作时,会触发对应的方法,上面代码我们改变了proxy实例对象的name属性,它的自动触发Proxy构造函数handler 里面的的set方法, 实现对象数据的监听.Proxy代理默认只能代理一层, 此时我们可以通过递归实现对深层的数据的监听.

#### 通过Proxy对数据进行劫持

```js
 class DeepProxy {
     constructor(data, handler) {
         // 显示返回proxy对象
         return this.toDeepProxy(data, handler)
     }
     toDeepProxy(target, handler) {
         Object.keys(target).forEach(key => {
             // 如果属性值类型为对象增递归监听
             if (typeof target[key] == 'object') {
                 target[key] = this.toDeepProxy(target[key], handler);
             }
         });
         return new Proxy(target, handler)
     }
 }
```

接下来我们在MVMM构造函数中中实例化DeepProxy类, 并赋值给MVVM实例的$data属性, 并通过this._proxyData方法将$data中的属性挂载到实例对象上, 通过操作实例对象上的属性我们可以实现对数据的监听.

```js
this.$data = new DeepProxy(this.$data,{
    set(target, key, val) {//当通过vm.xx ='44'触发set方法
        console.log(`属性${key}发生了改变`)
        //设置对应的属性值
        Reflect.set(target, key, val)
        return true
    },
    ge(target, key) {// 当获取vm身上对应的属性值是触发get方法
        // 返回的属性值
        return Reflect.get(target, key)
    }
})
// 将data中属性设置到实例对象上, 方便通过vm.xx读写
this._proxyData(this.$data);
```

```js
let vm = new MVVM({
    el: '#app',
    data:{
        name:"张三",
        age:'43',
        student:{
            name:'43',
            list:[43,4,4]
        }
    },
});
vm.age = 43;// 属性age发生了改变
vm.student.name = "李四"// 对象student的属性name发生了改变
```

当我们通过vm.age改变实例上的数据时,此时我们可以很清楚得知道设置的属性age在data上具体位置,但是当我们通过vm.student.name深层设置对象对应的数据时,此时我们在set方法总的target为student对象, key为name, 此时我们很难知道当前的设置的key具体在什么位置.所以这里要实现一个当set方法触发时, 找到key对应在实例上的具体位置,方便我们通过emit找到触发对应的订阅者.

我们可以通过遍历当前data对象中的key, 判断当前key是否与set触发时传入的p相等和对应的value值是否也相等, 如果对应的value为对象则递归遍历, 并把对应的key传入到下一次的判断中.

比如当我们通过student.name设置实例上的数据时,此时我们希望获取student.name这个类似的字符串, 因为我们通过mustache语法插值的对应的数据就为xx.xx.xx的格式,我们在编译模板时,由于我们是通过这个xx.xx格式的字符串作为observer.on对应name值进行订阅. 此时我们在set中emit时我们也得通过对应的xxx.xx格式的key找到对应的观察者并触发视图的更新.

```js
//通过将obj.xx.xx形式的key利用split切割并利用reduce方法
//获取深层对象的value值
function getVal(key, data) {
    return key.split('.').reduce((data, current) => {
        return data[current]
    }, data);
}
//data为当前的遍历对象, p为set触发时的传入的key, val为对应设置的属性值
// result表示上一级的key, obj为原始的数据data
function getDeepProperty(data, p, val, result,obj) {
    for (let key of Object.keys(data)) {
        // 如果属性值为对象则递归遍历, 并传入当前key.便于递归查找
        if (typeof data[key] === 'object') {
            result = result ? result + `.${key}` : key;
            return getDeepProperty(data[key], p, val, result,obj);
        }
        // 如果存在result则拼接出类似student.name
        if (result) {
            let oldKey = key
            key = result + `.${key}`;
            let value = getVal(key, obj);
            // 如果对应的key和p, val和value相等则返回key
            // 否者将 result 清空
            if (value === val && oldKey === p){
                return key
            } {
                result = null
            }
        } else {
            let value = getVal(key, obj);
            if (val == value && p === key) {
                return key
            }
        }
    }
}
```

接下来我们在MVMM类构造函数中调用

```js
let self = this;
this.$data = new DeepProxy(this.$data, {
    set(target, p, value) {
        Reflect.set(target, p, value);
        //深度获取当前设置的属性在实例对象上的位置
        p = getDeepProperty(self.$data, p, value, "", self.$data);
        // 当存在对应订阅者时, 触发回调并传入新数据
        observer.has(p) ? observer.emit(p, value) : ''
        return true
    },
    ge(target, key) {
        return Reflect.get(target, key)
    }
})
this._proxyData(this.$data);
```

接下来我们实现Compiler来进行模板的解析.绑定对应的事件处理函数,解析对应的指令,以及相应的mustache语法解析,并订阅相应的观察者,触发视图的更新.

#### 实现Compiler类

```js
class Compiler {
    static compilerUtil = {
        fnList: [ // 保存所有解析模板的函数
            function model(el, vm) { // 解析v-model指令
                // 获取对应的v-mode属性值xx  v-model="xx"
                let modelKey = el.getAttribute('v-model');
                //如果存在对应的属性值
                if (modelKey) {
                    //利用reduce 获取实例对象深层的属性值
                    el.value = this.getVal(modelKey, vm);
                    // 删除节点的v-mode指令
                    el.removeAttribute("v-model")
                    // 拼接出vm.xx.xx类似的字符串
                    let property = "vm.$data." + modelKey;
                    // 视图 => 数据 数据=> 视图
                    // 绑定input事件监听输入框的value值,并改变实例上对应的数据
                    el.addEventListener('input', ev => {
                        let value = ev.target.value;
                     // 通过eval函数将 vm.xx.xx=xx类型的字符串当做表达式调用
                        eval(`${property}='${value}'`)
                    });
                    observer.on(modelKey, (val) => {
                        el.value = val;
                    })
                }
            },
            function Bind(el, vm, attr) {
                // 将自定义的v-bind:xx==xx 属性的key和value解构出来, name即v-bind, value即xx
                const {name,value } = attr;
                // 如果name中存在v-bind 或者以:开头时进行相应的绑定
                if (name.includes('v-bind') || name.startsWith(":")) {
                    //  v-bind:xx中将对应的属性名xx解构出来
                    let [, key] = name.split(":");
                    // 获取对应的数据
                    let res = this.getVal(value, vm);
                    // 删除指令
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
                let reg = /{{(.+?)}}/g; // 全局匹配 {{xx.xx}}的正则
                // 如果不为元素节点, 即为文本节点
                if (!Compiler.isElement(el)) {
                    //利用matchAll全局匹配
                    let matches = [... el.textContent.matchAll(reg)];
                    matches.forEach(item =>{
                        // 取出{{xx}}中对应的xx
                        let key = item[1]
                        // 订阅数据变化
                        observer.on(key, val => {
                          el.textContent = val
                        });
                        // 设置节点的文本
                         this.setText(el, vm, key)
                    });
                }
            },
            // 处理事件绑定
            function onEvent(el, vm, property) {
                // 解构出对应的name和value
                let { name,value} = property;
                // 如果name包含v-on 或者为@开头时, 绑定对应的事件
                if (name.includes('v-on') || name.startsWith("@")) {
                    // 保存对应的事件名
                    let eventName = null
                    if (name.startsWith("@")) {
                        [, eventName] = name.split("@");
                    } else {
                        [, eventName] = name.split(":");
                    };
                    // 从实例对象中取出对应的事件执行函数
                    let fn = vm.methods[value];
                    // 处理@click="handler(xx.x,12)"类型的事件的正则
                    let reg = /([a-z]+)\((.+?)\)/,
                        arg = null;// 对的参数集合
                    // 如果为v-on:click="xx(xx,xx)"格式的事件
                    if (reg.test(value)) {
                        let res = value.match(reg),
                            key = res[1],// 取出对应的事件函数名
                            args = res[2];// 对应的参数集合
                        let fn = vm.methods[key];
                        // 如果参数集合的length>1, 则利用reduce取出所有的参数
                        if (args.split(',').length > 1) {
                            args = args.split(",").reduce((total, arg) => {
                                let val = this.getVal(arg, vm);
                                // 如果存在对应的数据则添加到total, 否者添加arg
                                if (val) {
                                    total.push(val)
                                } else {
                                    total.push(arg)
                                }
                                return total
                            }, [])
                            // 利用bind绑定对应的this, 并传递对应的参数集合
                            el.addEventListener(eventName, fn.bind(vm, ...args), false)
                        } else {
                            let res = this.getVal(args, vm)
                            // res为undefined, 则将args添加到参数集合中
                             args = res ? res : args;
                            el.addEventListener(eventName, fn.bind(vm, args), false)
                        }
                    } else {
                        // 当没有传递任何参数时, 直接绑定对应的时间爱你
                        el.addEventListener(eventName, ev => {
                            fn.call(vm, ev)
                        })
                    }
                }
            },
        ],
        //设置节点的文本
        setText(el, vm, key) {
            el.textContent = this.getVal(key, vm)
        },
        init(el, vm) {
            //取出当前节点所以的标签属性集合
            let attrs = el.attributes;
            // 遍历解析DOM的函数
            this.fnList.forEach(fn => {
                // 遍历attrs并调用fn,并将fn内部this指向compilerUtil,并传入对应的attr
                [...attrs].forEach(attr => {
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
        //将文档碎片追加到根元素中
        this.$el.appendChild(fragment)
    }
    createFragment() {
        // 创建文档碎片
        let fragment = document.createDocumentFragment();
        // 将所有的根元素的子节点追加到文档碎片中
        [...this.$el.childNodes].forEach(child => {
            fragment.append(child);
        });
        // 返回文档碎片
        return fragment;
    }
    compilerFragment(nodeList) {
        nodeList.forEach(node => {
            // 如果为元素节点则进行编译
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
        // 取出fnList中解析文本的函数
        const { fnList  } = Compiler.compilerUtil;
        if (reg.test(text)) {
            // 将解析文本的函数内部this指向当Compiler.compilerUtil, 方便调用对应的方法
            fnList[2].call(Compiler.compilerUtil, node, vm)
        }
    }
	// 判断节点是否为元素节点
    static isElement = (node) => {
        return node instanceof Element
    }
}
```

下面是完整的代码

```js
 class Compiler {
     static compilerUtil = {
         fnList: [ // 保存所有解析模板的函数
             function model(el, vm) { // 解析v-model指令
                 // 获取对应的v-mode属性值xx  v-model="xx"
                 let modelKey = el.getAttribute('v-model');
                 //如果存在对应的属性值
                 if (modelKey) {
                     //利用reduce 获取实例对象深层的属性值
                     el.value = this.getVal(modelKey, vm);
                     // 删除节点的v-mode指令
                     el.removeAttribute("v-model")
                     // 拼接出vm.xx.xx类似的字符串
                     let property = "vm.$data." + modelKey;
                     // 视图 => 数据 数据=> 视图
                     // 绑定input事件监听输入框的value值,并改变实例上对应的数据
                     el.addEventListener('input', ev => {
                         let value = ev.target.value;
                         // 通过eval函数将 vm.xx.xx=xx类型的字符串当做表达式调用
                         eval(`${property}='${value}'`)
                     });
                     observer.on(modelKey, (val) => {
                         el.value = val;
                     })
                 }
             },
             function Bind(el, vm, attr) {
                 // 将自定义的v-bind:xx==xx 属性的key和value解构出来, name即v-bind, value即xx
                 const { name, value } = attr;
                 // 如果name中存在v-bind 或者以:开头时进行相应的绑定
                 if (name.includes('v-bind') || name.startsWith(":")) {
                     //  v-bind:xx中将对应的属性名xx解构出来
                     let [, key] = name.split(":");
                     // 获取对应的数据
                     let res = this.getVal(value, vm);
                     // 删除指令
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
                 let reg = /{{(.+?)}}/g; // 全局匹配 {{xx.xx}}的正则
                 // 如果不为元素节点, 即为文本节点
                 if (!Compiler.isElement(el)) {
                     //利用matchAll全局匹配
                     let matches = [...el.textContent.matchAll(reg)];
                     matches.forEach(item => {
                         // 取出{{xx}}中对应的xx
                         let key = item[1]
                         // 订阅数据变化
                         observer.on(key, val => {
                             el.textContent = val
                         });
                         // 设置节点的文本
                         this.setText(el, vm, key)
                     });
                 }
             },
             // 处理事件绑定
             function onEvent(el, vm, property) {
                 // 解构出对应的name和value
                 let { name, value } = property;
                 // 如果name包含v-on 或者为@开头时, 绑定对应的事件
                 if (name.includes('v-on') || name.startsWith("@")) {
                     // 保存对应的事件名
                     let eventName = null
                     if (name.startsWith("@")) {
                         [, eventName] = name.split("@");
                     } else {
                         [, eventName] = name.split(":");
                     };
                     // 从实例对象中取出对应的事件执行函数
                     let fn = vm.methods[value];
                     // 处理@click="handler(xx.x,12)"类型的事件的正则
                     let reg = /([a-z]+)\((.+?)\)/,
                         arg = null;// 对的参数集合
                     // 如果为v-on:click="xx(xx,xx)"格式的事件
                     if (reg.test(value)) {
                         let res = value.match(reg),
                             key = res[1],// 取出对应的事件函数名
                             args = res[2];// 对应的参数集合
                         let fn = vm.methods[key];
                         // 如果参数集合的length>1, 则利用reduce取出所有的参数
                         if (args.split(',').length > 1) {
                             args = args.split(",").reduce((total, arg) => {
                                 let val = this.getVal(arg, vm);
                                 // 如果存在对应的数据则添加到total, 否者添加arg
                                 if (val) {
                                     total.push(val)
                                 } else {
                                     total.push(arg)
                                 }
                                 return total
                             }, [])
                             // 利用bind绑定对应的this, 并传递对应的参数集合
                             el.addEventListener(eventName, fn.bind(vm, ...args), false)
                         } else {
                             let res = this.getVal(args, vm)
                             // res为undefined, 则将args添加到参数集合中
                             args = res ? res : args;
                             el.addEventListener(eventName, fn.bind(vm, args), false)
                         }
                     } else {
                         // 当没有传递任何参数时, 直接绑定对应的时间爱你
                         el.addEventListener(eventName, ev => {
                             fn.call(vm, ev)
                         })
                     }
                 }
             },
         ],
         //设置节点的文本
         setText(el, vm, key) {
             el.textContent = this.getVal(key, vm)
         },
         init(el, vm) {
             //取出当前节点所以的标签属性集合
             let attrs = el.attributes;
             // 遍历解析DOM的函数
             this.fnList.forEach(fn => {
                 // 遍历attrs并调用fn,并将fn内部this指向compilerUtil,并传入对应的attr
                 [...attrs].forEach(attr => {
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
    //将文档碎片追加到根元素中
    this.$el.appendChild(fragment)
}
createFragment() {
    // 创建文档碎片
    let fragment = document.createDocumentFragment();
    // 将所有的根元素的子节点追加到文档碎片中
    [...this.$el.childNodes].forEach(child => {
        fragment.append(child);
    });
    // 返回文档碎片
    return fragment;
}
compilerFragment(nodeList) {
    nodeList.forEach(node => {
        // 如果为元素节点则进行编译
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
    // 取出fnList中解析文本的函数
    const { fnList } = Compiler.compilerUtil;
    if (reg.test(text)) {
        // 将解析文本的函数内部this指向当Compiler.compilerUtil, 方便调用对应的方法
        fnList[2].call(Compiler.compilerUtil, node, vm)
    }
}
// 判断节点是否为元素节点
static isElement = (node) => {
    return node instanceof Element
}
}
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
        if (!this.has(name)) throw new Error('未找到订阅者');;
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
    // 判断是否存在对应的订阅者
    has(name){
        return Reflect.has(this.subscribes,name)
    }
};
//通过将obj.xx.xx形式的key利用split切割并利用reduce方法
//获取深层对象的value值
function getVal(key, data) {
    return key.split('.').reduce((data, current) => {
        return data[current]
    }, data);
}
//data为当前的遍历对象, p为set触发时的传入的key, val为对应设置的属性值
// result表示上一级的key, obj为原始的数据data
function getDeepProperty(data, p, val, result, obj) {
    for (let key of Object.keys(data)) {
        // 如果属性值为对象则递归遍历, 并传入当前key.便于递归查找
        if (typeof data[key] === 'object') {
            result = result ? result + `.${key}` : key;
            return getDeepProperty(data[key], p, val, result, obj);
        }
        // 如果存在result则拼接出类似student.name的字符串
        if (result) {
            let oldKey = key
            key = result + `.${key}`;
            let value = getVal(key, obj);
            // 如果对应的key和p, val和value相等则返回key
            // 否者就将result 清空
            if (value === val && oldKey === p){
                return key
            } {
                result = null
            }
        } else {
            // 如果不存在result 
            let value = getVal(key, obj);
            if (val == value && p === key) {
                return key
            }
        }
    }
}
class MVVM {
    constructor(options) {
        // 校验options的参数类型
        if (isObject(options) !== "[object Object]") throw new Error('type error');
        // 将参数, data, method 解构出来
        const {data={},el=null, methods = {}} = options;
        this.$data = data;
        this.methods = methods
        this.$el = document.querySelector(el);
        let self = this;
        this.$data = new DeepProxy(this.$data, {
            set(target, p, value) {
                Reflect.set(target, p, value);
                p = getDeepProperty(self.$data, p, value, "", self.$data);
                // 如果存在对应的订阅者则进行发布
                observer.has(p) ? observer.emit(p, value) : ''
                return true
            },
            ge(target, key) {
                return Reflect.get(target, key)
            }
        })
        this._proxyData(this.$data);
        // 编译模板
        new Compiler(this.$el, this)
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
// 校验参数的类型是否为对象
function isObject(target) {
    return Function.prototype.call.bind(Object.prototype.toString)(target)
}
class DeepProxy {
    constructor(data, handler) {
        // 显示返回proxy对象
        return this.toDeepProxy(data, handler)
    }
    toDeepProxy(target, handler) {
        Object.keys(target).forEach(key => {
            // 如果属性值类型为对象增递归监听
            if (typeof target[key] == 'object') {
                target[key] = this.toDeepProxy(target[key], handler);
            }
        });
        return new Proxy(target, handler)
    }
}
```



```html
    <div id="app">
        <a v-bind:href="href">链接</a>
        <label>
            <input type="text" v-model="student.name" value="aa" />
            <p>{{student.name}}</p>
        </label>
        <img :src="url" alt="">
        <p>{{text}}</p>
        {{name}}
        <div>{{href}}</div>
        <h2>{{count}}</h2>
        <button @click="change(2)">加加</button>
    </div>
```

接下来我们在js中使用写好的MVMM类

```js
let vm = new Vue({
    el: '#app',
    data: {
        name: '张三',
        href: 'www.baidu.com',
        text: '这是一条文本',
        url: 'https://dss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3363295869,2467511306&fm=26&gp=0.jpg',
        student: {
            name: '小明',
        },
        count: 0,
        studentList: ["小明", "校长", "小红"],
    },
    methods: {
        change(num) {
            num = Number(num);
            this.count+= num;
            this.name = "李四"
            this.text = "这是新文本";
            this.href = "https://www.bilibili.com/"
            this.url = "https://dss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1819216937,2118754409&fm=26&gp=0.jpg"
        },
    }
});
```

此时我们可以当我们点击按钮时, 页面内容会会自动发生更新.

**总结**: 上面代码中, 我们实现了简单的MVMM模型, 我们利用了观察者的发布订阅来订阅了数据的更新, 当我们触发了set时, 会触发对应的emit发布, 通知对应的订阅者来更新相应的视图.利用MVMM模式, 我们可以实现将视图和数据的完全分离,使得mode和view可以独立的变化和修改.当model发生改变时, 会自动得进行视图的相应更新.

