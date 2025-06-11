export interface IApiResponse<T = unknown> {
  statusCode: number;
  message: string[];
  data?: T;
}