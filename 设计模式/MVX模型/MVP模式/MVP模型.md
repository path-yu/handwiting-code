## 1.MVP模式
### 1.1MVP定义
M（model）模型 —— V（view）视图 —— P（presenter）管理者，基于MVC模式衍生出的一种结构分离模式。
MVP模式和MVC模式的基本思想有共通的地方, Controller/Presenter负责逻辑的处理, Model提供数据, View负责显示.
### 1.2 MVP模式的优点
1. View和Mode完全分离,Model和View之间相互独立, 互不影响.
2. 使得模块之间的职责划分更加明显,层次清晰.
3. Model的业务层具有很好的灵活性和可重用性.
### 1.3 为什么使用MVP模式
解决View和Model之间的紧耦合,降低它们之间的依赖关系,使得View和Model层更方便的进行单元测试.MVP模式行业MVC模式
之间有一个重大的区别,在MVP中View层并不直接使用Model, 它们之间的通信是通过Presenter(MVC中的Controller)来进行的,所有的交互都发生在Presenter内部,而在MVC中View会直接从Model中读取数据而不是通过Controller.
### 1.4 起步

下面是MVP模式的简易示意图

![image-20201109193250176](C:/Users/86158/AppData/Roaming/Typora/typora-user-images/image-20201109193250176.png)

> 1. 用户在V上与程序进行交互, 并通知给管理者.
> 2. 管理者P触发相应的事件,,根据具体情况让M做出对应的改变
> 3. M发生改变后通知给P,此时P向V通知做出对应的视图的更新.

MVP模式的关在于P管理者的, 与MVC不同, Model和View不在直接联系, 也就是说数据更新之后是告知给Presenter, 然后P在通知V进行视图相应的改变.

**下面是一个非常简单的购物车案例**
我们有如下的HTML结构代码

```html
<div>
    <h2>欢迎光临水果店</h2>
    <table>
        <thead>
            <th>商品名</th>
            <th>商品价格</th>
            <th>商品数量</th>
            <th>累计</th>
            <th>操作</th>
        </thead>
        <tbody>

        </tbody>
    </table>
</div>
```
接下来我们写点css简单装饰一下
```css
td {
    text-align: center;
    border: 1px solid #ccc;
}
table {
    width: 500px;
    border: 1px solid #ccc;
    border-collapse: collapse;
}
```
此时我们的页面如下图所示

![image-20201109201425245](C:/Users/86158/AppData/Roaming/Typora/typora-user-images/image-20201109201425245.png)

下面是我们的的js代码部分
首先我们搭建MVP基本结构

```js
  let MVP = (function () {
      // 数据层
      const M = (function () {

      })()
      // 视图层
      const V = (function () {

      })();
      //逻辑处理层, 负责将view层和model建立联系
      const P = (function () {
          return {
              init() { }
          }
      })()
      return {
          // 初始化执行MVP模型
          init() {
              p.init()
          }
      }
  })()
  //上面的代码我们简单搭建了MVP结构,其中M层是数据相关层,V层负责视图的渲染,P层负责逻辑的处理
```
**数据层**

数据层Model我们只需要操作对应的数据业务逻辑,并对外提供对应的获取数据的接口和更新数据的接口.不与View层建立联系.

```js
const M = (function () {
    // 原始数据
    let data = [
        {
            fruitsName: '西瓜',
            fruitsPrice: 30,
            fruitsCount: 0,
            fruitsTotal: 0,
        },
        {
            fruitsName: '香蕉',
            fruitsPrice: 10,
            fruitsCount: 0,
            fruitsTotal: 0,
        }
    ];
    return {
        //更新数据的接口
        updateData(bool, index) {
            this.handleData(data[index],bool);
            this.vaildate(data,index);
        },
        //处理数据的接口, 对数据进行运算
        handleData(fruits,bool){
            bool ? fruits.fruitsCount++ :fruits.fruitsCount--;
            fruits.fruitsTotal = fruits.fruitsPrice * fruits.fruitsCount;
        },
        // 返回数据的接口
        getData(){
            return [...data];
        },
        // 检验数据接口
        vaildate(data,index){
            let fruits = data[index];
            // 限定商品的数量必须在0 -20之间
            fruits.fruitsCount = Math.max(0, Math.min(20,fruits.fruitsCount));
            fruits.fruitsTotal = Math.max(0,fruits.fruitsTotal);
            if(fruits.fruitsCount === 0){ alert('商品数量不能小于0')}
            else if(fruits.fruitsCount === 20) {alert('商品数量不能大于20')}
        }
    }
})()
```

**View层**

View层我们只操作页面对应的DOM元素即可,并对外提供两个更新视图的接口, 和初始化渲染的接口.值得注意的是初始化渲染渲染使用的是innerHTML拼接字符串这种简单粗暴的方式,我们可以根据也业务需求使用DOM动态生成节点追加到页面上, 由于我们使用的是js动态将DOM元素追加到页面上, 所以我们得在页面渲染之后在获取对应的按钮节点.

```js
const V = (function () {
    // 获取tbody节点以便渲染视图
    let tbody = document.querySelector('tbody'),
        countDom = null,// 全局保存对应的显示水果数量的DOM元素列表
        totalDom = null;
    //获取对应需要渲染视图的DOM节点
    function getEle() {
        countDom = document.querySelectorAll('.count');
        totalDom = document.querySelectorAll('.total');
    }
    return {
        // 初始化渲染数据接口
        initRender(data) {
            //利用reduce拼接对应的HTML字符串
            const htmlStr = data.reduce((total, item) => {
                    return total += `
                            <tr>
                                <td>${item.fruitsName}</td>
                                <td class='price'>${item.fruitsPrice}/个</td>
                                <td class='count'>${item.fruitsCount}</td>
                                <td class='total'>${item.fruitsTotal}</td>
                            <td>
                                <button class='increment'>+</button>
                                <button class='decrement'>-</button>
                            </td>
                            </tr>
                        `
            }, '');
            // 渲染tbody的innerHTML
            tbody.innerHTML= htmlStr;
            // 渲染完成时获取对应的DOM节点
            getEle();
            // 返回对应的操作页面按钮DOM元素节点
            return {
                increment:document.querySelectorAll('.increment'),
                decrement:document.querySelectorAll('.decrement')
            }
        },
        // 更新视图接口
        updateView(index,data){
            countDom[index].textContent = data[index].fruitsCount;
            totalDom[index].textContent = data[index].fruitsTotal;
        }
    }
})();
```

**Presenter层**

Presenter给对应的视图添加对应的事件,利用Model和View层提供的接口将两者通过Presenter层建立联系.

```js
 const P = (function(){
     //深度遍历DOM并绑定绑定对应的事件
     function walkDom(eles){
       	// 利用Object.entries将key和val取出来并进行遍历
         for(let [key,val] of Object.entries(eles)){
             //遍历对应的按钮节点
             for(let i = 0, len = val.length;i < len;i++){
				// 当key为increment,实现数据累加功能
                 if(key === 'increment'){
                     bindClick(val,true,i);
                 }else{
                     bindClick(val,false,i);
                 }
             }
         }
     }
       // 给对应元素绑定点击事件
     function bindClick(val,bool,index){
         val[index].addEventListener('click',ev =>{
             // 更新Model层数据
             M.updateData(bool, index);
             //通过model的getData获取最新数据并更新视图
             V.updateView(index, M.getData());
         },false)
     }
     return {
         init(){
             // 渲染视图 遍历DOM并绑定点击事件
             walkDom(V.initRender(M.getData()))
         }
     }
 })();
```

下面是完整的MVP模式代码

```js
 let MVP = (function () {
     // 数据层
     const M = (function () {
         // 原始数据
         let data = [
             {
                 fruitsName: '西瓜',
                 fruitsPrice: '30',
                 fruitsCount: 0,
                 fruitsTotal: 0,
             },
             {
                 fruitsName: '香蕉',
                 fruitsPrice: '10',
                 fruitsCount: 0,
                 fruitsTotal: 0,
             }
         ];
         return {
             //更新数据的接口
             updateData(bool, index) {
                 this.handleData(data[index], bool);
                 this.vaildate(data, index);
             },
             //处理数据的接口, 对数据进行运算
             handleData(fruits, bool) {
                 bool ? fruits.fruitsCount++ : fruits.fruitsCount--;
                 fruits.fruitsTotal = fruits.fruitsPrice * fruits.fruitsCount;
             },
             // 返回数据的接口
             getData() {
                 return [...data];
             },
             // 检验数据接口
             vaildate(data, index) {
                 let fruits = data[index];
                 // 限定商品的数量必须在0 -20之间
                 fruits.fruitsCount = Math.max(0, Math.min(20, fruits.fruitsCount));
                 fruits.fruitsTotal = Math.max(0, fruits.fruitsTotal);
                 if (fruits.fruitsCount === 0) { alert('商品数量不能小于0') }
                 else if (fruits.fruitsCount === 20) { alert('商品数量不能大于20') }
             }
         }
     })()
     // 视图层
     const V = (function () {
         // 获取tbody节点以便渲染视图
         let tbody = document.querySelector('tbody'),
             countDom = null,// 全局保存对应的显示水果数量的DOM元素列表
             totalDom = null;
         //获取对应需要渲染视图的DOM节点
         function getEle() {
             countDom = document.querySelectorAll('.count');
             totalDom = document.querySelectorAll('.total');
         }
         return {
             // 初始化渲染数据接口
             initRender(data) {
                 //利用reduce拼接对应的HTML字符串
                 const htmlStr = data.reduce((total, item) => {
                     return total += `
                                <tr>
                                    <td>${item.fruitsName}</td>
                                    <td class='price'>${item.fruitsPrice}/个</td>
                                    <td class='count'>${item.fruitsCount}</td>
                                    <td class='total'>${item.fruitsTotal}</td>
                                <td>
                                    <button class='increment'>+</button>
                                    <button class='decrement'>-</button>
                                </td>
                                </tr>
							`
                 }, '');
                 // 渲染tbody的innerHTML
                 tbody.innerHTML = htmlStr;
                 // 渲染完成时获取对应的DOM节点
                 getEle();
                 // 返回对应的操作页面按钮DOM元素节点
                 return {
                     increment: document.querySelectorAll('.increment'),
                     decrement: document.querySelectorAll('.decrement')
                 }
             },
             // 更新视图接口
             updateView(index, data) {
                 countDom[index].textContent = data[index].fruitsCount;
                 totalDom[index].textContent = data[index].fruitsTotal;
             }
         }
     })();
     //逻辑处理层, 负责将view层和model建立联系
     const P = (function () {
         //深度遍历DOM并绑定绑定对应的事件
         function walkDom(eles) {
             // 利用Object.entries将key和val取出来并进行遍历
             for (let [key, val] of Object.entries(eles)) {
                 //遍历对应的按钮节点
                 for (let i = 0, len = val.length; i < len; i++) {
                     // 当key为increment,实现数据累加功能
                     if (key === 'increment') {
                         bindClick(val, true, i);
                     } else {
                         bindClick(val, false, i);
                     }
                 }
             }
         }
         // 给对应元素绑定点击事件
         function bindClick(val, bool, index) {
             val[index].addEventListener('click', ev => {
                 // 更新Model层数据
                 M.updateData(bool, index);
                 //通过model的getData获取最新数据并更新视图
                 V.updateView(index, M.getData());
             }, false)
         }
         return {
             init() {
                 // 渲染视图 遍历DOM并绑定点击事件
                 walkDom(V.initRender(M.getData()))
             }
         }
     })();
     return {
         // 初始化执行MVP模型
         init() {
             P.init()
         }
     }
 })();
 MVP.init()
```

此时我们的页面如下所示

![](C:/Users/86158/AppData/Roaming/Typora/typora-user-images/image-20201109194559418.png)

### 1.5总结 

MVP模式的最大好处就是实现了Model和View的真正分离,.当数据和View之间的交互比较复杂是使用这种模式会更好, 同时也更方便于数据和视图的单独维护.

MVP的模式明显缺点就是增加了代码的复杂度,特别对大型应用程序的开发, 会使代码冗余,Presenter除了应用逻辑以为还有大量的View->Model, Model->View的同步逻辑, 会使Presenter臃肿,难以维护,

