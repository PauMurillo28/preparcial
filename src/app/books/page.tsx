"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type book = {
  id: number;
  Title: string;
  Release: string;
  image: string;
  description: string;
};

export default function EditBookPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = Number(id);
  const router = useRouter();

  // estado del form
  const [Title, setTitle] = useState("");
  const [Release, setRelease] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Cargar datos del autor
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/books/${bookId}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`No se pudo cargar el libro #${bookId}`);
        const a = (await res.json()) as book;
        setTitle(a.Title);
        setRelease(a.Release);
        setImage(a.image ?? "");
        setDescription(a.description ?? "");
        setError(null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [bookId]);

  // 2) Guardar cambios (PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { Title: Title.trim(), Release, image: image.trim(), description: description.trim() };
      const res = await fetch(`/api/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error al actualizar: ${t}`);
      }

      // Notificar y volver a la lista
      window.dispatchEvent(new Event("authors:updated"));
      router.push("/authors");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Error inesperado");
    }
  };

  if (loading) return <main className="p-6">Cargando...</main>;
  if (error)   return <main className="p-6 text-red-600">{error}</main>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Editar libro #{bookId}</h1>

      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            className="w-full border p-2 rounded"
            value={Title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha de lanzamiento</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={Release}
            onChange={(e) => setRelease(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">URL de la imagen</label>
          <input
            className="w-full border p-2 rounded"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white">Guardar</button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded border"
          >
            Cancelar
          </button>
        </div>
      </form>
    </main>
  );
}
