import { useState } from "react";
import { validateAuth } from "../lib/authValidation.js";

export default function useAuthForm(mode, initialValues = {}) {
  const [values, setValues] = useState(() => ({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    ...initialValues,
  }));
  const [errors, setErrors] = useState({});
  function update(event) {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      ...(name === "password" ? { confirmPassword: undefined } : {}),
    }));
  }
  function validate() {
    const nextErrors = validateAuth(values, mode);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) document.getElementById(first)?.focus();
    return !first;
  }
  function submit(event) {
    event?.preventDefault();
    return validate();
  }
  return { values, errors, update, validate, submit };
}
