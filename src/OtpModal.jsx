import { useEffect, useRef, useState } from "react";
import Icon from "./components/Icon";
import useExpiry from "./components/useExpiry";
import { authApi, isSuccessfulResponse } from "./lib/authApi";
import { responseMessage } from "./lib/authValidation";
import { forgetVerification } from "./lib/verificationSession";

export default function OtpModal({ email, expiresAt, notice, onClose, onVerified }) {
  const dialogRef = useRef(null);
  const inputRefs = useRef([]);
  const pendingRef = useRef(false);
  const requestRef = useRef(null);
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverExpired, setServerExpired] = useState(false);
  const secondsLeft = useExpiry(expiresAt);
  const expired = serverExpired || secondsLeft === 0;
  const otp = digits.join("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    inputRefs.current[0]?.focus();
    return () => {
      requestRef.current?.abort();
      if (dialog?.open) dialog.close();
    };
  }, []);

  function handleChange(index, value) {
    if (expired || pendingRef.current) return;
    const numbers = value.replace(/\D/g, "");
    setError("");
    if (!numbers) {
      setDigits((previous) => previous.map((digit, i) => i === index ? "" : digit));
      return;
    }
    const incoming = numbers.slice(0, 6 - index);
    setDigits((previous) => {
      const next = [...previous];
      incoming.split("").forEach((digit, offset) => { next[index + offset] = digit; });
      return next;
    });
    inputRefs.current[Math.min(index + incoming.length, 5)]?.focus();
  }

  function handlePaste(event) {
    event.preventDefault();
    if (expired || pendingRef.current) return;
    const numbers = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!numbers) return;
    setError("");
    setDigits(Array.from({ length: 6 }, (_, index) => numbers[index] || ""));
    inputRefs.current[Math.min(numbers.length, 5)]?.focus();
  }

  function handleKeyDown(event, index) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((previous) => previous.map((digit, i) => i === index - 1 ? "" : digit));
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function backToRegistration() {
    if (!pendingRef.current) onClose();
  }

  function showFailure(data, status) {
    if (status === 410 || data?.code === "OTP_EXPIRED") {
      setServerExpired(true);
      forgetVerification(email);
    }
    setError(responseMessage(data, "OTP is incorrect or expired. Please try again."));
  }

  async function handleVerify(event) {

    
    event.preventDefault();
    if (pendingRef.current) return;
    setError("");
    // Check the actual deadline too, to cover the interval between timer ticks.
    if (expired || (expiresAt && Date.parse(expiresAt) <= Date.now())) {
      setServerExpired(true);
      return;
    }
    if (!email || !/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    pendingRef.current = true;
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const pathname = window.location.pathname;
    const isCurrentPage = () => !controller.signal.aborted && window.location.pathname === pathname;
    try {
      const { data } = await authApi.post("/verify-otp", { email, otp }, { signal: controller.signal });
      if (!isCurrentPage()) return;
      if (!isSuccessfulResponse(data)) {
        showFailure(data);
        return;
      }
      onVerified();
    } catch (error) {
      if (!isCurrentPage()) return;
      if (error.response) showFailure(error.response.data, error.response.status);
      else setError("Could not verify the code. Check your server connection and try again.");
    } finally {
      pendingRef.current = false;
      if (requestRef.current === controller) requestRef.current = null;
      if (isCurrentPage()) setLoading(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="otp-title"
      aria-describedby="otp-description"
      onCancel={(event) => {
        event.preventDefault();
        backToRegistration();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[92vw] max-w-[460px] overflow-y-auto rounded-[28px] border border-violet-300/15 bg-[#0d0b18] p-0 text-white shadow-[0_30px_120px_rgba(0,0,0,0.7)] backdrop:bg-[#03020b]/80 backdrop:backdrop-blur-md"
    >
      <div className="relative isolate overflow-hidden px-5 py-5 sm:px-9 sm:py-10">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 -z-10 h-64 w-72 -translate-x-1/2 rounded-full bg-violet-600/25 blur-[70px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-200/60 to-transparent"
        />

        <p className="text-center font-serif text-[13px] tracking-[0.4em] text-violet-200/80">
          ARMANE
        </p>

        {/* Lock icon */}
        <div className="mx-auto mt-4 flex h-14 w-14 sm:mt-8 sm:h-[76px] sm:w-[76px] items-center justify-center rounded-[24px] border border-violet-200/20 bg-gradient-to-br from-violet-400/25 via-violet-500/10 to-transparent text-violet-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_40px_rgba(139,92,246,0.18)]">
          <Icon name="lock" size={30} />
        </div>

        <div className="mt-4 text-center sm:mt-7">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-violet-300">
            ONE LAST STEP
          </span>

          <h2
            id="otp-title"
            className="mt-3 text-[26px] font-semibold tracking-[-0.04em] sm:text-[34px]"
          >
            Verify your email
            <span className="text-violet-400">.</span>
          </h2>

          <p
            id="otp-description"
            className="mt-3 text-[13px] leading-6 text-slate-400"
          >
            Enter the latest 6-digit verification code for
          </p>

          <p className="mt-1 break-all text-sm font-medium text-violet-200">
            {email}
          </p>
        </div>

        {notice && (
          <p role="status" className="form-success mt-3 sm:mt-5">{notice}</p>
        )}

        <p className="mt-3 text-center text-xs text-violet-200 sm:mt-5" data-testid="otp-countdown">
          {expired
            ? "Code expired. Return to registration to start again."
            : secondsLeft === null
              ? "The server will check this code’s expiry."
              : `Code expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`}
        </p>

        <form noValidate onSubmit={handleVerify} className="mt-5 sm:mt-8">
          <fieldset disabled={loading || expired}>
            <legend className="sr-only">
              Six-digit verification code
            </legend>

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={6}
                  aria-label={`OTP digit ${index + 1}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "otp-error" : undefined}
                  value={digit}
                  onChange={(event) =>
                    handleChange(index, event.target.value)
                  }
                  onPaste={handlePaste}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  className={`h-12 min-w-0 rounded-xl border bg-white/[0.035] text-center text-2xl font-semibold text-white caret-violet-300 outline-none transition duration-200 focus:border-violet-400 focus:bg-violet-500/10 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60 sm:h-16 ${
                    error
                      ? "border-red-400/40"
                      : digit
                        ? "border-violet-400/50"
                        : "border-white/10"
                  }`}
                />
              ))}
            </div>
          </fieldset>

          {error && (
            <div
              id="otp-error"
              role="alert"
              className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-[13px] leading-5 text-red-300"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || expired || otp.length !== 6 || !email}
            className="mt-4 flex h-12 sm:mt-6 sm:h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-gradient-to-b from-violet-500 to-violet-700 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_30px_rgba(124,58,237,0.25)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                Verifying…
              </>
            ) : (
              <>
                Verify & continue
                <Icon name="arrow" size={18} />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={backToRegistration}
            disabled={loading}
            className="mt-3 flex h-11 sm:h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] text-[13px] font-medium text-slate-300 transition hover:border-violet-300/25 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="rotate-180">
              <Icon name="arrow" size={16} />
            </span>
            Back to registration
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] sm:mt-7 leading-5 text-slate-500">
          Check your inbox and spam folder for the code.
        </p>
      </div>
    </dialog>
  );
}
