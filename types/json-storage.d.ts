declare type KeyboardShortcut = {
	ctrl: boolean;
	alt: boolean;
	shift: boolean;
	meta: boolean;
	key: string;
};

declare type JsonStorage = {
	preferences?: {
		shortcut?: KeyboardShortcut;
	};
};
