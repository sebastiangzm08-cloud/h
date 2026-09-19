/** Inyecta un bloque de datos estructurados schema.org. El JSON siempre sale
    de contenido propio del sitio (nunca de input de un usuario), pero igual
    se escapa "<" para que no pueda cerrar el <script> antes de tiempo. */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
