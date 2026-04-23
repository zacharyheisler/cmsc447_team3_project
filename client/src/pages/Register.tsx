import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TextField from "../components/Textfield";
import registrationFlow from "../assets/registration_flow.png";
import logo from "../assets/ag_associates_logo.png";
import { MOCK_ACCOUNTS, type Account } from "../demo/mockAccounts";
import {
  validateRegisterCompanyName,
  validateRegisterEmail,
  validateRegisterPassword,
  validateRegisterPhoneNumber,
  validateRegisterUsername,
} from "../utils/validation";

export default function RegisterPage() {
  const navigate = useNavigate();
    // Textfield States
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");

    // Don't display empty error until after the field has been clicked once
  const [touchedFields, setTouchedFields] = useState({
    username: false,
    email: false,
    phoneNumber: false,
    companyName: false,
    password: false,
  });

    // Field Validation and error message collection
  const usernameError = validateRegisterUsername(username);
  const emailError = validateRegisterEmail(email);
  const phoneNumberError = validateRegisterPhoneNumber(phoneNumber);
  const companyNameError = validateRegisterCompanyName(companyName);
  const passwordError = validateRegisterPassword(password);

    // Manage button whether button is disabled.
  const isRegisterButtonDisabled = Boolean(
    usernameError || emailError || phoneNumberError || companyNameError || passwordError,
  );

  function markFieldTouched(fieldName: keyof typeof touchedFields) {
    setTouchedFields((currentFields) => ({
      ...currentFields,
      [fieldName]: true,
    }));
  }

  function handleSubmit(e: any) {
    e.preventDefault();

    if (isRegisterButtonDisabled) {
      return;
    }
// Push a new (unverified) account into the shared mock array so it shows
    // up on the Admin Account Management page for demo purposes.
    const newAccount: Account = {
      id: Date.now(),
      userId: `u${Date.now()}`,
      name: username.trim(),
      email: email.trim(),
      role: "USER",
      verified: false,
      active: true,
    };
    MOCK_ACCOUNTS.unshift(newAccount);

    
    navigate("/login", { state: { justRegistered: true } });
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
            onChange={(e) => setUsername(e.target.value)}
            onBlur={() => markFieldTouched("username")}
            errorMessage={touchedFields.username ? usernameError : ""}
          />

          <TextField
            title="Email address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markFieldTouched("email")}
            errorMessage={touchedFields.email ? emailError : ""}
          />

          <TextField
            title="Password"
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => markFieldTouched("password")}
            errorMessage={touchedFields.password ? passwordError : ""}
          />

          <TextField
            title="Phone number"
            placeholder="e.g. 123-456-7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={() => markFieldTouched("phoneNumber")}
            errorMessage={touchedFields.phoneNumber ? phoneNumberError : ""}
          />

          <TextField
            title="Company name"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onBlur={() => markFieldTouched("companyName")}
            errorMessage={touchedFields.companyName ? companyNameError : ""}
          />

          <button className="textbutton" type="submit" disabled={isRegisterButtonDisabled}>
            Sign up
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