import {
	ChangeEventHandler,
	KeyboardEventHandler,
	forwardRef,
	useCallback,
	useImperativeHandle,
	useRef,
} from "react";

type Props = {
	value: string;
	onChange(value: string): void;
	onUpDown(isUp: boolean): void;
	onEnter(): void;
	onEscape(): void;
};

export const ConverterInput = forwardRef<HTMLInputElement, Props>(
	(props, ref) => {
		const { value, onChange, onUpDown, onEnter, onEscape } = props;

		const localRef = useRef<HTMLInputElement>(null);
		useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
			ref,
			() => localRef.current,
		);

		const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
			(e) => onChange(e.target.value),
			[onChange],
		);

		const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
			(e) => {
				if (
					e.key === "ArrowDown" ||
					(e.ctrlKey && e.key === "n") ||
					e.key === "j"
				) {
					onUpDown(false);
					e.preventDefault();
				} else if (
					e.key === "ArrowUp" ||
					(e.ctrlKey && e.key === "p") ||
					e.key === "k"
				) {
					onUpDown(true);
					e.preventDefault();
				} else if (e.key === "Enter") {
					onEnter();
					e.preventDefault();
				} else if (e.key === "Esc" || e.key === "Escape") {
					onEscape();
					e.preventDefault();
				}
			},
			[onUpDown, onEnter, onEscape],
		);

		const handleBlur = useCallback(() => {
			localRef.current?.focus();
		}, []);

		return (
			<input
				className="w-full border-0 outline-0 bg-transparent text-white text-2xl"
				maxLength={30}
				ref={localRef}
				type="text"
				autoFocus
				value={value}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
			/>
		);
	},
);
