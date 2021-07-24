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
})();
function baseConverter2(number){
    let stack = new Stack();
    let result = "";;
    // 遍历求模
    while(number>0){
        stack.push(number%2);
        // 将number赋值为余数
        number = Math.floor(number/2);
    };
    // 遍历取出栈顶元素并删除
    while(stack.size()){
        result += stack.pop();
    };
    return result || "0"

}
// 16机制转换
//16进制转换
function baseConverter16(number,base=2) {
    let stack = new Stack();
    let sign = "0123456789abcdef";
    let result = "";
    while (number>0){
        let remainder = number%base;
        stack.push(sign[remainder]);
        number = Math.floor(number/base);
    }
    while(stack.size()){
        result += stack.pop();
    }
    return result||"0";
}
// console.log(baseConverter16(2,2) , "434");

// console.log(baseConverter2(2))

// console.log(12 / 2)
function isPlalindrome(word){
    if(!word || typeof word != "string"){
        throw new TypeError('the arguments type if not String or null');
        return false
    }
    let stack = new Stack();
    let back = "";
    stack.push(...word);
    while(stack.size()){
        back += stack.pop()
    }
    return back === word
}
function test(str){
   return  [...str].reverse().join("") === str
}
// console.log('我爱你爱我' === "我爱你爱我".split("").reverse().join(""))
// console.log(isPlalindrome('我爱你爱我'));
// console.log("我爱你爱我".split("").reverse().join(""))

// console.log(test("我爱你爱我"))

//检测括号匹配
function ifSignMatch(str){
    let leftSign = "{[(",
        rightSign = "}])";
    let stack = new Stack();
    // 依次遍历字符串每个字符
    for(let i =0,len = str.length; i<len; i++){
        let char = str.charAt(i);
        //检测是否有左括号
        if(leftSign.indexOf(char) !== -1){
            // 入栈
            stack.push(char)
        }
        // 检测是否有右括号
        else if(rightSign.indexOf(char) !== -1){
            // 判断当前栈顶符号是否与当前符号匹配,如果不匹配则返回false
              console.log(rightSign.indexOf(char), )
            if(leftSign.indexOf(stack.pop()) !== rightSign.indexOf(char)){
              
                return false
            }
        }
    }
    // 返回栈是否为空, 当栈为空说明匹配成功 返回true
    return stack.isEmpty()
}

console.log(ifSignMatch("{[{]}"));
console.log(ifSignMatch(`function isPlalindrome(word){
    if(!word || typeof word != "string"){
        throw new TypeError('the arguments type if not String or null');
        return false
    }
    let stack = new Stack();
    let back = "";
    stack.push(...word);
    while(stack.size()){
        back += stack.pop()
    }
    return back === word
}`));