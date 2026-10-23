import { createBrowserRouter, Link, RouterProvider, useRouteError } from "react-router-dom";
import RegistrationPage from "./Registion";
import LoginPage from "./login";
import OtpPage from "./OtpPage";
import OtpPopup from "../container/otppopup";
import ResetPasswordPage from "./ResetPasswordPage";

function RouteError() {
  const error = useRouteError();
  return (
    <main className="grid min-h-screen place-content-center gap-5 px-6 text-center text-slate-200">
      <h1 className="text-2xl font-semibold">Unable to open this page</h1>
      <p>{error?.status === 404 ? "The page does not exist." : "Please return to registration and try again."}</p>
      <Link to="/register" className="secondary-button">Back to registration</Link>
    </main>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <RegistrationPage />, errorElement: <RouteError /> },
  { path: "/register", element: <RegistrationPage />, errorElement: <RouteError /> },
  { path: "/login", element: <LoginPage />, errorElement: <RouteError /> },
  { path: "/otp/:email", element: <OtpPage />, errorElement: <RouteError /> },
  { path: "/forgotpassword", element: <OtpPopup />, errorElement: <RouteError /> },
  { path: "/reset-password", element: <ResetPasswordPage />, errorElement: <RouteError /> },

  { path: "*", element: <RouteError /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
