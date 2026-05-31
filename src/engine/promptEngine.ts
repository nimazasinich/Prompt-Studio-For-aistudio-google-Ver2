/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Phase 1 Deterministic Prompt Engine
 *
 * Transforms a raw user idea into a structured PromptManifest without
 * any external API calls. This is the PromptForge v4.0 deterministic
 * compiler ported to TypeScript. It always produces a valid, useful
 * output - even with no internet or API key configured.
 *
 * Pipeline:
 *   1. roleResolver        → infer persona and expertise level
 *   2. constraintDetector  → extract what the prompt must and must not do
 *   3. styleEngine         → determine tone, format, verbosity
 *   4. safetyInjector      → always inject 6 default guardrails
 *   5. formatInferrer      → determine optimal output format
 *   6. fewShotBuilder      → construct domain-matched examples
 *   7. autoTagger          → assign category tags
 */

export interface PromptManifest {
  role: string;
  expertise: 'junior' | 'senior' | 'expert' | 'specialist';
  constraints: string[];
  safetyGuardrails: string[];
  tone: 'formal' | 'technical' | 'creative' | 'instructional' | 'analytical';
  outputFormat: 'json' | 'markdown' | 'code' | 'prose' | 'structured';
  systemInstruction: string;
  userTemplate: string;
  variables: string[];
  examples: Array<{ id: string; input: string; output: string }>;
  tags: string[];
  scores: {
    clarity: number;
    constraintAdherence: number;
    edgeCases: number;
    tokenEfficiency: number;
    overall: number;
  };
  scoringFeedback: {
    clarity: string;
    constraintAdherence: string;
    edgeCases: string;
    tokenEfficiency: string;
  };
  phase: 'deterministic';
}

// ── Role Resolution ──────────────────────────────────────────────────────────

const ROLE_PATTERNS: Array<{ pattern: RegExp; role: string; expertise: PromptManifest['expertise'] }> = [
  { pattern: /\b(security|audit|owasp|vulnerability|pentest|cve)\b/i, role: 'Principal Security Engineer', expertise: 'specialist' },
  { pattern: /\b(typescript|javascript|react|node|backend|frontend|fullstack|api|code|refactor|debug)\b/i, role: 'Senior Software Engineer', expertise: 'expert' },
  { pattern: /\b(python|ml|machine learning|nlp|model|training|inference|pytorch|tensorflow)\b/i, role: 'Machine Learning Engineer', expertise: 'expert' },
  { pattern: /\b(data|analytics|sql|database|etl|pipeline|bigquery|spark)\b/i, role: 'Senior Data Engineer', expertise: 'senior' },
  { pattern: /\b(finance|accounting|ledger|audit|ebitda|revenue|financial)\b/i, role: 'Senior Forensic Accountant', expertise: 'specialist' },
  { pattern: /\b(write|writing|creative|story|fiction|narrative|character|world)\b/i, role: 'Award-Winning Creative Writer', expertise: 'expert' },
  { pattern: /\b(marketing|copy|ad|campaign|seo|content|brand)\b/i, role: 'Senior Marketing Copywriter', expertise: 'senior' },
  { pattern: /\b(legal|contract|compliance|gdpr|regulation|policy)\b/i, role: 'Senior Legal Analyst', expertise: 'specialist' },
  { pattern: /\b(product|ux|design|user|interface|wireframe|prototype)\b/i, role: 'Senior Product Designer', expertise: 'senior' },
  { pattern: /\b(devops|ci|cd|docker|kubernetes|terraform|infrastructure|deployment)\b/i, role: 'DevOps Platform Engineer', expertise: 'expert' },
  { pattern: /\b(customer|support|service|helpdesk|ticket|escalation)\b/i, role: 'Customer Success Manager', expertise: 'senior' },
  { pattern: /\b(translate|translation|language|multilingual|localization)\b/i, role: 'Professional Translator', expertise: 'expert' },
  { pattern: /\b(research|academic|scientific|paper|study|hypothesis|experiment)\b/i, role: 'Senior Research Analyst', expertise: 'specialist' },
  { pattern: /\b(summarize|summary|summarise|extract|document|report|brief)\b/i, role: 'Professional Technical Writer', expertise: 'senior' },
  { pattern: /\b(teach|explain|tutorial|lesson|education|student|learning)\b/i, role: 'Expert Educator and Curriculum Designer', expertise: 'expert' },
];

function resolveRole(idea: string): { role: string; expertise: PromptManifest['expertise'] } {
  for (const entry of ROLE_PATTERNS) {
    if (entry.pattern.test(idea)) {
      return { role: entry.role, expertise: entry.expertise };
    }
  }
  return { role: 'Expert AI Assistant', expertise: 'senior' };
}

// ── Constraint Detection ─────────────────────────────────────────────────────

function detectConstraints(idea: string): string[] {
  const constraints: string[] = [];

  if (/\b(json|structured|schema)\b/i.test(idea)) {
    constraints.push('Always output valid, parseable JSON matching the requested schema.');
    constraints.push('Never include markdown code fences, commentary, or preamble before the JSON object.');
  }
  if (/\b(code|function|class|method|script)\b/i.test(idea)) {
    constraints.push('Output only clean, production-ready code. Do not add explanatory prose outside of code comments.');
    constraints.push('Include comprehensive type annotations and handle all edge cases explicitly.');
  }
  if (/\b(bullet|list|item|step|point)\b/i.test(idea)) {
    constraints.push('Format all responses as ordered or unordered lists as appropriate. No paragraph prose.');
  }
  if (/\b(concise|brief|short|summary|terse)\b/i.test(idea)) {
    constraints.push('Responses must be concise. Do not exceed 3 sentences or 150 tokens unless explicitly requested.');
  }
  if (/\b(formal|professional|corporate|business)\b/i.test(idea)) {
    constraints.push('Maintain strictly formal, professional language. No contractions, colloquialisms, or casual phrasing.');
  }
  if (/\b(creative|fiction|story|narrative)\b/i.test(idea)) {
    constraints.push('Avoid clichés, predictable tropes, and formulaic narrative structures.');
    constraints.push('Use precise sensory details, active verbs, and subtext-rich dialogue.');
  }
  if (/\b(no greeting|no introduction|skip preamble|no acknowledgment)\b/i.test(idea)) {
    constraints.push('Never begin responses with greetings, affirmations, or meta-commentary like "Great question!" or "Sure!".');
  }

  // Always add these universal output quality constraints
  constraints.push('Never add unsolicited opinions, disclaimers, or filler phrases.');
  constraints.push('Responses must directly address the user request without restating the question.');

  return constraints;
}

// ── Safety Injector ──────────────────────────────────────────────────────────
// These 6 guardrails are ALWAYS injected deterministically regardless of user input

const SAFETY_GUARDRAILS: string[] = [
  'Never generate, reproduce, or assist with creating malware, exploits, or weaponizable technical instructions.',
  'Refuse requests that could facilitate violence, illegal activity, or harm to individuals or groups.',
  'Do not generate personally identifiable information (PII) about real individuals without explicit authorization.',
  'Do not produce content that could be used for deception, phishing, impersonation, or social engineering.',
  'Maintain factual accuracy; clearly distinguish between established facts and speculative or hypothetical content.',
  'Respect intellectual property: do not reproduce substantial copyrighted text verbatim.',
];

// ── Style Engine ─────────────────────────────────────────────────────────────

function inferStyle(idea: string): PromptManifest['tone'] {
  if (/\b(creative|story|fiction|narrative|write|novel)\b/i.test(idea)) return 'creative';
  if (/\b(code|function|api|debug|refactor|implement|script)\b/i.test(idea)) return 'technical';
  if (/\b(analyze|analyse|evaluate|assess|compare|audit|diagnose)\b/i.test(idea)) return 'analytical';
  if (/\b(teach|explain|tutorial|guide|how to|lesson|steps)\b/i.test(idea)) return 'instructional';
  if (/\b(report|document|professional|business|formal|corporate)\b/i.test(idea)) return 'formal';
  return 'technical';
}

// ── Format Inferrer ──────────────────────────────────────────────────────────

function inferFormat(idea: string): PromptManifest['outputFormat'] {
  if (/\b(json|schema|structured|parse|extract data)\b/i.test(idea)) return 'json';
  if (/\b(code|function|script|class|method|implement)\b/i.test(idea)) return 'code';
  if (/\b(markdown|document|report|table|header)\b/i.test(idea)) return 'markdown';
  if (/\b(story|narrative|creative|fiction|dialogue)\b/i.test(idea)) return 'prose';
  return 'structured';
}

// ── Variable Extractor ───────────────────────────────────────────────────────

function extractVariables(idea: string): string[] {
  const vars: string[] = [];
  const existing = idea.match(/\{\{(\w+)\}\}/g);
  if (existing) {
    existing.forEach(v => vars.push(v.replace(/[{}]/g, '')));
    return [...new Set(vars)];
  }

  // Infer variables from idea content
  if (/\b(code|function|script|endpoint)\b/i.test(idea)) vars.push('code_input');
  if (/\b(document|text|content|article|passage)\b/i.test(idea)) vars.push('input_text');
  if (/\b(topic|subject|theme|concept)\b/i.test(idea)) vars.push('topic');
  if (/\b(language|translate|target)\b/i.test(idea)) vars.push('target_language');
  if (/\b(format|style|type)\b/i.test(idea)) vars.push('output_format');
  if (/\b(year|date|period|quarter|fiscal)\b/i.test(idea)) vars.push('time_period');

  if (vars.length === 0) vars.push('user_input');
  return [...new Set(vars)];
}

// ── Few-Shot Builder ─────────────────────────────────────────────────────────

function buildFewShotExamples(
  role: string,
  format: PromptManifest['outputFormat'],
  variables: string[]
): PromptManifest['examples'] {
  const varFill = variables.reduce((acc, v) => {
    acc[v] = `[example ${v.replace(/_/g, ' ')}]`;
    return acc;
  }, {} as Record<string, string>);

  const inputStr = variables.map(v => `${v}: "${varFill[v]}"`).join(', ');

  if (format === 'json') {
    return [
      {
        id: 'ex_1',
        input: inputStr,
        output: JSON.stringify({ result: 'structured output matching schema', status: 'success', confidence: 0.95 }, null, 2),
      },
      {
        id: 'ex_2',
        input: `${variables[0] ?? 'user_input'}: "[edge case: empty or invalid input]"`,
        output: JSON.stringify({ result: null, status: 'error', message: 'Input validation failed: field must not be empty' }, null, 2),
      },
    ];
  }

  if (format === 'code') {
    return [
      {
        id: 'ex_1',
        input: inputStr,
        output: `// Optimized, type-safe implementation\nfunction processInput(input: string): ProcessedResult {\n  if (!input?.trim()) throw new Error('Input must not be empty');\n  // core logic here\n  return { success: true, output: input.toUpperCase() };\n}`,
      },
      {
        id: 'ex_2',
        input: `${variables[0] ?? 'user_input'}: "[function with edge cases: null, empty array, type mismatch]"`,
        output: `// Edge-case hardened variant\nfunction safeProcess(items: unknown[]): SafeResult {\n  if (!Array.isArray(items) || items.length === 0) {\n    return { success: false, error: 'Expected non-empty array' };\n  }\n  return { success: true, count: items.length };\n}`,
      },
    ];
  }

  return [
    {
      id: 'ex_1',
      input: inputStr,
      output: `[Precisely structured response from ${role}. Directly addresses the request. No preamble or filler. Meets all specified constraints and format requirements.]`,
    },
    {
      id: 'ex_2',
      input: `${variables[0] ?? 'user_input'}: "[challenging or ambiguous edge case]"`,
      output: `[Edge case handled appropriately by ${role}. Response explicitly addresses the ambiguity, provides structured output, and maintains all constraints.]`,
    },
  ];
}

// ── Auto Tagger ──────────────────────────────────────────────────────────────

function autoTag(idea: string, _role: string): string[] {
  const tags: string[] = ['deterministic', 'phase-1'];

  if (/\b(security|owasp|vulnerability|audit)\b/i.test(idea)) tags.push('security');
  if (/\b(code|typescript|javascript|python|function)\b/i.test(idea)) tags.push('code-generation');
  if (/\b(creative|story|fiction|write)\b/i.test(idea)) tags.push('creative-writing');
  if (/\b(data|analytics|sql|finance|ledger)\b/i.test(idea)) tags.push('data-analysis');
  if (/\b(production|enterprise|professional)\b/i.test(idea)) tags.push('production');
  if (/\b(safety|filter|guardrail|moderation)\b/i.test(idea)) tags.push('safety-hardened');
  if (/\b(json|structured|schema|parse)\b/i.test(idea)) tags.push('structured-output');

  return [...new Set(tags)];
}

// ── System Instruction Builder ───────────────────────────────────────────────

function buildSystemInstruction(
  role: string,
  expertise: PromptManifest['expertise'],
  tone: PromptManifest['tone'],
  constraints: string[],
  guardrails: string[],
  format: PromptManifest['outputFormat']
): string {
  const expertiseLabel = {
    junior: 'proficient',
    senior: 'highly experienced senior',
    expert: 'world-class expert',
    specialist: 'recognized domain specialist',
  }[expertise];

  const toneLabel = {
    formal: 'formal, precise, and professional',
    technical: 'technical, exact, and implementation-focused',
    creative: 'vivid, original, and emotionally resonant',
    instructional: 'clear, structured, and pedagogically sound',
    analytical: 'rigorous, evidence-based, and structured',
  }[tone];

  const formatLabel = {
    json: 'Valid JSON only. No markdown fences, no commentary.',
    code: 'Clean, typed, production-ready code with inline comments.',
    markdown: 'Well-structured Markdown with headers, lists, and code blocks as appropriate.',
    prose: 'Rich, flowing prose with precise vocabulary and clear structure.',
    structured: 'Structured, organized output appropriate to the task.',
  }[format];

  return `You are a ${expertiseLabel} ${role}. Your communication style is ${toneLabel}.

BEHAVIORAL CONSTRAINTS:
${constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

SAFETY GUARDRAILS (non-negotiable):
${guardrails.map((g, i) => `${i + 1}. ${g}`).join('\n')}

OUTPUT FORMAT: ${formatLabel}

Respond only within your defined role. Maintain all constraints on every response without exception.`;
}

// ── User Template Builder ────────────────────────────────────────────────────

function buildUserTemplate(variables: string[], format: PromptManifest['outputFormat']): string {
  const varSection = variables.map(v => `{{${v}}}`).join('\n');

  if (format === 'json') {
    return `Process the following input and return structured JSON:\n\n${varSection}`;
  }
  if (format === 'code') {
    return `Analyze and optimize the following:\n\n${varSection}\n\nApply all constraints and handle edge cases explicitly.`;
  }
  if (format === 'prose') {
    return `Using the following context:\n\n${varSection}\n\nProduce a response that meets all specified requirements.`;
  }
  return `${variables.length === 1 ? `Task: {{${variables[0]}}}` : variables.map(v => `${v.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: {{${v}}}`).join('\n\n')}`;
}

// ── Scoring ──────────────────────────────────────────────────────────────────

function scoreManifest(
  manifest: Omit<PromptManifest, 'scores' | 'scoringFeedback' | 'phase'>
): Pick<PromptManifest, 'scores' | 'scoringFeedback'> {
  const clarityScore = Math.min(100,
    70
    + (manifest.constraints.length >= 3 ? 10 : 0)
    + (manifest.examples.length >= 2 ? 10 : 0)
    + (manifest.systemInstruction.length > 300 ? 10 : 0)
  );

  const constraintScore = Math.min(100,
    65
    + (manifest.safetyGuardrails.length >= 6 ? 15 : 0)
    + (manifest.constraints.length >= 2 ? 10 : 0)
    + (manifest.userTemplate.includes('{{') ? 10 : 0)
  );

  const edgeCaseScore = Math.min(100,
    60
    + (manifest.examples.length >= 2 ? 15 : 0)
    + (manifest.examples.some(e => e.input.toLowerCase().includes('edge') || e.input.toLowerCase().includes('invalid')) ? 15 : 0)
    + (manifest.constraints.some(c => c.toLowerCase().includes('edge') || c.toLowerCase().includes('null') || c.toLowerCase().includes('empty')) ? 10 : 0)
  );

  const tokenScore = Math.min(100,
    70
    + (manifest.variables.length <= 3 ? 15 : 5)
    + (manifest.userTemplate.length < 300 ? 15 : 5)
  );

  const overall = Math.round((clarityScore + constraintScore + edgeCaseScore + tokenScore) / 4);

  return {
    scores: {
      clarity: clarityScore,
      constraintAdherence: constraintScore,
      edgeCases: edgeCaseScore,
      tokenEfficiency: tokenScore,
      overall,
    },
    scoringFeedback: {
      clarity: `Role and constraints are ${clarityScore >= 85 ? 'clearly defined with strong persona anchoring' : 'defined but could benefit from more specific behavioral boundaries'}.`,
      constraintAdherence: `${manifest.safetyGuardrails.length} safety guardrails injected. ${manifest.constraints.length} domain constraints applied. ${constraintScore >= 85 ? 'Comprehensive constraint coverage.' : 'Consider adding more specific negative constraints.'}`,
      edgeCases: `${manifest.examples.length} few-shot examples generated. ${edgeCaseScore >= 80 ? 'Edge case coverage is adequate.' : 'Add more examples targeting invalid inputs and boundary conditions.'}`,
      tokenEfficiency: `${manifest.variables.length} variable(s) defined. Template is ${tokenScore >= 85 ? 'concise and well-scoped' : 'functional but could be more compact'}.`,
    },
  };
}

// ── Main Compiler Function ───────────────────────────────────────────────────

/**
 * Compile a raw user idea into a PromptManifest using only deterministic
 * heuristics. No API calls. Always succeeds. Used as Phase 1 in the
 * two-phase pipeline, and as the sole output when Gemini is unavailable.
 */
export function compileWithDeterministicEngine(idea: string): PromptManifest {
  const safeIdea = (idea || '').trim();
  const { role, expertise } = resolveRole(safeIdea);
  const constraints = detectConstraints(safeIdea);
  const tone = inferStyle(safeIdea);
  const outputFormat = inferFormat(safeIdea);
  const variables = extractVariables(safeIdea);
  const examples = buildFewShotExamples(role, outputFormat, variables);
  const tags = autoTag(safeIdea, role);
  const systemInstruction = buildSystemInstruction(
    role, expertise, tone, constraints, SAFETY_GUARDRAILS, outputFormat
  );
  const userTemplate = buildUserTemplate(variables, outputFormat);

  const baseManifest = {
    role,
    expertise,
    constraints,
    safetyGuardrails: SAFETY_GUARDRAILS,
    tone,
    outputFormat,
    systemInstruction,
    userTemplate,
    variables,
    examples,
    tags,
  };

  const { scores, scoringFeedback } = scoreManifest(baseManifest);

  return {
    ...baseManifest,
    scores,
    scoringFeedback,
    phase: 'deterministic',
  };
}
