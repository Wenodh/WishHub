import { DefaultTelemetry, ConsoleLogger } from './providers/default';

export * from './types';
export * from './providers/default';

export const telemetry = new DefaultTelemetry(new ConsoleLogger('default'));

// For backwards compatibility
export const logger = telemetry.logger;
