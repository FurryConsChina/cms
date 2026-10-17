export type FeedbackStatus = "new" | "processing" | "resolved" | "closed" | "spam";
export type FeedbackCategory =
  | "incorrect_info"
  | "missing_info"
  | "broken_page"
  | "suggestion"
  | "other";

export type Feedback = {
  id: string;
  category: FeedbackCategory;
  contentSummary: string;
  status: FeedbackStatus;
  page: { path: string; title: string | null };
  target: { type: string; id: string } | null;
  createdAt: string;
};

export type FeedbackDetail = Omit<Feedback, "contentSummary"> & {
  content: string;
  contactEmail: string | null;
  internalNote: string | null;
  updatedAt: string;
  closedAt: string | null;
};
