// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, "../..");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = app.isPackaged
	? process.env.DIST
	: join(process.env.DIST_ELECTRON, "../public");

import { DefaultShortcut } from "../../common/defaultPreferences";
import { buildAcceleratorString } from "./buildAcceleratorString";
import {
	BrowserWindow,
	Menu,
	app,
	globalShortcut,
	ipcMain,
	screen,
} from "electron";
import storage from "electron-json-storage";
import { join } from "path";

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

Menu.setApplicationMenu(
	Menu.buildFromTemplate([
		{
			label: app.name,
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{
					label: "Preferences",
					accelerator: "CmdOrCtrl+,",
					click() {
						showPreferences();
					},
				},
				{ type: "separator" },
				{ role: "quit" },
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" },
			],
		},
	]),
);

let mainWindow: BrowserWindow | null = null;
let preferencesWindow: BrowserWindow | null = null;

const useDevTool = false;
const WindowWidth = useDevTool ? 960 : 380;
const DefaultWindowHieght = useDevTool ? 720 : 72;

async function createWindow() {
	if (mainWindow) {
		return;
	}

	mainWindow = new BrowserWindow({
		type: "panel",
		width: WindowWidth,
		height: DefaultWindowHieght,
		frame: false,
		resizable: false,
		show: false,
		backgroundColor: "#000000ff",
		icon: join(process.env.PUBLIC, "favicon.svg"),
		webPreferences: {
			// preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
		if (useDevTool) {
			mainWindow.webContents.openDevTools();
		}
	} else {
		mainWindow.loadFile(join(process.env.DIST, "index.html"));
	}

	mainWindow.on("show", () => {
		mainWindow?.webContents.send("show");
	});
	mainWindow.on("blur", () => {
		if (preferencesWindow?.isVisible()) {
			mainWindow.hide();
		} else {
			app.hide();
		}
	});
}

function showMainWindow() {
	if (mainWindow) {
		const cursorPosition = screen.getCursorScreenPoint();
		const activeScreen = screen.getDisplayNearestPoint(cursorPosition);
		const x =
			activeScreen.workArea.x +
			Math.floor((activeScreen.workArea.width - WindowWidth) / 2);
		const y =
			activeScreen.workArea.y + Math.floor(activeScreen.workArea.height * 0.2);
		mainWindow.setPosition(x, y);
		mainWindow.show();
	}
}

function showPreferences() {
	preferencesWindow = new BrowserWindow({
		title: "Preferences",
		backgroundColor: "#000000ff",
		icon: join(process.env.PUBLIC, "favicon.svg"),
		width: 320,
		height: 280,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		preferencesWindow.loadURL(
			join(process.env.VITE_DEV_SERVER_URL, "pref.html"),
		);
		if (useDevTool) {
			preferencesWindow.webContents.openDevTools();
		}
	} else {
		preferencesWindow.loadFile(join(process.env.DIST, "pref.html"));
	}

	preferencesWindow.on("close", () => {
		preferencesWindow = null;
	});
}

function registerShortcut(shortcut: KeyboardShortcut | null) {
	const acc = buildAcceleratorString(shortcut ?? DefaultShortcut);

	console.log("register global shortcut: ", acc);

	globalShortcut.unregisterAll();
	globalShortcut.register(acc, () => {
		showMainWindow();
	});
}

app
	.whenReady()
	.then(() => {
		console.log(storage.getDataPath());

		const preferences = storage.getSync(
			"preferences",
		) as JsonStorage["preferences"];

		registerShortcut(preferences.shortcut);
	})
	.then(() => {
		createWindow();
	});

ipcMain.on("resize", (e, { height }: { width: number; height: number }) => {
	if (mainWindow && !useDevTool) {
		mainWindow.setSize(WindowWidth, Number(height.toFixed()));
	}
});

ipcMain.on("hide", (e) => {
	app.hide();
});

ipcMain.on("set-preferences", (e, data: JsonStorage["preferences"]) => {
	if (data.shortcut) {
		registerShortcut(data.shortcut);
	}
	const current = storage.getSync("preferences");
	storage.set("preferences", { ...current, ...data }, (e) => console.error(e));
});

ipcMain.handle("get-preferences", (e) => {
	return storage.getSync("preferences");
});
