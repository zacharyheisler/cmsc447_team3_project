import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

const root = document.getElementById("root");

if (!root) {
	throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/user-dashboard" element={<></>} />
				<Route path="/agent-dashboard" element={<></>} />
				<Route path="/admin-dashboard" element={<></>} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);