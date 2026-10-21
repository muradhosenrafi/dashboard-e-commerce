import { normalizeEmail } from "./authValidation.js";

// Only pending email + timestamps are stored. Never passwords, codes or tokens.
const STORAGE_KEY = "armane.pending-verification.v1";
let memory = { activeEmail: "", entries: [] };

function readStore() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data.entries)) {
        memory = {
          activeEmail: typeof data.activeEmail === "string" ? data.activeEmail : "",
          entries: data.entries.filter((entry) =>
            typeof entry?.email === "string" &&
            (entry.expiresAt === null ||
              (typeof entry.expiresAt === "string" && Number.isFinite(Date.parse(entry.expiresAt))))
          ),
        };
      }
    }
  } catch {
    // Keep Back/continue working if storage is unavailable or corrupt.
  }
  return memory;
}

function writeStore(store) {
  memory = store;
  try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
  catch { /* The current page can still use the memory fallback. */ }
}

export function rememberVerification(email, expiresAt) {
  const normalized = normalizeEmail(email);
  const parsed = typeof expiresAt === "string" ? Date.parse(expiresAt) : NaN;
  const entry = {
    email: normalized,
    expiresAt: Number.isFinite(parsed) ? new Date(parsed).toISOString() : null,
  };
  const store = readStore();
  writeStore({
    activeEmail: normalized,
    entries: [...store.entries.filter((item) => item.email !== normalized), entry].slice(-10),
  });
  return entry;
}

export function getVerification(email) {
  const store = readStore();
  const normalized = normalizeEmail(email === undefined ? store.activeEmail : email || "");
  return store.entries.find((entry) => entry.email === normalized) || null;
}

export function canResumeVerification(entry, now = Date.now()) {
  return Boolean(entry && (entry.expiresAt === null || Date.parse(entry.expiresAt) > now));
}

export function forgetVerification(email) {
  const normalized = normalizeEmail(email);
  const store = readStore();
  const entries = store.entries.filter((entry) => entry.email !== normalized);
  writeStore({
    activeEmail: store.activeEmail === normalized ? entries.at(-1)?.email || "" : store.activeEmail,
    entries,
  });
}
