import { useState } from "react";
import { Link } from "react-router-dom";

export default function OtpPopup({onSubmit, onClose  }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const message = await onSubmit(email.trim());

      setSuccess(
        message ||
          "If an account exists with this email, a password reset link will be sent.",
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      onClick={(event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }}
    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#070811]/80 p-4 backdrop-blur-md">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
        className="relative my-auto w-full max-w-[430px] overflow-hidden rounded-[28px] border border-violet-300/15 bg-[#10111f] p-7 shadow-[0_30px_100px_rgba(0,0,0,0.6)] sm:p-10"
      >
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-600/15 blur-[70px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent"
        />

        <div className="relative">
          {/* Lock icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/20 bg-gradient-to-br from-violet-400/20 to-violet-600/5 text-violet-300 shadow-[0_8px_30px_rgba(139,92,246,0.12)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="10" width="14" height="11" rx="3" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v3" />
            </svg>
          </div>

          <p className="mt-7 text-[10px] font-semibold tracking-[0.2em] text-violet-300">
            LET’S GET YOU BACK
          </p>

          <h2
            id="forgot-password-title"
            className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-white sm:text-[34px]"
          >
            Forgot password
            <span className="text-violet-400">?</span>
          </h2>

          <p
            id="forgot-password-description"
            className="mt-3 text-[13px] leading-6 text-slate-400"
          >
            No worries. Enter your email address to request a password reset
            code.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <label
              htmlFor="reset-email"
              className="mb-2.5 block text-[12px] font-medium text-slate-300"
            >
              Email address
            </label>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-4 transition-all duration-200 focus-within:border-violet-400/60 focus-within:bg-violet-400/[0.04] focus-within:ring-4 focus-within:ring-violet-400/[0.08]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 text-slate-500"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="m3 7 9 6 9-6" />
              </svg>

              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                maxLength={254}
                required
                autoFocus
                className="min-w-0 w-full bg-transparent py-4 text-[13px] text-white outline-none placeholder:text-slate-600"
              />
            </div>



            {error && (
  <p
    role="alert"
    className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-[12px] leading-5 text-red-300"
  >
    {error}
  </p>
)}

{success && (
  <p
    role="status"
    className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-[12px] leading-5 text-emerald-300"
  >
    {success}
  </p>
)}

            <button
            
              type="submit"
              className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-4 text-[13px] font-semibold text-white shadow-[0_8px_25px_rgba(124,58,237,0.2)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_8px_30px_rgba(124,58,237,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#10111f] active:scale-[0.98]"
            >
           {loading ? "Sending link..." : "Submit"}
           
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">
            <Link
              to="/login"
                onClick={() => onClose?.()}
              className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium text-slate-400 transition-colors hover:bg-white/[0.03] hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:-translate-x-1"
                aria-hidden="true"
              >
                <path d="M19 12H5m7 7-7-7 7-7" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}