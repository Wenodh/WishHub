export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  // Identification
  requestId?: string;
  userId?: string;

  // Request/Response
  route?: string;
  method?: string;
  statusCode?: number;
  errorCode?: string;
  durationMs?: number;

  // Execution Context
  service?: string;
  operation?: string;

  // Domain Specific
  store?: string;
  adapter?: string;
  confidence?: number;
  extractionSource?: string[];

  // Arbitrary context
  [key: string]: any;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

export interface IMetrics {
  increment(name: string, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  timing(name: string, value: number, tags?: Record<string, string>): void;
}

export interface ITracing {
  startSpan(name: string, context?: Record<string, any>): any;
  finishSpan(span: any): void;
}

export interface IErrorReporting {
  captureException(error: Error, context?: Record<string, any>): void;
  captureMessage(message: string, context?: Record<string, any>): void;
}

export interface TelemetryEvents {
  'product.saved': { productId: string; userId: string; store: string };
  'product.deleted': { productId: string; userId: string };
  'product.duplicate': { productId: string; userId: string; store: string };
  'scraper.started': { url: string; adapter: string };
  'scraper.completed': { url: string; adapter: string; confidence: number };
  'scraper.failed': { url: string; adapter: string; error: string };
  'api.request': { route: string; method: string; requestId: string; userId?: string };
  'api.response': {
    route: string;
    method: string;
    statusCode: number;
    durationMs: number;
    requestId: string;
    userId?: string;
    errorCode?: string;
  };
}

export interface ITelemetry {
  logger: ILogger;
  metrics: IMetrics;
  tracing: ITracing;
  errorReporting: IErrorReporting;
  track<K extends keyof TelemetryEvents>(event: K, properties: TelemetryEvents[K]): void;
}
