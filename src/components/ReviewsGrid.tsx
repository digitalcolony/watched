import { useMemo, useState } from "react";
import type { ReviewData } from "../types/review";

type SortKey = "timestamp" | "show_name" | "review" | "show_type";
type SortDirection = "asc" | "desc";

interface ReviewsGridProps {
	reviews: ReviewData[];
}

const parseDateValue = (input: string) => {
	const timestamp = new Date(input).getTime();
	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const formatMonthYear = (input: string) => {
	const date = new Date(input);
	if (Number.isNaN(date.getTime())) return input || "—";
	return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
};

const sortValue = (review: ReviewData, key: SortKey) => {
	if (key === "timestamp") {
		return parseDateValue(review.timestamp);
	}

	return review[key].toLowerCase();
};

const exportReviews = (items: ReviewData[]) => {
	const exportItems = items.map((item) => {
		const starCount = (item.review.match(/⭐/g) || []).length;
		return {
			timestamp: item.timestamp,
			show_name: item.show_name,
			review_1_to_5: Number.isFinite(starCount) ? starCount : 0,
			show_type: item.show_type,
		};
	});

	const payload = JSON.stringify(exportItems, null, 2);
	const blob = new Blob([payload], { type: "application/json" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `reviews-${new Date().toISOString().slice(0, 10)}.json`;
	link.style.display = "none";
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

export default function ReviewsGrid({ reviews }: ReviewsGridProps) {
	const [query, setQuery] = useState("");
	const [sortKey, setSortKey] = useState<SortKey>("timestamp");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

	const filteredAndSorted = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		const filtered = normalizedQuery
			? reviews.filter((item) => {
					return item.show_name.toLowerCase().includes(normalizedQuery);
				})
			: reviews;

		return [...filtered].sort((left, right) => {
			const leftValue = sortValue(left, sortKey);
			const rightValue = sortValue(right, sortKey);

			if (leftValue < rightValue) return sortDirection === "asc" ? -1 : 1;
			if (leftValue > rightValue) return sortDirection === "asc" ? 1 : -1;
			return 0;
		});
	}, [query, reviews, sortDirection, sortKey]);

	const changeSort = (key: SortKey) => {
		if (key === sortKey) {
			setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
			return;
		}

		setSortKey(key);
		setSortDirection(key === "timestamp" ? "desc" : "asc");
	};

	const sortLabel = (key: SortKey) => {
		if (sortKey !== key) return "↕";
		return sortDirection === "asc" ? "↑" : "↓";
	};

	return (
		<div className="reviews-module">
			<div className="controls">
				<div className="controls-row">
					<div className="search-wrap">
						<input
							id="review-search"
							type="search"
							placeholder="Search title"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						{query ? (
							<button
								type="button"
								className="search-clear"
								aria-label="Clear search"
								onClick={() => setQuery("")}
							>
								×
							</button>
						) : null}
					</div>
					<div className="controls-actions">
						<p className="count">{filteredAndSorted.length} result(s)</p>
						<button
							type="button"
							className="export-button"
							onClick={() => exportReviews(filteredAndSorted)}
						>
							Export JSON
						</button>
					</div>
				</div>
			</div>

			<div className="grid-shell" role="region" aria-label="Reviews grid">
				<table>
					<thead>
						<tr>
							<th>
								<button type="button" onClick={() => changeSort("timestamp")}>
									Date {sortLabel("timestamp")}
								</button>
							</th>
							<th>
								<button type="button" onClick={() => changeSort("show_name")}>
									Show {sortLabel("show_name")}
								</button>
							</th>
							<th>
								<button type="button" onClick={() => changeSort("review")}>
									Rating {sortLabel("review")}
								</button>
							</th>
							<th>
								<button type="button" onClick={() => changeSort("show_type")}>
									Type {sortLabel("show_type")}
								</button>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredAndSorted.map((item, index) => (
							<tr key={`${item.show_name}-${item.timestamp}-${index}`}>
								<td>{formatMonthYear(item.timestamp)}</td>
								<td>{item.show_name || "—"}</td>
								<td>{item.review || "—"}</td>
								<td>{item.show_type || "—"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
