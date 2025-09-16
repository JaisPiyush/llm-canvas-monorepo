export interface Context {
    [key: string]: any;
  }
  
  export interface ContextKey {
    key: string;
    type: 'boolean' | 'string' | 'number';
    description: string;
    defaultValue?: any;
  }
  
  /**
   * Evaluates 'when' clause expressions against a context
   */
  export class ContextEvaluator {
    private readonly contextKeys = new Map<string, ContextKey>();
    private readonly context = new Map<string, any>();
  
    /**
     * Register a context key
     */
    registerContextKey(contextKey: ContextKey): void {
      this.contextKeys.set(contextKey.key, contextKey);
      
      if (contextKey.defaultValue !== undefined) {
        this.context.set(contextKey.key, contextKey.defaultValue);
      }
    }
  
    /**
     * Set a context value
     */
    setContext(key: string, value: any): void {
      const contextKey = this.contextKeys.get(key);
      if (contextKey) {
        // Type validation
        if (!this.isValidType(value, contextKey.type)) {
          throw new Error(`Invalid type for context key '${key}'. Expected ${contextKey.type}, got ${typeof value}`);
        }
      }
      
      this.context.set(key, value);
    }
  
    /**
     * Get a context value
     */
    getContext(key: string): any {
      return this.context.get(key);
    }
  
    /**
     * Evaluate a 'when' clause expression
     */
    evaluate(expression: string): boolean {
      if (!expression || expression.trim() === '') {
        return true;
      }
  
      try {
        return this.evaluateExpression(expression.trim());
      } catch (error) {
        console.warn(`Failed to evaluate when clause '${expression}':`, error);
        return false;
      }
    }
  
    /**
     * Get all registered context keys
     */
    getContextKeys(): ContextKey[] {
      return Array.from(this.contextKeys.values());
    }
  
    /**
     * Get current context
     */
    getCurrentContext(): Map<string, any> {
      return new Map(this.context);
    }
  
    private isValidType(value: any, expectedType: string): boolean {
      switch (expectedType) {
        case 'boolean':
          return typeof value === 'boolean';
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number';
        default:
          return true;
      }
    }
  
    private evaluateExpression(expression: string): boolean {
      // Handle simple cases
      if (expression === 'true') return true;
      if (expression === 'false') return false;
  
      // Handle negation
      if (expression.startsWith('!')) {
        return !this.evaluateExpression(expression.slice(1).trim());
      }
  
      // Handle logical operators
      if (expression.includes('&&')) {
        const parts = expression.split('&&').map(p => p.trim());
        return parts.every(part => this.evaluateExpression(part));
      }
  
      if (expression.includes('||')) {
        const parts = expression.split('||').map(p => p.trim());
        return parts.some(part => this.evaluateExpression(part));
      }
  
      // Handle comparison operators
      const comparisonMatch = expression.match(/^(.+?)\s*(==|!=|<|>|<=|>=)\s*(.+)$/);
      if (comparisonMatch) {
        const [, left, operator, right] = comparisonMatch;
        return this.evaluateComparison(left.trim(), operator, right.trim());
      }
  
      // Handle context key lookup
      if (expression.includes('.')) {
        return this.evaluateContextKey(expression);
      }
  
      // Simple context key
      const value = this.context.get(expression);
      return Boolean(value);
    }
  
    private evaluateComparison(left: string, operator: string, right: string): boolean {
      const leftValue = this.getExpressionValue(left);
      const rightValue = this.getExpressionValue(right);
  
      switch (operator) {
        case '==':
          return leftValue === rightValue;
        case '!=':
          return leftValue !== rightValue;
        case '<':
          return leftValue < rightValue;
        case '>':
          return leftValue > rightValue;
        case '<=':
          return leftValue <= rightValue;
        case '>=':
          return leftValue >= rightValue;
        default:
          return false;
      }
    }
  
    private evaluateContextKey(expression: string): boolean {
      // Handle nested context keys like 'view.focused'
      const parts = expression.split('.');
      let value = this.context.get(parts[0]);
      
      for (let i = 1; i < parts.length && value != null; i++) {
        value = value[parts[i]];
      }
      
      return Boolean(value);
    }
  
    private getExpressionValue(expression: string): any {
      // Handle quoted strings
      if ((expression.startsWith('"') && expression.endsWith('"')) ||
          (expression.startsWith("'") && expression.endsWith("'"))) {
        return expression.slice(1, -1);
      }
  
      // Handle numbers
      if (/^\d+(\.\d+)?$/.test(expression)) {
        return parseFloat(expression);
      }
  
      // Handle booleans
      if (expression === 'true') return true;
      if (expression === 'false') return false;
  
      // Handle context keys
      if (expression.includes('.')) {
        const parts = expression.split('.');
        let value = this.context.get(parts[0]);
        
        for (let i = 1; i < parts.length && value != null; i++) {
          value = value[parts[i]];
        }
        
        return value;
      }
  
      // Simple context key
      return this.context.get(expression);
    }
  }
  
  // Default context evaluator instance
  export const contextEvaluator = new ContextEvaluator();
  
  // Register common context keys
  contextEvaluator.registerContextKey({
    key: 'extensionDevelopment',
    type: 'boolean',
    description: 'Whether the application is running in extension development mode',
    defaultValue: false
  });
  
  contextEvaluator.registerContextKey({
    key: 'workspaceHasFiles',
    type: 'boolean',
    description: 'Whether the workspace has any files',
    defaultValue: false
  });
  
  contextEvaluator.registerContextKey({
    key: 'view',
    type: 'string',
    description: 'The currently focused view ID',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'viewItem',
    type: 'string',
    description: 'The context value of the selected view item',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'resourceExtname',
    type: 'string',
    description: 'The file extension of the selected resource',
    defaultValue: ''
  });
  
  contextEvaluator.registerContextKey({
    key: 'resourceFilename',
    type: 'string',
    description: 'The filename of the selected resource',
    defaultValue: ''
  });