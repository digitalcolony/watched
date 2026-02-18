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
					<input
						id="review-search"
						type="search"
						placeholder="Search title"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
					<p className="count">{filteredAndSorted.length} result(s)</p>
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
