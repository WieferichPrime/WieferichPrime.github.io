class NoTernimal {
    constructor(name = '', value = '', height = 0) {
        this.childs = [];
        this.name = name;
        this.value = value;
        this.height = height;
        this.rpn = [];
    }
}

class Terminal {
    constructor(name='',value='',height=0) {
        this.name = name;
        this.value = value;
        this.height = height;
    }
}

export class CheckSyntax {
    constructor(tokens = [], Parser) {
        this.tokens = tokens;
        this.height = 0;
        this.buffer = [];
        this.index = -1;
        this.ret_index = 0;
        this.parser = Parser
        this.advance();
    }

    reset = () => {
        this.height = 0;
        this.buffer = [];
        this.index = -1;
        this.ret_index = 0;
        this.advance();
    }

    advance = () => {
        if (this.index < this.tokens.length) {
            this.index += 1;
            this.current_tok = this.index === this.tokens.length ? ['', null] : this.tokens[this.index];
        }
    }

    checkT = (values) => {
        if (values.indexOf(this.current_tok[1]) == -1) {
            throw new Error()
        }
    }

    toRpn = (expr) => {
        this.parser.tokens = this.buffer.slice().reverse();
        this.parser.reset();
        expr.rpn = this.parser.rpn()
        this.buffer = [];
    }

    lang = () => {
        const lang = new NoTernimal('lang')
        while (this.index < this.tokens.length) {
            try {
                this.height += 1;
                const expr = this.mathExpr()
                this.toRpn(expr);
                lang.childs.push(expr);
                lang.rpn = lang.rpn.concat(expr.rpn);
            } catch {
                throw new Error('Нежданный или отсутствующий токен на позиции ' + this.index);
            }
        }
        return lang;
    }

    mathExpr = () => {
        const mathExpr = new NoTernimal('mathExpr','', this.height);
        try {
            this.height += 1;
            try {
                mathExpr.childs.push(this.int())
            } catch(e) {
                mathExpr.childs.push(this.mathExprWbr())
            }
            if (['PLUS', 'MINUS', 'DIV', 'MUL', 'POW'].indexOf(this.current_tok[1]) !== -1) {
                try {
                    mathExpr.value = this.current_tok[0];
                    this.buffer.push(this.current_tok);
                    this.advance();
                    this.height += 1;
                    mathExpr.childs.push(this.mathExpr());
                } catch {
                    throw new Error();
                }
            }
            this.height -= 1;
            return mathExpr;
        } catch(e){
            throw new Error();
        }
    }

    value = () => {
        const value = new Terminal();
        value.height = this.height;
        try {
            this.checkT('INT');
            value.name = this.current_tok[1];
            value.value = this.current_tok[0];
            return value;
        } catch {
            throw new Error()
        }
    }

    mathExprWbr = () => {
        const mathExprWbr = new NoTernimal('mathExprWbr');
        mathExprWbr.height = this.height;
        this.height += 1;
        try {
            this.checkT('LP');
            this.buffer.push(this.current_tok);
            this.advance();
            const mathExpr = this.mathExpr();
            mathExprWbr.childs.push(mathExpr);
            this.checkT('RP');
            this.buffer.push(this.current_tok);
            this.advance();
            this.height -= 1;
            mathExprWbr.rpn = mathExpr.rpn.slice();
            return mathExprWbr;
        } catch (e) {
            throw e;
        }
    }

    minuses = () => {
        let minuses = 1;
        this.checkT('MINUS');
        this.advance();
        while (this.current_tok[1] == 'MINUS') {
            this.checkT('MINUS');
            this.advance();
            minuses += 1;
        }
        return minuses;
    }

    pluses = () => {
        this.checkT('PLUS');
        this.advance();
        while (this.current_tok[1] == 'PLUS') {
            this.checkT('PLUS');
            this.advance();
        }
    }

    int = () => {
        try {
            let minuses = 0;
            if (['MINUS','PLUS', 'INT'].indexOf(this.current_tok[1]) == -1) throw new Error();
            if (this.current_tok[1] == 'MINUS') minuses += 1;
            if (this.current_tok[1] == 'INT') {
                const value = this.value();
                this.buffer.push(this.current_tok);
                this.advance();
                this.height -= 1;
                return value;
            }

            this.advance();
            while (this.current_tok[1] == 'MINUS' || this.current_tok[1] == 'PLUS') {
                if (this.current_tok[1] == 'MINUS') minuses += 1;
                this.advance();
            }
            const value = this.value();
            const tokenCopy = this.current_tok.slice();
            if (minuses % 2 == 1) {
                value.value = -value.value;
                tokenCopy[0] = -tokenCopy[0];
            }
            this.buffer.push(tokenCopy);
            this.advance();
            this.height -= 1;
            return value;
        } catch {
            throw new Error();
        }
    }
}

export class Parser {
    constructor(tokens = []) {
        this.tokens = tokens.reverse();
        this.stack = [];
        this.output = [];
        this.logs = [];
        this.advance();
    }

    reset = () => {
        this.stack = [];
        this.output = [];
        this.logs = [];
        this.advance();
    }

    advance = () => {
        this.current_tok = this.tokens.length != 0 ? this.tokens.pop() : null;
    }

    log = (comment = '') => {
        if (this.current_tok) {
            this.logs.push({current: this.current_tok.slice(), stack: this.stack.slice(), output: this.output.slice(), comment: comment})
        } else {
            this.logs.push({current: null, stack: this.stack.slice(), output: this.output.slice(), comment: comment})
        }    
    }

    rpn = () => {
        while (this.tokens.length + 1 != 0 && this.current_tok) {
            if (['INT'].indexOf(this.current_tok[1]) !== -1) {
                this.output.push(this.current_tok);
                this.log('Текущий элемент - значение, заносим его в выходную последовательность.');
                this.advance();
            } else if (['PLUS', 'MINUS', 'DIV', 'MUL', 'POW'].indexOf(this.current_tok[1]) !== -1) {
                if (
                    this.stack.length != 0 &&
                    ['PLUS', 'MINUS', 'DIV', 'MUL'].indexOf(this.stack[this.stack.length - 1] !== -1) &&
                    this.stack[this.stack.length - 1][2] >= this.current_tok[2]
                ) {
                    this.output.push(this.stack.pop());  
                    this.log('Текущий элемент - операция. Заносим в выходную последовательность операцию с большим или равным приоритетом из стека, если она есть.');
                }
                this.stack.push(this.current_tok);
                this.log('Текущий элемент - операция. Заносим её в стек.');
                this.advance();
            } else if (['LP'].indexOf(this.current_tok[1]) !== -1) {
                this.stack.push(this.current_tok);
                this.log('Текущий элемент - открывающая скобка - заносим её в стек.');
                this.advance();
            } else if (['RP'].indexOf(this.current_tok[1]) !== -1) {
                while (['LP'].indexOf(this.stack[this.stack.length - 1][1]) === -1 ) {
                    this.output.push(this.stack.pop());
                    this.log('Текущий элемент - закрывающая скобка. Достаём из стека значения и заносим их в выходную последовательность до открывающей скобки.');
                    if (this.stack.length == 0) break;
                }
                this.stack.pop();
                this.log('Убираем открывающую скобку из стека');
                this.advance();
            }
        }
        while (this.stack.length != 0) {
            this.output.push(this.stack.pop());
            this.log('Входные значения закончились. Достаём из стека элементы и заносим в выходную последовательность.');
        }
        return this.output
    }
}