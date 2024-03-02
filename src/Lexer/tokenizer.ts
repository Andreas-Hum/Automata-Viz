
import { Token } from "../Parser/tokens";



export function tokenizeFile(stream: string) {
    const regex = /\s*(->|{|}|[A-Za-z_][A-Za-z_0-9]*|\S)\s*/g;

    let match;
    let tokens = [];
    let row = 1;
    let col = 1;
    let inBrackets = false;
    let previousToken = null;
    while (match = regex.exec(stream)) {
        if (match[1] === '[') {
            inBrackets = true;
        } else if (match[1] === ']') {
            inBrackets = false;
        }
        const token = Token.fromString(match[1], row, col, inBrackets, previousToken);
        tokens.push(token);
        previousToken = token;
        const lines = match[0].split('\n');
        row += lines.length - 1;
        col = lines.length > 1 ? lines[lines.length - 1].length : col + lines[0].length;
    }

    return tokens;
}

