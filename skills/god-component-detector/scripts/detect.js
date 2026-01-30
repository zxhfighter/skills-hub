#!/usr/bin/env node

/**
 * God Component Detector Script
 * Analyzes React/Next.js component files for God Component anti-patterns
 */

const fs = require('fs');
const path = require('path');

class GodComponentDetector {
  constructor(filePath) {
    this.filePath = filePath;
    this.content = '';
    this.lines = [];
    this.metrics = {
      loc: 0,
      useState: 0,
      useEffect: 0,
      customHooks: 0,
      functions: 0,
      props: 0,
      imports: 0,
      conditionals: 0,
      responsibilities: []
    };
  }

  analyze() {
    this.content = fs.readFileSync(this.filePath, 'utf-8');
    this.lines = this.content.split('\n');
    
    this.calculateLOC();
    this.countHooks();
    this.countFunctions();
    this.countProps();
    this.countImports();
    this.countConditionals();
    this.identifyResponsibilities();
    
    return this.generateReport();
  }

  calculateLOC() {
    this.metrics.loc = this.lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('/*') &&
             !trimmed.startsWith('*');
    }).length;
  }

  countHooks() {
    this.metrics.useState = (this.content.match(/useState\(/g) || []).length;
    this.metrics.useEffect = (this.content.match(/useEffect\(/g) || []).length;
    
    // Count custom hooks (use[A-Z])
    const customHookMatches = this.content.match(/\buse[A-Z]\w+\(/g) || [];
    const standardHooks = ['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue'];
    this.metrics.customHooks = customHookMatches.filter(hook => 
      !standardHooks.some(std => hook.startsWith(std))
    ).length;
  }

  countFunctions() {
    // Count function declarations and arrow functions
    const functionDeclarations = (this.content.match(/function\s+\w+\s*\(/g) || []).length;
    const arrowFunctions = (this.content.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []).length;
    const asyncFunctions = (this.content.match(/async\s+function/g) || []).length;
    
    this.metrics.functions = functionDeclarations + arrowFunctions + asyncFunctions;
  }

  countProps() {
    // Look for props destructuring or Props interface
    const propsMatch = this.content.match(/{\s*([^}]+)\s*}:\s*\w+Props/);
    if (propsMatch) {
      const props = propsMatch[1].split(',').map(p => p.trim()).filter(p => p.length > 0);
      this.metrics.props = props.length;
    }
  }

  countImports() {
    this.metrics.imports = (this.content.match(/^import\s+/gm) || []).length;
  }

  countConditionals() {
    const ternary = (this.content.match(/\?[^:]+:/g) || []).length;
    const andAnd = (this.content.match(/&&\s*</g) || []).length;
    this.metrics.conditionals = ternary + andAnd;
  }

  identifyResponsibilities() {
    const responsibilities = [];

    // Data Fetching
    if (this.content.match(/fetch\(|axios\.|useSWR|useQuery|api\./)) {
      responsibilities.push({
        type: 'Data Fetching',
        evidence: 'Contains fetch/axios/SWR/Query calls'
      });
    }

    // Form Handling
    if (this.content.match(/onSubmit|handleSubmit|validation|zodResolver|useForm/)) {
      responsibilities.push({
        type: 'Form Handling',
        evidence: 'Contains form submission or validation logic'
      });
    }

    // Business Logic
    if (this.content.match(/calculate|compute|transform|process|format/i)) {
      responsibilities.push({
        type: 'Business Logic',
        evidence: 'Contains calculations or data transformations'
      });
    }

    // Side Effects
    if (this.metrics.useEffect > 0) {
      responsibilities.push({
        type: 'Side Effects',
        evidence: `${this.metrics.useEffect} useEffect hooks`
      });
    }

    // Routing
    if (this.content.match(/useRouter|useNavigate|router\.push|navigate\(/)) {
      responsibilities.push({
        type: 'Routing',
        evidence: 'Contains routing logic'
      });
    }

    // State Management
    if (this.metrics.useState > 3) {
      responsibilities.push({
        type: 'State Management',
        evidence: `${this.metrics.useState} state variables`
      });
    }

    // Authentication
    if (this.content.match(/auth|login|logout|session|token|permission/i)) {
      responsibilities.push({
        type: 'Authentication/Authorization',
        evidence: 'Contains auth-related logic'
      });
    }

    // UI Rendering (always present in components)
    if (this.content.match(/return\s*\(/)) {
      responsibilities.push({
        type: 'UI Rendering',
        evidence: 'JSX rendering'
      });
    }

    this.metrics.responsibilities = responsibilities;
  }

  getSeverity() {
    if (this.metrics.loc > 500) return 'CRITICAL';
    if (this.metrics.loc > 300) return 'HIGH';
    if (this.metrics.responsibilities.length > 4) return 'HIGH';
    if (this.metrics.useState > 8 || this.metrics.useEffect > 5) return 'MEDIUM';
    return 'LOW';
  }

  generateReport() {
    const severity = this.getSeverity();
    const isGodComponent = severity === 'CRITICAL' || severity === 'HIGH';

    if (!isGodComponent) {
      return {
        isGodComponent: false,
        severity: 'LOW',
        message: 'Component appears healthy'
      };
    }

    const issues = [];
    if (this.metrics.loc > 500) issues.push(`Excessive LOC: ${this.metrics.loc} lines (>500)`);
    else if (this.metrics.loc > 300) issues.push(`Large file: ${this.metrics.loc} lines (>300)`);
    
    if (this.metrics.useState > 8) issues.push(`Too many state variables: ${this.metrics.useState} (>8)`);
    if (this.metrics.useEffect > 5) issues.push(`Too many effects: ${this.metrics.useEffect} (>5)`);
    if (this.metrics.responsibilities.length > 4) issues.push(`Too many responsibilities: ${this.metrics.responsibilities.length} (>4)`);
    if (this.metrics.functions > 10) issues.push(`Too many functions: ${this.metrics.functions} (>10)`);
    if (this.metrics.imports > 10) issues.push(`Many imports: ${this.metrics.imports} (>10)`);

    return {
      isGodComponent: true,
      severity,
      metrics: this.metrics,
      issues,
      responsibilities: this.metrics.responsibilities,
      suggestions: this.generateSuggestions()
    };
  }

  generateSuggestions() {
    const suggestions = [];

    if (this.metrics.responsibilities.some(r => r.type === 'Data Fetching')) {
      suggestions.push('Extract data fetching logic into custom hooks (e.g., usePositions, useStockData)');
    }

    if (this.metrics.responsibilities.some(r => r.type === 'Business Logic')) {
      suggestions.push('Move business logic calculations to separate utility functions or service classes');
    }

    if (this.metrics.useState > 5) {
      suggestions.push('Consider using useReducer for complex state management');
      suggestions.push('Extract related state into custom hooks');
    }

    if (this.metrics.useEffect > 3) {
      suggestions.push('Extract side effects into custom hooks');
      suggestions.push('Combine related effects where possible');
    }

    if (this.metrics.loc > 400) {
      suggestions.push('Split component into smaller, focused sub-components');
      suggestions.push('Use component composition pattern');
    }

    if (this.metrics.responsibilities.some(r => r.type === 'Form Handling')) {
      suggestions.push('Extract form logic into a custom useForm hook');
    }

    return suggestions;
  }
}

// CLI Usage
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node detect-god-component.js <file-path>');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const detector = new GodComponentDetector(filePath);
  const report = detector.analyze();

  if (!report.isGodComponent) {
    console.log('✅ Component appears healthy');
    process.exit(0);
  }

  console.log(`\n🚨 God Component Detected: ${path.basename(filePath)}\n`);
  console.log(`Severity: ${report.severity}`);
  console.log(`LOC: ${report.metrics.loc} lines\n`);
  
  console.log('Issues:');
  report.issues.forEach(issue => console.log(`  - ${issue}`));
  
  console.log(`\nResponsibilities Found (${report.responsibilities.length}):`);
  report.responsibilities.forEach(r => console.log(`  - ${r.type}: ${r.evidence}`));
  
  console.log('\nMetrics:');
  console.log(`  - useState: ${report.metrics.useState}`);
  console.log(`  - useEffect: ${report.metrics.useEffect}`);
  console.log(`  - Custom Hooks: ${report.metrics.customHooks}`);
  console.log(`  - Functions: ${report.metrics.functions}`);
  console.log(`  - Props: ${report.metrics.props}`);
  console.log(`  - Imports: ${report.metrics.imports}`);
  console.log(`  - Conditionals: ${report.metrics.conditionals}`);
  
  console.log('\nRefactoring Suggestions:');
  report.suggestions.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
  console.log('');
}

module.exports = GodComponentDetector;
