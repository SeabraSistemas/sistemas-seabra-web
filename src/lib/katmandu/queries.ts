import { getSheetValues } from './sheets-server';
import { parseNumber, parseText } from './format';
import { USUARIOS_PERMITIDOS } from './allowlist';
import type { AnimalRebanho, Baixa, Destino, OcorrenciaClinica, PesagemRegistro, Sexo } from './types';

/**
 * Camada de leitura do /katmandu. Indexa colunas por NOME de header (linha 1
 * da aba), não por letra fixa — resiste a reordenação de coluna na planilha.
 * Nunca lança: aba ausente/erro de leitura => [] (o layout autenticado já
 * garante que só usuário liberado chega aqui; uma planilha "vazia" e uma
 * "quebrada" viram a mesma tela de estado vazio por ora).
 *
 * Nomes de header conferidos direto contra a planilha real (não só os rótulos
 * do Looker) — RebanhoProd e Pesagem têm dezenas de colunas além da Z, e
 * alguns nomes divergem do que aparecia no Looker (ex: "Causa da baixa", não
 * "Baixa"; "destino" em minúsculo na Pesagem, "Destino" com maiúscula na
 * RebanhoProd). O range passado pro Sheets é só o nome da aba (sem A:Z) pra
 * não truncar colunas.
 */

function toObjects(rows: string[][] | null): Record<string, string>[] {
  if (!rows || rows.length === 0) return [];
  const [header, ...body] = rows;
  return body.map((row) => {
    const obj: Record<string, string> = {};
    header.forEach((col, i) => {
      obj[col.trim()] = row[i] ?? '';
    });
    return obj;
  });
}

function sexoDe(raw: string | undefined): Sexo {
  const v = parseText(raw)?.toLowerCase();
  if (!v) return null;
  if (v.startsWith('m')) return 'macho';
  if (v.startsWith('f')) return 'femea';
  return null;
}

function destinoDe(raw: string | undefined): Destino {
  const v = parseText(raw)?.toLowerCase();
  if (!v) return null;
  if (v.includes('melhor') || v.includes('cabeceira')) return 'melhor';
  if (v.includes('pior') || v.includes('fundo')) return 'pior';
  if (v.includes('medi') || v.includes('meio')) return 'mediano';
  return null;
}

/**
 * Mapa "ID lote" (coluna A) -> "Lote" (coluna B) da aba `Lotes`. Em
 * RebanhoProd/Pesagem/Baixa a coluna "Lote" às vezes vem como o ID cru (ex:
 * "8f6ab158") em vez do nome resolvido — a aba `Lotes` é o lookup que faltava
 * aplicar. Resolver aqui, na leitura, corrige nas três abas de uma vez.
 */
export async function getLoteMap(): Promise<Map<string, string>> {
  const rows = await getSheetValues('Lotes');
  const map = new Map<string, string>();
  if (!rows) return map;
  const [, ...body] = rows;
  for (const [chaveRaw, valorRaw] of body) {
    const chave = parseText(chaveRaw);
    const valor = parseText(valorRaw);
    if (chave && valor) map.set(chave, valor);
  }
  return map;
}

/**
 * Mesmo esquema de `getLoteMap`, pra aba `local` ("ID local" -> "Local").
 * RebanhoProd/Pesagem/Baixa guardavam o nome do local direto até a aba
 * `local` ganhar uma coluna de ID própria; linhas gravadas depois disso
 * trazem o ID cru (ex: "vcbdho0026") em vez do nome — resolver aqui cobre as
 * duas gerações de dado na mesma coluna.
 */
export async function getLocalMap(): Promise<Map<string, string>> {
  const rows = await getSheetValues('local');
  const map = new Map<string, string>();
  if (!rows) return map;
  const [, ...body] = rows;
  for (const [chaveRaw, valorRaw] of body) {
    const chave = parseText(chaveRaw);
    const valor = parseText(valorRaw);
    if (chave && valor) map.set(chave, valor);
  }
  return map;
}

/** Valor já resolvido (nome) passa direto; uma chave crua conhecida no mapa vira o nome. */
export function resolverComMapa(raw: string | undefined, mapa: Map<string, string>): string | null {
  const texto = parseText(raw);
  if (!texto) return null;
  return mapa.get(texto) ?? texto;
}

/**
 * RebanhoProd tem 105 colunas — `Lote` (CR) e `Data última pesagem` (CY) são
 * nativas e 388/388 preenchidas. A primeira versão juntava esses dois campos
 * das abas `Lote` e `Pesagem`; a aba `Lote` está VAZIA (0 linhas) na planilha
 * real, então a coluna Lote do dashboard vinha sempre vazia. Ler direto da
 * RebanhoProd conserta isso e economiza duas leituras de aba por request.
 */
export async function getRebanho(): Promise<AnimalRebanho[]> {
  const [rows, loteMap, localMap] = await Promise.all([
    getSheetValues('RebanhoProd'),
    getLoteMap(),
    getLocalMap(),
  ]);

  return toObjects(rows).map((r) => {
    const idAnimal = parseText(r['ID animal']) ?? '';
    return {
      idAnimal,
      sisbov: parseText(r['ID eletrônica']),
      sexo: sexoDe(r['Sexo']),
      categoria: parseText(r['Categoria']),
      idadeDias: parseNumber(r['Idade (dias)']),
      idadeMeses: parseNumber(r['Idade (meses)']),
      baixa: parseText(r['Causa da baixa']),
      escore: parseNumber(r['Escore']),
      metodo: parseText(r['Método']),
      reproducao: parseText(r['Reprodução']),
      status: parseText(r['Status']),
      gpd: parseNumber(r['GPD']),
      gmd: parseNumber(r['GMD']),
      destino: destinoDe(r['Destino']),
      entradaEngorda: parseText(r['Entrada engorda']),
      diasEmEngorda: parseNumber(r['Dias em engorda']),
      lote: resolverComMapa(r['Lote'], loteMap),
      pdi: parseNumber(r['pdi']),
      ultimoManejo: parseText(r['data_ultima_pesagem']),
      local: resolverComMapa(r['local'], localMap),
    };
  }).filter((a) => a.idAnimal !== '');
}

export async function getPesagem(): Promise<PesagemRegistro[]> {
  const [rows, loteMap, localMap] = await Promise.all([
    getSheetValues('Pesagem'),
    getLoteMap(),
    getLocalMap(),
  ]);
  return toObjects(rows).map((r) => {
    const diasVida = parseNumber(r['Dias de vida']);
    return {
      idAnimal: parseText(r['ID animal']) ?? '',
      sisbov: parseText(r['SISBOV']),
      pesoKg: parseNumber(r['Peso/kg']),
      ultimaPesagemKg: parseNumber(r['Última pesagem']),
      diferencaKg: parseNumber(r['Diferença (última pesagem)']),
      pesoEntradaKg: parseNumber(r['Peso entrada engorda']),
      diasEmEngorda: parseNumber(r['Dias em engorda']),
      gmd: parseNumber(r['GMD']),
      gpd: parseNumber(r['GPD']),
      pdi: parseNumber(r['pdi']),
      gpdi: parseNumber(r['gpdi']),
      lote: resolverComMapa(r['Lote'], loteMap),
      destino: destinoDe(r['destino']),
      dataPesagem: parseText(r['Data da pesagem']),
      venda: parseText(r['Venda']),
      manejos: parseText(r['Manejos']),
      mesesVida: diasVida == null ? null : diasVida / 30,
      local: resolverComMapa(r['local'], localMap),
    };
  }).filter((p) => p.idAnimal !== '');
}

export async function getBaixas(): Promise<Baixa[]> {
  const [rows, loteMap, localMap] = await Promise.all([
    getSheetValues('Baixa'),
    getLoteMap(),
    getLocalMap(),
  ]);
  return toObjects(rows).map((r) => ({
    idAnimal: parseText(r['ID animal']) ?? '',
    data: parseText(r['Data da baixa']),
    causa: parseText(r['Causa da baixa']),
    categoria: parseText(r['Categoria na baixa']),
    lote: resolverComMapa(r['Lote'], loteMap),
    local: resolverComMapa(r['local'], localMap),
    obs: parseText(r['OBS']),
  })).filter((b) => b.idAnimal !== '');
}

export async function getClinica(): Promise<OcorrenciaClinica[]> {
  const rows = await getSheetValues('Clínica');
  return toObjects(rows).map((r) => ({
    idAnimal: parseText(r['ID animal']) ?? '',
    data: parseText(r['Data do caso']),
    ocorrencia: parseText(r['Caso']),
    observacao: parseText(r['OBS']),
  })).filter((c) => c.idAnimal !== '');
}

/** Confere o usuário contra a allowlist estática (sem senha — a lista é o gate). */
export async function usuarioValido(usuario: string): Promise<boolean> {
  const alvo = usuario.trim().toLowerCase();
  if (!alvo) return false;
  return USUARIOS_PERMITIDOS.some((u) => u.toLowerCase() === alvo);
}
