import { datadogRum } from "@datadog/browser-rum";

datadogRum.init({
  applicationId: "22add7d3-916e-4c33-90c3-a95597a0d110",
  clientToken: "pub18c555485d3c9ff1bbbdfa5f664987c5",
  site: "datadoghq.com",
  service: "nana's-cookbook",
  env: "prod",
  // Specify a version number to identify the deployed version of your application in Datadog
  // version: '1.0.0',
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackBfcacheViews: true,
  defaultPrivacyLevel: "allow",
});
