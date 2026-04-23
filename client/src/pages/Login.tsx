import { useState, useEffect, type ChangeEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TextField from "../components/Textfield";
import logo from '../assets/ag_associates_logo.png'; 
import { MdErrorOutline, MdClose, MdCheckCircle } from "react-icons/md";

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const [usernameOrEmail, setUsernameOrEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loginError, setLoginError] = useState("");
	const [showRegisteredToast, setShowRegisteredToast] = useState(false);

	useEffect(() => {
		const state = location.state as { justRegistered?: boolean } | null;
		if (state?.justRegistered) {
			setShowRegisteredToast(true);
			// Clear the nav state so the popup doesn't re-appear on refresh/back
			window.history.replaceState({}, document.title);
		}
	}, [location.state]);
	const isLoginButtonDisabled = !usernameOrEmail.trim() || !password.trim();

	// Mock submit function (just for the demo)
	const handleSubmit = (event: any) => {
		event.preventDefault();

		const identity = usernameOrEmail.trim().toLowerCase();
		const enteredPassword = password.trim();

		if ((identity === "admin" || identity === "admin@a-gassociates.com") && enteredPassword === "Admin12345") {
			navigate("/dashboard");
			sessionStorage.setItem("USER_ROLE", "admin");
			return;
		}

		if ((identity === "user" || identity === "user@a-gassociates.com") && enteredPassword === "User12345") {
			navigate("/dashboard");
			sessionStorage.setItem("USER_ROLE", "user");
			return;
		}

		if ((identity === "agent" || identity === "agent@a-gassociates.com") && enteredPassword === "Agent12345") {
			navigate("/dashboard");
			sessionStorage.setItem("USER_ROLE", "agent");
			return;
		}

		setLoginError("Invalid username/email or password.");
	};

	// handle username/email textfield ChangeEvent
	function updateUsernameOrEmail(e: ChangeEvent<HTMLInputElement>) {
		setUsernameOrEmail(e.target.value);
		if (loginError) {
			setLoginError("");
		}
	}

	// handle password textfield ChangeEvent
	function updatePassword(e: ChangeEvent<HTMLInputElement>) {
		setPassword(e.target.value);
		if (loginError) {
			setLoginError("");
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-5">
			{showRegisteredToast && (
				<div
					className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex items-start gap-3 max-w-md w-[calc(100%-2rem)] bg-white border border-green-300 shadow-lg rounded-lg p-3"
					role="status"
					aria-live="polite"
				>
					<MdCheckCircle size={22} className="mt-0.5 text-green-600 shrink-0" />
					<p className="flex-1 text-sm text-slate-800">
						You have successfully registered. An email will be sent to your inbox once the account has been verified by an Administrator.
					</p>
					<button
						type="button"
						onClick={() => setShowRegisteredToast(false)}
						aria-label="Close notification"
						className="text-slate-500 hover:text-slate-800 cursor-pointer"
					>
						<MdClose size={20} />
					</button>
				</div>
			)}
			<form className="flex flex-col w-full max-w-sm gap-4" onSubmit={handleSubmit}>

				<div className="flex w-full justify-center">
					<img src={logo} className="w-[25%] mb-2"/>
				</div>
				<h3 className="font-bold text-(--headings-text) text-center mb-6">Welcome Back!</h3>

				<TextField
					title="Username or email address"
					placeholder="Enter username or email"
					value={usernameOrEmail}
					onChange={updateUsernameOrEmail}
				/>

				<TextField
					title="Password"
					type="password"
					placeholder="Enter password"
					value={password}
					onChange={updatePassword}
				/>

				{(loginError ? 
					// Case: error, display error message
					<div 
						className="flex flex-row justify-center bg-(--danger-surface) outline-(--danger-text) outline-1 rounded-lg p-2.75 gap-x-1" 
					>
						<MdErrorOutline size={20} className="mt-0.5 text-(--danger-text)"/>
						<p className="text-(--danger-text)">{loginError}</p>
					</div> 
					: // Case: no error, don't show message
					<></>
				)}

				<button 
					className="textbutton" 
					type="submit" 
					disabled={isLoginButtonDisabled}
				>
					Sign in
				</button>

				<div className="flex bg-(--border-default) h-px mb-2 mt-2"></div>

				<span className="flex flex-row gap-1 justify-center">
					<p className="text-sm!">Don't have an account?</p>
					<Link to="/register" className="text-(--primary-button) text-sm! hover:underline">Sign up</Link>
				</span>
			</form>
			 
		</div>
	);
}