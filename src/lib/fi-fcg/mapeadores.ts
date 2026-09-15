/**
 * Linhas cruas (string[][], header na linha 1) => tipos de fi-fcg/types.ts.
 * Puro — testável sem tocar a rede. Indexa por NOME de header (não por
 * letra fixa), mesmo princípio de src/lib/katmandu/queries.ts: resiste a
 * reordenação de coluna. Headers conferidos ao vivo contra a planilha real
 * (não só os rótulos do Looker) — ver o plano de /FI_FCG.
 */
import { diaDe, parseMoeda, parseNumber, parseText } from '@/lib/painel/format';
import type {
  CategoriaArroba,
  CategoriaCusto,
  Custo,
  DescricaoCusto,
  LancamentoFinanceiro,
  RegAborto,
  RegBaixa,
  RegIatf,
  RegParto,
  RegPesagem,
  RegRebanho,
  RegToque,
  RegVenda,
  TipoCusto,
} from './types';

export function toObjects(rows: string[][] | null): Record<string, string>[] {
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

/** Primeiro header (dentre os aliases) que existir na linha — cobre grafia que pode mudar (ex: o typo "Patida"). */
function campo(r: Record<string, string>, ...nomes: string[]): string | undefined {
  for (const n of nomes) {
    if (r[n] !== undefined) return r[n];
  }
  return undefined;
}

/** Aba "Reproduçao" (dashboard IATF). */
export function mapIatf(rows: string[][] | null): RegIatf[] {
  return toObjects(rows)
    .map((r) => {
      const id = parseText(r['ID animal']) ?? '';
      // "Patida (sêmen)" é o header real hoje (typo de origem) — o alias cobre o dia em que for corrigido na planilha.
      const ecc = parseText(r['ECC']);
      return {
        id,
        data: diaDe(r['Data IATF']),
        protocolo: parseText(r['Protocolo']),
        metodo: parseText(r['Método']),
        partida: parseText(campo(r, 'Patida (sêmen)', 'Partida (sêmen)')),
        inseminador: parseText(r['Inseminador']),
        ecc,
        eccNum: parseNumber(ecc),
        fazenda: parseText(r['Fazenda']),
        lote: parseText(r['Lote']),
        pesoKg: parseNumber(r['Peso/kg']),
      };
    })
    .filter((x) => x.id !== '');
}

/** Aba "Toque". */
export function mapToque(rows: string[][] | null): RegToque[] {
  return toObjects(rows)
    .map((r) => {
      const id = parseText(r['ID animal']) ?? '';
      const escore = parseText(r['Escore']);
      return {
        id,
        data: diaDe(r['Data']),
        diagnostico: parseText(r['Diagnóstico']),
        destino: parseText(r['Destino']),
        escore,
        escoreNum: parseNumber(escore),
        observacao: parseText(r['Observação']),
        idadeAnos: parseNumber(r['Idade atual']),
        status: parseText(r['Status']),
        reproducao: parseText(r['Reprodução']),
        fazenda: parseText(r['Fazenda']),
        lote: parseText(r['Lote']),
        pesoKg: parseNumber(r['Peso/kg']),
        touroIatf: parseText(r['Touro iatf']),
      };
    })
    .filter((x) => x.id !== '');
}

/** Aba "RebanhoProd". Nota: a coluna de local físico se chama "lote" em MINÚSCULA aqui (não "Lote"). */
export function mapRebanho(rows: string[][] | null): RegRebanho[] {
  return toObjects(rows)
    .map((r) => ({
      id: parseText(r['ID animal']) ?? '',
      eletronica: parseText(r['ID eletrônica']),
      marca: parseText(r['Marca']),
      sexo: parseText(r['Sexo']),
      categoria: parseText(r['Categoria']),
      causaBaixa: parseText(r['Causa da baixa']),
      idadeMeses: parseNumber(r['Idade (meses)']),
      fazenda: parseText(r['Fazenda']),
      lote: parseText(r['lote']),
      status: parseText(r['Status']),
      reproducao: parseText(r['Reprodução']),
      escore: parseNumber(r['Escore']),
      destino: parseText(r['Destino']),
      ultimaPesagemKg: parseNumber(r['Última pesagem']),
      dataUltimaPesagem: diaDe(r['data_ultima_pesagem']),
      nascimento: diaDe(r['Data de nascimento']),
    }))
    .filter((x) => x.id !== '');
}

/** Abas "Parto" e "Parto CG" — mesmo layout nas duas, "Fazenda" já vem certa em cada uma (diferente do livro-caixa Financeiro). */
export function mapPartos(rows: string[][] | null): RegParto[] {
  return toObjects(rows)
    .map((r) => ({
      id: parseText(r['ID animal']) ?? '',
      eletronica: parseText(r['ID eletrônica']),
      marca: parseText(r['Marca']),
      idMae: parseText(r['ID Mãe']),
      idPai: parseText(r['ID Pai']),
      nascimento: diaDe(r['Data de nascimento']),
      sexo: parseText(r['Sexo']),
      metodo: parseText(r['Método']),
      pesoNascimento: parseNumber(r['Peso ao nascimento']),
      fazenda: parseText(r['Fazenda']),
      categoria: parseText(r['Categoria']),
    }))
    .filter((x) => x.id !== '');
}

/** Aba "Pesagem". Nota: aqui "destino" é minúsculo (na RebanhoProd é "Destino"). */
export function mapPesagem(rows: string[][] | null): RegPesagem[] {
  return toObjects(rows)
    .map((r) => ({
      id: parseText(r['ID animal']) ?? '',
      data: diaDe(r['Data da pesagem']),
      pesoKg: parseNumber(r['Peso/kg']),
      entradaKg: parseNumber(r['Peso entrada engorda']),
      diasEngorda: parseNumber(r['Dias em engorda']),
      gpd: parseNumber(r['GPD']),
      gmd: parseNumber(r['GMD']),
      pdi: parseNumber(r['PDI']),
      gpdi: parseNumber(r['GPDi']),
      fazenda: parseText(r['Fazenda']),
      lote: parseText(r['Lote']),
      sexo: parseText(r['Sexo']),
      destino: parseText(r['destino']),
    }))
    .filter((x) => x.id !== '');
}

/** Aba "Baixa". Nota: "idade" (dias) é minúsculo. */
export function mapBaixas(rows: string[][] | null): RegBaixa[] {
  return toObjects(rows)
    .map((r) => ({
      id: parseText(r['ID animal']) ?? '',
      data: diaDe(r['Data da baixa']),
      tipo: parseText(r['Causa da baixa']),
      causaObito: parseText(r['Causa do óbito']),
      valor: parseMoeda(r['Valor']),
      fazenda: parseText(r['Fazenda']),
      obs: parseText(r['OBS']),
      categoria: parseText(r['Categoria na baixa']),
      idadeDias: parseNumber(r['idade']),
    }))
    .filter((x) => x.id !== '');
}

/**
 * Aba "Venda". `Valor` vem formatado como moeda ("R$ 3.264,00", "R$ 0,01",
 * às vezes negativo) — nunca número puro, então é sempre `parseMoeda`, não
 * `parseNumber` (que não reconhece o prefixo "R$" e devolveria null pra
 * TODO valor preenchido). Preenchido em só ~5% das vendas — ver
 * financeiro.ts pra como isso entra nas métricas ("só o registrado").
 */
export function mapVendas(rows: string[][] | null): RegVenda[] {
  return toObjects(rows).map((r, i) => ({
    id: parseText(r['ID venda']) ?? `venda-${i}`,
    idAnimal: parseText(r['ID animal']),
    data: diaDe(r['Data da venda']),
    valor: parseMoeda(r['Valor']),
    cliente: parseText(r['Cliente']),
    fazenda: parseText(r['Fazenda']),
    pesoKg: parseNumber(r['Peso/kg']),
  }));
}

/** Aba "Aborto". */
export function mapAbortos(rows: string[][] | null): RegAborto[] {
  return toObjects(rows).map((r, i) => ({
    id: parseText(r['ID aborto']) ?? `aborto-${i}`,
    idAnimal: parseText(r['ID animal']),
    data: diaDe(r['Data do aborto']),
    suspeita: parseText(r['Suspeita']),
    fazenda: parseText(r['Fazenda']),
  }));
}

/** Aba "Financeiro" (livro-caixa gerado pelo AppSheet). A coluna "Fazenda" dele é sempre "Inhumas" (achado ao vivo) — nunca usar pra Fazenda real, só pra conciliar com os eventos. */
export function mapFinanceiro(rows: string[][] | null): LancamentoFinanceiro[] {
  return toObjects(rows).map((r, i) => ({
    id: parseText(r['ID financeiro']) ?? `fin-${i}`,
    identificacao: parseText(r['Identificação']),
    descricao: parseText(r['Descrição']),
    categoria: parseText(r['Categoria']),
    valor: parseMoeda(r['Valor total']),
    data: diaDe(r['Data']),
  }));
}

/** Aba "Categoria@" — preço fixo por categoria (Média@ × Valor da @), a mesma tabela que o AppSheet usa pra valorar Baixa automaticamente. */
export function mapCategoriaArroba(rows: string[][] | null): CategoriaArroba[] {
  return toObjects(rows)
    .map((r) => ({
      categoria: parseText(r['Categoria']) ?? '',
      mediaArroba: parseNumber(r['Média@']),
      valorCategoria: parseMoeda(r['Valor categoria']),
    }))
    .filter((x) => x.categoria !== '');
}

function tipoCustoDe(raw: string | undefined): TipoCusto | null {
  const v = parseText(raw);
  if (v === 'Mensal' || v === 'Anual') return v;
  return null;
}

/** Aba "Categorias de Custo" (nova, 15/09/2026 — não é do AppSheet). */
export function mapCategoriasCusto(rows: string[][] | null): CategoriaCusto[] {
  return toObjects(rows)
    .map((r) => ({ id: parseText(r['ID']) ?? '', nome: parseText(r['Nome']) ?? '' }))
    .filter((x) => x.id !== '');
}

/** Aba "Descrições de Custo" (nova, 16/09/2026 — mesmo formato de Categorias de Custo). */
export function mapDescricoesCusto(rows: string[][] | null): DescricaoCusto[] {
  return toObjects(rows)
    .map((r) => ({ id: parseText(r['ID']) ?? '', nome: parseText(r['Nome']) ?? '' }))
    .filter((x) => x.id !== '');
}

/** Aba "Custos" (nova, 15/09/2026). Valor sempre em R$ formatado (mesmo padrão de Venda/Baixa) — `parseMoeda`, não `parseNumber`. */
export function mapCustos(rows: string[][] | null): Custo[] {
  return toObjects(rows)
    .map((r) => ({
      id: parseText(r['ID']) ?? '',
      descricao: parseText(r['Descrição']),
      categoria: parseText(r['Categoria']),
      fazenda: parseText(r['Fazenda']),
      tipo: tipoCustoDe(r['Tipo']),
      valor: parseMoeda(r['Valor']),
      dataInicio: diaDe(r['Data início']),
      dataFim: diaDe(r['Data fim']),
      observacao: parseText(r['Observação']),
    }))
    .filter((x) => x.id !== '');
}
