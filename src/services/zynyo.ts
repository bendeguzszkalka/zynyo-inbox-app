import { InboxItem } from "../constants/data";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const USER_EMAIL = process.env.EXPO_PUBLIC_USER_EMAIL;

/**
 * Checks if a document state requires user action (needs signing).
 */
export function isStateActionable(state: string): boolean {
  const normalized = state?.toUpperCase();
  return normalized === "NOT_VALIDATED" || normalized === "PARTIALLY_VALIDATED";
}

/**
 * Formats a timestamp into a clean, premium-looking human-readable date.
 */
function formatDate(timestamp: number): string {
  try {
    const date = new Date(timestamp);
    // Format: e.g. "May 30, 22:45"
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}

/**
 * Fetches all incoming sign requests for the configured user email and sorts them.
 * Actionable requests are sorted to the top, and within each group, sorted by date descending.
 */
export async function fetchIncomingSignRequests(): Promise<InboxItem[]> {
  if (!API_URL || !API_KEY || !USER_EMAIL) {
    console.error("Zynyo API environment variables are not fully configured:", {
      API_URL,
      hasApiKey: !!API_KEY,
      USER_EMAIL,
    });
    throw new Error("API configuration is incomplete. Please check your .env file.");
  }

  const states = "NOT_VALIDATED,PARTIALLY_VALIDATED,VALIDATED,SIGNED,CANCELLED,REJECTED";
  const start = 0;
  const limit = 100;

  const url = `${API_URL}/documents/${states}/${start}/${limit}?recipients=${encodeURIComponent(USER_EMAIL)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "apikey": API_KEY,
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const text = await response.text();
      errorMsg += `: ${text}`;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid response format: expected an array of documents");
  }

  const mapped: InboxItem[] = data.map((doc: any) => {
    const sender = doc.signRequest?.submitterName || doc.signRequest?.submitter || "Unknown Submitter";
    const timestamp = doc.stateChangedDate || doc.signRequest?.createdAt || Date.now();

    return {
      id: doc.documentUUID || Math.random().toString(),
      sender,
      message: doc.name || "Untitled Document",
      state: doc.documentState || "UNKNOWN",
      description: doc.description || "",
      date: timestamp,
      formattedDate: formatDate(timestamp),
    };
  });

  // Sort: Actionable first, then sort by timestamp descending (newest first)
  return mapped.sort((a, b) => {
    const actA = isStateActionable(a.state);
    const actB = isStateActionable(b.state);

    if (actA && !actB) return -1;
    if (!actA && actB) return 1;

    return b.date - a.date;
  });
}
