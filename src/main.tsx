import App from "./App";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React from "react";
import ReactDOM from "react-dom/client";

dayjs.extend(utc);
dayjs.extend(timezone);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");
