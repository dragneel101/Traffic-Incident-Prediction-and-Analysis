export function getErrorMessage(error) {
  // FastAPI validation / business errors include detail field
  const detail = error?.response?.data?.detail;
  if (detail) return typeof detail === "string" ? detail : JSON.stringify(detail);

  const status = error?.response?.status;
  const messages = {
    400: "Invalid request. Please check your inputs.",
    401: "Your session has expired. Please log in again.",
    403: "You don't have permission to do that.",
    404: "The requested resource was not found.",
    429: "Too many requests. Please slow down.",
    500: "Server error. Please try again in a moment.",
    502: "Server is temporarily unavailable.",
    503: "Service unavailable. Please try again later.",
  };

  return messages[status] || error?.message || "Something went wrong. Please try again.";
}
