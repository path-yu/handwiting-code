function tokenize(text) {
    return text.trim().split(/\n|\r\n/).reduce((tokens, line, idx) => {
        const spaces = line.match(/^\s+/) || ['']
        const indent = spaces[0].length
        const input = line.trim()
        const words = input.split(/\s/)
         let value = words.shift()
        if (words.length === 0) {
            tokens.push({
                type: 'selector',
                value,
                indent
            })
            
        } else {
            let type = ''
            if (/^\$/.test(value)) {
                type = 'variableDef'
            } else if (/^[a-zA-Z-]+$/.test(value)) {
                type = 'property'
            } else {
                throw new Error(`Tokenize error:Line ${idx} "${value}" is not a vairable or property!`)
            }
            tokens.push({
                type,
                value,
                indent
            })
            while (value = words.shift()) {
                tokens.push({
                    type: /^\$/.test(value) ? 'variableRef' : 'value',
                    value,
                    indent: 0
                })
            }

        }

        return tokens;
    }, [])
}
module.exports = {
    tokenize
}