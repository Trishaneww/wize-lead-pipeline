// Libs
import { toast } from "sonner";

export function displayToast(
  message: string,
  variant: "success" | "error" | "warning" | "info" = "info",
  description?: string,
) {
  toast[variant](message, { description });
}
