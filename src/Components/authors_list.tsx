"use client";

import React, { useEffect, useState } from "react";
import Card, { AuthorProps } from "./author";

interface AuthorListProps {
  authors?: AuthorProps[]; 
}

const AuthorList: React.FC<AuthorListProps> = ({ authors: initialAuthors }) => {
  const [authors, setAuthors] = useState<AuthorProps[]>(initialAuthors ?? []);
  const [loading, setLoading] = useState<boolean>(!initialAuthors);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/authors", { cache: "no-store" });
        if (!res.ok) throw new Error("Error al cargar autores");
        const data: AuthorProps[] = await res.json();
        if (isMounted) setAuthors(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isMounted) setError(msg);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 1) carga inicial
    if (!initialAuthors) void load();

    // 2) refrescar cuando el form dispare "authors:updated"
    const onUpdated = () => void load();
    window.addEventListener("authors:updated", onUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("authors:updated", onUpdated);
    };
  }, [initialAuthors]);

  const deleteAuthor = async (id: number) => {
    const ok = confirm("¿Eliminar este autor?");
    if (!ok) return;
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`No se pudo eliminar: ${t}`);
      }
      // Actualiza la lista local al instante
      setAuthors((prev) => prev.filter((a) => a.id !== id));
      // Y notifica por si otras vistas escuchan el evento
      window.dispatchEvent(new Event("authors:updated"));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg);
    }
  };

 
  if (loading) return <p className="text-gray-500">Cargando autores...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (authors.length === 0) {
    return <p className="text-gray-500">No hay autores para mostrar.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {authors.map((author) => (
        <Card key={author.id} {...author} onDelete={deleteAuthor} />
      ))}
    </div>
  );
};

export default AuthorList;


