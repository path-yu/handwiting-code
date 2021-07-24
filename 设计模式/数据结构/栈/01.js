// const Stack = (function () {
//     let sym = Symbol("name");
//     console.log(sym)
//     return class {
//         constructor(){
//             this[sym] = []
//         }
//         push(...rest){
//             rest.forEach(v =>{
//                 this[sym].push(v)
//             })
//         }
//     }
// } )()
// let stack = new Stack();
// stack.push([3,4,5]);
// console.log(stack)
class Stack{
    constructor(){
        this.items = []
    }
    // 添加数据
    push(...rest){
        rest.forEach(v=>this.items.push(v));
        return this.items.length;
    }
    // 返回栈顶数据
    peek(){
        return this.items[this.items.length-1]
    }
    // 删除栈顶元素并返回
    pop(){
        return this.items.pop()
    }
    // 清空栈
    clear(){
        this.items = []
    }
    // 返回栈的长度
    size(){
        return this.items.length;
    }
    // 返回栈是否为空
    isEmpty(){
        return this.items.length === 0 ? true : false
    }
}
let stack1 = new Stack();
stack1.push(1,2,3,4)
console.log(stack1.peek());//4
console.log(stack1.pop());//4
console.log(stack1.pop());//3
console.log(stack1.pop());//2
console.log(stack1.pop());//1
console.log(stack1.size())//0
console.log(stack1.isEmpty())// true