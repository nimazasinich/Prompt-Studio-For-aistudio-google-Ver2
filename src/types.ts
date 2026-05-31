/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptExample {
  id: string;
  input: string;
  output: string;
}

export interface PromptScore {
  clarity: number;
  constraintAdherence: number;
  edgeCases: number;
  tokenEfficiency: number;
  overall: number;
}

export interface PromptDefinition {
  id: string;
  version: number;
  systemInstruction: string;
  userTemplate: string;
  examples: PromptExample[];
  variables: string[];
  createdAt: string;
  scores: PromptScore;
  scoringFeedback: {
    clarity: string;
    constraintAdherence: string;
    edgeCases: string;
    tokenEfficiency: string;
  };
  tags?: string[];
}

export type HistoryItemType = 'chat' | 'optimize' | 'feedback_analysis' | 'test_run';

export interface PromptHistoryItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type: HistoryItemType;
  metadata?: {
    optimizedPrompt?: PromptDefinition;
    extractedVariables?: string[];
    feedbackAnalysis?: {
      diagnosis: string;
      rootCause: string;
      suggestedFixes: string[];
      previousOutput: string;
      pastedPrompt: string;
    };
    testRuns?: {
      scenarioName: string;
      inputs: Record<string, string>;
      output: string;
      evalVerdict: 'pass' | 'fail' | 'partial';
      score: number;
      explanation: string;
    }[];
  };
}

export interface PromptSession {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  history: PromptHistoryItem[];
  currentPrompt: PromptDefinition | null;
  versionHistory: PromptDefinition[];
}

export interface TestScenario {
  id: string;
  name: string;
  inputs: Record<string, string>; // maps variable_name -> test value
  expectedCriteria: string[]; // checklist criteria (e.g., "Must be in bullet points", "No greetings")
}

export interface EcosystemIntegrationState {
  googleDrive: {
    connected: boolean;
    linkedDocId?: string;
    linkedDocName?: string;
    linkedDocContent?: string;
  };
  notebookLM: {
    connected: boolean;
    linkedProjectId?: string;
    linkedProjectName?: string;
    notesCount?: number;
    linkedContent?: string;
  };
  github: {
    connected: boolean;
    repoName?: string;
    branch?: string;
    lastCommitHash?: string;
  };
  huggingFace: {
    connected: boolean;
    selectedTemplate?: string;
  };
}

export interface InternalKnowledgeArticle {
  id: string;
  title: string;
  category: 'token_mgmt' | 'sys_inst' | 'safety' | 'few_shot' | 'ai_studio';
  summary: string;
  content: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  bio?: string;
  preferredModel?: string;
  avatarUrl?: string;
  provider?: 'local' | 'google' | 'github';
  createdAt: string;
}

