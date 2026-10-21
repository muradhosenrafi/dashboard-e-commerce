import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import FormField from "./components/FormField";
import useAuthForm from "./components/useAuthForm";
import useExpiry from "./components/useExpiry";
import Icon from "./components/Icon";
import { authApi, isSuccessfulResponse, needsVerification } from "./lib/authApi";
import { normalizeEmail, responseMessage } from "./lib/authValidation";
import { canResumeVerification, getVerification, rememberVerification } from "./lib/verificationSession";

export default function RegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { values, errors, update, validate } = useAuthForm("register", {
    email: location.state?.email || getVerification()?.email || "",
  });
  const [feedback, setFeedback] = useState(() => location.state?.notice ? { type: "error", message: location.state.notice } : null);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const requestRef = useRef(null);
  useEffect(() => () => requestRef.current?.abort(), []);

  const email = normalizeEmail(values.email);
  const pending = email ? getVerification(email) : null;
  const secondsLeft = useExpiry(pending?.expiresAt);
  const canResume = Boolean(pending && secondsLeft !== 0);
  const password = values.password || "";
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1
    : /[a-z]/i.test(password) && /[^a-z]/i.test(password) ? 3 : 2;

  function handleChange(event) {
    update(event);
    setFeedback(null);
  }

  function openVerification(entry, message) {
    rememberVerification(entry.email, entry.expiresAt);
    navigate(`/otp/${values.email}`, { state: { email: entry.email, message } });
  }

  function resumeFromServer(data) {
    if (!needsVerification(data)) return false;
    const entry = rememberVerification(email, data.otpExpiresAt);
    if (!canResumeVerification(entry)) {
      setFeedback({ type: "error", message: "OTP expired. Please register again after the pending account is removed." });
    } else {
      openVerification(entry, responseMessage(data, "Continue your email verification."));
    }
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setFeedback(null);

    // Resume a confirmed pending registration; never create a duplicate account.
    if (canResume && canResumeVerification(pending)) {
      openVerification(pending, "Continue with your existing verification code.");
      return;
    }
    if (!validate()) return;

    submitting.current = true;
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const isCurrentPage = () => !controller.signal.aborted && window.location.pathname === location.pathname;
    try {
      const { data } = await authApi.post("/registration", {
        username: values.name.trim(), email, password,
      }, { signal: controller.signal });
      if (!isCurrentPage()) return;
      if (isSuccessfulResponse(data)) {
        const entry = rememberVerification(email, data.otpExpiresAt);
        openVerification(entry, responseMessage(data, "Registration successful! Please verify your email."));
      } else if (!resumeFromServer(data)) {
        setFeedback({ type: "error", message: responseMessage(data, "Registration failed. Please try again.") });
      }
    } catch (error) {
      if (!isCurrentPage()) return;
      const data = error.response?.data;
      if (!resumeFromServer(data)) {
        setFeedback({ type: "error", message: responseMessage(data,
          error.code === "ECONNABORTED" ? "The request timed out. Please try again."
            : "Could not register. Check your server connection and try again.") });
      }
    } finally {
      submitting.current = false;
      if (requestRef.current === controller) requestRef.current = null;
      if (isCurrentPage()) setLoading(false);
    }
  }

  return (
    <AuthLayout mode="register">
      <div className="form-badge">
        <Icon name="sparkle" size={18} />
      </div>

      <div className="mt-6 text-[10px] font-semibold tracking-[.2em] text-violet-300">
        LET’S GET YOU STARTED
      </div>

      <h1
        id="page-title"
        tabIndex={-1}
        className="mt-2.5 text-[31px] font-semibold leading-tight tracking-[-.04em] text-white outline-none"
      >
        Create your account
        <span className="text-violet-400">.</span>
      </h1>

      <p className="mt-3 text-[13px] leading-6 text-slate-400">
        A fresh start for you and your business.
      </p>

      {pending && (
        <p role="status" className="mt-5 rounded-xl border border-violet-300/20 bg-violet-500/10 p-3 text-xs leading-6 text-violet-200">
          {canResume
            ? "This email is waiting for verification. Continue with your existing code, or enter another email to create a new account."
            : "The previous code expired. Register again to get a new code. Pending account cleanup may take a little longer."}
        </p>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <FormField
          id="name"
          label="Name"
          icon="user"
          placeholder="Your name"
          autoComplete="name"
          maxLength={80}
          value={values.name || ""}
          onChange={handleChange}
          error={errors.name}
          disabled={loading}
          required
        />

        <FormField
          id="email"
          label="Email address"
          icon="mail"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={254}
          value={values.email || ""}
          onChange={handleChange}
          error={errors.email}
          disabled={loading}
          required
        />

        <div>
          <FormField
            id="password"
            label="Password"
            icon="lock"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            maxLength={128}
            value={password}
            onChange={handleChange}
            error={errors.password}
            disabled={loading}
            required
          />

          <div className="mt-2.5 flex items-center gap-3">
            <div
              className="flex w-[75px] gap-1"
              aria-hidden="true"
            >
              {[1, 2, 3].map((level) => (
                <span
                  key={level}
                  className={`h-[3px] flex-1 rounded-full ${
                    strength >= level
                      ? strength === 1
                        ? "bg-amber-400/70"
                        : "bg-violet-400"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>

            <span className="text-[10px] text-slate-500">
              {strength === 0
                ? "At least 8 characters"
                : strength === 1
                  ? "Add a few more characters"
                  : strength === 2
                    ? "Try mixing letters and numbers"
                    : "Looking good"}
            </span>
          </div>
        </div>

        <FormField
          id="confirmPassword"
          label="Confirm password"
          icon="lock"
          type="password"
          placeholder="Enter your password again"
          autoComplete="new-password"
          maxLength={128}
          value={values.confirmPassword || ""}
          onChange={handleChange}
          error={errors.confirmPassword}
          disabled={loading}
          required
        />

        {feedback && (
          <div
            role={feedback.type === "error" ? "alert" : "status"}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
              feedback.type === "success"
                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-400/20 bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.type === "success" && (
              <Icon name="check" size={19} />
            )}

            <p>{feedback.message}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account..." : canResume ? "Continue verification" : "Create account"}
          <Icon name="arrow" size={18} />
        </button>
      </form>

      <div className="form-divider mt-7">
        <span>Already have an account?</span>
      </div>

      <Link
        to="/login"
        className="secondary-button mt-5 w-full"
      >
        Log in
        <Icon name="arrow" size={16} />
      </Link>
    </AuthLayout>
  );
}
