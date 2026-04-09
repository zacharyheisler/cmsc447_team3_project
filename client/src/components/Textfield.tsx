import { useId, type InputHTMLAttributes } from "react";
import "./components.css";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	title?: string;
	errorMessage?: string;
};

export default function TextField({
	title,
	errorMessage,
	className,
	type,
	...inputProps
}: TextFieldProps) {
	const generatedId = useId();
	const inputId = inputProps.id ?? generatedId;
	const hasError = Boolean(errorMessage);
	const inputClassName = `textfield_input${hasError ? " textfield_input--error" : ""}${className ? ` ${className}` : ""}`;

	return (
		<div className="textfield">
			{title ? (
				<label className="textfield_label" htmlFor={inputId}>
					{title}
				</label>
			) : null}

			<input
				id={inputId}
				className={inputClassName}
				type={type}
				{...inputProps}
			/>

			{errorMessage ? (
				<p className="textfield_error">{errorMessage}</p>
			) : null}
		</div>
	);
}