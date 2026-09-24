import { EstadoCarga } from '@/components/painel/EstadoCarga';

/** EstadoCarga + aviso quando a leitura da planilha falhou (producao_diaria não tem cache pra cair no dado antigo). */
export function EstadoPlanilha({ configurado, ok, carregadoEm }: { configurado: boolean; ok: boolean; carregadoEm: number | null }) {
  return (
    <div className="flex flex-col gap-2">
      <EstadoCarga configurado={configurado} stale={false} carregadoEm={carregadoEm} atualizarHref="/sanri/api/atualizar" />
      {configurado && !ok && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Não foi possível ler a planilha agora — tente Atualizar em instantes.
        </div>
      )}
    </div>
  );
}
