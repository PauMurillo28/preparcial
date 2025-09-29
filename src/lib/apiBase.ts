export const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ?? "";

export function assertApiBase() {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE no está configurado. (Se usará almacenamiento local para reviews si aplicable.) Agrega .env.local con NEXT_PUBLIC_API_BASE=http://127.0.0.1:8080/api si deseas persistencia real.");
  }
  return API_BASE;
}
