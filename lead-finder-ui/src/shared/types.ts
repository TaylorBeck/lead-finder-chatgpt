type UnknownObject = Record<string, unknown>;

export type WidgetState = UnknownObject;

export type SetWidgetState = (state: WidgetState) => Promise<void>;

export type Theme = "light" | "dark";

export type SafeAreaInsets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type SafeArea = {
  insets: SafeAreaInsets;
};

export type UserAgent = Record<string, unknown>;

export type WebplusGlobals = {
  // visuals
  theme: Theme;
  userAgent: UserAgent;

  // layout
  maxHeight: number;
  displayMode: DisplayMode;
  safeArea: SafeArea;

  // state
  toolInput: UnknownObject;
  toolOutput: UnknownObject;
  widgetState: UnknownObject | null;
  setWidgetState: SetWidgetState;
};

// API types
type API = {
  // Calling APIs
  streamCompletion: StreamCompletion;
  callCompletion: CallCompletion;
  callTool: CallTool;
  sendFollowUpMessage: SendFollowUpMessage;

  // Layout controls
  requestDisplayMode: RequestDisplayMode;
};

/** Display mode */
export type DisplayMode = "pip" | "inline" | "fullscreen";
export type RequestDisplayMode = (args: { mode: DisplayMode }) => Promise<{
  mode: DisplayMode;
}>;

export type CallToolResponse = {
  result: string;
};

export type CallTool = (
  name: string,
  args: Record<string, unknown>
) => Promise<CallToolResponse>;

// Completion types
export type ModelHintName = "thinking-none" | "thinking-low" | "thinking-high";

export type CompletionStreamOptions = {
  systemPrompt?: string | null;
  modelType?: ModelHintName;
};

export type Annotations = {
  audience?: ("user" | "assistant")[] | null;
  priority?: number | null;
};

export type TextContent = {
  type: "text";
  text: string;
  annotations?: Annotations | null;
  _meta?: Record<string, never> | null;
};

export type ImageContent = {
  type: "image";
  data: string;
  mimeType: string;
  annotations?: Annotations | null;
  _meta?: Record<string, never> | null;
};

export type AudioContent = {
  type: "audio";
  data: string;
  mimeType: string;
  annotations?: Annotations | null;
  _meta?: Record<string, never> | null;
};

export type SamplingMessage = {
  role: "user" | "assistant";
  content: TextContent | ImageContent | AudioContent;
};

export type ModelHint = {
  name: ModelHintName;
};

export type ModelPreferences = {
  hints: ModelHint[];
};

export type CreateMessageRequestParams = {
  messages: SamplingMessage[];
  modelPreferences: ModelPreferences;
  systemPrompt?: string | null;
  metadata?: Record<string, string> | null;
};

export type CreateMessageResponse = {
  content: TextContent | ImageContent | AudioContent;
  model: string;
  role: "assistant";
  stopReason?: string;
};

export type StreamCompletion = (
  request: CreateMessageRequestParams
) => AsyncIterable<CreateMessageResponse>;

export type CallCompletion = (
  request: CreateMessageRequestParams
) => Promise<CreateMessageResponse>;

export type SendFollowUpMessage = (args: { prompt: string }) => Promise<void>;

/** Extra events */
export const SET_GLOBALS_EVENT_TYPE = "openai:set_globals";
export class SetGlobalsEvent extends CustomEvent<{
  globals: Partial<WebplusGlobals>;
}> {
  readonly type = SET_GLOBALS_EVENT_TYPE;
}

export const TOOL_RESPONSE_EVENT_TYPE = "openai:tool_response";
export class ToolResponseEvent extends CustomEvent<{
  tool: { name: string; args: UnknownObject };
}> {
  readonly type = TOOL_RESPONSE_EVENT_TYPE;
}

/**
 * Global openai object injected by the web sandbox for communicating with chatgpt host page.
 */
declare global {
  interface Window {
    webplus: API & WebplusGlobals;
    openai: API & WebplusGlobals;
  }

  interface WindowEventMap {
    [SET_GLOBALS_EVENT_TYPE]: SetGlobalsEvent;
    [TOOL_RESPONSE_EVENT_TYPE]: ToolResponseEvent;
  }
}

// Lead Finder specific types
export interface Lead {
  id: string;
  prospect_name: string;
  company: string;
  title?: string;
  industry?: string;
  location?: string;
  source_platform: string;
  source_url: string;
  source_content?: string;
  lead_score: number;
  score_breakdown: {
    intent_strength: number;
    company_fit: number;
    role_relevance: number;
    engagement_level: number;
    timing_signals: number;
  };
  intent_analysis: {
    has_intent: boolean;
    confidence: number;
    intent_level: string;
    urgency_level: string;
    solution_seeking: string[];
    pain_points: string[];
  };
  contact_info?: {
    email?: string;
    email_confidence?: number;
    phone?: string;
    social_profiles?: Record<string, string>;
  };
  company_insights?: {
    industry: string;
    size: string;
    revenue: string;
    technologies: string[];
    recent_news: string[];
  };
}

export interface Metrics {
  total_conversations_analyzed: number;
  qualified_leads_found: number;
  average_lead_score: number;
  platform_breakdown: Record<string, number>;
  industry_breakdown: Record<string, number>;
  geographic_distribution: Record<string, number>;
}

export interface SearchParams {
  keywords: string[];
  industry?: string;
  platforms: string[];
  intent_keywords: string[];
  filters_applied: {
    geographic?: string;
    company_size?: string;
    min_score: number;
  };
}

export interface LeadFinderData {
  leads: Lead[];
  metrics: Metrics;
  search_parameters: SearchParams;
  generated_at: string;
}

