import { mutate } from "swr";

/** JSON-serialized Pin as returned by the API. */
export interface Pin {
  id: number;
  uniqueId: string;
  title: string;
  link: string;
  description?: string | null;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

/** Pin with an optional search snippet from full-text search results. */
export interface PinWithSnippet extends Pin {
  snippet?: string | null;
}

export interface DayCount {
  day: string;
  count: number;
}

const BASE = "/api/pins";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function revalidate() {
  return mutate((key: string) => key?.startsWith(BASE));
}

export const PinRequests = {
  list: (key?: string): Promise<PinWithSnippet[]> => {
    const url = key && key !== BASE ? key : BASE;
    return fetch(url).then((res) => handleResponse<PinWithSnippet[]>(res));
  },

  get: (uniqueId: string) => fetch(`${BASE}/${uniqueId}`).then(handleResponse),

  create: async (data: { title: string; link: string }) => {
    const pin = await fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
    await revalidate();
    return pin;
  },

  update: async (uniqueId: string, data: { title: string; link: string }) => {
    const pin = await fetch(`${BASE}/${uniqueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse);
    await revalidate();
    return pin;
  },

  delete: async (uniqueId: string) => {
    await fetch(`${BASE}/${uniqueId}`, { method: "DELETE" });
    await revalidate();
  },

  weekly: (): Promise<DayCount[]> =>
    fetch(`${BASE}/weekly`).then((res) => handleResponse<DayCount[]>(res)),
};
