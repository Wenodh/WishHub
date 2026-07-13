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
    // In a real production app, we would use coreTelemetry.track(event, properties)
    // For now, we delegate to logger and prepare for full integration
    console.log(`[Telemetry] ${event}`, properties);

    try {
        // We use the core logger which might be configured with different providers
        coreTelemetry.logger.info(`Extension event: ${event}`, properties);
    } catch (e) {
        // Silently fail telemetry
    }
  }
}

export const telemetry = new ExtensionTelemetry();
