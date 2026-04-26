import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(input?: number | string): string {
  if (!input) return "";

  const timestamp = typeof input === "string" ? new Date(input).getTime() : input;
  if (isNaN(timestamp)) return "";

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

/**
 * Display-friendly URL: strips scheme, www, query, hash, and credentials,
 * truncates path to at most N non-empty segments.
 */
export const cleanURL = (url: string, maxSegments = 2): string => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url; // fall back to raw input if it's not parseable
  }

  const host = parsed.hostname.replace(/^www\./, "");
  const segments = parsed.pathname
    .split("/")
    .filter(Boolean)
    .slice(0, maxSegments);
  const path = segments.length ? "/" + segments.join("/") : "";

  return host + path;
};

export const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());
