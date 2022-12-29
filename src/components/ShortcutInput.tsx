import { KeyboardEventHandler, forwardRef, useCallback, useMemo } from "react";

type Props = {
  shortcut: KeyboardShortcut;
  onChange(shortcut: KeyboardShortcut): void;
};

export const ShortcutInput = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    const { shortcut, onChange } = props;

    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
      (e) => {
        const actualKey = e.code.match(/^(?:Key)?(.+)$/)?.[1];
        if (
          actualKey &&
          !(
            e.key === "Control" ||
            e.key === "Alt" ||
            e.key === "Shift" ||
            e.key === "Meta"
          )
        ) {
          const shortcut = {
            ctrl: e.ctrlKey,
            alt: e.altKey,
            shift: e.shiftKey,
            meta: e.metaKey,
            key: actualKey,
          };
          if (shortcut.ctrl || shortcut.alt || shortcut.meta) {
            onChange(shortcut);
          }
        }
        e.preventDefault();
      },
      [onChange],
    );

    const shortcutString = useMemo(() => {
      if (!shortcut) {
        return "";
      }
      const keys = [];
      if (shortcut.ctrl) {
        keys.push("⌃");
      }
      if (shortcut.alt) {
        keys.push("⌥");
      }
      if (shortcut.shift) {
        keys.push("⇧");
      }
      if (shortcut.meta) {
        keys.push("⌘");
      }
      keys.push(shortcut.key);

      return keys.join(" ");
    }, [shortcut]);

    return (
      <input
        ref={ref}
        className="p-2 w-full border rounded-2xl outline-0 bg-transparent text-white text-2xl text-center"
        autoFocus
        type="text"
        value={shortcutString}
        onKeyDown={handleKeyDown}
      />
    );
  },
);
