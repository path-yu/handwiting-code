class SqQueue {
    constructor(length) {
        this.queue = new Array(length+1);
        // 队头
        this.front = 0;
        //队尾
        this.rear = 0;
        // 当前队列大小
        this.size =  0
    }
    // 入队
    enQueue(item){
        /*
        * 判断队尾+1 是否为队头
        * 如果是就代表需要扩展数组
        * % this.queue.length是防止数组越界
        * */
        if(this.front === (this.rear +1) % this.queue.length){
            // 对数组进行扩容, 长度翻2倍并加1
            this.resize(this.getSize() * 2 + 1);
        }
        //将新元素赋值给队尾
        this.queue[this.rear] = item;
        // 队列长度++
        this.size++;
        //rear指针往后移一位 并判断是否已经排列到最后的位置,如果是则重新指向头部
        this.rear = (this.rear + 1) % this.queue.length;
    }
    //出队
    deQueue(){
        if(this.isEmpty())  throw Error('Queue is Empty');
        // 保存队头元素
        let res = this.queue[this.front];
        //清空当前队头元素
        this.queue[this.front] = null;
        // front指针后移, 如
        this.front = (this.front + 1) % this.queue.length;
        this.size--;
        /*
        * 判断当前队列大小是否过小.
        * 为了保证不浪费空间,在队列空间等于总长度的四分之一时
        * 且不为2是缩小总长度为当前的一半
        * */
        if(this.size === this.getSize() && this.getSize() / 2 !== 0){
            console.log(22)
            this.resize(this.getSize() / 2)
        }
        return res
    }
    // 获取队头
    getHeader(){
        if(this.isEmpty())  throw Error('Queue is Empty');
        return this.queue[this.front];
    }
    // 获取队列个数
    getSize(){
        return this.queue.length -1
    }
    //重新计算数组
    resize(length){
        let q = new Array(length);
        for(let i = 0;i < length; i++){
            // 从原队列的头节点开始, 依次移动front指针
            // 并跟原队列长度进行求模, 防止越界, 从原数组获取不到对应的元素
            q[i] = this.queue[(i + this.front) % this.queue.length]
        }
        // 将数组扩容, 并将front指向0, rear指向最后
        this.queue = q;
        this.front = 0;
        this.rear = this.size;
    }
    // 返回队列是否为空
    isEmpty(){
        return this.front === this.rear
    }
}
let  queue = new SqQueue(2);
console.log(queue.enQueue(4));
console.log(queue.enQueue(5));
// console.log(queue.enQueue(6));
// console.log(queue.enQueue(7));
// console.log(queue.enQueue(8));
// console.log(queue.enQueue(9));
// console.log(queue.enQueue(8));
// console.log(queue.deQueue());
console.log(queue.deQueue());
// console.log(queue.deQueue());
// console.log(queue.deQueue());
// console.log(queue.deQueue());
console.log(queue);