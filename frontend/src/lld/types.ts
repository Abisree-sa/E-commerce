export type LldNodeType = 
  | 'controller'
  | 'service'
  | 'repository'
  | 'entity'
  | 'database'
  | 'dto'
  | 'event'
  | 'broker'
  | 'cache'
  | 'external'
  | 'component'
  | 'interface'
  | 'state'
  | 'provider';

export interface LldAttribute {
  name: string;
  type: string;
  dbColumn?: string;
  dbType?: string;
  constraints?: string;
  purpose: string;
  jpaAnnotations?: string[];
  javaField?: string;
}

export interface LldMethod {
  name: string;
  visibility: '+' | '-' | '#';
  returnType: string;
  parameters: string;
  transactional?: boolean;
  sqlQuery?: string;
  purpose: string;
}

export interface LldNode {
  id: string;
  label: string;
  type: LldNodeType;
  package?: string;
  className?: string;
  attributes?: LldAttribute[];
  methods?: LldMethod[];
  responsibilities: string;
  implementationNotes?: string;
  springAnnotations?: string[];
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface LldConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  type: 'sync_call' | 'implements' | 'extends' | 'depends_on' | 'jpa_mapping' | 'async_event' | 'sql_query' | 'redis_cmd';
  action?: string;
}

export type LldPacketType = 
  | 'request' 
  | 'response' 
  | 'query' 
  | 'result' 
  | 'cache_hit' 
  | 'cache_miss' 
  | 'event' 
  | 'consumer'
  | 'failure'
  | 'transaction';

export interface LldWorkflowStep {
  stepNumber: number;
  title: string;
  sourceNodeId: string;
  targetNodeId: string;
  fromName: string;
  toName: string;
  method?: string;
  payload?: string;
  validation?: string;
  databaseOperation?: string;
  transaction?: string;
  result?: string;
  nextStep?: string;
  packetType: LldPacketType;
  durationMs: number;
  explanation: string;
  whyThisStepExists: string;
  connectionType?: 'sync' | 'async' | 'cache' | 'database' | 'event';
  codeSnippet?: string;
}

export interface LldScenario {
  id: string;
  title: string;
  description: string;
  steps: LldWorkflowStep[];
}

export interface LldDiagramData {
  id: string;
  code: string; // 'LLD-01' .. 'LLD-30'
  title: string;
  subtitle: string;
  module: 'inventory' | 'payment' | 'order' | 'product' | 'search' | 'cart' | 'checkout' | 'system';
  description: string;
  nodes: LldNode[];
  connections: LldConnection[];
  scenarios: LldScenario[];
}

export interface AttributeTraceDetail {
  attributeName: string;
  dbColumn: string;
  dbTable: string;
  jpaField: string;
  javaClass: string;
  type: string;
  constraints: string;
  usedByServiceMethod: string;
  updatedBy: string;
  concurrencyStrategy: string;
  businessPurpose: string;
  testCoverage: string;
}

export interface MethodTraceDetail {
  methodName: string;
  className: string;
  package: string;
  calledBy: string;
  inputs: string;
  validationRules: string;
  transactionBoundary: string;
  repositoryCalls: string;
  databaseUpdates: string;
  eventsEmitted: string;
  errorHandling: string;
  testClass: string;
}

export interface ApiTraceDetail {
  endpoint: string;
  httpMethod: string;
  controller: string;
  requestDto: string;
  validation: string;
  service: string;
  repository: string;
  database: string;
  event: string;
  response: string;
}

export interface EventTraceDetail {
  eventName: string;
  producer: string;
  broker: string;
  consumers: string[];
  idempotencyStrategy: string;
  outboxTable: string;
  failureRecovery: string;
}

export interface JudgeStep {
  stepNumber: number;
  title: string;
  diagramId: string;
  scenarioId?: string;
  focusNodeId?: string;
  keyTakeaway: string;
  codeHighlight: string;
  architecturalInsight: string;
}
