import { ILogger, LogContext, IMetrics, ITracing, IErrorReporting, ITelemetry, TelemetryEvents } from "../types";

export class ConsoleLogger implements ILogger {
  constructor(private service: string) {}

  private log(level: string, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      ...context,
    };
    console.log(JSON.stringify(entry));
  }

  debug(message: string, context?: LogContext) { this.log('debug', message, context); }
  info(message: string, context?: LogContext) { this.log('info', message, context); }
  warn(message: string, context?: LogContext) { this.log('warn', message, context); }
  error(message: string, context?: LogContext) { this.log('error', message, context); }
}

export class NoopMetrics implements IMetrics {
  increment() {}
  gauge() {}
  histogram() {}
  timing() {}
}

export class NoopTracing implements ITracing {
  startSpan() { return {}; }
  finishSpan() {}
}

export class ConsoleErrorReporting implements IErrorReporting {
  captureException(error: Error, context?: Record<string, any>) {
    console.error('[EXCEPTION]', error, context);
  }
  captureMessage(message: string, context?: Record<string, any>) {
    console.error('[MESSAGE]', message, context);
  }
}

export class DefaultTelemetry implements ITelemetry {
  constructor(
    public logger: ILogger,
    public metrics: IMetrics = new NoopMetrics(),
    public tracing: ITracing = new NoopTracing(),
    public errorReporting: IErrorReporting = new ConsoleErrorReporting()
  ) {}

  track<K extends keyof TelemetryEvents>(event: K, properties: TelemetryEvents[K]) {
    this.logger.info(`Event: ${event}`, properties as any);
  }
}
