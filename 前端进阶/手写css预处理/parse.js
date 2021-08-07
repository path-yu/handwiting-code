function parse(tokens) {
    var ast = {
        type: 'root',
        children: [],
        indent: -1
    };

    let path = [ast]
    let preNode = ast
    let node
    let vDict = {}
    while (node = tokens.shift()) {
        if (node.type === 'variableDef') {
            if (tokens[0] && tokens[0].type === 'value') {
                const vNode = tokens.shift()
                vDict[node.value] = vNode.value
            } else {
                preNode.rules[preNode.rules.length - 1].value = vDict[node.value]
            }
            continue;
        }
        if (node.type === 'property') {
            if (node.indent > preNode.indent) {
                preNode.rules.push({
                    property: node.value,
                    value: []
                })
            } else {
                let parent = path.pop()
                while (node.indent <= parent.indent) {
                    parent = path.pop()
                }
                parent.rules.push({
                    property: node.value,
                    value: []

                })
                preNode = parent
                path.push(parent)
            }
            continue;
        }
        if (node.type === 'value') {
            try {
                preNode.rules[preNode.rules.length - 1].value.push(node.value);
            } catch (e) {
                console.error(preNode)
            }
            continue;
        }
        if (node.type === 'variableRef') {
            preNode.rules[preNode.rules.length - 1].value.push(vDict[node.value]);
            continue;

        }
        if (node.type === 'selector') {
            const item = {
                type: 'selector',
                value: node.value,
                indent: node.indent,
                rules: [],
                children: []
            }
            if (node.indent > preNode.indent) {
                path[path.length - 1].indent === node.indent && path.pop()
                path.push(item)
                preNode.children.push(item);
                preNode = item;
            } else {

                let parent = path.pop()
                while (node.indent <= parent.indent) {
                    parent = path.pop()
                }
                parent.children.push(item)
                path.push(item)
            }
        }
    }
    return ast;

}
module.exports = {
    parse,
}