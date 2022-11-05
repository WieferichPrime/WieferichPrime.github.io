export default (characters) => {
    let tokens = []
    let lastPos = 0;
    let regexp = /./;
    regexp.lastIndex = 0;
    
    while(lastPos < characters.length) {
        let match;
        for (const token of token_exprs) {
            regexp = token[0];
            regexp.lastIndex = lastPos;
            let result;
            
            if (result = regexp.exec(characters)) {
                match = result
                if (token[1]) {
                    tokens.push([result[0], token[1], token[2]])
                }
                break;
            }
        }
        if (!match) {
            alert(`Недопустимый символ на позиции ${lastPos}: ${characters[lastPos]}`)
            return [];
        } else {
            lastPos = regexp.lastIndex;
        }
    }
    return tokens;
}   

const token_exprs = [
    [/[ \t\n]+/y, null, null],
    [/\(/y, 'LP',null],
    [/\)/y, 'RP',null],
    [/0|([1-9][0-9]*)/y, 'INT', null],
    [/[\+]/y, 'PLUS', 1],
    [/[\-]/y, 'MINUS', 1],
    [/[\*]/y, 'MUL', 2],
    [/[\/]/y, 'DIV', 2],
    [/[\^]/y, 'POW', 3],
]
