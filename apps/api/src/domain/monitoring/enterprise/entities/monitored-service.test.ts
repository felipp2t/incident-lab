import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MONITORED_SERVICE_NAME_MAX_LENGTH,
  MonitoredService
} from "./monitored-service.js";

test("normalizes a valid service name in the domain", () => {
  assert.equal(MonitoredService.normalizeName("  Checkout API  "), "Checkout API");
  assert.equal(MonitoredService.normalizeName("x".repeat(MONITORED_SERVICE_NAME_MAX_LENGTH)), "x".repeat(MONITORED_SERVICE_NAME_MAX_LENGTH));
});

test("rejects blank, oversized, and control-character service names in the domain", () => {
  assert.equal(MonitoredService.normalizeName("   "), null);
  assert.equal(MonitoredService.normalizeName("x".repeat(MONITORED_SERVICE_NAME_MAX_LENGTH + 1)), null);
  assert.equal(MonitoredService.normalizeName("Checkout\u0000API"), null);
});
