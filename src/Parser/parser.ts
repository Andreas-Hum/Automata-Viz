import { tokenizeFile } from "../Lexer/tokenizer";
import { Token, TOKENS_TYPE } from "./tokens";

export interface Statement {
    type: string;
    name?: string;
    states?: string[];
    statements?: Statement[];
    state?: string;
}

interface StartStatement extends Statement {
    type: 'start';
    state: string;
}

interface BeginStatement extends Statement {
    type: 'begin';
}

interface DefStatement extends Statement {
    type: 'def';
    name: string;
    statements: Statement[];
}

interface StateDefStatement extends Statement {
    type: 'stateDef';
    name: string;
    statements: Statement[];
}

interface TransitionStatement extends Statement {
    type: 'transition';
    label: string;
    states: string[];
}

interface AcceptStatement extends Statement {
    type: 'accept';
    states: string[];
}

interface EndStatement extends Statement {
    type: 'end';
}

export default class Lexer {
    private tokens: Token[];
    private position: number = 0;
    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private consume(): Token {
        return this.tokens[this.position++];
    }

    private match(type: TOKENS_TYPE): boolean {
        if (this.peek().type === type) {
            this.consume();
            return true;
        }
        return false;
    }

    public lex(): Statement[] {
        const statements: Statement[] = [];
        while (this.position < this.tokens.length) {
            const statement: Statement = this.statement();
            if (statement) {
                statements.push(statement);
            }
        }
        return statements;
    }

    private statement(): StateDefStatement | AcceptStatement | EndStatement | StartStatement | BeginStatement | DefStatement {
        let statement: StateDefStatement | AcceptStatement | EndStatement | StartStatement | BeginStatement | DefStatement;
        if (this.match(TOKENS_TYPE.BEGIN)) {
            statement = this.beginStatement();
        } else if (this.match(TOKENS_TYPE.DEF_GRAPH)) {
            statement = this.defStatement();
        } else if (this.match(TOKENS_TYPE.STATE_DEF)) {
            statement = this.stateDefStatement();
        } else if (this.match(TOKENS_TYPE.START)) {
            statement = this.startStatement();
        } else if (this.match(TOKENS_TYPE.ACCEPT)) {
            statement = this.acceptStatement();
        } else if (this.match(TOKENS_TYPE.END)) {
            statement = this.endStatement();
        } else {
            throw new SyntaxError(`Unexpected token ${this.peek().value} at row ${this.peek().row}, col ${this.peek().col}`);
        }
        return statement;
    }

    private startStatement(): StartStatement {
        if (!this.match(TOKENS_TYPE.ARROW)) {
            throw new SyntaxError(`Expected -> after START at row ${this.peek().row}, col ${this.peek().col}`);
        }
        const state: Token = this.consume();
        if (state.type !== TOKENS_TYPE.STATE) {
            throw new SyntaxError(`Expected state after -> at row ${state.row}, col ${state.col}`);
        }
        if (!this.match(TOKENS_TYPE.SEMICOLON)) {
            throw new SyntaxError(`Expected ; at the end of statement at row ${this.peek().row}, col ${this.peek().col}`);
        }
        return { type: 'start', state: state.value };
    }
    private beginStatement(): BeginStatement {
        return { type: 'begin' };
    }

    private defStatement(): DefStatement {
        const name: Token = this.consume();
        if (name.type !== TOKENS_TYPE.IDENTIFIER) {
            throw new SyntaxError(`Expected identifier after def at row ${name.row}, col ${name.col}`);
        }
        if (!this.match(TOKENS_TYPE.LEFT_BRACE)) {
            throw new SyntaxError(`Expected { after identifier at row ${name.row}, col ${name.col}`);
        }
        const statements: Statement[] = [];
        while (!this.match(TOKENS_TYPE.RIGHT_BRACE)) {
            const statement: Statement = this.statement();
            if (statement) {
                statements.push(statement);
            }
        }
        if (!this.match(TOKENS_TYPE.SEMICOLON)) {
            throw new SyntaxError(`Expected ; at the end of def block at row ${this.peek().row}, col ${this.peek().col}`);
        }
        return { type: 'def', name: name.value, statements: statements };
    }

    private stateDefStatement(): StateDefStatement {
        const name: Token = this.consume();
        if (name.type !== TOKENS_TYPE.IDENTIFIER) {
            throw new SyntaxError(`Expected identifier after STATE at row ${name.row}, col ${name.col}`);
        }
        if (!this.match(TOKENS_TYPE.ARROW)) {
            throw new SyntaxError(`Expected -> after identifier at row ${name.row}, col ${name.col}`);
        }
        if (!this.match(TOKENS_TYPE.LEFT_BRACE)) {
            throw new SyntaxError(`Expected { after -> at row ${name.row}, col ${name.col}`);
        }
        const statements: Statement[] = [];
        while (!this.match(TOKENS_TYPE.RIGHT_BRACE)) {
            let statement: Statement;
            let lastToken = this.peek().value;
            if (this.match(TOKENS_TYPE.IDENTIFIER)) {
                statement = this.transitionStatement(lastToken);
            } else {
                statement = this.statement();
            }
            if (statement) {
                statements.push(statement);
            }
        }
        if (!this.match(TOKENS_TYPE.SEMICOLON)) {
            throw new SyntaxError(`Expected ; at the end of def block at row ${this.peek().row}, col ${this.peek().col}`);
        }
        return { type: 'stateDef', name: name.value, statements: statements };
    }

    private transitionStatement(value: string): TransitionStatement {

        if (!this.match(TOKENS_TYPE.ARROW)) {
            throw new SyntaxError(`Expected -> after identifier at row ${this.peek().row}, col ${this.peek().col}`);
        }

        if (!this.match(TOKENS_TYPE.LEFT_SQUARE_BRACKET)) {
            throw new SyntaxError(`Expected [ after transition at row ${this.peek().row}, col ${this.peek().col}`);
        }
        const states: string[] = [];
        while (!this.match(TOKENS_TYPE.RIGHT_SQUARE_BRACKET)) {
            const state: Token = this.consume();
            if (state.type !== TOKENS_TYPE.STATE && state.type !== TOKENS_TYPE.SELF) {
                throw new SyntaxError(`Expected state inside [] at row ${state.row}, col ${state.col}`);
            }
            states.push(state.value);
            if (!this.match(TOKENS_TYPE.COMMA) && this.peek().type !== TOKENS_TYPE.RIGHT_SQUARE_BRACKET) {
                throw new SyntaxError(`Expected , or ] after state at row ${this.peek().row}, col ${this.peek().col}`);
            }
        }
        if (!this.match(TOKENS_TYPE.SEMICOLON)) {
            throw new SyntaxError(`Expected ; at the end of ACCEPT statement at row ${this.peek().row}, col ${this.peek().col}`);
        }
        return { type: 'transition', label: value, states: states };
    }

    private acceptStatement(): AcceptStatement {
        if (!this.match(TOKENS_TYPE.ARROW)) {
            throw new SyntaxError(`Expected -> after ACCEPT at row ${this.peek().row}, col ${this.peek().col}`);
        }
        if (!this.match(TOKENS_TYPE.LEFT_SQUARE_BRACKET)) {
            throw new SyntaxError(`Expected [ after -> at row ${this.peek().row}, col ${this.peek().col}`);
        }
        const states: string[] = [];
        while (!this.match(TOKENS_TYPE.RIGHT_SQUARE_BRACKET)) {
            const state: Token = this.consume();
            if (state.type !== TOKENS_TYPE.STATE) {
                throw new SyntaxError(`Expected state inside [] at row ${state.row}, col ${state.col}`);
            }
            states.push(state.value);
            if (!this.match(TOKENS_TYPE.COMMA) && this.peek().type !== TOKENS_TYPE.RIGHT_SQUARE_BRACKET) {
                throw new SyntaxError(`Expected , or ] after state at row ${this.peek().row}, col ${this.peek().col}`);
            }
        }
        if (!this.match(TOKENS_TYPE.SEMICOLON)) {
            throw new SyntaxError(`Expected ; at the end of ACCEPT statement at row ${this.peek().row}, col ${this.peek().col}`);
        }

        return { type: 'accept', states: states };
    }

    private endStatement(): EndStatement {
        return { type: 'end' };
    }
}

