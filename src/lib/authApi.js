import axios from "axios";

const authorization = import.meta.env.VITE_API_AUTHORIZATION ?? "sdfgasdfas3546d464aA";

export const authApi = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/authentication").replace(/\/$/, ""),
  timeout: 15000,
  headers: authorization ? { Authorization: authorization } : {},
});

export function isSuccessfulResponse(data) {
  return data?.success === true && !data.error;
}

// An "email exists" string alone cannot tell whether the account is verified.
export function needsVerification(data) {
  return data && typeof data === "object" && (
    data.code === "EMAIL_NOT_VERIFIED" ||
    data.requiresVerification === true || data.isVerified === false
  );
}
