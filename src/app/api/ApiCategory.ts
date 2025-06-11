import { IApiResponse } from "@/app/interfaces/IApiResponse";
import { TypeCategory } from "@/app/types/TypeCategory";
import api from "@/app/utils/api";
import showAlert from "@/app/utils/alert";
import { AxiosError } from "axios";

export type ResponseCategories = IApiResponse<TypeCategory[]>;
export type ResponseCategory = IApiResponse<TypeCategory>;

export class ApiCategory {
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

    static async fetchCategories(): Promise<TypeCategory[]> {
        try {
            const res = await this.request<ResponseCategories>("get", "/categories");
            if (res && res.statusCode === 200 && res.data) {
                return res.data;
            }
            const message = res?.message?.[0] || "Unknown error";
            showAlert(res?.statusCode || 500, message);
            return [];
        }
        catch (err) {
            showAlert(500, String(err));
            return []
        }
    }

    static async createCategory(name: string): Promise<boolean> {
        const res = await this.request<ResponseCategory>("post", "/categories", { name });
        if (res) {
            this.handleResponseMessage(res.statusCode || 200, res.message);
            return true;
        }
        return false;
    }

    /*
    static async fetchCategoryById(id: string): Promise<TypeCategory > {
        if (!id || id === "Main Body")
            return {};

        const res = await this.request<ResponseCategory>("get", `/categories/${id}`);
        if (res && res.statusCode === 200 && res.data) {
            return res.data;
        }
        const message = res?.message?.[0] || "Unknown error";
        showAlert(res?.statusCode || 500, message);
        return {};
    }
    */

    static async updateCategory(id: string, name: string): Promise<boolean> {
        const res = await this.request<ResponseCategory>("put", `/categories/${id}`, { name });
        if (res) {
            this.handleResponseMessage(res.statusCode || 200, res.message);
            return true;
        }
        return false;
    }

    static async deleteCategory(id: string): Promise<boolean> {
        const res = await this.request<ResponseCategory>("delete", `/categories/${id}`);
        if (res) {
            this.handleResponseMessage(res.statusCode || 200, res.message);
            return true;
        }
        return false;
    }
}