import 'server-only';
import { publicClient } from '@/lib/adm/supabase-admin';
import { propriedadeApp } from '@/lib/sanri/config';
import { lerCoberturas, lerComunicacoes, lerCrias } from '@/lib/sanri/abcc-queries';
import { LINHAS_POR_CDC, preencherCdc, preencherCdn } from '@/lib/sanri/abcc/folhas';
import {
  linhaCdc,
  linhaCdn,
  maiusculo,
  nomeArquivo,
  numeroTexto,
  ordenarCoberturas,
  separarEmFolhas,
  traduzirErroAbcc,
  type CabecalhoCdc,
  type CabecalhoCdn,
  type LinhaCdc,
  type LinhaCdn,
} from '@/lib/sanri/abcc/regras';

export type Falha = { ok: false; status: number; erro: string };
const SEM_BANCO: Falha = { ok: false, status: 503, erro: 'banco do app não configurado' };

export interface Emitidas {
  ok: true;
  /** "302/2026"… na ordem em que foram gravadas. */
  emitidas: { id: number; texto: string; animais: number }[];
  /** Se uma folha do meio falhou, as anteriores ficaram; esta diz por quê. */
  parou: string | null;
}

const RE_CDC = /^\d{1,5}\/\d{4}$/;

/**
 * CDN das crias escolhidas: uma folha por método, de 25 em 25, numeradas em
 * sequência a partir de `numero`. As crias são relidas do banco aqui (não
 * vem nada da tela além dos ids, do número, da data e do CDC Nº digitado
 * para quem o sistema não achou).
 */
export async function emitirCdn(
  ids: number[],
  numero: number,
  data: string,
  cdcDigitado: Record<string, string>,
  email: string,
): Promise<Emitidas | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const ano = Number(data.slice(0, 4));
  const escolhidas = new Set(ids);
  const desde = `${ano - 1}-01-01`;
  const crias = (await lerCrias(desde)).filter((c) => escolhidas.has(c.id));
  if (crias.length !== escolhidas.size) return { ok: false, status: 400, erro: 'alguma cria não foi encontrada (atualize a página)' };
  const ja = crias.filter((c) => c.enviada);
  if (ja.length) return { ok: false, status: 400, erro: `já foram em CDN: ${ja.map((c) => c.numero).join(', ')}` };

  const emitidas: Emitidas['emitidas'] = [];
  let n = numero;
  for (const folha of separarEmFolhas(crias)) {
    const cab: CabecalhoCdn = { numero: n, ano, data, metodo: folha.metodo };
    const linhas: LinhaCdn[] = folha.crias.map((c) => {
      const l = linhaCdn(c);
      const digitado = (cdcDigitado[String(c.id)] ?? '').trim();
      return !l.cdc && RE_CDC.test(digitado) ? { ...l, cdc: digitado } : l;
    });
    const { data: id, error } = await supa.rpc('abcc_emitir', {
      p_propriedade: propriedadeApp(),
      p_tipo: 'cdn',
      p_ano: ano,
      p_numero: n,
      p_data: data,
      p_externa: false,
      p_cabecalho: cab,
      p_linhas: linhas.map((l) => ({ animal_id: l.animalId, dados: l })),
      p_criado_por: email,
    });
    if (error) return { ok: true, emitidas, parou: `CDN ${numeroTexto(n, ano)}: ${traduzirErroAbcc(error)}` };
    emitidas.push({ id: Number(id), texto: numeroTexto(n, ano), animais: linhas.length });
    n++;
  }
  return { ok: true, emitidas, parou: null };
}

export interface PedidoCdc {
  coberturaIds: number[];
  numero: number;
  data: string;
  periodoDe: string;
  periodoAte: string;
  /** true = só registra uma CDC que já foi enviada antes (sem folha nova). */
  externa: boolean;
}

/**
 * CDC das coberturas escolhidas (todas do mesmo reprodutor). A folha cabe
 * LINHAS_POR_CDC matrizes: com mais, saem várias CDCs em sequência. A
 * registrada (externa) é uma só, com o número que ela já tinha.
 */
export async function emitirCdc(p: PedidoCdc, email: string): Promise<Emitidas | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const ano = Number(p.data.slice(0, 4));
  const escolhidas = new Set(p.coberturaIds);
  const desde = p.periodoDe < p.data ? p.periodoDe : p.data;
  const todas = await lerCoberturas(`${Number(desde.slice(0, 4)) - 1}-01-01`);
  const cobs = ordenarCoberturas(todas.filter((c) => escolhidas.has(c.id)));
  if (cobs.length !== escolhidas.size) return { ok: false, status: 400, erro: 'alguma cobertura não foi encontrada (atualize a página)' };
  const reps = new Set(cobs.map((c) => c.reprodutor?.id ?? null));
  if (reps.size !== 1) return { ok: false, status: 400, erro: 'escolha coberturas de um reprodutor só' };
  const ja = cobs.filter((c) => c.cdc);
  if (ja.length) return { ok: false, status: 400, erro: `já estão em CDC: ${ja.map((c) => `${maiusculo(c.femea.nome)} (${c.cdc})`).join(', ')}` };
  const rep = cobs[0].reprodutor;

  const blocos: typeof cobs[] = [];
  if (p.externa) blocos.push(cobs);
  else for (let i = 0; i < cobs.length; i += LINHAS_POR_CDC) blocos.push(cobs.slice(i, i + LINHAS_POR_CDC));

  const emitidas: Emitidas['emitidas'] = [];
  let n = p.numero;
  for (const bloco of blocos) {
    const cab: CabecalhoCdc = {
      numero: n,
      ano,
      data: p.data,
      reprodutorId: rep?.id ?? null,
      reprodutor: maiusculo(rep?.nome) || (rep?.numero ?? '').trim(),
      registro: (rep?.numero ?? '').trim(),
      raca: maiusculo(rep?.raca),
      periodoDe: p.periodoDe,
      periodoAte: p.periodoAte,
    };
    const linhas: LinhaCdc[] = bloco.map(linhaCdc);
    const { data: id, error } = await supa.rpc('abcc_emitir', {
      p_propriedade: propriedadeApp(),
      p_tipo: 'cdc',
      p_ano: ano,
      p_numero: n,
      p_data: p.data,
      p_externa: p.externa,
      p_cabecalho: { ...cab, reprodutor_id: cab.reprodutorId, periodo_de: cab.periodoDe, periodo_ate: cab.periodoAte },
      p_linhas: linhas.map((l) => ({ animal_id: l.animalId, cobertura_id: l.coberturaId, data_cobertura: l.data, dados: l })),
      p_criado_por: email,
    });
    if (error) return { ok: true, emitidas, parou: `CDC ${numeroTexto(n, ano)}: ${traduzirErroAbcc(error)}` };
    emitidas.push({ id: Number(id), texto: numeroTexto(n, ano), animais: linhas.length });
    n++;
  }
  return { ok: true, emitidas, parou: null };
}

export async function cancelar(id: number): Promise<{ ok: true } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const { error } = await supa.rpc('abcc_cancelar', { p_propriedade: propriedadeApp(), p_id: id });
  if (error) return { ok: false, status: 400, erro: traduzirErroAbcc(error) };
  return { ok: true };
}

/** Exclui de vez uma comunicação JÁ CANCELADA (a que vale o banco recusa). */
export async function excluir(id: number): Promise<{ ok: true } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const { error } = await supa.rpc('abcc_excluir', { p_propriedade: propriedadeApp(), p_id: id });
  if (error) return { ok: false, status: 400, erro: traduzirErroAbcc(error) };
  return { ok: true };
}

/** Marca (ou desmarca) crias que já foram em CDN fora do sistema. */
export async function marcar(ids: number[], enviada: boolean): Promise<{ ok: true; alteradas: number } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const { data, error } = await supa.rpc('abcc_marcar_cdn', { p_propriedade: propriedadeApp(), p_animais: ids, p_enviada: enviada });
  if (error) return { ok: false, status: 400, erro: traduzirErroAbcc(error) };
  return { ok: true, alteradas: Number(data) || 0 };
}

/**
 * O .xlsx de uma comunicação emitida: o modelo do criador com o cabeçalho e
 * as linhas gravados na hora da emissão — baixar de novo dá a mesma folha.
 */
export async function arquivo(id: number): Promise<{ ok: true; nome: string; bytes: Uint8Array } | Falha> {
  const supa = publicClient();
  if (!supa) return SEM_BANCO;
  const c = (await lerComunicacoes()).find((x) => x.id === id);
  if (!c) return { ok: false, status: 404, erro: 'comunicação não encontrada' };
  if (c.externa) return { ok: false, status: 400, erro: 'esta foi só registrada — a folha foi feita fora do sistema' };
  const { data, error } = await supa
    .from('abcc_modelo')
    .select('arquivo_base64')
    .eq('propriedade_id', propriedadeApp())
    .eq('tipo', c.tipo)
    .maybeSingle();
  if (error) return { ok: false, status: 500, erro: 'não foi possível ler o modelo' };
  if (!data) return { ok: false, status: 404, erro: `o modelo da ${c.tipo.toUpperCase()} não está no sistema` };
  const modelo = new Uint8Array(Buffer.from((data as { arquivo_base64: string }).arquivo_base64, 'base64'));
  try {
    const bytes =
      c.tipo === 'cdn'
        ? preencherCdn(modelo, c.cabecalho as CabecalhoCdn, c.linhas.map((l) => l.dados as LinhaCdn))
        : preencherCdc(modelo, c.cabecalho as CabecalhoCdc, c.linhas.map((l) => l.dados as LinhaCdc));
    return { ok: true, nome: nomeArquivo(c.tipo, c.numero, c.ano, c.tipo === 'cdc' ? String(c.cabecalho.reprodutor ?? '') : undefined), bytes };
  } catch (err) {
    console.error('[sanri] falha ao montar a folha', id, err);
    return { ok: false, status: 500, erro: 'não foi possível montar a folha' };
  }
}

