import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { normalizeEmail, responseMessage, validateAuth } from "../src/lib/authValidation.js";
import { canResumeVerification, forgetVerification, getVerification, rememberVerification } from "../src/lib/verificationSession.js";

let storage;
beforeEach(() => {
  storage = new Map([["armane.pending-verification.v1", JSON.stringify({ activeEmail: "", entries: [] })]]);
  globalThis.window = { sessionStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  }};
});
const valid = { name: "Test User", email: "user@example.com", password: "Password123!", confirmPassword: "Password123!" };

test("empty registration blocks every required field", () => {
  assert.deepEqual(Object.keys(validateAuth({})), ["name", "email", "password", "confirmPassword"]);
});
test("invalid email, short password and mismatched confirmation block submission", () => {
  const errors = validateAuth({ ...valid, email: "invalid", password: "short" });
  assert.deepEqual(Object.keys(errors), ["email", "password", "confirmPassword"]);
});
test("valid registration and login pass; login needs no registration-only fields", () => {
  assert.deepEqual(validateAuth(valid), {});
  assert.deepEqual(validateAuth({ email: valid.email, password: "x" }, "login"), {});
});
test("blank login cannot slip through validation", () => {
  assert.deepEqual(Object.keys(validateAuth({}, "login")), ["email", "password"]);
});
test("oversized name, email and password are rejected", () => {
  const errors = validateAuth({ ...valid, name: "a".repeat(81), email: `${"a".repeat(250)}@x.com`, password: "x".repeat(129), confirmPassword: "x".repeat(129) });
  assert.deepEqual(Object.keys(errors), ["name", "email", "password"]);
});
test("normalization preserves plus aliases and password whitespace is not trimmed", () => {
  assert.equal(normalizeEmail(" User+Tag@Example.COM "), "user+tag@example.com");
  assert.equal(validateAuth({ ...valid, password: " Password123! " }).confirmPassword, "Passwords do not match.");
});
test("Back/resume preserves the original deadline instead of extending it", () => {
  const expires = "2030-01-01T00:00:30.000Z";
  rememberVerification(" User@Example.com ", expires);
  rememberVerification(getVerification().email, getVerification().expiresAt);
  assert.deepEqual(getVerification("user@example.com"), { email: "user@example.com", expiresAt: expires });
  assert.equal(canResumeVerification(getVerification(), Date.parse(expires) - 1), true);
  assert.equal(canResumeVerification(getVerification(), Date.parse(expires)), false);
});
test("switching email preserves both pending registrations and blank email matches none", () => {
  rememberVerification("a@example.com", "2030-01-01T00:00:30Z");
  rememberVerification("b@example.com", "2030-01-01T00:00:45Z");
  assert.equal(getVerification().email, "b@example.com");
  assert.equal(getVerification("a@example.com").email, "a@example.com");
  assert.equal(getVerification(""), null);
});
test("verification clears only the verified account and never stores credentials", () => {
  rememberVerification("a@example.com", "2030-01-01T00:00:30Z");
  rememberVerification("b@example.com", "2030-01-01T00:00:45Z");
  forgetVerification("a@example.com");
  assert.equal(getVerification("a@example.com"), null);
  assert.ok(getVerification("b@example.com"));
  const saved = JSON.parse([...storage.values()][0]);
  assert.deepEqual(Object.keys(saved.entries[0]).sort(), ["email", "expiresAt"]);
});
test("history is bounded and older pending records are evicted", () => {
  for (let i = 0; i < 12; i++) rememberVerification(`user${i}@example.com`, "2030-01-01T00:00:30Z");
  assert.equal(getVerification("user0@example.com"), null);
  assert.equal(JSON.parse([...storage.values()][0]).entries.length, 10);
});
test("missing server deadline is not replaced with a fabricated new OTP timer", () => {
  rememberVerification("user@example.com", undefined);
  assert.equal(getVerification().expiresAt, null);
});
test("string and JSON errors render as text, never as React objects", () => {
  assert.equal(responseMessage("email already exists", "fallback"), "email already exists");
  assert.equal(responseMessage({ message: "Wrong OTP" }, "fallback"), "Wrong OTP");
  assert.equal(responseMessage({ message: { nested: true } }, "fallback"), "fallback");
});
