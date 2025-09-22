"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AuthorForm from "../../../Components/AuthorForm";

export default function NewAuthorPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Crear Autor</h1>

      <AuthorForm />

      <button
        onClick={() => router.back()}
        className="mt-4 px-3 py-2 rounded border"
      >
        Cancelar
      </button>
    </main>
  );
}


