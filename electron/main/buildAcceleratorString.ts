export function buildAcceleratorString(shortcut: KeyboardShortcut) {
	const keys = [];

	if (shortcut.ctrl) {
		keys.push("Control");
	}
	if (shortcut.alt) {
		keys.push("Option");
	}
	if (shortcut.shift) {
		keys.push("Shift");
	}
	if (shortcut.meta) {
		keys.push("Command");
	}
	keys.push(shortcut.key);

	return keys.join("+");
}
