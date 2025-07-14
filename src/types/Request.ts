export type List<T> = {
  total: number;
  // next: string;
  // previous: string;
  current: number;
  pageSize: number;
  records: T[];
};

export type PaginationConfig = {
  page?: number;
  page_size?: number;
  ordering?: "created_at" | "updated_at";
  search?: string;
};
