// Local (non-persistent across browsers) storage for authors, books, prizes
// Mirrors minimal data needed for UI when API_BASE not configured or requests fail.

export interface LocalBook {
  id: number; // negative ID to avoid collision
  name: string;
  publishingDate: string;
  image: string;
  description: string;
}

export interface LocalPrize {
  id: number; // negative ID
  name: string;
  premiationDate: string;
}

export interface LocalAuthor {
  id: number; // negative ID
  name: string;
  birthDate: string;
  image: string;
  description: string;
  books: LocalBook[];
  prizes: LocalPrize[];
}

const STORAGE_KEY = "localAuthorsData";
interface StoreShape { authors: LocalAuthor[] }

function load(): StoreShape {
  if (typeof window === "undefined") return { authors: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { authors: [] };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const maybe = parsed as Record<string, unknown>;
      if (Array.isArray(maybe.authors)) {
        return { authors: maybe.authors as unknown as LocalAuthor[] };
      }
    }
    return { authors: [] };
  } catch { return { authors: [] }; }
}

function save(data: StoreShape) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function getLocalAuthors(): LocalAuthor[] {
  return load().authors;
}

export function addLocalAuthor(author: Omit<LocalAuthor, "id">): LocalAuthor {
  const store = load();
  const newAuthor: LocalAuthor = { ...author, id: -Date.now() - Math.floor(Math.random()*1000) };
  store.authors.unshift(newAuthor);
  save(store);
  return newAuthor;
}

export function deleteLocalAuthor(id: number) {
  const store = load();
  const before = store.authors.length;
  store.authors = store.authors.filter(a => a.id !== id);
  if (store.authors.length !== before) save(store);
}
