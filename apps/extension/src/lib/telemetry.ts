import { telemetry as coreTelemetry } from '@wishhub/telemetry';

export type TelemetryEvent =
  | 'PopupOpened'
  | 'ProductExtracted'
  | 'ProductSaved'
  | 'DuplicateDetected'
  | 'OfflineQueued'
  | 'RetrySucceeded'
  | 'RetryFailed';

class ExtensionTelemetry {
  emit(event: TelemetryEvent, properties?: Record<string, any>) {
    try {
        // Use the core telemetry logger for structured logging
        coreTelemetry.logger.info(`Extension event: ${event}`, properties);
    } catch (e) {
        // Silently fail telemetry in extension to avoid blocking user flow
    }
  }
}

export const telemetry = new ExtensionTelemetry();
