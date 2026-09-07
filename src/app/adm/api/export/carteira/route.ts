import { NextResponse } from 'next/server';

import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import {
  SITUACAO_ROTULO,
  filtrarCobrancas,
  lerOrdemCobrancaDaUrl,
  lerSituacoesDaUrl,
  listarCobrancas,
  ordenarCobrancas,
  situacaoDaCobranca,
} from '@/lib/adm/areas/cobrancas';
import { getCoorte, linhasExportCoorte, montarMatriz, type LinhaExportCoorte } from '@/lib/adm/areas/coorte';
import type { LinhaCobranca, LinhaPagamentosCliente } from '@/lib/adm/areas/contrato';
import {
  SITUACAO_CLIENTE_ROTULO,
  filtrarPorSituacao,
  lerSituacoesClienteDaUrl,
  listarPagamentosPorCliente,
  situacaoDoCliente,
} from '@/lib/adm/areas/pagamentos-cliente';
import { BALDES_RISCO, BALDE_ROTULO, carregarBalde, type BaldeRisco } from '@/lib/adm/areas/risco';
import {
  colunaBooleano,
  colunaData,
  colunaInteiro,
  colunaNumero,
  colunaTexto,
  contentDisposition,
  gerarCsvTabular,
  gerarXlsxTabular,
  type ColunaExportTabular,
} from '@/lib/adm/export-tabular';
import { diaCivil } from '@/lib/adm/format';
import { getAdmSession } from '@/lib/adm/guard';
import type { Resultado, UsuarioLista } from '@/lib/adm/types';
import { ehPeriodoRelativo, inicioDoPeriodo } from '@/lib/adm/url';
import { XLSX_CONTENT_TYPE } from '@/lib/adm/xlsx';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Exportação das QUATRO TELAS DE CARTEIRA — pagamentos, receita, risco, adoção.
 *
 * O IRMÃO PEQUENO de `src/app/adm/api/export/route.ts`. Aquela rota resolve as
 * tabelas CRUAS de um cliente (rebanho, produção...): paginação keyset, escopo
 * por `usuario`+`prop`, dezenas de colunas. Estas quatro telas são o oposto nos
 * três eixos — agregam a base inteira, cabem em memória, não pertencem a
 * ninguém — e por isso o par CSV/XLSX vem de `export-tabular.ts`, não daquela
 * rota. Ver o cabeçalho de `export-tabular.ts` para a comparação completa.
 *
 * A URL DESTA ROTA É A URL DA TELA mais `tela` e `formato` — a mesma garantia
 * do irmão grande: o arquivo baixado é exatamente o recorte que está na grade,
 * porque lê os MESMOS parsers de filtro que a página usa (`lerSituacoesDaUrl`,
 * `lerOrdemCobrancaDaUrl`...), nunca uma segunda leitura da query string.
 *
 * SOMENTE LEITURA (decisão D3): esta rota só faz SELECT.
 */

function erroJson(status: number, mensagem: string) {
  return NextResponse.json({ erro: mensagem }, { status });
}

function erroDeResultado(r: Extract<Resultado<unknown>, { ok: false }>) {
  return erroJson(r.motivo === 'sem-config' ? 503 : 500, r.detalhe);
}

const TELAS = ['pagamentos', 'receita', 'risco', 'adocao'] as const;
type Tela = (typeof TELAS)[number];

function ehTela(valor: string | null): valor is Tela {
  return valor != null && (TELAS as readonly string[]).includes(valor);
}

/** Devolve o arquivo pronto — CSV ou XLSX — a partir de colunas e linhas já
 *  filtradas. Chamado uma vez por `tela`, com o `T` de cada uma inferido no
 *  local da chamada. */
function responder<T>(
  formato: 'csv' | 'xlsx',
  colunas: readonly ColunaExportTabular<T>[],
  linhas: readonly T[],
  nomeArquivo: string,
  nomeAba: string,
): Response {
  if (formato === 'xlsx') {
    const buf = gerarXlsxTabular(colunas, linhas, nomeAba);
    return new Response(new Uint8Array(buf), {
      headers: {
        'Content-Type': XLSX_CONTENT_TYPE,
        'Content-Disposition': contentDisposition(nomeArquivo, 'xlsx'),
        'Cache-Control': 'no-store',
      },
    });
  }
  return new Response(gerarCsvTabular(colunas, linhas), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': contentDisposition(nomeArquivo, 'csv'),
      'Cache-Control': 'no-store',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Colunas — uma projeção fechada por tela, conferida em compilação
// ─────────────────────────────────────────────────────────────────────────────

const COLUNAS_PAGAMENTOS: ColunaExportTabular<LinhaPagamentosCliente>[] = [
  colunaInteiro('Nº do usuário', (l) => l.usuario_id),
  colunaTexto('Cliente', (l) => l.nome),
  colunaTexto('Situação', (l) => SITUACAO_CLIENTE_ROTULO[situacaoDoCliente(l)]),
  colunaTexto('Plano', (l) => l.plano_nome),
  colunaInteiro('Pagamentos', (l) => l.pagamentos),
  colunaNumero('Total pago', (l) => l.total_pago),
  colunaNumero('Em aberto', (l) => l.em_aberto),
  colunaNumero('Vencido', (l) => l.vencido),
  colunaNumero('MRR atual', (l) => l.mrr_atual),
  colunaData('Primeiro pagamento', (l) => l.primeiro_pagamento),
  colunaData('Último pagamento', (l) => l.ultimo_pagamento),
  colunaInteiro('Meses como cliente', (l) => l.meses_como_cliente),
];

const COLUNAS_RECEITA: ColunaExportTabular<LinhaCobranca>[] = [
  colunaInteiro('Nº do usuário', (l) => l.usuario_id),
  colunaTexto('Cliente', (l) => l.usuario_nome),
  colunaTexto('Plano', (l) => l.plano_nome),
  colunaNumero('Valor', (l) => l.valor),
  colunaTexto('Situação', (l) => SITUACAO_ROTULO[situacaoDaCobranca(l)]),
  colunaTexto('Método', (l) => l.metodo_pagamento),
  colunaData('Vencimento', (l) => l.data_vencimento),
  colunaData('Pagamento', (l) => l.data_pagamento),
  colunaInteiro('Dias de atraso', (l) => l.dias_de_atraso),
];

/** As mesmas colunas para os quatro baldes de risco — todos leem `UsuarioLista`.
 *  D2: o sinal de vida é o ÚLTIMO LANÇAMENTO, nunca login (não existe coluna de
 *  acesso no banco, e colaborador legado nem passa pelo Supabase Auth). */
const COLUNAS_RISCO: ColunaExportTabular<UsuarioLista>[] = [
  colunaInteiro('Nº do usuário', (l) => l.id),
  colunaTexto('Nome', (l) => l.nome),
  colunaTexto('Propriedade', (l) => l.propriedade_nome),
  colunaTexto('Estado', (l) => l.estado),
  colunaTexto('Plano', (l) => l.plano_nome),
  colunaTexto('Origem do acesso', (l) => l.origem_acesso),
  colunaBooleano('É teste (is_tester)', (l) => l.is_tester),
  colunaInteiro('Animais ativos', (l) => l.animais_ativos),
  colunaNumero('MRR', (l) => l.valor_real_mensal),
  colunaData('Vencimento da assinatura', (l) => l.data_vencimento),
  colunaData('Último lançamento', (l) => l.ultimo_lancamento_em),
  colunaInteiro('Dias sem lançar', (l) => l.dias_sem_lancar),
];

const COLUNAS_ADOCAO: ColunaExportTabular<LinhaExportCoorte>[] = [
  colunaTexto('Coorte (mês de entrada)', (l) => l.coorte),
  colunaInteiro('Contas na coorte', (l) => l.tamanhoCoorte),
  colunaInteiro('Mês de vida', (l) => l.mes),
  colunaInteiro('Ativos', (l) => l.ativos),
  colunaNumero('Retenção (%)', (l) => l.retencao * 100, 1),
];

// ─────────────────────────────────────────────────────────────────────────────
// Rota
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // O gate não redireciona aqui: uma rota de arquivo tem que responder 401 em
  // JSON, senão o navegador baixa a página de login com extensão .csv.
  const sessao = await getAdmSession();
  if (!sessao) return erroJson(401, 'Sessão expirada. Entre novamente.');

  const url = new URL(request.url);
  const params = url.searchParams;

  const formato = params.get('formato') === 'xlsx' ? 'xlsx' : 'csv';
  const telaParam = params.get('tela');
  if (!ehTela(telaParam)) return erroJson(400, 'Tela desconhecida.');
  const tela: Tela = telaParam;

  const nomeParam = params.get('nome')?.trim() || null;

  // `gerar` é montado dentro do switch mas só CHAMADO depois da auditoria —
  // ver a nota antes do `registrarAcesso`. `detalhesAuditoria`/`totalLinhas`
  // saem do mesmo ramo para a trilha e o arquivo nunca poderem discordar.
  let gerar: () => Response;
  let totalLinhas: number;
  let detalhesAuditoria: Record<string, unknown>;

  switch (tela) {
    case 'pagamentos': {
      const r = await listarPagamentosPorCliente();
      if (!r.ok) return erroDeResultado(r);

      const situacoes = lerSituacoesClienteDaUrl(params.get('f.situacao'));
      const linhas = filtrarPorSituacao(r.dados, situacoes);

      totalLinhas = linhas.length;
      detalhesAuditoria = { situacoes };
      gerar = () =>
        responder(formato, COLUNAS_PAGAMENTOS, linhas, nomeParam ?? 'quem-pagou-e-quanto', 'Pagamentos');
      break;
    }

    case 'receita': {
      const r = await listarCobrancas();
      if (!r.ok) return erroDeResultado(r);

      // A MESMA leitura de filtro que a página faz — situação, período (por
      // vencimento) e ordenação — para o arquivo bater com a tabela.
      const situacoes = lerSituacoesDaUrl(params.get('f.situacao'));
      const periodoBruto = params.get('f.vencimento');
      const desde =
        periodoBruto && ehPeriodoRelativo(periodoBruto)
          ? diaCivil(inicioDoPeriodo(periodoBruto, new Date()))
          : null;

      const noPeriodo = filtrarCobrancas(r.dados, { de: desde });
      const filtradas = filtrarCobrancas(noPeriodo, { situacoes });
      const ordem = lerOrdemCobrancaDaUrl(params.get('sort'));
      const linhas = ordenarCobrancas(filtradas, ordem);

      totalLinhas = linhas.length;
      detalhesAuditoria = { situacoes, periodo: periodoBruto ?? null, ordem };
      gerar = () => responder(formato, COLUNAS_RECEITA, linhas, nomeParam ?? 'receita-cobrancas', 'Cobranças');
      break;
    }

    case 'risco': {
      const baldeParam = params.get('balde');
      if (!baldeParam || !(BALDES_RISCO as readonly string[]).includes(baldeParam)) {
        return erroJson(400, `Balde desconhecido. Use um de: ${BALDES_RISCO.join(', ')}.`);
      }
      const balde = baldeParam as BaldeRisco;

      const r = await carregarBalde(balde, new Date());
      if (!r.ok) return erroDeResultado(r);

      totalLinhas = r.dados.length;
      detalhesAuditoria = { balde };
      gerar = () => responder(formato, COLUNAS_RISCO, r.dados, nomeParam ?? `risco-${balde}`, BALDE_ROTULO[balde]);
      break;
    }

    case 'adocao': {
      const r = await getCoorte();
      if (!r.ok) return erroDeResultado(r);

      const matriz = montarMatriz(r.dados, new Date());
      const linhas = linhasExportCoorte(matriz);

      totalLinhas = linhas.length;
      detalhesAuditoria = { coortes: matriz.faixas.length };
      gerar = () => responder(formato, COLUNAS_ADOCAO, linhas, nomeParam ?? 'adocao-retencao', 'Coortes');
      break;
    }
  }

  // AUDITORIA ANTES DO ARQUIVO — mesma disciplina de
  // src/app/adm/(app)/c/[id]/page.tsx e de route.ts: registrar depois deixaria
  // uma exportação sem rastro toda vez que a geração quebrasse no meio, e um
  // arquivo saindo do painel é o evento que mais importa numa resposta a
  // incidente. `alvoTipo: 'tabela'` reaproveita o vocabulário existente (a
  // união é fechada de propósito) — o que distingue este export de um export
  // de tabela crua vai no detalhe, não num novo tipo.
  await registrarAcesso('exportou', {
    sid: sessao.sid,
    ator: sessao.sub,
    alvoTipo: 'tabela',
    alvoId: null,
    detalhes: { tabela: `carteira.${tela}`, formato, linhas: totalLinhas, ...detalhesAuditoria },
    ip: extrairIp(request.headers),
    userAgent: extrairUserAgent(request.headers),
  });

  try {
    return gerar();
  } catch (e) {
    console.error('[adm] falha ao exportar carteira', tela, e);
    return erroJson(500, 'Não foi possível gerar o arquivo.');
  }
}
