import dayjs from "dayjs";
import { useMemo } from "react";

export type DatetimeSuggestion = {
	value: string;
	tz: string;
};

const timezones = ["UTC"];

export const useDatetimeSuggestions = (v: string): DatetimeSuggestion[] => {
	return useMemo(() => {
		const result: DatetimeSuggestion[] = [];
		const userTimezone = dayjs.tz.guess();

		for (const tz of [userTimezone, ...timezones]) {
			if (v.match(/^[0-9]+$/) && v.length > 6) {
				if (v.length >= 11) {
					if (v.length === 11) {
						v = `${v}00`;
					} else if (v.length === 12) {
						v = `${v}0`;
					}
					const milli = parseInt(v, 10);
					const d = dayjs.tz(milli, tz);
					result.push(
						...[
							{ value: d.format("YYYY-MM-DD HH:mm:ss.SSS"), tz },
							{ value: d.format("YYYY-MM-DD"), tz },
						],
					);
				} else {
					const n = parseInt(v, 10);
					const d = dayjs.tz(n, tz);
					result.push(
						...[
							{ value: d.format("YYYY-MM-DD HH:mm:ss"), tz },
							{ value: d.format("YYYY-MM-DD"), tz },
						],
					);
				}
			} else {
				const d = dayjs.tz(v, tz);
				if (d.isValid()) {
					result.push(
						...[
							{ value: d.unix().toString(), tz },
							{ value: d.valueOf().toString(), tz },
						],
					);
				}
			}
		}

		return result;
	}, [v]);
};
