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
    // In production, we might want to avoid console.log if a real logging service is attached,
    // but for now, we keep it as the default provider.
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

/**
 * Composite Telemetry allows multiple providers to be notified of events.
 * This is useful for migrating to Sentry/PostHog/Datadog without breaking local logs.
 */
export class CompositeTelemetry implements ITelemetry {
    constructor(
        private providers: ITelemetry[]
    ) {}

    get logger(): ILogger {
        // Returns the first provider's logger for simplicity, or a combined logger if needed.
        return this.providers[0]?.logger || new ConsoleLogger('noop');
    }

    get metrics(): IMetrics {
        return this.providers[0]?.metrics || new NoopMetrics();
    }

    get tracing(): ITracing {
        return this.providers[0]?.tracing || new NoopTracing();
    }

    get errorReporting(): IErrorReporting {
        return this.providers[0]?.errorReporting || new ConsoleErrorReporting();
    }

    track<K extends keyof TelemetryEvents>(event: K, properties: TelemetryEvents[K]) {
        this.providers.forEach(p => p.track(event, properties));
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
    this.logger.info(`Telemetry: ${event}`, properties as any);
  }
}
