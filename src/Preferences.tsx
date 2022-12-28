import { DefaultShortcut } from "../common/defaultPreferences";
import { ShortcutInput } from "./components/ShortcutInput";
import "./index.css";
import { ipcRenderer } from "electron";
import { useCallback, useEffect, useState } from "react";

const Preferences: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [shortcut, setShortcut] = useState<KeyboardShortcut | null>(null);

	useEffect(() => {
		setLoading(true);
		ipcRenderer
			.invoke("get-preferences")
			.then((preferences: JsonStorage["preferences"]) => {
				if (preferences?.shortcut) {
					setShortcut(preferences.shortcut);
				}
			})
			.finally(() => setLoading(false));
	}, []);

	const handleChange = useCallback((shortcut: KeyboardShortcut) => {
		setShortcut(shortcut);
		ipcRenderer.send("set-preferences", { shortcut });
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-4">
			<div className="h3 mb-2 text-white">Keyboard shortcut</div>
			<ShortcutInput
				shortcut={shortcut ?? DefaultShortcut}
				onChange={handleChange}
			/>
		</div>
	);
};

export default Preferences;
