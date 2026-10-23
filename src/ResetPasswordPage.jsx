import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import FormField from "./components/FormField";
import Icon from "./components/Icon";
import { authApi, isSuccessfulResponse } from "./lib/authApi";
import { responseMessage } from "./lib/authValidation";

export default function ResetPasswordPage() {
  const location = useLocation();
  const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

  const token =
    new URLSearchParams(location.hash.slice(1)).get("token") || "";

  const validToken = /^[a-f0-9]{64}$/.test(token);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const pendingRef = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (pendingRef.current || success) return;

    setError("");

    if (!validToken) {
      setError("Invalid reset link. Please request a new link.");
      return;
    }

  if (!passwordRegex.test(password)) {
  setError(
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character.",
  );
  return;
}

    if (new TextEncoder().encode(password).length > 72) {
      setError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    pendingRef.current = true;
    setLoading(true);

    try {
      const { data } = await authApi.post("/reset-password", {
        token,
        password,
        confirmPassword,
      });

      if (!isSuccessfulResponse(data)) {
        setError(
          responseMessage(data, "Unable to reset your password."),
        );
        return;
      }

      setPassword("");
      setConfirmPassword("");
      setSuccess(
        responseMessage(
          data,
          "Password reset successfully. You can log in now.",
        ),
      );
    } catch (error) {
      setError(
        responseMessage(
          error.response?.data,
          error.response
            ? "Unable to reset your password."
            : "Cannot connect to the server. Please try again.",
        ),
      );
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="form-badge">
        <Icon name="lock" size={18} />
      </div>

      <p className="mt-6 text-[10px] font-semibold tracking-[.2em] text-violet-300">
        A FRESH START
      </p>

      <h1
        id="page-title"
        tabIndex={-1}
        className="mt-2.5 text-[34px] font-semibold leading-tight tracking-[-.04em] text-white outline-none"
      >
        Reset password<span className="text-violet-400">.</span>
      </h1>

      <p className="mt-3 text-[13px] leading-6 text-slate-400">
        Choose a new password to get back to your space.
      </p>

      {!validToken && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-[13px] text-red-300"
        >
          Invalid reset link. Return to login and request a new link.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <FormField
          id="password"
          label="New password"
          icon="lock"
          type="password"
          placeholder="Enter your new password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError("");
          }}
          disabled={loading || Boolean(success) || !validToken}
          maxLength={72}
          required
        />

        <FormField
          id="confirmPassword"
          label="Confirm password"
          icon="lock"
          type="password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setError("");
          }}
          disabled={loading || Boolean(success) || !validToken}
          maxLength={72}
          required
        />

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-[13px] leading-6 text-red-300"
          >
            {error}
          </p>
        )}

        {success && (
          <div role="status" className="form-success">
            <Icon name="check" size={19} />
            <p>{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || Boolean(success) || !validToken}
          className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset password"}
          <Icon name="arrow" size={18} />
        </button>
      </form>

      <Link
        to="/login"
        className="secondary-button mt-5 w-full"
      >
        Login
        <Icon name="arrow" size={16} />
      </Link>
    </AuthLayout>
  );
}