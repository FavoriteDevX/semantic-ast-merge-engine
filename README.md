
## Semantic AST Merge Engine

The semantic-ast-merge-engine is a next-generation Abstract Syntax Tree (AST) compilation utility designed to fundamentally replace line-based text comparison (diff3) traditional to Git workflows. By parsing source code into structured node trees, this engine evaluates logic mutations rather than text layout rearrangements, effectively eliminating false-positive merge conflicts when functions are moved across files.

🛠 Architecture & Technical Deep Dive

Standard text diff algorithms treat source code as an array of strings. If Developer A moves a function from line 10 to line 300, and Developer B fixes a typo inside that function, Git flags an unresolvable line conflict.
This engine circumvents line metrics by implementing a three-way AST parsing and mutation pipeline:
    [Base Code String]       [Ours Code String]      [Theirs Code String]

            |                        |                        |
     (Babel Parsing)          (Babel Parsing)          (Babel Parsing)
            v                        v                        v
       [Base AST]               [Ours AST]              [Theirs AST]
            \                        |                        /
             \                       v                       /
              +---> [Semantic Conflict & Resolution Loop] <+
                                     |
                         (AST Node Reconstruction)
                                     v
                            [Merged Output AST]
                                     |
                             (Code Generation)
                                     v
                         [Production Ready Code]

Core Execution Pipeline

1. Lexical & Syntactic Isolation: The engine digests the three source states (Base, Ours, and Theirs) using a strict ECMAScript compliance parser via @babel/core.
2. Functional Extraction Map: It runs a structural node traversal using @babel/traverse to locate all FunctionDeclaration blocks, cataloging them into a deterministic signature map indexed by structural node identifier names.
3. AST Intersection Resolution:
	• If a function's position changes in Ours but its code body is unaltered, the layout framework of Ours is preserved.
	• If Theirs mutates the code body of a function without modifying layout architecture, the modified sub-tree from Theirs is hot-swapped straight into the target skeleton AST node.
	• If both paths mutate the code block concurrently, a semantic exception framework flags a true logical conflict.

💾 Installation & Dependencies

Ensure you have Node.js v18.0.0 or higher deployed locally.
bash
# Clone the repository structure
git clone https://github.com
cd semantic-ast-merge-engine

# Initialize and lock internal compiler node assets
npm install


🚀 Execution & Verification Matrix

To execute the embedded structural test scenario and view the AST generation dump, run the production compiler trigger:
bash
npm start

## Sample Output Breakdown

Upon execution, you will observe that even though function calculateTotal was completely repositioned to the bottom of the scope in one target path, the generator automatically merges the logical internal payload alterations from the opposing path without demanding developer manual intervention.
