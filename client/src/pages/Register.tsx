import { useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/Textfield";
import CompanyCombobox from "../components/CompanyCombobox";
import registrationFlow from "../assets/registration_flow.png";
import logo from "../assets/ag_associates_logo.png";
import { MdErrorOutline } from "react-icons/md";
import {
  normalizePhone,
  validateRegisterEmail,
  validateRegisterPassword,
  validateRegisterPhoneNumber,
  validateRegisterUsername,
} from "../utils/validation";
import { apiFetch } from "../utils/api";

interface Company {
  companyId: number;
  name: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  // ── Field states ────────────────────────────────────────────────────
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  // ── Company selection (id = existing, name = new) ──────────────────
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);

  // Don't show errors until a field has been blurred once
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    phoneNumber: false,
    company: false,
    password: false,
  });

  // ── Sync validation ─────────────────────────────────────────────────
  const usernameError = validateRegisterUsername(username);
  const emailError = validateRegisterEmail(email);
  const phoneNumberError = validateRegisterPhoneNumber(phoneNumber);
  const passwordError = validateRegisterPassword(password);

  // ── Async availability state ────────────────────────────────────────
  const [usernameAvailError, setUsernameAvailError] = useState("");
  const [emailAvailError, setEmailAvailError] = useState("");
  const [phoneAvailError, setPhoneAvailError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // ── Companies list ──────────────────────────────────────────────────
  const [companies, setCompanies] = useState<Company[]>([]);

  // ── Submit state ────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load companies on mount
  useEffect(() => {
    apiFetch<Company[]>("/auth/companies").then(setCompanies).catch(() => {});
  }, []);

  // Async username availability check (debounced 400 ms)
  useEffect(() => {
    if (!touchedFields.username || usernameError || !username.trim()) {
      setUsernameAvailError("");
      return;
    }
    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const { available } = await apiFetch<{ available: boolean }>(
          `/auth/check-username?username=${encodeURIComponent(username.trim())}`,
        );
        setUsernameAvailError(available ? "" : "Username is already taken.");
      } catch {
        // silently ignore network errors
      } finally {
        setIsCheckingUsername(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username, touchedFields.username, usernameError]);

  // Async email availability check (debounced 400 ms)
  useEffect(() => {
    if (!touchedFields.email || emailError || !email.trim()) {
      setEmailAvailError("");
      return;
    }
    setIsCheckingEmail(true);
    const timer = setTimeout(async () => {
      try {
        const { available } = await apiFetch<{ available: boolean }>(
          `/auth/check-email?email=${encodeURIComponent(email.trim())}`,
        );
        setEmailAvailError(available ? "" : "Email is already registered.");
      } catch {
        // silently ignore network errors
      } finally {
        setIsCheckingEmail(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [email, touchedFields.email, emailError]);

  // Async phone availability check (debounced 400 ms)
  useEffect(() => {
    if (!touchedFields.phoneNumber || phoneNumberError || !phoneNumber.trim()) {
      setPhoneAvailError("");
      return;
    }
    setIsCheckingPhone(true);
    const timer = setTimeout(async () => {
      try {
        const { available } = await apiFetch<{ available: boolean }>(
          `/auth/check-phone?phone=${encodeURIComponent(normalizePhone(phoneNumber))}`,
        );
        setPhoneAvailError(available ? "" : "Phone number already in use.");
      } catch {
        // silently ignore network errors
      } finally {
        setIsCheckingPhone(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [phoneNumber, touchedFields.phoneNumber, phoneNumberError]);

  function markFieldTouched(fieldName: keyof typeof touchedFields) {
    setTouchedFields((current) => ({ ...current, [fieldName]: true }));
  }

  const isRegisterButtonDisabled = Boolean(
    usernameError ||
      usernameAvailError ||
      emailError ||
      emailAvailError ||
      phoneNumberError ||
      phoneAvailError ||
      passwordError ||
      (!companyId && !companyName) ||
      isCheckingUsername ||
      isCheckingEmail ||
      isCheckingPhone ||
      isSubmitting,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isRegisterButtonDisabled) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          phoneNumber: normalizePhone(phoneNumber),
          password,
          ...(companyId ? { companyId } : { companyName: companyName! }),
        }),
      });
      navigate("/login", { state: { justRegistered: true } });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full md:flex">
      <div className="hidden lg:flex lg:w-[50%] lg:items-center lg:justify-center lg:bg-(--accent-gray-blue) lg:p-5 xl:w-1/2 xl:p-8">
        <img
          src={registrationFlow}
          className="w-full object-contain lg:max-w-130"
        />
      </div>

      <div className="flex min-h-screen w-full items-center justify-center p-5 lg:w-1/2">
        <form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex w-full justify-center">
            <img src={logo} className="mb-2 w-[22%] min-w-14 max-w-20" />
          </div>
          <h3 className="mb-6 text-center font-bold text-(--headings-text)">Create an account!</h3>

          <TextField
            title="Username"
            placeholder="Choose a username"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            onBlur={() => markFieldTouched("username")}
            errorMessage={
              touchedFields.username ? usernameError || usernameAvailError : ""
            }
          />

          <TextField
            title="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            onBlur={() => markFieldTouched("email")}
            errorMessage={touchedFields.email ? emailError || emailAvailError : ""}
          />

          <TextField
            title="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            onBlur={() => markFieldTouched("password")}
            errorMessage={touchedFields.password ? passwordError : ""}
          />

          <TextField
            title="Phone number"
            placeholder="e.g. 123-456-7890"
            value={phoneNumber}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
            onBlur={() => markFieldTouched("phoneNumber")}
            errorMessage={touchedFields.phoneNumber ? phoneNumberError || phoneAvailError : ""}
          />

          {/* Company search combobox */}
          <CompanyCombobox
            companies={companies}
            onChange={(val) => {
              if (val === null) {
                setCompanyId(null);
                setCompanyName(null);
              } else if ('companyId' in val) {
                setCompanyId(val.companyId!);
                setCompanyName(null);
              } else {
                setCompanyId(null);
                setCompanyName(val.companyName!);
              }
            }}
            onBlur={() => markFieldTouched("company")}
            errorMessage={touchedFields.company && !companyId && !companyName ? "Please select or enter a company." : ""}
          />

          {submitError && (
            <div className="flex flex-row justify-center bg-(--danger-surface) outline-(--danger-text) outline-1 rounded-lg p-2.75 gap-x-1">
              <MdErrorOutline size={20} className="mt-0.5 text-(--danger-text)" />
              <p className="text-(--danger-text)">{submitError}</p>
            </div>
          )}

          <button
            className="textbutton"
            type="submit"
            disabled={isRegisterButtonDisabled}
          >
            {isSubmitting ? "Creating account…" : "Sign up"}
          </button>

          <div className="flex bg-(--border-default) h-px mb-2 mt-2"></div>

          <span className="flex flex-row gap-1 justify-center">
            <p className="text-sm!">Already have an account?</p>
            <Link to="/login" className="text-(--primary-button) text-sm! hover:underline">
              Sign in
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
}
