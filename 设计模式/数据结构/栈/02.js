let Stack = (function () {
    let data = {};
    return class {
        constructor() {
            this.sym =  Symbol("key");
            data[this.sym] = []
        }
        // 添加数据
        push(...rest) {
            rest.forEach(v =>  data[this.sym].push(v) );
            return data[this.sym].length;
        }
        // 返回栈顶数据
        peek() {
            return data[this.sym][ data[this.sym].length - 1]
        }
        // 删除栈顶元素并返回
        pop() {
            return  data[this.sym].pop()
        }
        // 清空栈
        clear() {
            data[this.sym] = []
        }
        // 返回栈的长度
        size() {
            return data[this.sym].length;
        }
        // 返回栈是否为空
        isEmpty() {
            return data[this.sym].length === 0 ? true : false
        }
        print(){
            data[this.sym].forEach(item =>{
                console.log(item)
            })
        }
    }
})()
let stack1 = new Stack();
stack1.push(1,2,3,4);
console.log(stack1)
console.log(stack1.peek());//4
console.log(stack1.pop());//4
console.log(stack1.pop());//3
console.log(stack1.pop());//2
console.log(stack1.pop());//1
console.log(stack1.size())//0
console.log(stack1.isEmpty())// true
let stack2 = new Stack();
stack1.push(2,3,4,5);
stack1.print()
// console.log(stack1)
// console.log(stack1.peek());//4
// console.log(stack1.pop());//4
// console.log(stack1.pop());//3
// console.log(stack1.pop());//2
// console.log(stack1.pop());//1
// console.log(stack1.size())//0
console.log(stack1.isEmpty())// true