import lexer from '/lexer.js'
import { Parser, CheckSyntax} from '/parser.js'

window.onload = () => {
    const parser = new Parser();
    const checkSyntax = new CheckSyntax([], parser);
    const arrow = document.getElementsByClassName('bi-arrow-down-short')[0];
    const lexems = document.getElementsByClassName('expr')[0];
    const poliz = document.getElementsByClassName('expr')[1];
    const stack = document.getElementsByClassName('expr')[2];
    let stack_len = -1;
    const output = document.getElementsByClassName('expr')[3];
    let output_len = -1;
    const comment = document.querySelector('.comment');
    const elem = document.querySelector('.elem');

    const stepByStep = document.getElementById('stepByStep');
    let step_count = 0;

    if (!stepByStep.checked) {
        document.querySelector('.step-content').style.display = 'none';
    } else {
        document.querySelector('.step-content').style.display = 'block';
    }

    const step = () => {
        if (step_count >= Object.values(parser.logs).length) return;

        if (parser.logs[step_count]['stack'].length === 0) {
            stack.textContent = 'Стек пуст';
        } else if(stack_len != parser.logs[step_count]['stack'].length){
            stack.textContent = '';
            for (const token of parser.logs[step_count]['stack']) {
                const stackItem = document.createElement('div');
                stackItem.classList.add('text-center', 'round', (stack_len < parser.logs[step_count]['stack'].length) ? 'stack-item': null);
                stackItem.textContent = token[0];
        
                stack.appendChild(stackItem);
            }
        }
    
    if (parser.logs[step_count]['output'].length === 0) {
        output.textContent = 'Выход пуст';
    } else if (output_len != parser.logs[step_count]['output'].length){
        output.textContent = '';
        for (const token of parser.logs[step_count]['output']) {
            const outputItem = document.createElement('div');
            outputItem.classList.add('text-center', 'round', 'output-item');
            outputItem.textContent = token[0];
    
            output.appendChild(outputItem);
        }
    }

    comment.textContent = parser.logs[step_count]['comment'];
    elem.textContent = parser.logs[step_count]['current'] ? parser.logs[step_count]['current'][0] : 'Нет';

    stack_len = parser.logs[step_count]['stack'].length;
    output_len = parser.logs[step_count]['output'].length;
    step_count += 1;
}

    document.getElementById('calculate').addEventListener('click', () => {
        lexems.innerHTML = '';
        poliz.innerHTML = '';
        stack.innerHTML = '';
        output.innerHTML = '';
        step_count = 0;
        output_len = -1;
        stack_len = -1;
        const tokens = lexer(document.getElementById('input_expr').value);
        if (tokens.length === 0) {
            document.querySelector('.step-content').style.display = 'none';
            return;
        };
        checkSyntax.tokens = tokens;
        checkSyntax.reset();
        let lang;
        try {
            lang = checkSyntax.lang()
        } catch(e) {
            alert(e);
            document.querySelector('.step-content').style.display = 'none';
            return;
        }
        document.getElementsByClassName('lexem_header')[0].textContent = tokens.length == 0 ?  '' : 'Лексемы';
        document.getElementsByClassName('poliz_header')[0].textContent = tokens.length == 0 ?  '' : 'ПОЛИЗ';

        arrow.style.display = 'inline';
        arrow.classList.add('rotate');
        setTimeout(() => arrow.classList.remove('rotate'), 1000);
        for(const token of tokens) {
            const cell = document.createElement('div');
            cell.classList.add('text-center', 'round', 'appear');
            cell.textContent = token[0];
            lexems.appendChild(cell);
        }

        if (stepByStep.checked) {
            document.getElementsByClassName('poliz_header')[0].textContent = '';
            document.getElementsByClassName('stack_header')[0].textContent = tokens.length == 0 ?  '' : 'Стек';
            document.getElementsByClassName('output_header')[0].textContent = tokens.length == 0 ?  '' : 'Выход';
            document.getElementsByClassName('comment_header')[0].textContent = tokens.length == 0 ?  '' : 'Комментарий';
            document.getElementsByClassName('elem_header')[0].textContent = tokens.length == 0 ?  '' : 'Текущий элемент';

            document.querySelector('.step-content').style.display = 'block';

            step();
            document.querySelector('.btn-next').classList.remove('d-none');
        } else {
            document.querySelector('.step-content').style.display = 'none';
            document.querySelector('.btn-next').classList.add('d-none');
            for (const token of Array.from(lang.rpn)) {
                const cell = document.createElement('div');
                cell.classList.add('text-center', 'round', 'appear');
                cell.textContent = token[0];
                poliz.appendChild(cell);
            }
        }
    
    })

    document.querySelector('.btn-next').addEventListener('click', step);
}



