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

export function validateRegisterPhoneNumber(value: string): string {
	const trimmedValue = value.trim();
	const digitsOnly = trimmedValue.replace(/\D/g, "");

	if (!trimmedValue) {
		return "Phone number is required.";
	}

	if (digitsOnly.length !== 10) {
		return "Enter a valid 10-digit phone number.";
	}

	return "";
}

export function validateRegisterCompanyName(value: string): string {
	if (!value.trim()) {
		return "Company name is required.";
	}

	return "";
}