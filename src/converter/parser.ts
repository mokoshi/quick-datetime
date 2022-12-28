import dayjs, { Dayjs } from "dayjs";

export type ParsedResult =
	| { isValid: false }
	| {
			isValid: true;
			dayjsObject: Dayjs;
			isUnixtime: boolean;
			isMillitime: boolean;
	  };

export function parse(v: string): ParsedResult {
	try {
		if (v.match(/^[0-9]+$/) && v.length > 6) {
			if (v.length >= 11) {
				if (v.length === 11) {
					v = `${v}00`;
				} else if (v.length === 12) {
					v = `${v}0`;
				}
				const dayjsObject = dayjs(parseInt(v, 10));
				if (dayjsObject.isValid()) {
					return {
						isValid: true,
						dayjsObject,
						isUnixtime: true,
						isMillitime: true,
					};
				}
			} else {
				const dayjsObject = dayjs(parseInt(v, 10) * 1000);
				if (dayjsObject.isValid()) {
					return {
						isValid: true,
						dayjsObject,
						isUnixtime: true,
						isMillitime: false,
					};
				}
			}
		} else if (v.length >= 4) {
			const dayjsObject = dayjs(v);
			if (dayjsObject.isValid()) {
				return {
					isValid: true,
					dayjsObject,
					isUnixtime: false,
					isMillitime: false,
				};
			}
		}
	} catch (e) {
		console.error(e);
	}

	return { isValid: false };
}
