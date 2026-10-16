import { Aviso } from './Controles';

/** Aba que já aparece no menu mas ainda não tem conteúdo. */
export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-semibold text-ink">{titulo}</h2>
      <Aviso tom="aviso">Em construção.</Aviso>
    </div>
  );
}
