import { MutableRefObject, useEffect } from "react";

export const useResizeObserver = (
	element: MutableRefObject<Element | null>,
	callback: ResizeObserverCallback,
) => {
	useEffect(() => {
		const resizeObserver = new ResizeObserver(callback);

		if (element.current) {
			resizeObserver.observe(element.current);
		}

		return () => resizeObserver.disconnect();
	}, [element, callback]);
};
