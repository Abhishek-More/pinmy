export interface PinData {
  id: number;
  uniqueId: string;
  title: string;
  link: string;
  description?: string | null;
  userId: string;
  snippet?: string | null;
}

const BASE = "/api/pins";

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const PinRequests = {
  list: (key?: string): Promise<PinData[]> => {
    const url = key && key !== BASE ? key : BASE;
    return fetch(url).then((res) => handleResponse<PinData[]>(res));
  },

  get: (uniqueId: string) => fetch(`${BASE}/${uniqueId}`).then(handleResponse),

  create: (data: { title: string; link: string }) =>
    fetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (uniqueId: string, data: { title: string; link: string }) =>
    fetch(`${BASE}/${uniqueId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (uniqueId: string) =>
    fetch(`${BASE}/${uniqueId}`, { method: "DELETE" }),
};
