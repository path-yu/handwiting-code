// 单向队列
class Queue {
    constructor() {
        this.queue = []
    }
    //入队
    enQueue(...items){
        return items.map(item =>  {
            this.queue.push(item);
            return item
        })
    }
    // 出队
    deQueue(){
        return this.queue.shift()
    }
    // 返回队头
    first(){
        return this.queue[0];
    }
    //清空队列
    clear(){
        this.queue = [];
    }
    // 返回队列的长度
    size(){
        return this.queue.length;
    }
    //队列是否为空
    isEmpty(){
        return this.size() == 0
    }
}
let queue = new Queue();
console.log("队列是否为空" + queue.isEmpty())
console.log('入队的人'+ queue.enQueue('A', 'B', 'C'));
console.log('出队的人' + queue.deQueue());
console.log('出队的人' + queue.deQueue());
console.log('出队的人' + queue.deQueue());
console.log("队列是否为空" + queue.isEmpty())