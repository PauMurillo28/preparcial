// Simple local (non-persistent across devices) reviews store using localStorage.
// If the backend review endpoint is unavailable or API_BASE isn't set, we fall back to this.
// Data shape kept minimal and independent from backend IDs.

export interface LocalReviewData {
  name: string;
  source?: string;
  description: string;
}

export interface LocalReview extends LocalReviewData {
  id: number; // negative number to avoid collision with server IDs (assumed positive)
  createdAt: string;
  _local: true;
}

const STORAGE_KEY = "localBookReviews";

interface AllStoreShape {
  [bookId: string]: LocalReview[];
}

function loadAll(): AllStoreShape {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed as AllStoreShape : {};
  } catch {
    return {};
  }
}

function saveAll(data: AllStoreShape) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota errors */
  }
}

export function getLocalReviews(bookId: number): LocalReview[] {
  const all = loadAll();
  return all[String(bookId)] ?? [];
}

export function addLocalReview(bookId: number, data: LocalReviewData): LocalReview {
  const all = loadAll();
  const list = all[String(bookId)] ?? [];
  // negative id ensures no collision with server-provided positive IDs.
  const newReview: LocalReview = {
    id: -Date.now() - Math.floor(Math.random() * 1000),
    name: data.name,
    source: data.source,
    description: data.description,
    createdAt: new Date().toISOString(),
    _local: true,
  };
  list.unshift(newReview); // add to top
  all[String(bookId)] = list;
  saveAll(all);
  return newReview;
}
