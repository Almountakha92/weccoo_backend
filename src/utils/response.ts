export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const ok = <T>(message: string, data: T): ApiResponse<T> => ({
  message,
  data
});
