 class MVVM {
            constructor(options) {
                // 校验options的参数类型
                if (isObject(options) !== "[object Object]") throw new Error('type error');
                const {
                    data,
                    el,
                    methods = {}
                } = options;
                this.$data = data;
                this.methods = methods
                this.$el = document.querySelector(el);
                let self = this;
                this.$data = new DeepProxy(this.$data, {
                    set(target, p, value) {
                        Reflect.set(target, p, value);
                        p = getDeepProperty(self.$data, p, value, "", self.$data);
                        observer.has(p) ? observer.emit(p, value) : ''
                        return true
                    },
                    ge(target, key) {
                        return Reflect.get(target, key)
                    }
                })
                this._proxyData(this.$data);
                new Compiler(this.$el, this)
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
 