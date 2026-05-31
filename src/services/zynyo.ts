import { InboxItem } from "../constants/data";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const USER_EMAIL = process.env.EXPO_PUBLIC_USER_EMAIL;

/**
 * Checks if a document state requires user action (needs signing).
 */
export function isStateActionable(state: string, userHasSigned?: boolean, userRole?: string): boolean {
  if (userHasSigned) return false;
  if (userRole === "RECEIVE" || userRole === "CC") return false;
  const normalized = state?.toUpperCase();
  return normalized === "NOT_VALIDATED" || normalized === "PARTIALLY_VALIDATED";
}

/**
 * Returns a friendly label and badge colors for any API state.
 */
export function getFriendlyBadgeProps(state: string, badgeColors: any, userHasSigned?: boolean, userRole?: string, signatoryState?: string) {
  const s = (state || "UNKNOWN").toUpperCase();

  // Rejected / Cancelled
  if (signatoryState === "REJECTED" || s === "REJECTED") {
    return { label: "Rejected", ...badgeColors.cancelled };
  }
  if (s === "CANCELLED") {
    return { label: "Cancelled", ...badgeColors.cancelled };
  }

  // Copy Only roles
  if (userRole === "RECEIVE" || userRole === "CC") {
    return { label: "Copy Only", ...badgeColors.default };
  }

  // Completed
  if (["SIGNED", "VALIDATED", "DOWNLOADED", "GROUP_COMPLETED"].includes(s)) {
    return { label: "Signed", ...badgeColors.signed };
  }
  
  if (userHasSigned && ["NOT_VALIDATED", "PARTIALLY_VALIDATED"].includes(s)) {
    return { label: "Waiting on others", ...badgeColors.default };
  }

  // Viewing / Opened
  if (["UUID_ACCESSED", "VIEWING", "VIEWED", "DOWNLOAD_ACCESSED"].includes(s)) {
    return { label: "Opened", ...badgeColors.toSign };
  }
  // Invited
  if (["EMAIL_SENT"].includes(s)) {
    return { label: "Invited", ...badgeColors.toSign };
  }
  // Pending
  if (["NOT_VALIDATED", "PARTIALLY_VALIDATED", "NOT_INVITED", "AWAIT_EMAIL"].includes(s)) {
    return { label: "To Sign", ...badgeColors.toSign };
  }
  // Failed
  if (["AUTHENTICATION_FAILED", "ERROR", "E_EMAIL"].includes(s)) {
    return { label: "Failed", ...badgeColors.failed };
  }
  // Misc
  if (["REPLACED", "DELEGATED"].includes(s)) {
    return { label: "Replaced", ...badgeColors.default };
  }
  if (["CC", "REPLACEMENT_CANDIDATE", "AUTHORIZATION_CANDIDATE"].includes(s)) {
    return { label: "Copy Only", ...badgeColors.default };
  }

  // Fallback for any unknown state: Replace underscores and capitalize words
  const friendlyLabel = (state || "Unknown")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return { label: friendlyLabel, ...badgeColors.default };
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
export async function fetchIncomingSignRequests(userEmail: string): Promise<InboxItem[]> {
  if (!API_URL || !API_KEY || !userEmail) {
    console.error("Zynyo API environment variables are not fully configured:", {
      API_URL,
      hasApiKey: !!API_KEY,
      userEmail,
    });
    throw new Error("API configuration is incomplete or user is not logged in.");
  }

  const states = "NOT_VALIDATED,PARTIALLY_VALIDATED,VALIDATED,SIGNED,CANCELLED,REJECTED";
  const start = 0;
  const limit = 100;

  const url = `${API_URL}/documents/${states}/${start}/${limit}?recipients=${encodeURIComponent(userEmail)}`;

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
    const signatory = doc.signatories?.find((s: any) => s.email?.toLowerCase() === userEmail.toLowerCase());
    
    const userHasSigned = signatory?.state === "VALIDATED" || doc.documentState === "SIGNED" || doc.documentState === "VALIDATED";
    const userRole = signatory?.signatoryRole || "SIGN";
    const signatoryState = signatory?.state || "UNKNOWN";

    return {
      id: doc.documentUUID || Math.random().toString(),
      signatoryId: signatory?.publicUUID || doc.documentUUID,
      userHasSigned,
      userRole,
      signatoryState,
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
    const actA = isStateActionable(a.state, a.userHasSigned, a.userRole);
    const actB = isStateActionable(b.state, b.userHasSigned, b.userRole);

    if (actA && !actB) return -1;
    if (!actA && actB) return 1;

    return b.date - a.date;
  });
}

/**
 * Fetches the full document details, including all signatories.
 */
export async function fetchDocumentDetails(uuid: string): Promise<any> {
  if (!API_URL || !API_KEY) {
    throw new Error("API configuration is incomplete.");
  }

  const url = `${API_URL}/document/${uuid}`;
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

  return response.json();
}

