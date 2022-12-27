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

import { BrowserWindow, app, globalShortcut, ipcMain, screen } from "electron";
import { release } from "os";
import { join } from "path";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
	app.quit();
	process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

const WindowWidth = 360;
const DefaultWindowHieght = 72;

async function createWindow() {
	win = new BrowserWindow({
		title: "Main window",
		type: "panel",
		width: WindowWidth,
		height: DefaultWindowHieght,
		frame: false,
		resizable: false,
		show: false,
		backgroundColor: "#000000ff",
		icon: join(process.env.PUBLIC, "favicon.svg"),
		webPreferences: {
			preload,
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	if (process.env.VITE_DEV_SERVER_URL) {
		// electron-vite-vue#298
		win.loadURL(url);
		// Open devTool if the app is not packaged
		// win.webContents.openDevTools();
	} else {
		win.loadFile(indexHtml);
	}

	win.on("show", () => {
		win?.webContents.send("show");
	});
}

function showWindow() {
	if (win) {
		const cursorPosition = screen.getCursorScreenPoint();
		const activeScreen = screen.getDisplayNearestPoint(cursorPosition);
		const x =
			activeScreen.workArea.x +
			Math.floor((activeScreen.workArea.width - WindowWidth) / 2);
		const y =
			activeScreen.workArea.y + Math.floor(activeScreen.workArea.height * 0.2);
		win.setPosition(x, y);
		win.show();
	}
}

app
	.whenReady()
	.then(() => {
		globalShortcut.register("Control+U", () => {
			showWindow();
		});
	})
	.then(createWindow);

app.on("second-instance", () => {
	if (win) {
		// Focus on the main window if the user tried to open another
		if (win.isMinimized()) win.restore();
		win.focus();
	}
});

app.on("activate", () => {
	const allWindows = BrowserWindow.getAllWindows();
	if (allWindows.length) {
		allWindows[0].focus();
	} else {
		createWindow();
	}
});

app.on("browser-window-blur", () => {
	app.hide();
});

ipcMain.on("resize", (e, { height }: { width: number; height: number }) => {
	if (win) {
		win.setSize(WindowWidth, Number(height.toFixed()));
	}
});

ipcMain.on("hide", (e) => {
	app.hide();
});

ipcMain.on("log", (e, log: string) => {
	console.log(JSON.parse(log));
});
