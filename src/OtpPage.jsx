import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import OtpModal from "./OtpModal";
import { forgetVerification, getVerification } from "./lib/verificationSession";

export default function OtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [verification] = useState(() => getVerification(location.state?.email));

  if (!verification) {
    return <Navigate to="/register" replace state={{ notice: "Please register first to receive a verification code." }} />;
  }

  function backToRegistration() {
    navigate("/register", { replace: true, state: { email: verification.email } });
  }

  function verified() {
    forgetVerification(verification.email);
    navigate("/login", { replace: true, state: { email: verification.email, verified: true } });
  }

  return (
    <AuthLayout mode="register">
      <h1 className="text-3xl font-semibold text-white">Verify your email.</h1>
      <p role="status" className="mt-4 text-sm leading-7 text-violet-200">
        {location.state?.message || "Continue your email verification."}
      </p>
      <p className="mt-3 break-all text-sm text-slate-400">{verification.email}</p>
      <button type="button" className="secondary-button mt-7 w-full" onClick={backToRegistration}>
        Back to registration
      </button>
      <OtpModal
        email={verification.email}
        expiresAt={verification.expiresAt}
        notice={location.state?.message}
        onClose={backToRegistration}
        onVerified={verified}
      />
    </AuthLayout>
  );
}
