/**
 * Legis Connect — OpenTelemetry Universal Tracing SDK Init
 * Instrumentação universal para microserviços Node.js/NestJS
 * Padrão: Enterprise OpenTelemetry Framework (Prompt 228 - Etapa 4 & 6)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'grpc://otel-collector.legis-observability.svc:4317',
});

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'legis-backend-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-nestjs-core': { enabled: true },
      '@opentelemetry/instrumentation-pg': { enabled: true },
      '@opentelemetry/instrumentation-redis': { enabled: true },
    }),
  ],
});

// Inicialização segura
export function initTracing() {
  otelSDK.start();
  console.log('[OPENTELEMETRY] Tracing SDK inicializado com sucesso.');
}
