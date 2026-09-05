'use client';

import { Building2, Info } from 'lucide-react';
import { ZERAR_PAGINA, useParamsAdm } from '@/components/adm/AdmFilters';
import { avisoDeOrigem, lerSelecaoParam, resolverEscopo, rotuloDeVinculo, TODAS } from '@/lib/adm/escopo';
import { formatarInteiro } from '@/lib/adm/format';
import type { Escopo } from '@/lib/adm/types';

/**
 * O seletor de propriedade — a peça de arquitetura central da ficha do cliente.
 *
 * O TENANT REAL DO BANCO É `propriedade_id`, NÃO `usuario_id`. São 93 tabelas
 * carregando a coluna. A hipótese "1 usuário = 1 propriedade" é falsa para três
 * dos cinco papéis, e falsa exatamente onde mais dói: o técnico com carteira
 * (a `usuarios.propriedade_id` dele é NULL) e o colaborador (que enxerga o
 * rebanho do produtor dono, não o próprio). Uma tela que assume a hipótese não
 * dá erro — ela mostra a fazenda errada, ou fazenda nenhuma.
 *
 * POR QUE É CLIENT COMPONENT, e não é preguiça: o App Router não entrega
 * `searchParams` a layouts, e o cabeçalho da ficha vive num layout. Como o
 * seletor precisa saber o que está em `?prop=` para se desenhar, ele lê a URL
 * sozinho. `escopo.ts` é módulo puro (sem I/O, sem env, sem segredo) exatamente
 * para poder ser importado daqui: a MESMA `resolverEscopo()` decide a seleção no
 * servidor e aqui, então os dois lados nunca discordam sobre qual fazenda está
 * aberta.
 *
 * TRÊS FORMAS, uma por situação real da base:
 *  · 0 propriedades  — rótulo estático + aviso (admin de associação, conta nova);
 *  · 1 propriedade   — rótulo estático. É o caso de 30 dos 31 produtores, e um
 *                      <select> de um item só é ruído que finge escolha;
 *  · 2+              — <select> com "carteira consolidada" na frente.
 *
 * E o BANNER DE ORIGEM, que não é enfeite: quando o vínculo não é 'dono', o dado
 * na tela pertence a outra pessoa. Sem dizer isso em voz alta, o painel mostra o
 * rebanho de um produtor sob o nome do colaborador dele — e, no caso da
 * consultoria, dados de gente que sequer usa o app.
 */
export function SeletorPropriedade({ escopo }: { escopo: Escopo }) {
  const { params, aplicar } = useParamsAdm();

  // A seleção vem da URL, não de estado local: é ela que a página do servidor
  // leu para montar os números. Guardar a escolha em useState criaria uma
  // segunda verdade, e a primeira divergência entre as duas é um dashboard
  // mostrando "Fazenda A" no seletor com os números da Fazenda B.
  const selecao = lerSelecaoParam(params.get('prop'));
  const resolvido = resolverEscopo(escopo.usuario, escopo.propriedades, selecao);
  const aviso = avisoDeOrigem(resolvido);
  const alvo = resolvido.selecionada;

  function escolher(valor: string) {
    // `cursor`/`page` caem junto: o keyset da página 3 da fazenda anterior não
    // significa nada na nova, e mantê-lo abriria a tabela numa página vazia.
    aplicar({ prop: valor, ...ZERAR_PAGINA });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <Building2 size={15} strokeWidth={1.8} className="shrink-0 text-muted-foreground" aria-hidden />

        {resolvido.propriedades.length > 1 ? (
          <select
            aria-label="Propriedade em foco"
            value={alvo ? String(alvo.id) : TODAS}
            onChange={(e) => escolher(e.target.value)}
            className="max-w-[26rem] rounded-full border border-input bg-secondary px-3 py-1 text-sm text-foreground outline-none"
          >
            {/* A carteira consolidada é uma opção legítima, não um "todos"
                genérico: para o técnico ela é a visão padrão do negócio dele. */}
            <option value={TODAS}>
              Carteira consolidada · {formatarInteiro(resolvido.propriedades.length)} propriedades
            </option>
            {resolvido.propriedades.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.nome}
                {p.estado ? ` · ${p.estado}` : ''} · {formatarInteiro(p.animais_ativos)} animais
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-medium text-foreground">
            {alvo ? alvo.nome : 'Sem propriedade'}
          </span>
        )}

        {alvo && (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{rotuloDeVinculo(alvo.vinculo)}</span>
            {alvo.numero_criador && (
              <>
                <span aria-hidden>·</span>
                {/* Nº de criador da ABCC/ARCO. É secundário por decisão (D1): a
                    identidade do painel é usuarios.id, e criador sem registro
                    existe e é normal. */}
                <span>Nº criador {alvo.numero_criador}</span>
              </>
            )}
            {(alvo.cidade || alvo.estado) && (
              <>
                <span aria-hidden>·</span>
                <span>{[alvo.cidade, alvo.estado].filter(Boolean).join('/')}</span>
              </>
            )}
            <span aria-hidden>·</span>
            <span className="tabular-nums">{formatarInteiro(alvo.animais_ativos)} animais ativos</span>
          </span>
        )}
      </div>

      {aviso && (
        <p className="flex items-start gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <Info size={14} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden />
          <span>{aviso}</span>
        </p>
      )}
    </div>
  );
}

