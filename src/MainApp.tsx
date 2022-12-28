import { ConverterInput } from "./components/ConverterInput";
import { DatetimeSuggestionItem } from "./components/SuggestionItem";
import "./index.css";
import { useResizeObserver } from "./useResizeObserver";
import { useDatetimeSuggestions } from "./useSuggestions";
import { clipboard, ipcRenderer } from "electron";
import { useCallback, useEffect, useRef, useState } from "react";

const MainApp: React.FC = () => {
	const [value, setValue] = useState("");
	const [cursor, setCursor] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const handleResize: ResizeObserverCallback = useCallback((entries) => {
		const { width, height } = entries[0].contentRect;
		ipcRenderer.send("resize", { width, height });
	}, []);
	useResizeObserver(containerRef, handleResize);

	const suggestions = useDatetimeSuggestions(value);

	useEffect(() => {
		const showListener = () => {
			inputRef.current?.select();
		};
		ipcRenderer.on("show", showListener);
		return () => {
			ipcRenderer.removeListener("show", showListener);
		};
	}, []);

	const handleUpDown = useCallback(
		(isUp: boolean) => {
			if (suggestions.length > 0) {
				if (isUp) {
					setCursor((cursor - 1 + suggestions.length) % suggestions.length);
				} else {
					setCursor((cursor + 1) % suggestions.length);
				}
			}
		},
		[cursor, suggestions],
	);

	const handleEnter = useCallback(() => {
		if (suggestions.length > 0) {
			clipboard.writeText(suggestions[cursor].value);
		}
		ipcRenderer.send("hide");
	}, [suggestions, cursor]);

	const handleEscape = useCallback(() => {
		ipcRenderer.send("hide");
	}, []);

	return (
		<div ref={containerRef}>
			<div className="p-4">
				<ConverterInput
					ref={inputRef}
					value={value}
					onChange={setValue}
					onUpDown={handleUpDown}
					onEnter={handleEnter}
					onEscape={handleEscape}
				/>
			</div>
			{suggestions.length > 0 && (
				<div className="border-t border-gray-500 p-2">
					{suggestions.map((s, i) => {
						return (
							<DatetimeSuggestionItem
								key={i.toString()}
								suggestion={s}
								isSelected={i === cursor}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default MainApp;
