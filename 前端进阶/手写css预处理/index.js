const {
    tokenize
} = require('./tokenize');
const {parse} = require('./parse');
const {transform} = require('./transorm')
//  编译器 
// 解析 -> 转换 -> 代码生成
// 解析 -> 词法解析 -> 语法分析
const stylusText = `
$ib inline-block
$borderColor lightgreen
div
  p
    border 1px solid $borderColor
  color darkkhaki
  .a-b
    background-color lightyellow
    [data]
      padding 15px
      font-size 12px
.d-ib
  display $ib
`
/*
    variableDef， 以“ $” 符号开头， 该行前面无其他非空字符串；
    variableRef， 以“ $” 符号开头， 该行前面有非空字符串；
    selector， 独占一行， 该行无其他非空字符串；
    property， 以字母开头， 该行前面无其他非空字符串；
    value， 非该行第一个字符串， 且该行第一个字符串为 property 或 variableDef 类型
*/
// 词法解析

const res = tokenize(stylusText);
console.log(res);
// 语法解析 将生成的令牌数组, 转换为抽象语法树
/*
{
    type: 'root',
    children: [{
        type: 'selector',
        value: string
        rules: [{
            property: string,
            value: string[],
        }],
        indent: number,
        children: []
    }]
}
*/

const resultParse = parse(res);

function generate(nodes) {
    return nodes.map(n => {
        let rules = n.rules.reduce((acc, item) => acc += `${item.property}:${item.value};`, '')
        return `${n.selector} {${rules}}`
    }).join('\n')
}
console.log(transform(resultParse));
console.log(generate(transform(resultParse)));