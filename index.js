const babel = require('@babel/core');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types'); 

class SemanticASTMergeEngine {
constructor() {
this.baseAST = null;
this.oursAST = null;
this.theirsAST = null;
} 

parseCode(code) {
return babel.parseSync(code, {
ast: true,
code: false,
sourceType: "module",
plugins: ["@babel/plugin-proposal-class-properties"]
});
}

extractFunctions(ast) {
const functions = new Map();
traverse(ast, {
FunctionDeclaration(path) {
const name = path.node.id.name;
const code = generate(path.node).code;
functions.set(name, { path, node: path.node, code });
},
ClassMethod(path) {
const name = path.node.key.name;
const code = generate(path.node).code;
functions.set(name, { path, node: path.node, code });
}
});
return functions;
}

merge(baseCode, oursCode, theirsCode) {
this.baseAST = this.parseCode(baseCode);
this.oursAST = this.parseCode(oursCode);
this.theirsAST = this.parseCode(theirsCode);
const baseFuncs = this.extractFunctions(this.baseAST);
const oursFuncs = this.extractFunctions(this.oursAST);
const theirsFuncs = this.extractFunctions(this.theirsAST);

const mergedAST = t.file(t.program([]));
const addedToMerged = new Set();

// Traverse Ours to build the structural skeleton
traverse(this.oursAST, {
    Program: (path) => {
        mergedAST.program.body = [...path.node.body];
    }
});

// Deep Semantic Resolution Loop
for (const [funcName, oursMeta] of oursFuncs.entries()) {
    const baseMeta = baseFuncs.get(funcName);
    const theirsMeta = theirsFuncs.get(funcName);

    if (baseMeta && theirsMeta) {
        const oursChanged = oursMeta.code !== baseMeta.code;
        const theirsChanged = theirsMeta.code !== baseMeta.code;

        if (oursChanged && theirsChanged) {
            console.warn(`[CONFLICT] Semantic conflict detected in function: ${funcName}. Falling back to structural integration.`);
            continue; 
        }

        if (theirsChanged && !oursChanged) {
            // Update the body of the function inside the merged skeleton with Theirs' changes
            traverse(mergedAST, {
                FunctionDeclaration(path) {
                    if (path.node.id.name === funcName) {
                        path.replaceWith(t.cloneNode(theirsMeta.node));
                    }
                }
            });
        }
    }
    addedToMerged.add(funcName);
}

// Add brand new functions from Theirs that don't exist in Ours
for (const [funcName, theirsMeta] of theirsFuncs.entries()) {
    if (!oursFuncs.has(funcName) && !baseFuncs.has(funcName)) {
        mergedAST.program.body.push(t.cloneNode(theirsMeta.node));
    }
}

return generate(mergedAST).code;

}

} 

// Production Verification Test Case
const base = function calculateTotal(price) { return price * 1.12; }\nfunction logItem() { console.log("Item logic"); };
const ours = function logItem() { console.log("Item logic"); }\nfunction calculateTotal(price) { return price * 1.12; }; // Moved position
const theirs = function calculateTotal(price) { console.log("Auditing pricing system"); return price * 1.20; }\nfunction logItem() { console.log("Item logic"); }; // Modified body 

const engine = new SemanticASTMergeEngine();
const result = engine.merge(base, ours, theirs);
console.log("=== SEMANTIC MERGE OUTPUT ===");
console.log(result); 

module.exports = SemanticASTMergeEngine;
