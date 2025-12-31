
export enum AgentCategory {
  CORE = 'Core',
  CREATIVE = 'Creative Suite',
  EDUCATION = 'Educational Intelligence',
  WELLNESS = 'Wellness & Growth',
  SPECIALIZED = 'Specialized Intelligence',
  OPERATIONS = 'Operations'
}

export interface GroundingSource {
  title?: string;
  uri: string;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface User {
  id: string;
  name: string;
  isGuest: boolean;
  avatarUrl?: string;
}

export interface TrainingProtocol {
  id: string;
  name: string;
  rules: string;
  samples: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  agentId?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  audioData?: string; // Raw base64 PCM data
  groundingSources?: GroundingSource[];
  isThinking?: boolean;
  operationId?: string; // For async operations like Video Gen
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: AgentCategory;
  icon: string;
  color: string;
  systemPrompt: string;
  capabilities: string[];
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Zephyr' | 'Fenrir';
  voiceSampleUrl?: string;
  isCustomVoice?: boolean;
}

export interface ChatSession {
  agentId: string;
  messages: Message[];
}
