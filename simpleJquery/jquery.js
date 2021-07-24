(function () {
    function Jquery(selector) {
        if (!(this instanceof Jquery)) {
            return new Jquery.fn.init(selector,[])// 手动new一下 init构造函数
        }
    }
    Jquery.fn = Jquery.prototype;
    Jquery.fn.init = function (selector,content) {
        let length = null;
        if (typeof selector !== 'string') {
            if ('nodeName' in selector) {// 如果传入的是一个DOM对象 说明它有 nodename 属性
                content.push.call(this,selector)
                length = 1
            } else {
                for (const [index, item] of Object.entries(selector)) {
                    content.push.call(this,item)
                }
                length = selector.length
            }
        } else {
            const dom = document.querySelectorAll(selector)
            dom.forEach((item, index) => this[index] = item)
            length = dom.length
        }
        this.length = length
        this.__proto__.splice  =  content.splice
    }
    Jquery.fn.init.prototype = Jquery.fn;
    const prototypeMethods = { // 用于保存原型的方法
        click(callback) {
            getDom(this).forEach(item => {
                item.onclick = function (ev) {
                    callback.call(this, ev)
                }
            })
            return this
        },
        each(callback) {
            getDom(this).forEach((item,index) =>{
                callback(item,index)
            })
            return this
        },
        css() {
            let args = Array.prototype.slice.call(arguments, 0)
            if (typeof args[0] !== 'object') {
                let [key, val] = args
                getDom(this).forEach(item => {
                    item.style[key] = val
                })
            } else {
                let params = JSON.stringify(args[0]);
                let res = params.slice(1, params.length - 1)
                let CssStyle = res.replace(/,/g, (item) => {
                    return item = ';'
                }).replace(/"/g, (target) => {
                    return target = ""
                })
                getDom(this).forEach((item) => {
                    item.style.cssText = CssStyle
                })
            }
            return this
        },
        addClass(name){
            getDom(this,(item,index) =>{
                item.classList.add(name)
            })
            return this
        },
        removeClass(name){//
            getDom(this,(item,index) =>{
                item.classList.remove(name)
            })
            return this
        },
        children(){
            let length = this.length;
            if(length > 1){
                getDom(this,(item,index) =>   [].pop.call(this)  )
                return this
            }
          const children =  getDom(this)[0].children;
            if(!children.length){
                [].pop.call(this)
                return this
            }else{
                [].pop.call(this)
                for(let [index,item] of Object.entries(children)){
                    console.log(item);
                    [].push.call(this,item)
                }
                return this
            }
        }
    }
    function getDom(obj,callback) {
        callback = callback || function(){};
        let list =  Array(obj.length).fill('').map((item, index) => item = obj[index])
        list.forEach((item,index) => {
            callback(item,index)
        })
        return list
    }
    function minxi(obj) {// 将 方法混入到 实例对象的原型上
        console.log(obj);
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                Jquery.fn[key] = obj[key]
            }
        }
    }
    minxi(prototypeMethods)
    window.$ = window.Jquery = Jquery
})(window)