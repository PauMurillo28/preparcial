"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mapRawBook, Book } from "../../../types/book";
import { API_BASE } from "../../../lib/apiBase";
import { getLocalReviews, LocalReview } from "../../../lib/localReviews";

interface Review {
  id: number;
  name: string;          // nombre del reviewer o título de la review
  source?: string;       // posible campo "source" en el backend
  description: string;   // contenido de la review
  _local?: boolean;      // marca si viene de almacenamiento local
}

function mapRawReview(raw: unknown): Review {
  if (typeof raw === "object" && raw !== null) {
    const r = raw as Record<string, unknown>;
    const pick = (k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
    return {
      id: typeof r.id === "number" ? r.id : Number(r.id ?? 0),
      name: pick("name"),
      source: pick("source") || undefined,
      description: pick("description"),
    };
  }
  return { id: 0, name: "", description: "" };
}

// usamos API_BASE importado del util

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const [book, setBook] = useState<Book | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      if (API_BASE) {
        const response = await fetch(`${API_BASE}/books/${bookId}/reviews`, { cache: "no-store" });
        if (response.ok) {
          const raw = await response.json();
          return Array.isArray(raw) ? raw.map(mapRawReview) : [];
        }
      }
      // Si no hay API o falla, devolvemos vacío aquí; luego mezclamos con local.
      return [] as Review[];
    } catch {
      return [] as Review[];
    }
  }, [bookId]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
  let data: unknown | null = null;
      // 1) Intentar endpoint dedicado
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/books/${bookId}`, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
          }
        } catch { /* ignore */ }
      }
      // 2) Fallback: buscar libro dentro de autores
      if (!data) {
        const aRes = await fetch(`/api/authors`, { cache: "no-store" });
        if (aRes.ok) {
          const authors = await aRes.json();
          if (Array.isArray(authors)) {
            outer: for (const author of authors) {
              if (Array.isArray(author.books)) {
                for (const raw of author.books) {
                  if (Number(raw.id) === bookId) { data = raw; break outer; }
                }
              }
            }
          }
        }
      }
      if (!data) throw new Error("Libro no encontrado en backend ni en autores");
  const mapped = mapRawBook(data);
  setBook(mapped);
  const dObj = (typeof data === "object" && data !== null) ? data as Record<string, unknown> : {};
  const possibleReviews = dObj["reviews"];
	const serverReviews = Array.isArray(possibleReviews) ? possibleReviews.map(mapRawReview) : await fetchReviews();
	// Mezclar con reviews locales (sin duplicar por id)
	const local = getLocalReviews(bookId) as LocalReview[];
	const merged = [
	  ...local,
	  ...serverReviews.filter(r => !local.some(l => l.id === r.id))
	];
	setReviews(merged as Review[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [bookId, fetchReviews]);


  useEffect(() => { void load(); }, [load]);

  // Escuchar evento cuando se añade review
  useEffect(() => {
    const handler = () => load();
    window.addEventListener("reviews:updated", handler);
    return () => window.removeEventListener("reviews:updated", handler);
  }, [bookId, load]);

  if (loading) return <main className="p-6">Cargando...</main>;
  if (error) return <main className="p-6 text-red-600">{error}</main>;
  if (!book) return <main className="p-6">Libro no encontrado.</main>;

  return (
    <main className="p-6 space-y-6">
      <Link href="/books" className="text-sm underline">← Volver a libros</Link>
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="shrink-0 mx-auto md:mx-0 bg-black/80 rounded-md p-3 border border-neutral-700">
          {book.image ? (
            <Image
              src={book.image}
              alt={book.name}
              width={260}
              height={360}
              className="object-contain w-[260px] h-auto"
              priority
            />
          ) : (
            <div className="w-[260px] h-[360px] flex items-center justify-center text-xs text-gray-500">Sin imagen</div>
          )}
        </div>
        <div className="flex-1 space-y-4 relative z-10">
          <h1 className="text-3xl font-bold">{book.name}</h1>
            <p className="text-sm text-gray-500">Publicación: {book.publishingDate}</p>
            <p className="leading-relaxed whitespace-pre-wrap">{book.description}</p>
            <Link
              href={`/books/${book.id}/review-form`}
              className="inline-block px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
            >
              Agregar review
            </Link>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        {reviews.length === 0 && <p className="text-gray-500 text-sm">Sin reviews todavía.</p>}
        <ul className="space-y-3">
          {reviews.map(r => (
            <li key={r.id} className="border rounded p-3">
              <p className="font-medium">{r.name || "Anónimo"}</p>
              {r.source && <p className="text-xs text-gray-500">Fuente: {r.source}</p>}
              <p className="text-sm mt-1 whitespace-pre-wrap">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
