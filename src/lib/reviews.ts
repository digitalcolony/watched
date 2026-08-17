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
		seenBefore2021: asText(row.seenBefore2021),
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
	const endpoint = (
		import.meta.env.REVIEWS_ENDPOINT ??
		import.meta.env.PUBLIC_REVIEWS_ENDPOINT ??
		""
	).trim();

	if (!endpoint) {
		throw new Error(
			"Missing REVIEWS_ENDPOINT environment variable (or PUBLIC_REVIEWS_ENDPOINT fallback).",
		);
	}

	let normalizedEndpoint = endpoint;

	try {
		normalizedEndpoint = new URL(endpoint).toString();
	} catch {
		throw new Error(`REVIEWS_ENDPOINT is not a valid URL: ${endpoint}`);
	}

	const response = await fetch(normalizedEndpoint, {
		headers: {
			accept: "application/json",
		},
		redirect: "follow",
	});

	if (!response.ok) {
		const bodySample = (await response.text()).slice(0, 180).replace(/\s+/g, " ").trim();
		const resolvedUrl = response.url || normalizedEndpoint;
		throw new Error(
			`Reviews fetch failed with status ${response.status} (${response.statusText}) from ${resolvedUrl}. Body preview: ${bodySample || "<empty>"}`,
		);
	}

	const payload = await response.json();
	const rows = extractRows(payload);
	const finishedRows = rows.filter((value) => {
		const row = (value ?? {}) as UnknownRecord;
		return asText(row.finished).toLowerCase() === "yes";
	});

	return finishedRows.map(toReviewData);
};
