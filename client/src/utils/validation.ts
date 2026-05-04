const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

export function validateRegisterUsername(value: string): string {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "Username is required.";
	}

	if (trimmedValue.length < 3) {
		return "Username must be at least 3 characters.";
	}

	if (!usernameRegex.test(trimmedValue)) {
		return "Use only letters, numbers, and underscores.";
	}

	return "";
}

export function validateRegisterEmail(value: string): string {
	const trimmedValue = value.trim();

	if (!trimmedValue) {
		return "Email is required.";
	}

	if (!emailRegex.test(trimmedValue)) {
		return "Enter a valid email address.";
	}

	return "";
}

export function validateRegisterPassword(value: string): string {
	if (!value.trim()) {
		return "Password is required.";
	}

	if (value.length < 8) {
		return "Password must be at least 8 characters.";
	}

	return "";
}

export function normalizePhone(value: string): string {
	const trimmed = value.trim();
	if (trimmed.startsWith("+")) {
		// International format: keep the + and all digits, strip other formatting chars
		const digits = trimmed.slice(1).replace(/\D/g, "");
		return "+" + digits;
	}
	// No country code provided — strip formatting and default to +1
	const digits = trimmed.replace(/\D/g, "");
	// If user typed 11 digits starting with 1, they included the US country code already
	if (digits.length === 11 && digits.startsWith("1")) {
		return "+1" + digits.slice(1);
	}
	return "+1" + digits;
}

export function validateRegisterPhoneNumber(value: string): string {
	const trimmed = value.trim();

	if (!trimmed) {
		return "Phone number is required.";
	}

	if (trimmed.startsWith("+")) {
		// International: require the + plus at least 7 digits (shortest valid numbers)
		const digits = trimmed.slice(1).replace(/\D/g, "");
		if (digits.length < 7) {
			return "Enter a valid international phone number (e.g. +44 7911 123456).";
		}
		return "";
	}

	// No country code: must be 10 digits or 11 digits starting with 1
	const digits = trimmed.replace(/\D/g, "");
	const isValid =
		digits.length === 10 ||
		(digits.length === 11 && digits.startsWith("1"));

	if (!isValid) {
		return "Enter a valid phone number (e.g. 202-555-1234 or +44 7911 123456).";
	}

	return "";
}

export function validateRegisterCompanyName(value: string): string {
	if (!value.trim()) {
		return "Company name is required.";
	}

	return "";
}