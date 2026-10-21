export function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

export function validateAuth(values, mode = "register") {
  const errors = {};
  const name = (values.name || "").trim();
  const email = normalizeEmail(values.email);
  const password = values.password || "";
  if (mode === "register") {
    if (!name) errors.name = "Please enter your name.";
    else if (name.length > 80) errors.name = "Use 80 characters or fewer.";
  }
  if (!email) errors.email = "Please enter your email address.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!password) errors.password = "Please enter your password.";
  else if (mode === "register" && password.length < 8) {
    errors.password = "Use at least 8 characters.";
  } else if (password.length > 128) {
    errors.password = "Use 128 characters or fewer.";
  }
  if (mode === "register") {
    if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (values.confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
}

export function responseMessage(data, fallback) {
  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string" && data.message.trim()) return data.message;
  if (typeof data?.error === "string" && data.error.trim()) return data.error;
  return fallback;
}
