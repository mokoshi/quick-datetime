import { ipcRenderer } from 'electron';

export function debugLog(s: any) {
	ipcRenderer.send('log', JSON.stringify(s));
}
