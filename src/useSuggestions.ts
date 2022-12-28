import { parse } from "./converter/parser";
import dayjs from "dayjs";
import { useMemo } from "react";

export type DatetimeSuggestion = {
	value: string;
	tz: string;
	diffFromUTC: string | null;
};

const timezones = ["UTC"];

export const useDatetimeSuggestions = (v: string): DatetimeSuggestion[] => {
	return useMemo(() => {
		const result: DatetimeSuggestion[] = [];
		const userTimezone = dayjs.tz.guess();

		const parsedResult = parse(v);
		if (!parsedResult.isValid) {
			return [];
		}

		for (const tz of [userTimezone, ...timezones]) {
			const diffFromUTC = dayjs.tz(0, tz).format("Z").match(/00:00$/)
				? null
				: dayjs.tz(0, tz).format("Z");

			if (parsedResult.isUnixtime) {
				const d = dayjs.tz(parsedResult.dayjsObject.valueOf(), tz);

				if (parsedResult.isMillitime) {
					result.push({
						value: d.format("YYYY-MM-DD HH:mm:ss.SSS"),
						tz,
						diffFromUTC,
					});
				} else {
					result.push({
						value: d.format("YYYY-MM-DD HH:mm:ss"),
						tz,
						diffFromUTC,
					});
				}
				result.push({ value: d.format("YYYY-MM-DD"), tz, diffFromUTC });
			} else {
				const d = dayjs.tz(
					parsedResult.dayjsObject.format("YYYY-MM-DDTHH:mm:ss.SSS"),
					tz,
				);

				result.push(
					...[
						{ value: d.unix().toString(), tz, diffFromUTC },
						{ value: d.valueOf().toString(), tz, diffFromUTC },
					],
				);
				if (diffFromUTC !== null) {
					result.push({
						value: d.utc().format("YYYY-MM-DD HH:mm:ss"),
						tz: "UTC",
						diffFromUTC: null,
					});
				}
			}
		}

		return result;
	}, [v]);
};
