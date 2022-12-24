import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { clipboard, ipcRenderer } from "electron";
import useResizeObserver from "./useResizeObserver";

const App: React.FC = () => {
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);

  const element = useRef(null);

  useEffect(() => {
    // setValue(clipboard.readText());
  }, []);

  const handleResize = (entries: any) => {
    const { width, height } = entries[0].contentRect;
    ipcRenderer.send("resize", { width, height });
  };

  useResizeObserver([element], handleResize);

  const suggestions = getSuggestions(value);

  return (
    <div ref={element} style={{ backgroundColor: "#faf" }}>
      <input
        style={{ margin: 16 }}
        type="text"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === "ArrowDown" ||
            (e.ctrlKey && e.key === "n") ||
            e.key === "j"
          ) {
            setCursor((cursor + 1) % suggestions.length);
            e.preventDefault();
          } else if (
            e.key === "ArrowUp" ||
            (e.ctrlKey && e.key === "p") ||
            e.key === "k"
          ) {
            setCursor((cursor - 1 + suggestions.length) % suggestions.length);
            e.preventDefault();
          } else if (e.key === "Enter") {
            if (suggestions.length > 0) {
              clipboard.writeText(suggestions[cursor]);
            }
            ipcRenderer.send("hide");
            e.preventDefault();
          }
        }}
      />
      {suggestions.map((s, i) => {
        return (
          <div
            style={{ backgroundColor: i === cursor ? "#aef" : "transparent" }}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
};

function getSuggestions(v: string) {
  if (v.match(/^[0-9]+$/)) {
    if (v.length >= 11) {
      if (v.length === 11) {
        v = v + "00";
      } else if (v.length === 12) {
        v = v + "0";
      }
      const milli = parseInt(v, 10);
      const d = dayjs(milli);
      return [d.format("YYYY-MM-DD HH:mm:ss.SSS"), d.format("YYYY-MM-DD")];
    } else {
      const n = parseInt(v, 10);
      const d = dayjs.unix(n);
      return [d.format("YYYY-MM-DD HH:mm:ss"), d.format("YYYY-MM-DD")];
    }
  } else {
    const d = dayjs(v);
    if (d.isValid()) {
      return [d.unix().toString(), d.valueOf().toString()];
    }
  }
  return [];
}

export default App;
