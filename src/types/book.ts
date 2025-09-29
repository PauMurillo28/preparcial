export interface Book {
  id: number;
  name: string;
  publishingDate: string; // ISO date string
  image: string;
  description: string;
  isbn?: string;
  editorialName?: string;
}

// Helper para mapear variaciones de claves posibles del backend
export function mapRawBook(raw: unknown): Book {
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>;
    const pickString = (key: string): string => {
      const v = r[key];
      return typeof v === "string" ? v : "";
    };
    const editorial = r["editorial"];
    return {
      id: typeof r.id === "number" ? r.id : Number(r.id ?? 0),
      name: pickString("name") || pickString("title") || pickString("Title"),
      publishingDate: pickString("publishingDate") || pickString("release") || pickString("Release"),
      image: pickString("image"),
      description: pickString("description"),
      isbn: pickString("isbn"),
      editorialName: typeof editorial === "object" && editorial !== null ? pickStringNested(editorial as Record<string, unknown>, "name") : undefined,
    };

    function pickStringNested(obj: Record<string, unknown>, key: string): string | undefined {
      const v = obj[key];
      return typeof v === "string" ? v : undefined;
    }
  }
  return { id: 0, name: "", publishingDate: "", image: "", description: "" };
}
