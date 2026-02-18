import type { ReviewData } from "../types/review";

type UnknownRecord = Record<string, unknown>;

const asText = (value: unknown) =>
	typeof value === "string" ? value.trim() : String(value ?? "").trim();

const toReviewData = (value: unknown): ReviewData => {
	const row = (value ?? {}) as UnknownRecord;

	return {
		timestamp: asText(row.timestamp),
		show_name: asText(row.show_name),
		review: asText(row.review),
		show_type: asText(row.show_type),
	};
};

const extractRows = (payload: unknown): unknown[] => {
	if (Array.isArray(payload)) {
		return payload;
	}

	if (payload && typeof payload === "object") {
		const maybeRecord = payload as UnknownRecord;
		const data = maybeRecord.data;

		if (Array.isArray(data)) {
			return data;
		}
	}

	return [];
};

export const getReviews = async (): Promise<ReviewData[]> => {
	const endpoint = import.meta.env.REVIEWS_ENDPOINT;

	if (!endpoint) {
		throw new Error("Missing REVIEWS_ENDPOINT environment variable.");
	}

	const response = await fetch(endpoint, {
		headers: {
			accept: "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Reviews fetch failed with status ${response.status}.`);
	}

	const payload = await response.json();
	const rows = extractRows(payload);
	const finishedRows = rows.filter((value) => {
		const row = (value ?? {}) as UnknownRecord;
		return asText(row.finished).toLowerCase() === "yes";
	});

	return finishedRows.map(toReviewData);
};
