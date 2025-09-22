import React from "react";
import Link from "next/link";
import AuthorList from "../../Components/authors_list";

export default function AuthorsPage() {
  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lista de Autores</h1>
        <Link
          href="/authors/Crear"
          className="px-3 py-2 rounded bg-black text-white"
        >
          Nuevo Autor
        </Link>
      </div>

      <AuthorList />
    </main>
  );
}
