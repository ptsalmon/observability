const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

module.exports = (serviceName) => {
   // Configure Jaeger Exporter
   const jaegerExporter = new JaegerExporter({
       serviceName: serviceName,
       // Replace 'localhost' and '6831' with your Jaeger backend host and port
       endpoint: 'http://localhost:14268/api/traces', 
   });

   // Create tracer provider with Jaeger exporter
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   // Add Jaeger exporter to span processor
   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

   // Register instrumentations
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   // Return tracer
   return trace.getTracer(serviceName);
};
