import 'server-only';
import { adicionarLinha, lerAba } from '@/lib/sheets/server';
import { diasEntre, formatDia, hojeCompacto } from '@/lib/painel/format';
import { ABA_ESTACOES, ABA_REBANHO, ABA_REPRODUCAO, spreadsheetId } from './config';
import {
  COLUNAS_ESTACAO,
  candidatas,
  conflitoReprodutor,
  criarIndice,
  mapAnimais,
  mapCoberturas,
  mapEstacoes,
  type AcaoEstacao,
  type Estacao,
} from './monta';
import { falha, garantirAbaDoPainel, gerarId, type Resultado } from './mutations';

/**
 * Escrita em estacao_monta — a ÚNICA escrita da Reprodução. Cada mudança é
 * uma linha nova com a estação inteira (a atual é a última do estacao_id);
 * nada nas abas do app é tocado. A validação relê Reproduçao fresca: a
 * cobertura lançada no app há 1 minuto já vale.
 */
export type PedidoEstacao =
  | { acao: 'criar'; reprodutor: string; inicio: number; fim: number; femeas: string[]; obs: string }
  | { acao: 'alterar'; estacaoId: string; inicio: number; fim: number; femeas: string[]; obs: string }
  | { acao: 'finalizar' | 'reabrir' | 'excluir'; estacaoId: string };

/** Mais que um ano de estação é erro de digitação de data. */
const MAXIMO_DIAS = 366;

export async function salvarEstacao(p: PedidoEstacao, email: string): Promise<Resultado> {
  const sid = spreadsheetId();
  if (!sid) return falha(503, 'planilha não configurada');
  const aba = await garantirAbaDoPainel(sid, ABA_ESTACOES, COLUNAS_ESTACAO);
  if (!aba) return falha(502, 'não foi possível preparar a aba estacao_monta');
  const estacoes = mapEstacoes(aba.linhas);
  const hoje = hojeCompacto();

  if (p.acao === 'criar' || p.acao === 'alterar') {
    if (p.fim < p.inicio) return falha(400, 'o fim não pode ser antes do início');
    if ((diasEntre(p.inicio, p.fim) ?? 0) > MAXIMO_DIAS) return falha(400, 'período maior que um ano — confira as datas');
    const femeas = [...new Set(p.femeas)];
    if (femeas.length === 0) return falha(400, 'selecione pelo menos uma fêmea');

    const atual = p.acao === 'alterar' ? estacoes.find((e) => e.id === p.estacaoId) : undefined;
    if (p.acao === 'alterar' && !atual) return falha(404, 'estação não encontrada');
    const reprodutor = atual?.reprodutor ?? (p.acao === 'criar' ? p.reprodutor : '');
    const periodo = { inicio: p.inicio, fim: p.fim };
    const ignorar = atual?.id;

    const conflito = conflitoReprodutor(estacoes, reprodutor, periodo, ignorar);
    if (conflito) return falha(409, `o reprodutor já tem uma estação de ${formatDia(conflito.inicio)} a ${formatDia(conflito.fim)}`);

    const [rebanho, reproducao] = await Promise.all([lerAba(sid, ABA_REBANHO), lerAba(sid, ABA_REPRODUCAO)]);
    if (!rebanho || !reproducao) return falha(502, 'não foi possível ler o rebanho ou as coberturas');
    const indice = criarIndice(mapAnimais(rebanho));
    const validas = new Map(candidatas(mapCoberturas(reproducao, indice), estacoes, reprodutor, periodo, ignorar).map((c) => [c.femea, c]));
    for (const f of femeas) {
      const c = validas.get(f);
      const nome = indice.porChave.get(f)?.nome ?? f;
      if (!c) return falha(400, `${nome} não tem cobertura lançada no app com este reprodutor no período`);
      if (c.ocupadaEm) return falha(409, `${nome} já está em outra estação no mesmo período`);
    }

    const rep = indice.porChave.get(reprodutor);
    const nova: Estacao = {
      id: atual?.id ?? gerarId(),
      reprodutor,
      reprodutorNumero: rep?.numero ?? atual?.reprodutorNumero ?? null,
      reprodutorNome: rep?.nome ?? atual?.reprodutorNome ?? null,
      inicio: p.inicio,
      fim: p.fim,
      finalizadaEm: atual?.finalizadaEm ?? null,
      femeas,
      obs: p.obs || null,
      alteradaEm: hoje,
      alteradaPor: email,
      criadaEm: atual?.criadaEm ?? hoje,
    };
    // Número legível ao lado da chave, para quem abrir a aba na planilha.
    const numeros = femeas.map((f) => indice.porChave.get(f)?.numero ?? f.replace(/^[nc]:/, ''));
    return gravar(sid, aba.header, nova, atual ? 'alterada' : 'criada', email, hoje, numeros);
  }

  const atual = estacoes.find((e) => e.id === p.estacaoId);
  if (!atual) return falha(404, 'estação não encontrada');
  if (p.acao === 'finalizar') {
    if (atual.finalizadaEm != null) return falha(409, 'a estação já está finalizada');
    return gravar(sid, aba.header, { ...atual, finalizadaEm: hoje }, 'finalizada', email, hoje, null);
  }
  if (p.acao === 'reabrir') return gravar(sid, aba.header, { ...atual, finalizadaEm: null }, 'reaberta', email, hoje, null);
  return gravar(sid, aba.header, atual, 'excluida', email, hoje, null);
}

async function gravar(
  sid: string,
  header: string[],
  e: Estacao,
  acao: AcaoEstacao,
  email: string,
  hoje: number,
  numeros: string[] | null,
): Promise<Resultado> {
  const valores: Record<string, string> = {
    id: gerarId(),
    estacao_id: e.id,
    data: formatDia(hoje),
    acao,
    reprodutor: e.reprodutor,
    reprodutor_numero: e.reprodutorNumero ?? '',
    reprodutor_nome: e.reprodutorNome ?? '',
    inicio: formatDia(e.inicio),
    fim: formatDia(e.fim),
    finalizada_em: e.finalizadaEm != null ? formatDia(e.finalizadaEm) : '',
    femeas: e.femeas.join(';'),
    femeas_numeros: numeros ? numeros.join(';') : '',
    obs: e.obs ?? '',
    lancado_por: email,
  };
  const ok = await adicionarLinha(sid, ABA_ESTACOES, header.map((h) => valores[h] ?? ''), 'USER_ENTERED');
  return ok ? { ok: true, id: e.id } : falha(502, 'falha ao gravar na planilha');
}
