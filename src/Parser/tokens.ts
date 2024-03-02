class LexicalError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "LexicalError";
    }
}


export enum TOKENS_TYPE {
    BEGIN = 'BEGIN',
    END = 'END',
    DEF_GRAPH = 'DEF_GRAPH',
    LEFT_BRACE = 'LEFT_BRACE',
    RIGHT_BRACE = 'RIGHT_BRACE',
    START = "START",
    ACCEPT = "ACCEPT",
    ARROW = "ARROW",
    DEF_STATE = "DEF_STATE",
    STATE = "STATE",
    SELF = "SELF",
    SEMICOLON = "SEMICOLON",
    COMMA = "COMMA",
    IDENTIFIER = "IDENTIFIER",
    TRANSITION = "TRANSITION",
    TRANSITION_STATE = "TRANSITION_STATE",
    UNKNOWN = "UNKNOWN",
    STATE_DEF = "STATE_DEF",
    LEFT_BRACKET = 'LEFT_BRACKET',
    RIGHT_BRACKET = 'RIGHT_BRACKET',
    LEFT_SQUARE_BRACKET = "LEFT_SQUARE_BRACKET",
    RIGHT_SQUARE_BRACKET = "RIGHT_SQUARE_BRACKET"

}

export class Token {
    constructor(public type: TOKENS_TYPE, public value: string, public row: number, public col: number) { }
    static fromString(value: string, row: number, col: number, inBrackets: boolean, previousToken: Token | null): Token {
        const lookup: { [key: string]: TOKENS_TYPE } = {
            'BEGIN': TOKENS_TYPE.BEGIN,
            'END': TOKENS_TYPE.END,
            'def': TOKENS_TYPE.DEF_GRAPH,
            '{': TOKENS_TYPE.LEFT_BRACE,
            '}': TOKENS_TYPE.RIGHT_BRACE,
            'START': TOKENS_TYPE.START,
            'ACCEPT': TOKENS_TYPE.ACCEPT,
            '->': TOKENS_TYPE.ARROW,
            'STATE': TOKENS_TYPE.STATE_DEF,
            'SELF': TOKENS_TYPE.SELF,
            ';': TOKENS_TYPE.SEMICOLON,
            ',': TOKENS_TYPE.COMMA,
            'STATE_DEF': TOKENS_TYPE.STATE_DEF,
            '(': TOKENS_TYPE.LEFT_BRACKET,
            ')': TOKENS_TYPE.RIGHT_BRACKET,
            '[': TOKENS_TYPE.LEFT_SQUARE_BRACKET,
            ']': TOKENS_TYPE.RIGHT_SQUARE_BRACKET,
        };

        let type = lookup[value];

        // If the token type is not found in the lookup object, check if it's a valid identifier
        if (type === undefined) {
            if (/^[a-zA-Z0-9_][a-zA-Z0-9_]*$/.test(value)) {
                type = TOKENS_TYPE.IDENTIFIER;
            } else {
                throw new LexicalError(`Unexpected token ${value} at row ${row}, col ${col}`);
            }
        }

        if (inBrackets && type === TOKENS_TYPE.IDENTIFIER) {
            type = TOKENS_TYPE.STATE;
        } else if (previousToken && (previousToken.type === TOKENS_TYPE.START || previousToken.type === TOKENS_TYPE.ARROW) && type === TOKENS_TYPE.IDENTIFIER) {
            type = TOKENS_TYPE.STATE;
        }
        return new Token(type, value, row, col);
    }
}