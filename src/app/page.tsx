import { redirect } from "next/navigation";
//*Lit redireccionamiento, solo para que quede bonito
export default function Home() {
  redirect("/authors");
}
