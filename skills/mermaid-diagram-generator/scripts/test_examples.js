#!/usr/bin/env node

const { generateDiagram } = require('./generate_diagram.js');
const fs = require('fs');
const path = require('path');

// Example diagrams
const examples = {
  flowchart: {
    type: 'flowchart',
    code: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Option 1]
    B -->|No| D[Option 2]
    C --> E[End]
    D --> E
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px`,
    title: 'Simple Flowchart'
  },

  sequence: {
    type: 'sequence',
    code: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: I am good thanks!
    Alice->>Bob: Great! See you later.`,
    title: 'User Authentication'
  },

  gantt: {
    type: 'gantt',
    code: `gantt
    title Project Timeline
    dateFormat YYYY-MM-DD
    section Development
    Design: des1, 2024-01-01, 10d
    Coding: des2, after des1, 20d
    Testing: des3, after des2, 10d
    section Deployment
    Deploy: deploy, after des3, 5d`,
    title: 'Project Schedule'
  },

  classDiagram: {
    type: 'classDiagram',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
    }
    class Dog {
        +bark()
        +fetch()
    }
    class Cat {
        +meow()
        +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
    title: 'Animal Class Hierarchy'
  },

  stateDiagram: {
    type: 'stateDiagram',
    code: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Success
    Processing --> Error
    Success --> [*]
    Error --> Idle`,
    title: 'State Machine'
  },

  erDiagram: {
    type: 'erDiagram',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses
    PRODUCT ||--o{ LINE_ITEM : "is in"`,
    title: 'Database Schema'
  },

  pie: {
    type: 'pie',
    code: `pie title Programming Language Usage
    "JavaScript" : 45
    "Python" : 30
    "Java" : 15
    "Others" : 10`,
    title: 'Language Distribution'
  },

  mindmap: {
    type: 'mindmap',
    code: `mindmap
  root((Mindmap))
    Origins
      Long history
      Popularisation
    Research
      On effectiveness
      On features
    Uses
      Creative techniques
      Strategic planning
      Argument mapping`,
    title: 'Mindmap Example'
  }
};

// Generate all examples
async function generateAllExamples() {
  const outputDir = path.join(__dirname, '..', 'examples');

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('🎨 Generating Mermaid diagram examples...\n');

  for (const [name, example] of Object.entries(examples)) {
    const outputFile = path.join(outputDir, `${name}.png`);

    try {
      console.log(`Generating ${name}...`);

      // Prepare mermaid code with title
      let mermaidCode = example.type;
      if (example.title) {
        mermaidCode = `${example.type}\n    title ${example.title}\n    ${example.code.substring(example.type.length).trim()}`;
      } else {
        mermaidCode = example.code;
      }

      await generateDiagram(mermaidCode, outputFile, {
        type: example.type,
        title: example.title,
        scale: 2,
        background: 'white',
        theme: 'default'
      });

      console.log(`✅ ${name} generated\n`);

    } catch (error) {
      console.error(`❌ Failed to generate ${name}: ${error.message}\n`);
    }
  }

  console.log('🎉 All examples generated in:', outputDir);
}

// Run if executed directly
if (require.main === module) {
  generateAllExamples().catch(console.error);
}

module.exports = { examples, generateAllExamples };
