"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { mapRawBook, Book } from "../../types/book";
import { API_BASE } from "../../lib/apiBase";

export default function BooksListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let mapped: Book[] = [];
        let ok = false;
        // 1) Intentar endpoint dedicado de backend si API_BASE está configurado
        if (API_BASE) {
          try {
            const res = await fetch(`${API_BASE}/books`, { cache: "no-store" });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data)) {
                mapped = data.map(mapRawBook);
                ok = true;
              }
            }
          } catch {
            // ignoramos y pasamos al fallback
          }
        }
        // 2) Fallback: construir libros a partir de /api/authors (ruta interna que ya funciona)
        if (!ok) {
          const aRes = await fetch(`/api/authors`, { cache: "no-store" });
            if (!aRes.ok) throw new Error("No se pudo obtener autores para derivar libros");
            const authorsData = await aRes.json();
            if (Array.isArray(authorsData)) {
              const mapUnique = new Map<number, Book>();
              for (const author of authorsData) {
                if (Array.isArray(author.books)) {
                  for (const rawBook of author.books) {
                    const b = mapRawBook(rawBook);
                    if (!mapUnique.has(b.id)) mapUnique.set(b.id, b);
                  }
                }
              }
              mapped = Array.from(mapUnique.values());
              ok = true;
            }
        }
        setBooks(mapped);
        if (!ok) throw new Error("No se pudieron cargar libros de ningún origen");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="p-6">Cargando libros...</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Libros</h1>
      {books.length === 0 && <p className="text-gray-500">No hay libros registrados.</p>}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map(b => (
          <Link
            key={b.id}
            href={`/books/${b.id}`}
            className="group border rounded-md bg-neutral-900/50 hover:bg-neutral-800 transition shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col overflow-hidden"
          >
            <div className="w-full h-64 bg-black flex items-center justify-center overflow-hidden">
              {b.image ? (
                <Image
                  src={b.image}
                  alt={b.name}
                  width={230}
                  height={320}
                  className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <span className="text-xs text-gray-500">Sin imagen</span>
              )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h3 className="font-semibold text-base leading-snug line-clamp-2">{b.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-3 flex-1">{b.description}</p>
              <p className="text-[11px] text-gray-500">Publicación: {b.publishingDate || '—'}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
