"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE, assertApiBase } from "../lib/apiBase";
import { addLocalAuthor } from "../lib/localAuthors";

interface AuthorFormData {
  name: string;
  birthDate: string;
  image: string;
  description: string;
}

interface BookFormData {
  title: string;
  release: string;
  bookImage: string;
  bookDescription: string;
}

// prize form se maneja inline, no se requiere interfaz dedicada

/*
  Flujo requerido por el PDF (creación encadenada):
  1. Crear Autor        -> POST /authors
  2. Crear Libro        -> POST /books
  3. Asociar Libro      -> POST /authors/{authorId}/books/{bookId}
  4. Crear Premio       -> POST /prizes
  5. Asociar Premio     -> POST /prizes/{prizeId}/author/{authorId}

  Si la API no está disponible (sin NEXT_PUBLIC_API_BASE o falla alguna etapa),
  se hace fallback a almacenamiento local (localStorage) creando una estructura
  equivalente para demostrar la funcionalidad sin persistencia real.
*/
const AuthorForm: React.FC = () => {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  // Campos libro
  const [bookName, setBookName] = useState("");
  const [publishingDate, setPublishingDate] = useState("");
  const [bookImage, setBookImage] = useState("");
  const [bookDescription, setBookDescription] = useState("");

  // Campos premio
  const [prizeName, setPrizeName] = useState("");
  const [premiationDate, setPremiationDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Validaciones mínimas obligatorias segun requerimiento PDF
      if (!name || !birthDate || !bookName || !publishingDate || !prizeName || !premiationDate) {
        throw new Error("Todos los campos obligatorios (autor, libro y premio) deben estar completos");
      }

      const authorPayload: AuthorFormData = { name: name.trim(), birthDate, image: image.trim(), description: description.trim() };
      const bookPayload: BookFormData = { title: bookName.trim(), release: publishingDate, bookImage: bookImage.trim(), bookDescription: bookDescription.trim() };

      let usedLocal = false;
      if (API_BASE) {
        try {
          const base = assertApiBase();
          // 1) Crear Autor
          const authorRes = await fetch(`${base}/authors`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authorPayload),
          });
          if (!authorRes.ok) throw new Error("Error creando autor (POST /authors)");
          const createdAuthor = await authorRes.json();
          const authorId = createdAuthor.id;
          // 2) Crear Libro
          const bookRes = await fetch(`${base}/books`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: bookPayload.title,
              publishingDate: bookPayload.release,
              image: bookPayload.bookImage,
              description: bookPayload.bookDescription,
            }),
          });
          if (!bookRes.ok) throw new Error("Error creando libro (POST /books)");
          const createdBook = await bookRes.json();
          const bookId = createdBook.id;
          // 3) Asociar Libro a Autor
          const assocBookRes = await fetch(`${base}/authors/${authorId}/books/${bookId}`, { method: "POST" });
          if (!assocBookRes.ok) throw new Error("Error asociando libro a autor (POST /authors/{authorId}/books/{bookId})");
          // 4) Crear Premio
          const prizeRes = await fetch(`${base}/prizes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: prizeName.trim(), premiationDate }),
          });
            if (!prizeRes.ok) throw new Error("Error creando premio (POST /prizes)");
            const createdPrize = await prizeRes.json();
          // 5) Asociar Premio a Autor
          const assocPrizeRes = await fetch(`${base}/prizes/${createdPrize.id}/author/${authorId}`, { method: "POST" });
          if (!assocPrizeRes.ok) throw new Error("Error asociando premio a autor (POST /prizes/{prizeId}/author/{authorId})");
        } catch {
          usedLocal = true;
        }
      } else {
        usedLocal = true;
      }

      if (usedLocal) {
        addLocalAuthor({
          name: authorPayload.name,
          birthDate: authorPayload.birthDate,
            image: authorPayload.image,
          description: authorPayload.description,
          books: [{
            id: -Date.now() - 1,
            name: bookPayload.title,
            publishingDate: bookPayload.release,
            image: bookPayload.bookImage,
            description: bookPayload.bookDescription,
          }],
          prizes: [{
            id: -Date.now() - 2,
            name: prizeName.trim(),
            premiationDate,
          }],
        });
      }

      // Notificar y limpiar
      window.dispatchEvent(new Event("authors:updated"));
      setName("");
      setBirthDate("");
      setImage("");
      setDescription("");
  setBookName("");
  setPublishingDate("");
      setBookImage("");
      setBookDescription("");
      setPrizeName("");
  setPremiationDate("");

      router.push("/authors");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Birth date (texto)</label>
        <input
          placeholder="YYYY-MM-DD o libre"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Image URL</label>
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          rows={4}
        />
      </div>

      <fieldset className="border rounded p-4 space-y-4">
        <legend className="text-sm font-semibold">Libro (obligatorio)</legend>
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha publicación (texto)</label>
          <input
            placeholder="YYYY-MM-DD o libre"
            value={publishingDate}
            onChange={(e) => setPublishingDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Imagen</label>
          <input
            value={bookImage}
            onChange={(e) => setBookImage(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={bookDescription}
            onChange={(e) => setBookDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>
      </fieldset>

      <fieldset className="border rounded p-4 space-y-4">
        <legend className="text-sm font-semibold">Premio (obligatorio)</legend>
        <div>
          <label className="block text-sm font-medium">Nombre del premio</label>
          <input
            value={prizeName}
            onChange={(e) => setPrizeName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha de premiación (texto)</label>
          <input
            placeholder="YYYY-MM-DD o libre"
            value={premiationDate}
            onChange={(e) => setPremiationDate(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
      </fieldset>

      {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

      <button disabled={submitting} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
        {submitting ? "Creando flujo (autor + libro + premio)..." : "Crear Autor + Libro + Premio"}
      </button>
    </form>
  );
};

export default AuthorForm;


