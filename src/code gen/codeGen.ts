import { tokenizeFile } from '../Lexer/tokenizer';
import { Statement } from './../Parser/parser';
import Lexer from './../Parser/parser';
class CodeGen {

    public code: string = ""
    constructor(public AST: Statement[]) { }

    public generateCode() {
        for (const node of this.AST) {
            switch (node.type) {
                case "begin":
                    this.code += " \n"
                    break
                case "def": {
                    this.code += this.genMachine(node)
                }
            }
        }
    }

    public genMachine(node: Statement) {
        if (node.statements === undefined || node.statements.some((s: any) => s.type === "stateDef")) return ""
        let machine: string = `class ${node.name} {\n\n`;
        const states = []
        const startState = ""
        const acceptStaes = []
        const transitions = []

        for (const statements of node.statements) {

        }
    }

    public init(node: Statement) {

    }

}

class DotCodeGen {
    constructor(public AST: any[]) { }

    public generateCode() {
        let code = '';
        for (const node of this.AST) {
            switch (node.type) {
                case 'begin':
                    break;
                case 'def':
                    code += `digraph "${node.name}" {\n`;
                    code += 'rankdir=LR;\n';
                    code += 'size="8,5"\n';
                    for (const statement of node.statements || []) {
                        if (statement.type === 'start') {
                            code += `initial [shape=point];\n`;
                            code += `initial -> "${statement.state}"\n`;
                        } else if (statement.type === 'accept') {
                            for (const state of statement.states || []) {
                                code += `"${state}" [shape=doublecircle];\n`;
                            }
                        } else if (statement.type === 'stateDef') {
                            for (const transition of statement.statements || []) {
                                const label = transition.label ? ` [label="${transition.label}"]` : '';
                                for (const to of transition.states || []) {
                                    const fromState = statement.name;
                                    const toState = to === 'SELF' ? statement.name : to;
                                    code += `"${fromState}" -> "${toState}"${label}\n`;
                                }
                            }
                        }
                    }
                    code += '}\n';
                    break;
            }
        }
        return code;
    }
}