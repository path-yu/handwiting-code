function transform(ast) {
    let newAst = [];

    function traverse(node, result, prefix) {
        let selector = ''
        if (node.type === 'selector') {
            selector = [...prefix, node.value];
            result.push({
                selector: selector.join(' '),
                rules: node.rules.reduce((acc, rule) => {
                    acc.push({
                        property: rule.property,
                        value: rule.value.join(' ')
                    })
                    return acc;
                }, [])
            })
        }
        for (let i = 0; i < node.children.length; i++) {
            traverse(node.children[i], result, selector)
        }
    }
    traverse(ast, newAst, [])
    return newAst;
}
module.exports = {
    transform
}