import { ProjecaoView } from '@/components/fi-fcg/ProjecaoView';
import { CAMPOS_IATF_PROJECAO, CAMPOS_MARCO_IDADE, CAMPOS_REBANHO_PROJECAO, CAMPOS_TOQUE_PROJECAO, type PacoteProjecao } from '@/lib/fi-fcg/pacotes';
import { getIatf, getMarcosIdade, getRebanho, getToque } from '@/lib/fi-fcg/queries';
import { exigirSessao } from '@/lib/fi-fcg/sessao';
import { empacotar } from '@/lib/painel/pacote';
import { hojeCompacto } from '@/lib/painel/format';

/**
 * Extraída de Financeiro (21/09/2026) — não tem relação com dinheiro, e
 * como página própria carrega só o que `projetarRebanho` precisa (bem menos
 * que a leva inteira de Financeiro). Mesmo recorte reduzido de sempre
 * (Prenha + 4 categorias-fonte de transição), ver CAMPOS_REBANHO_PROJECAO.
 */
export default async function ProjecaoPage() {
  await exigirSessao();
  const [rebanho, iatf, toque, marcosIdade] = await Promise.all([getRebanho(), getIatf(), getToque(), getMarcosIdade()]);

  const idsPrenha = new Set(rebanho.itens.filter((a) => a.reproducao === 'Prenha').map((a) => a.id));
  const categoriasFonteProjecao = new Set(['Bezerro', 'Bezerra', 'Garrote', 'Novilha']);
  const rebanhoProjecao = rebanho.itens.filter(
    (a) => idsPrenha.has(a.id) || categoriasFonteProjecao.has(a.categoria ?? ''),
  );
  const iatfProjecao = iatf.itens.filter((r) => idsPrenha.has(r.id));
  const toqueProjecao = toque.itens.filter((r) => idsPrenha.has(r.id));

  const todas = [rebanho, iatf, toque, marcosIdade];
  const carregadoEm = todas
    .map((l) => l.carregadoEm)
    .filter((v): v is number => v != null)
    .reduce((min, v) => (min == null ? v : Math.min(min, v)), null as number | null);

  const dados: PacoteProjecao = {
    rebanhoProjecao: empacotar(rebanhoProjecao, CAMPOS_REBANHO_PROJECAO),
    iatfProjecao: empacotar(iatfProjecao, CAMPOS_IATF_PROJECAO),
    toqueProjecao: empacotar(toqueProjecao, CAMPOS_TOQUE_PROJECAO),
    marcosIdade: empacotar(marcosIdade.itens, CAMPOS_MARCO_IDADE),
    configurado: rebanho.configurado,
    stale: todas.some((l) => l.stale),
    carregadoEm,
  };

  const fazendas = Array.from(new Set(rebanho.itens.map((r) => r.fazenda).filter((f): f is string => !!f))).sort();

  return <ProjecaoView dados={dados} fazendas={fazendas} hoje={hojeCompacto()} />;
}
