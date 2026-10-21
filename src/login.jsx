import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import FormField from "./components/FormField";
import Icon from "./components/Icon";
import useAuthForm from "./components/useAuthForm";
import { authApi, isSuccessfulResponse, needsVerification } from "./lib/authApi";
import { normalizeEmail, responseMessage } from "./lib/authValidation";
import { canResumeVerification, rememberVerification } from "./lib/verificationSession";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { values, errors, update, validate } = useAuthForm("login", {
    email: location.state?.email || "",
  });
  const [serverError, setServerError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(null);
  const pendingRef = useRef(false);
  useEffect(() => () => requestRef.current?.abort(), []);

  function handleChange(event) {
    update(event);
    setServerError("");
    setLoginSuccess(false);
  }

  function resumePending(data, email) {
    if (!needsVerification(data)) return false;
    const entry = rememberVerification(email, data.otpExpiresAt);
    if (!canResumeVerification(entry)) return false;
    navigate("/otp", { state: { email, message: "Please verify your email before logging in." } });
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pendingRef.current) return;
    setServerError("");
    setLoginSuccess(false);
    if (!validate()) return;

    pendingRef.current = true;
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const isCurrentPage = () => !controller.signal.aborted && window.location.pathname === location.pathname;
    const email = normalizeEmail(values.email);
    try {
      const { data } = await authApi.post("/login", {
        email, password: values.password,
      }, { signal: controller.signal });
      if (!isCurrentPage()) return;
      if (isSuccessfulResponse(data)) setLoginSuccess(true);
      else if (!resumePending(data, email)) {
        setServerError(responseMessage(data, "Email or password is incorrect."));
      }
    } catch (error) {
      if (!isCurrentPage()) return;
      const data = error.response?.data;
      if (!resumePending(data, email)) {
        setServerError(responseMessage(data,
          error.response ? "Email or password is incorrect."
            : "Cannot connect to the server. Please try again."));
      }
    } finally {
      pendingRef.current = false;
      if (requestRef.current === controller) requestRef.current = null;
      if (isCurrentPage()) setLoading(false);
    }
  }

  return (
    <AuthLayout mode="login">
      <div className="form-badge">
        <Icon name="lock" size={18} />
      </div>
      <div className="mt-6 text-[10px] font-semibold tracking-[.2em] text-violet-300">
        YOUR SPACE IS WAITING
      </div>
      <h1
        id="page-title"
        tabIndex={-1}
        className="mt-2.5 text-[34px] leading-tight font-semibold tracking-[-.04em] text-white outline-none"
      >
        Welcome back<span className="text-violet-400">.</span>
      </h1>
      <p className="mt-3 text-[13px] leading-6 text-slate-400">
        Good to see you. Let’s pick up where you left off.
      </p>

      {location.state?.verified && (
        <p role="status" className="form-success mt-6">
          Email verified successfully. You can log in now.
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-10 space-y-6">
        <FormField
          id="email"
          label="Email address"
          icon="mail"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={254}
          value={values.email}
          onChange={handleChange}
          disabled={loading}
          error={errors.email}
          required
        />
        <FormField
          id="password"
          label="Password"
          icon="lock"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          maxLength={128}
          value={values.password}
          onChange={handleChange}
          disabled={loading}
          error={errors.password}
          required
        />

        {/* Server error message */}
        {serverError && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-[13px] text-red-300"
          >
            <p>{serverError}</p>
          </div>
        )}

        {/* Success message */}
        {loginSuccess && (
          <div role="status" className="form-success">
            <Icon name="check" size={19} />
            <p>Login successful! Welcome back.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
          <Icon name="arrow" size={18} />
        </button>
      </form>

      <div className="form-divider mt-8">
        <span>New to ARMANE?</span>
      </div>
      <Link
        to="/register"
        className="secondary-button mt-5 w-full"
      >
        Create an account
        <Icon name="arrow" size={16} />
      </Link>
      <div className="mt-9 flex gap-3 rounded-xl border border-violet-300/[.08] bg-violet-300/[.025] p-4">
        <span className="mt-0.5 text-violet-300">
          <Icon name="sparkle" size={17} />
        </span>
        <div>
          <p className="text-[12px] text-slate-300">
            A little clarity goes a long way.
          </p>
          <p className="mt-1 text-[11px] leading-5 text-slate-500">
            Your next great idea starts with a clear view.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
