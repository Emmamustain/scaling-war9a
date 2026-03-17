export type TPaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
};

export type TApiResponse<T> = {
  data: T;
  message?: string;
};

export type TApiError = {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
};
