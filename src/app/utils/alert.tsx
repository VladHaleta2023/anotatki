import { toast } from "react-toastify";

export default function showAlert(statusCode: number, message: string) {
  if (statusCode >= 200 && statusCode < 300) {
    toast.success(message);
  } else if (statusCode >= 400 && statusCode < 500) {
    toast.warning(message);
  } else {
    toast.error(message);
  }
}