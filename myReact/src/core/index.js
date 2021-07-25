/**
 * @description: 
 * @param {*} type 字符串
 * @param {*} props jsx传递的属性
 * @param {array} children 子元素后代虚拟DOM列表
 * @return {*}
 */

function createElement(type, props, ...children) {
    delete props.__source;
    return {
        type,
        props: {
            ...props,
            children: children.map(child =>
                typeof child === "object" ?
                child :
                createTextElement(child)
            ),
        }
    }
}
// 文本类型vdom创建
function createTextElement(text) {
    return {
        type: 'TEXT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}
// 创建DOM
function createDOM(vdom) {
    // 创建真实DOM
    const dom = vdom.type === 'TEXT' ?
        document.createTextNode('') :
        document.createElement(vdom.type);
    // 设置属性
    updateDom(dom, {}, vdom.props);
    return dom;
}

function updateDom(dom, prevProps, nextProps) {
    // 规避children 属性
    // 老的操作 取消
    // 新增存在 新增. 并没有做新赖相等的判定
    // @todo 兼容性
    Object.keys(prevProps)
        .filter(name => name != 'children')
        .filter(name => !(name in nextProps))
        .forEach(name => {
            if (name.slice(0, 2) == 'on') {
                // onClick = click
                dom.removeEventListener(name.slice(2).toLowerCase(), prevProps[name], false)
            } else {
                dom[name] = '';
            }
        })
    nextProps && Object.keys(nextProps)
        .filter(name => name != 'children')
        .forEach(name => {
            if (name.slice(0, 2) == 'on') {
                // onClick = click
                dom.addEventListener(name.slice(2).toLowerCase(), nextProps[name], false)
            } else {
                dom[name] = nextProps[name];
            }
        })


}

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    // 取消wip
    wipRoot = null;
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    // 向上递归查找
    let domParentFiber = fiber.parent;
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    };

    const domParent = domParentFiber.dom;
    if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
        domParent.appendChild(fiber.dom);
    } else if (fiber.effectTag === 'DELETION') {
        commitDeletion(fiber, domParent);
    } else if (fiber.effectTag = 'UPDATE' && fiber.dom != null) {
        updateDom(fiber.dom, fiber.base.props, fiber.props);
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom);
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

function render(vdom, container) {
    // 设置全局nextUnitOfWork
    wipRoot = {
        dom: container,
        props: {
            children: [vdom]
        },
        base: currentRoot //记录上一个fiber
    }
    nextUnitOfWork = wipRoot;
    deletions = [];
}
let nextUnitOfWork = null
// 工作中的fiber
let wipRoot = null;
let currentRoot = null;
let deletions = null;
// 任务调度
//调度我们的diff 或者渲染任务 这个方法会一直调用
function workLoop(deadline) {
    // 有任务，并且当前帧还没结束
    // 没考虑到超时( deadline.didTimeout
    while (nextUnitOfWork && deadline.timeRemaining() > 1) {
        // 获取下一个任务单元
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    // 没有下个任务了 提交修改
    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }
    requestIdleCallback(workLoop)
}
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    // 是否为函数组件
    const isFunctionComponent = fiber.type instanceof Function;
    
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        // dom
        updateHostComponent(fiber)
    }

    // fiber 遍历顺序
    // 子 => 子的兄弟 => 没有兄弟了 => 父元素
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        // 没有兄弟元素了, 找父元素
        nextFiber = nextFiber.parent;
    }
}
class Home{
    constructor(){}
}

function useState(init) {
    // 记录上一个hooks
    const oldHooks = wipFiber.base && wipFiber.base.hooks && wipFiber.base.hooks[hookIndex];
    // 创建hook 数据结构
    const hook = {
        state: oldHooks ? oldHooks.state : init,
        queue: []
    }
    const actions = oldHooks ? oldHooks.queue :[];
    // 更新上一个触发setState操作中 state数据  
    actions.forEach(action => {
        hook.state = action;
    })
    const setState = action => {
        // 将待修改的数据保存到hook中的queue队列中
        // 带重新渲染组件前更改state数据
        hook.queue.push(action);
        wipRoot = {
            dom: currentRoot.dom,
            props: currentRoot.props,
            base: currentRoot
        }
        // 将nextUnitOfWork 重新赋值, 开启下一轮渲染任务
        // 此时函数组件会重新渲染, 并调用内部的useState方法
        nextUnitOfWork = wipRoot;
        deletions = [];
    }
    wipFiber.hooks.push(hook);
    hookIndex++;
    return [hook.state, setState]

}
let wipFiber = null;
let hookIndex = null;

function updateFunctionComponent(fiber) {
    wipFiber = fiber;
    hookIndex = 0;
    wipFiber.hooks = [];
    // 执行函数传入props
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
    // 如果没有dom 就不是入口, 直接创建DOM
    if (!fiber.dom) {
        fiber.dom = createDOM(fiber);
    }
    // 子元素调和
    reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(wipFiber, elements) {
   let index = 0
   let oldFiber =
       wipFiber.base && wipFiber.base.child
   let prevSibling = null
   // 构建fiber 结构
   while (index < elements.length || oldFiber != null) {

       const element = elements[index];
       let newFiber = null;
       // 对比oldFiber的状态和当前element
       // 先比较类型
       const sameType = oldFiber && element && element.type == oldFiber.type;
       if (sameType) {
           // 复用节点 更新
          newFiber = {
              type: oldFiber.type,
              props: element.props,
              dom: oldFiber.dom,
              parent: wipFiber,
              base: oldFiber,
              effectTag: "UPDATE",
          }
       }
       if (!sameType && element) {
           // 替换
           newFiber = {
               type: element.type,
               props: element.props,
               dom: null,
               parent: wipFiber,
               base: null,
               effectTag: "PLACEMENT",
           };
       }
       if (!sameType && oldFiber) {
           oldFiber.effectTag = "DELETION";
           deletions.push(oldFiber);
           // 删除
       }
      
       if (oldFiber) {
           oldFiber = oldFiber.sibling
       }
       if (index === 0) {
           wipFiber.child = newFiber
       } else if (element) {
           prevSibling.sibling = newFiber
       }
       prevSibling = newFiber
       index++
   }
}
class Component{
    constructor(props){
        this.props = props;
    }
}
 function useComponent(Component) {
    return function(props){
        let component = new Component(props);
        let [state,setState] = useState(component.state);
        component.props = props;
        component.state = state;
        component.setState = setState;
        return component.render();
    }
}
export default {
    render,
    createElement,
    useState,
    Component,
    useComponent
}