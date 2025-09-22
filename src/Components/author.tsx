/* Hola profe o monitores, los comentarios son yo explicandome a mi misma, no que haya dejado lo de chat GPT jaja */

/* En este archivo voy a definir mi card de autor, en este es donde agrego todos los demás botones y el enrutamiento porque tiene sentido que se haga dentro de cada card*/

/* Uso image que es de Next para optimizar la carga de imágenes, además me ayuda a redimensionar */
import Image from "next/image";
import React from "react";
import Link from "next/link";

// props de las cositas que voy a usar para mi card, creo que al final no era full necesacio por lo que estoy importando los datos desde el API. Creo que es más útil si tuviera un número finito de autores que editar a mano.
export interface AuthorProps {
    id: number;
    birthDate: string;
    name: string;
    description: string;
    image: string;
}
//*Type adicional que funciona como intercepción entre ambos props, para agregar la función de eliminar. Esto quedó así porque primero había hecho solo la visualización y hasta el final agregué el delete */
type CardProps = AuthorProps & {
  onDelete?: (id: number) => void;
};

//* Uso la intercepción para crear la card, y dentro de la card agrego los botones de editar y eliminar.
const Card = ({ id, birthDate, name, description, image, onDelete }: CardProps) => {
  return (
    <div className="border rounded-lg shadow-lg overflow-hidden max-w-sm">
      {/* 3. We use props to render dynamic content. */}
      <Image
        src={image}
        alt={`Imagen para ${name}`}
        width={500}
        height={300}
        className="w-full h-48 object-contain bg-black"
      />

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2">{name}</h3>
        <p className="text-gray-700">{description}</p>
        <p className="text-sm text-gray-500 mt-2">Nacido: {birthDate}</p>

        <div className="pt-3">
          {/* Este es un link porque lo manejo como una ruta */}
          <Link
            href={`/authors/${id}/edit`}
            className="inline-block px-3 py-1 rounded bg-blue-600 text-white text-sm"
          >
            Editar
          </Link>

          <button
          //* Este es un botón porque ejecuta una función, no es una ruta
            onClick={() => onDelete?.(id)}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm center"
          >
            Eliminar
          </button>

        </div>
      </div>
    </div>
  );
};

export default Card;
