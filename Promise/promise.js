class _Promise {
    static PENGIND = 'PENDING';// 准备状态常量
    static FULFILLED = 'FULFILLED';// 成功状态
    static REJECTED = 'REJECTED';//拒绝状态
    constructor(executor) {
        this.status = _Promise.PENGIND;// 定义promise 状态, 默认为 准备状态
        this.value = undefined; //     保存状态成功时传递的值
        this.reason = undefined; // 保存状态拒绝时传递的值
        this.onResloveCallbackS = [];  // 保存状态成功的回调函数
        this.onRejectEdCallbackS = []; //保存状态拒绝的回调函数
        //用于class 默认使用严格模式, 所有需要手动绑定this
        const resolve = this.reslove.bind(this)
        const reject = this.reject.bind(this);
        try {
            executor(resolve, reject)// 传入两个方法
        } catch (error) {// 当executor报错时把 错误值传递给解决方法
            reject(error)
        }
    }
     reslove(value) {
        // 当状态为等待状态时改变promise实例状态为 成功
        if (this.status === _Promise.PENGIND) {
            this.status = _Promise.FULFILLED
            this.value = value;
            // 异步执行then方法里的成功方法
            setTimeout(() => {
                this.onResloveCallbackS.map(callback => callback.onFulfilled(this.value))
            });
        }
    }
     reject(reason) {
        // 当状态为等待状态时改变promise实例状态为拒绝
        if (this.status === _Promise.PENGIND) {
            this.status = _Promise.REJECTED
            this.reason = reason;
            // 异步执行then方法里的拒绝方法, 
            setTimeout(() => {
                //  把then里面的回调函数进行执行并传参
                this.onRejectEdCallbackS.map(callback => callback.onRejected(this.reason))
            })
        }
    }
    //  默认返回 实例对象上的用于保存状态所对应的值, 实现then方法的穿透
    then(onFulfilled = () => this.value, onRejected = () => this.reason) {// 给then方法内的两个回调函数添加默认值
        //  如果传递参数的类型不是函数, 就抛出一个错误
        if (typeof onRejected !== "function" || typeof onRejected !== "function") {
            throw new Error('The argument type must be a function')
        }
        let promise =  new _Promise((reslove, reject) => {
               //当状态为准备时, 将then内部的函数放在状态改变时执行
            if (this.status === _Promise.PENGIND) {
                this.onResloveCallbackS.push({
                    onFulfilled: value => {// value 会接受promise状态改变时传递的值
                        this.parse(promise,onFulfilled(value), reslove, reject)
                    }
                })
                this.onRejectEdCallbackS.push({
                    onRejected: reason => {
                        this.parse(promise,onRejected(reason), reslove, reject);
                    }
                })
            }
            //当Promise实例状态为成功时调用onfulfilled函数, 并传入实例对象上的value值
            if (this.status === _Promise.FULFILLED) {
                // 异步执行 then方法里的回调函数
                setTimeout(() => {
                    this.parse(promise,onFulfilled(this.value), reslove, reject);
                });
            }
            if (this.status === _Promise.REJECTED) {
                setTimeout(() => {
                    this.parse(promise,onRejected(this.reason), reslove, reject);
                });
               
            }
        })
        return promise // 返回新的promise
    }
    parse(promise,result,reslove,reject){//
        if(promise === result){ // 对then 返回的值进行约束,不能返回自己的promise, 否者抛出错误
            throw new TypeError('Chaining cycle detected for promise #<Promise>')
        }
        console.log(result);
        try {// 状态执行时进行trycatch 捕获错误
            if(result instanceof _Promise){// 如果状态改变执行方法返回的是一个promise
                //将上一个promise状态值传递给下一个then
                result.then( res => reslove(res), reason => reject(reason))
            // result.then(reslove,reject) // 因为res和rej 方法默认会执行,并传递参数, 所以我们可以简写
            }else{
                reslove(result)// 改状态成功时返回的参数传递给下一个promise的reslove方法
            }
        } catch (error) {
            //当一个promise发生错误时, 将错误抛给下一个promise的reject方法
            reject(error)// 
        }
    }
    static reslove(value){
        return new _Promise((reslove,reject) =>{// 返回一个新的的promise 
            if(value instanceof _Promise){// 如果传入的promise
                value.then(reslove,reject)
            }else{
                reslove(value)
            }
        })
    }
    static reject(reason){
        return new _Promise((reslove,reject) =>{
            reject(reason)
        })
    }

    static All(promises){
        const values = [];
        return new _Promise((reslove,reject) =>{
            promises.forEach(promise => {
                console.log(promise);
                promise.then(
                    value =>{
                        values.push(value);
                        if(values.length === promises.length){
                            reslove(values)
                        }
                    },
                    reason => {
                        console.log(reason);
                        reject(reason)
                    }
                )
            });
        })
    }
}