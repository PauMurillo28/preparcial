"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthorFormData {
  name: string;
  birthDate: string;
  image: string;
  description: string;
}

const AuthorForm: React.FC = () => {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newAuthor: AuthorFormData = { name, birthDate, image, description };

    // POST al backend
    await fetch("/api/authors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAuthor),
    });

    // refrescar lista
    window.dispatchEvent(new Event("authors:updated"));

    // limpiar form
    setName("");
    setBirthDate("");
    setImage("");
    setDescription("");

    // redirigir a lista
    router.push("/authors");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Birth date</label>
        <input
          type="date"
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

      <button className="px-4 py-2 rounded bg-black text-white">Crear</button>
    </form>
  );
};

export default AuthorForm;


