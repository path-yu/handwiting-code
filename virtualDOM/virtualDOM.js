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
// 创建真实DOM
function createDom(vDom) {
    const {
        tagName,
        props,
        children = []
    } = vDom
    let ele = document.createElement(tagName);
    // 遍历props并给DOM节点设置相应的属性
    for (let [key, val] of Object.entries(props)) {
        setAttribute(ele, key, val)
    }
    // 遍历children;
    if (children.length) {
        children.forEach(child => {
            const childEle = (child instanceof Element) ?
                createDom(child) // 如果子节点也是虚拟DOM, 就递归构建DOM节点, 
                :
                document.createTextNode(child) // 如果为字符串, 只构建文本节点
            ele.appendChild(childEle)
        })
    }
    return ele
}
// 设置DOM元素的相对应的属性键值对
function setAttribute(ele, key, val) {
    // 针对textarea设置value时候的特殊情况
    if (ele.tagName === "TEXTAREA" && key === "value") {
        ele.value = val
        return
    }

    key === "style" ? ele.style.cssText = val : ele.setAttribute(key, val);
}
// 渲染虚拟DOM
function render(Dom, root) {
    return root.appendChild(Dom)
}
// 虚拟DOM之间最主要的变化包括
// 文本变化 属性变化 删除节点 替换节点
// 根据这些变化创建4个标识符
const TEXT = 0; // 文本
const ATTR = 1; // 属性
const REMOVE = 2; // 删除
const REPLACE = 3; // 替换
// 对比DOM的差异
function diff(oldTree, newTree) {
    // 创建一个补丁对象和全局index索引
    let patches = {};
    let index = 0;
    // 创建diff方法比较两者差异
    diffWalk(oldTree, newTree, index, patches);
    return patches
}
// 遍历两个DOM树
function diffWalk(oldTree, newTree, index, patches) {
    let patch = [];
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
        // 递归
        diffWalk(child, newChildren[i], ++index, patches);
    })
}
// patch 根据补丁对象更改真实的DOM
function patch(DOM, patches) {
    let patchIndex = 0;
    walkPath(DOM, patches);
    function walkPath(DOM, patches) {
        // 获取第一个节点的补丁
        let patch = patches[patchIndex++];
        // 获取当前DOM的子节点
        let children = DOM.children;
        // 递归子节点 打补丁;
        children.length && patch && [...children].forEach(child => walkPath(child, patches));
        if (patch) {
            doPath(DOM, patch)
        }
    }
}
function doPath(node, patch) {
    patch.forEach(item => {
        switch (item.type) {
            case TEXT:
                node.textContent = item.text;
                break;
            case ATTR:
                for (let [key, val] of Object.entries(item.attrs)) {
                    setAttribute(node, key, val);
                }
                break;
            case REMOVE:
                node.parentNode.removeChild(node);
                break;
            case REPLACE:
                let newTree = patch[0].newTree;
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