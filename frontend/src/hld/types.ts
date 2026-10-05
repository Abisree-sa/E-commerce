export type NodeType = 
  | 'client'
  | 'gateway'
  | 'service'
  | 'cache'
  | 'database'
  | 'broker'
  | 'external'
  | 'loadbalancer'
  | 'cdn';

export interface HldNode {
  id: string;
  label: string;
  type: NodeType;
  iconName?: string;
  description: string;
  responsibility: string;
  receives: string;
  produces: string;
  dataOwnership: string;
  dependencies: string[];
  communication: string;
  whyItExists: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface Waypoint {
  x: number;
  y: number;
}

export interface HldConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol: 'HTTP' | 'HTTPS' | 'SQL' | 'Redis' | 'Kafka Event' | 'SMTP';
  type?: 'sync' | 'async' | 'cache' | 'database' | 'event';
  waypoints?: Waypoint[];
  action?: string;
}

export type PacketType = 
  | 'request' 
  | 'response' 
  | 'query' 
  | 'result' 
  | 'cache_hit' 
  | 'cache_miss' 
  | 'event' 
  | 'consumer'
  | 'failover'
  | 'failure';

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  sourceNodeId: string;
  targetNodeId: string;
  fromName?: string;
  toName?: string;
  action: string;
  operation: string;
  payload: string;
  result: string;
  packetType: PacketType;
  durationMs: number;
  explanation: string;
  why?: string;
  nextStep?: string;
  connectionType?: 'sync' | 'async' | 'cache' | 'database' | 'event';
  activeNodes?: string[];
  failedNodeId?: string;
}

export interface HldScenario {
  id: string;
  title: string;
  description: string;
  traceFeatureId?: string;
  steps: WorkflowStep[];
}

export interface HldDiagramData {
  id: string;
  code: string; // 'HLD-01' .. 'HLD-10'
  title: string;
  subtitle: string;
  description: string;
  nodes: HldNode[];
  connections: HldConnection[];
  scenarios: HldScenario[];
}

export interface FeatureTrace {
  id: string;
  label: string;
  activeNodeIds: string[];
  activeConnectionIds: string[];
  description: string;
}

