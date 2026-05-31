import { describe, it, expect } from 'vitest';
import { compileWithDeterministicEngine } from '../promptEngine';

describe('Deterministic Prompt Engine', () => {
  it('should always return a valid PromptManifest', () => {
    const result = compileWithDeterministicEngine('Write a customer support bot');
    expect(result).toBeDefined();
    expect(result.systemInstruction).toBeTruthy();
    expect(result.userTemplate).toBeTruthy();
    expect(result.variables.length).toBeGreaterThan(0);
    expect(result.examples.length).toBeGreaterThanOrEqual(1);
    expect(result.phase).toBe('deterministic');
  });

  it('should inject exactly 6 safety guardrails on every compilation', () => {
    const result = compileWithDeterministicEngine('any arbitrary idea');
    expect(result.safetyGuardrails).toHaveLength(6);
  });

  it('should resolve correct role for security-related ideas', () => {
    const result = compileWithDeterministicEngine('audit OWASP vulnerabilities in Express backend');
    expect(result.role).toContain('Security');
    expect(result.expertise).toBe('specialist');
  });

  it('should resolve correct role for TypeScript coding ideas', () => {
    const result = compileWithDeterministicEngine('refactor TypeScript functions with better types');
    expect(result.role).toContain('Software Engineer');
  });

  it('should resolve correct role for creative writing ideas', () => {
    const result = compileWithDeterministicEngine('write a fiction story about space exploration');
    expect(result.role).toContain('Writer');
    expect(result.tone).toBe('creative');
  });

  it('should infer JSON output format for data extraction tasks', () => {
    const result = compileWithDeterministicEngine('extract structured JSON schema from financial data');
    expect(result.outputFormat).toBe('json');
  });

  it('should infer code output format for programming tasks', () => {
    const result = compileWithDeterministicEngine('implement a TypeScript class with unit tests');
    expect(result.outputFormat).toBe('code');
  });

  it('should produce valid scores (0-100) for all dimensions', () => {
    const result = compileWithDeterministicEngine('analyze sales data trends for Q3');
    expect(result.scores.clarity).toBeGreaterThanOrEqual(0);
    expect(result.scores.clarity).toBeLessThanOrEqual(100);
    expect(result.scores.constraintAdherence).toBeGreaterThanOrEqual(0);
    expect(result.scores.constraintAdherence).toBeLessThanOrEqual(100);
    expect(result.scores.overall).toBeGreaterThanOrEqual(0);
    expect(result.scores.overall).toBeLessThanOrEqual(100);
  });

  it('should extract explicit {{variable}} placeholders from idea', () => {
    const result = compileWithDeterministicEngine('Analyze {{code_snippet}} for {{vulnerability_type}} issues');
    expect(result.variables).toContain('code_snippet');
    expect(result.variables).toContain('vulnerability_type');
  });

  it('should handle empty or minimal input without crashing', () => {
    expect(() => compileWithDeterministicEngine('')).not.toThrow();
    expect(() => compileWithDeterministicEngine('   ')).not.toThrow();
    expect(() => compileWithDeterministicEngine('a')).not.toThrow();
  });

  it('should produce non-stub output different from sandbox placeholder', () => {
    const result = compileWithDeterministicEngine('build a customer service chatbot');
    expect(result.systemInstruction).not.toContain('sandbox');
    expect(result.userTemplate).not.toContain('sandbox');
    expect(result.scores.overall).not.toBe(50);
  });

  it('should always include phase-1 tag in output', () => {
    const result = compileWithDeterministicEngine('create a marketing email writer');
    expect(result.tags).toContain('phase-1');
    expect(result.tags).toContain('deterministic');
  });

  it('should detect constraints for JSON output tasks', () => {
    const result = compileWithDeterministicEngine('parse invoices and return JSON');
    expect(result.constraints.some(c => c.toLowerCase().includes('json'))).toBe(true);
  });

  it('should add the security tag for security-related tasks', () => {
    const result = compileWithDeterministicEngine('run a security vulnerability scan');
    expect(result.tags).toContain('security');
  });
});
