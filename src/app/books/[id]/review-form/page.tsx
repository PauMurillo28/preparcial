"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE, assertApiBase } from "../../../../lib/apiBase";
import { addLocalReview } from "../../../../lib/localReviews";

export default function ReviewFormPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const router = useRouter();

  const [name, setName] = useState(""); // nombre del reviewer o título
  const [source, setSource] = useState(""); // fuente opcional
  const [description, setDescription] = useState(""); // contenido
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!description.trim()) throw new Error("La descripción es obligatoria");
      const payload = { name: name.trim() || "Anon", source: source.trim() || undefined, description: description.trim() };
      let posted = false;
      if (API_BASE) {
        try {
          const base = assertApiBase();
          const res = await fetch(`${base}/books/${bookId}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            posted = true;
          }
        } catch {
          // ignorar y usar fallback local
        }
      }
      if (!posted) {
        addLocalReview(bookId, payload);
      }
      window.dispatchEvent(new Event("reviews:updated"));
      router.push(`/books/${bookId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Agregar review al libro #{bookId}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre / Alias (opcional)</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Fuente (opcional)</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} className="w-full border p-2 rounded" placeholder="Blog, Podcast, Revista..." />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border p-2 rounded" rows={4} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button disabled={submitting} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60 text-sm">{submitting ? "Guardando..." : "Guardar"}</button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded border text-sm">Cancelar</button>
        </div>
      </form>
    </main>
  );
}
