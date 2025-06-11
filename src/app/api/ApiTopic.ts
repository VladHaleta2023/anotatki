import api from "@/app/utils/api";
import showAlert from "@/app/utils/alert";
import { AxiosError } from "axios";
import { TypeTopic } from "@/app/types/TypeTopic";
import { IApiResponse } from "@/app/interfaces/IApiResponse";

export type ResponseTopics = IApiResponse<TypeTopic[]>;
export type ResponseTopic = IApiResponse<TypeTopic>;

type ResponseTopicWithCurrent = {
  current: TypeTopic;
};

type ResponseTopicNotes = {
  behavior: TypeTopic | null;
  current: TypeTopic;
  next: TypeTopic | null;
};

export type TopicNotes = ResponseTopicNotes | null;

export class ApiTopic {
  constructor() {}

  private static handleError(error: unknown): void {
    const err = error as AxiosError<{ message?: string | string[] }>;
    const status = err.response?.status || 500;
    const message = Array.isArray(err.response?.data?.message)
      ? err.response?.data?.message[0]
      : err.response?.data?.message || "Unknown error";

    showAlert(status, message);
  }

  private static handleResponseMessage(
    statusCode: number,
    message: string | string[],
  ): void {
    const msg = Array.isArray(message) ? message[0] : message || "OK";
    showAlert(statusCode, msg);
  }

  private static async request<T>(
    method: "get" | "post" | "put" | "delete",
    url: string,
    data?: unknown
  ): Promise<T | null> {
    try {
      let res;
      switch (method) {
        case "get":
          res = await api.get<T>(url);
          break;
        case "post":
          res = await api.post<T>(url, data);
          break;
        case "put":
          res = await api.put<T>(url, data);
          break;
        case "delete":
          res = await api.delete<T>(url);
          break;
        default:
          throw new Error("Unsupported method");
      }
      return res.data;
    } catch (error) {
      this.handleError(error);
      return null;
    }
  }

  static async fetchTopics(categoryId: string): Promise<TypeTopic[]> {
    try {
      const res = await this.request<ResponseTopics>(
        "get",
        `/categories/${categoryId}/topics`
      );
      if (res && res.statusCode === 200 && res.data) {
        return res.data;
      }
      const message = res?.message?.[0] || "Unknown error";
      showAlert(res?.statusCode || 500, message);
      return [];
    } catch (err) {
      showAlert(500, String(err));
      return [];
    }
  }

  static async createTopic(categoryId: string, title: string): Promise<boolean> {
    const res = await this.request<ResponseTopic>(
      "post",
      `/categories/${categoryId}/topics`,
      { title }
    );
    if (res) {
      this.handleResponseMessage(res.statusCode || 200, res.message);
      return true;
    }
    return false;
  }

  static async fetchTopicByIdTitle(categoryId: string, id: string): Promise<string> {
    if (!id || id === "Main Body") return "";

    try {
      const res = await this.request<IApiResponse<ResponseTopicWithCurrent>>(
        "get",
        `/categories/${categoryId}/topics/${id}`
      );
      if (res && res.statusCode === 200 && res.data?.current) {
        return res.data.current.title;
      }
      const message = res?.message?.[0] || "Unknown error";
      showAlert(res?.statusCode || 500, message);
      return "";
    } catch (err) {
      showAlert(500, String(err));
      return "";
    }
  }

  static async fetchTopicById(
    categoryId: string,
    id: string
  ): Promise<ResponseTopicNotes | null> {
    if (!id || id === "Main Body") return null;

    try {
      const res = await this.request<IApiResponse<ResponseTopicNotes>>(
        "get",
        `/categories/${categoryId}/topics/${id}`
      );
      if (res && res.statusCode === 200 && res.data?.current) {
        return res.data;
      }
      const message = res?.message?.[0] || "Unknown error";
      showAlert(res?.statusCode || 500, message);
      return null;
    } catch (err) {
      showAlert(500, String(err));
      return null;
    }
  }

  static async updateTopic(
    categoryId: string,
    id: string,
    title: string
  ): Promise<boolean> {
    const res = await this.request<ResponseTopic>(
      "put",
      `/categories/${categoryId}/topics/${id}`,
      { title }
    );
    if (res) {
      this.handleResponseMessage(res.statusCode || 200, res.message);
      return true;
    }
    return false;
  }

  static async updateTopicNotes(
    categoryId: string,
    id: string,
    content: string
  ): Promise<boolean> {
    const res = await this.request<ResponseTopic>(
      "put",
      `/categories/${categoryId}/topics/${id}/notes`,
      { content }
    );
    if (res) {
      this.handleResponseMessage(res.statusCode || 200, res.message);
      return true;
    }
    return false;
  }

  static async deleteTopic(categoryId: string, id: string): Promise<boolean> {
    const res = await this.request<ResponseTopic>(
      "delete",
      `/categories/${categoryId}/topics/${id}`
    );
    if (res) {
      this.handleResponseMessage(res.statusCode || 200, res.message);
      return true;
    }
    return false;
  }
}