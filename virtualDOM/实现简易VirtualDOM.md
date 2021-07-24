1. # 虚拟DOM

虚拟DOM用原生的JavaScript模拟实现了DOM结构,.我们通过操作这个虚拟DOM树来实现对页面的渲染和维护.

## 1.1  为什么需要虚拟DOm?

1. 原生手动对DOM操作非常麻烦,非常不利于开发大型应用程序.
2. 当DOM操作越来越多时,状态的维护和DOM操作之间难以维护.
3. 当视图的状态只发生部分变化时,视图难以有效得进行部分更新.
4. 原生DOM元素过于庞大,轻微的触碰可能就会导致页面重排,产生性能问题.

## 1.2  起步

所谓的virtual DOM算法包括以下几个步骤

1. 用原生JavaScript对象结构模拟出DOM树结构,利用这个树构建一个真正的DOM树,并渲染到页面中
2. 当状态变更时, 重新构建一个新的虚拟DOM树,然后用新的树和旧的树进行对比,记录并保存出两棵树的差异,
3. 当步骤二记录的差异应用到步骤一中所构建的真正的DOM树上,视图就更新了.

## 1.3 算法实现

### 步骤一: 用JavaScript对象模拟DOM树

#### 1. 构建出虚拟DOM树

```js
// 构造虚拟DOM对象类
function Element(tagName, props, children) {
    this.tagName = tagName;
    this.props = props;
    this.children = children;
}
// 创建虚拟DOM
function createElement(tagName, props, children) {
    return new Element(tagName, props, children)
}
//  <ul class="ul-wrap">
//         <li class="li-item">1</li>
//         <li class="li-item">2</li>
//         <li class="li-item">3</li>
//     </ul>
// 假设我们有如上的DOM结构, 那我我们就可以利用虚拟DOM模拟出一个类似的DOM树结构
  let VDOM = createElement("ul", {
      class: "ul-wrap",
  }, [
      createElement("li", {
          class: "li-item"
      }, ["1"]),
      createElement("li", {
          class: "li-item"
      }, ["2"]),
      createElement("li", {
          class: "li-item"
      }, ["3"]),
  ]);
console.dir(JSON.stringify(VDOM,null,2));
```

此时我们可以在控制在中打印出打印的虚拟DOM为以下结构

![image-20201024121605576](../../AppData/Roaming/Typora/typora-user-images/image-20201024121605576.png)

#### 2. 利用虚拟DOM,构建出真实DOM,并渲染到页面上.

```js
// 创建真实DOM
function createDom(vDom) {
    // 利用解构赋值取出对应的值,并未其添加默认值,让代码更为健壮合理
    const {tagName,props={},children=[]} = vDom;
    // 创建DOM元素
    let ele = document.createElement(tagName);
    // 遍历props并给DOM节点设置相应的属性
    for (let [key, val] of Object.entries(props)) {
        setAttribute(ele, key, val)
    }
    // 如果children的length不为0则对其进行遍历
    if (children.length) {
        children.forEach(child => {
            const childEle = (child instanceof Element) // 判断子节点是否为虚拟DOM节点
                ? createDom(child) // 如果子节点也是虚拟DOM, 就递归构建DOM节点, 
                : document.createTextNode(child) // 如果为字符串, 只构建文本节点
            // 将节点追加到根元素上
            ele.appendChild(childEle)
        })
    }
    return ele
}
// 设置DOM元素的相对应的属性键值对
function setAttribute(ele, key, val) {
    // 针对给textarea设置value时候的特殊情况
    if (ele.tagName === "TEXTAREA" && key === "value") {
        ele.value = val
        return
    }
    // 判断key为style时的特殊情况
    key === "style" ? ele.style.cssText = val : ele.setAttribute(key, val);
}  
// 将利用虚拟DOM构建的真实DOM渲染到视图上
function render(Dom, root) {
    return root.appendChild(Dom)
}
//将第一步的虚拟DOM利用createDom进行构建,并渲染到页面上
 let DOM = createDom(VDOM);
console.log(DOM)
 render(DOM,document.getElementById("app"))
```

可以在控制台打印出如下所示

![image-20201024123145518](../../AppData/Roaming/Typora/typora-user-images/image-20201024123145518.png)

### 步骤二:比较两棵虚拟DOM树的差异

比较两棵DOM树的差异是vtitual DOM算法的最核心的部分, 这也是所谓的 Virtual DOM 的 diff 算法。

节点的差异变化最主要的的有以下几种

1. 文本变化, 元素文本内容发生了改变.
2. 属性变化,修改了节点的属性.
3. 删除节点,把之前的节点从DOM中移除看
4. 替换节点, 例如把上面的ul节点替换为div节点

所以我们首先定义几种差异类型标识符

```js
const TEXT = 0; // 文本
const ATTR = 1; // 属性
const REMOVE = 2; // 删除
const REPLACE = 3; // 替换
```

##### 为什么需要diff算法?

因为如果我们有一个很复杂的视图,我们要对它进行更新视图的操作, 可能我们只需要更新视图中的很小的一部分,但有时我们还是不得不更新整个DOM树才能完成渲染,这是很浪费性能和资源的,所以diff算法的作用就是用来剔除无用更新, 只更新需要更新的部分.

编写策略: 

1. 只在同一个层级的元素进行对比.
2. 深度优先遍历,记录差异 每一个节点都会有一个唯一的标记.
3. diff只是找到差异,找打了我们需要补齐差异.

下面是diff算法的简单实现

```js
// 创建diff方法比较两者差异
function diff(oldTree, newTree) {
    // 创建一个补丁对象和全局index索引
    let patches = {};
    let index = 0;// 用于记录当前遍历的节点标志
    diffWalk(oldTree, newTree, index, patches);
    return patches
}
// 深度优先遍历两个DOM树
function diffWalk(oldTree, newTree, index, patches) {
    let patch = [];// 记录两个节点差异的数组
    // 当新节点不存在时, 说明此时节点被删除了
    if (!newTree) {
        patch.push({
            type: REMOVE,
            index,
        }) //当两个节点的类型都为文本是比较文本变化, 如果新老节点的文本不一样就追加补丁上
    } else if (typeof oldTree === "string" && typeof newTree === "string") {
        if (oldTree !== newTree) {
            patch.push({
                type: TEXT,
                text: newTree
            })
        } //当两个节点的tagName即标签类型相同时, 对比两者的属性是否反生了变化
    } else if (oldTree.tagName === newTree.tagName) {
        // 获取新老节点属性的差异
        let attrs = diffAttr(oldTree.props, newTree.props);
        // 判断attr是否为空, 当attr为空对象是, Object.keys(attr).length返回为0
        if (Object.keys(attrs).length) {
            patch.push({
                type: ATTR,
                attrs,
            })
        }
        // 当老节点或新节点的children存在时则 递归遍历节点的子节点
        if (oldTree.children || newTree.children) {
            diffChildren(oldTree.children, newTree.children, index, patches);
        } // 检测节点替换变化
    } else {
        patch.push({
            type: REPLACE,
            newTree,
        })
    }
    // 检测patch数组里面的值是否为空, 不为空时才会将差异记录到patches上
    if (patch.length) {
        patches[index] = patch
    }
}
// 对比老节点和新节点的属性变化
function diffAttr(oldProps, newProps) {
    // 记录并保存老节点和新节点的属性变化
    let attr = {};
    // 遍历老节点的props 检测老节点的属性所对应的值是否发生了改变
    for (let key in oldProps) {
        if (oldProps[key] !== newProps[key]) {
            attr[key] = newProps[key]
        }
    }
    // 遍历新节点的key, 检测老节点是否存在key属性, 如果不存在则记录到attr上
    for (let key in newProps) {
        if (!Reflect.has(oldProps, key)) {
            attr[key] = newProps[key]
        }
    }
    return attr
}
// 遍历子节点, 并给参数添加默认值, 防止参数不为数组时,使用forEach会报错的可能
function diffChildren(oldChildren = [], newChildren = [], index, patches) {
    // 遍历children 找出区别
    oldChildren.forEach((child, i) => {
        // 深度遍历新老虚拟DOM树的差异
        diffWalk(child, newChildren[i], ++index, patches);
    })
}
let VOM1 = createElement("ul", {
    class: "ul-box",
}, [
    createElement("li", {
        class: "li-item"
    }, ["1"]),
    createElement("li", {
        class: "li-item",
        style:'color:red'
    }, ["我是diff之后的文本"]),
]);
// 上面我们新创建了一个DOM树,我们将原先的DOM树的ul的class类名改为了ul-box,
// 并给第二个li节点的节点添加一个style属性,并修改了其文本,且删除了最后一个li节点.
console.log(diff(VDOM, VOM1));
```

我们可以在控制台打印出如下结果

![image-20201024161145645](../../AppData/Roaming/Typora/typora-user-images/image-20201024161145645.png)

### 步骤三: 将差异应用到真正的DOM树上

因为步骤一中所构建的虚拟DOM对象和`render`的真正的DOM树的信息,结构是一样的,所以我们也可以对那棵树也进行深度优先遍历,遍历的过程中从步骤二中取出对应的差异对象, 然后判断其类型, 进行相应的DOM操作.

下面是简单的代码实现

```js
// patch 根据补丁对象更改真实的DOM
function patch(DOM, patches) {
    let patchIndex = 0;// 记录当前节点的标志
    walkPath(DOM, patches);
    function walkPath(DOM, patches) {
        // 获取第一个节点的补丁
        let patch = patches[patchIndex++];
        // 获取当前DOM的所有子元素
        let children = DOM.children;
        //如果children和patch同时存在值则遍历子节点 ,打补丁
         children.length  && patch && [...children].forEach(child => walkPath(child, patches));
        if (patch) {
            doPath(DOM, patch)
        }
    }
}
function doPath(node, patch) {
    // 遍历patch 取出对应的补丁,通过type来判断需要进行的DOM操作类型
    patch.forEach(item => {
        switch (item.type) {
            case TEXT:
                node.textContent = item.text;
                break;
            case ATTR:
                // 通过Object.entries取出atts对象的键值对并进行遍历
                for (let [key, val] of Object.entries(item.attrs)) {
                    setAttribute(node, key, val);
                }
                break;
            case REMOVE:
                //从老节点的父节点上删除老节点
                node.parentNode.removeChild(node);
                break;
            case REPLACE:
                let newTree = patch[0].newTree;
                // 如果新节点为虚拟DOM对象则创建为DOM对象,否者创建文本节点
                newTree = (newTree instanceof Element) ?
                    createDom(newTree) :
                    document.createTextNode(newTree);
                // 将老节点替换为新节点
                node.parentNode.replaceChild(newTree, node)
            default:
                break;
        }
    })
    }
```

接下来我们简单的测试一下

```js
 // 构建虚拟DOM
let VDOM = createElement("ul", {
         class: "ul-wrap",
     }, [
         createElement("li", {
             class: "li-item"
         }, ["1"]),
         createElement("li", {
             class: "li-item"
         }, ["2"]),
           createElement("li", {
             class: "li-item"
         }, ["3"]),
     ]);\
// 创建新的虚拟DOM
 let VOM1 = createElement("ul", {
         class: "ul-wrap-box",
 }, [
     createElement("li", {
         class: "li-item"
     }, ["1"]),
     createElement("li", {
         class: "li-item",
         style:'color:red'
     }, ["2"]),
 ]);
// 通过虚拟DOM构建真实的DOM
 let DOM = createDom(VDOM);
// 将DOM渲染到视图上
 render(DOM,document.getElementById("app"))
// 比较两棵虚拟DOM树的差异,
 let patches = diff(VDOM,VOM1);
// 在真正的DOM元素应用变更
 patch(DOM, patches);
```

**总结**:虚拟DOM的作用说白了就是利用`js`的计算性能来换取真实操作DOM所消耗的性能, 通过diff算法找出差异,最终做到只更新差异的部分,从而达到尽可能减少操作真实DOM操作,以提升性能.

