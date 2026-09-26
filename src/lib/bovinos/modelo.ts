import { U, serialDia, t } from '@/lib/bovinos/texto';
import { celula, coluna, type Tabela } from '@/lib/bovinos/tabela';

/**
 * Linhas tipadas das três abas que a conferência cruza. Colunas sempre pelo
 * nome (ver tabela.ts). Os campos opcionais ficam '' quando a planilha não
 * tem a coluna — a Benoni não tem "Identificação" nem "SISBOV", por exemplo.
 */

export interface RegRebanho {
  linha: number;
  idRebanho: string;
  A: string;
  id: string;
  tag: string;
  mae: string;
  pai: string;
  nascTxt: string;
  nasc: number | null;
  sexo: string;
  fazenda: string;
  idM: string;
  idP: string;
  manejo: string;
}

export interface RegParto {
  aba: string;
  linha: number;
  idRebanho: string;
  idM: string;
  idP: string;
  A: string;
  id: string;
  tag: string;
  mae: string;
  pai: string;
  nascTxt: string;
  nasc: number | null;
  sexo: string;
  metodo: string;
  previsto: number | null;
}

export interface RegIatf {
  linha: number;
  /** ID animal como está na Reproduçao. */
  idTxt: string;
  /** ID animal, Identificação e N° de manejo (maiúsculas) — por qualquer um se acha a vaca. */
  nomes: string[];
  /** ID eletrônica e SISBOV. */
  tags: string[];
  /** Coluna "ID A" como está. Só é chave se existir no RebanhoProd (na Santo Antônio ela guarda o número do animal). */
  A: string;
  data: number | null;
  dataTxt: string;
  semen: string;
  previsto: number | null;
}

export interface Modelo {
  rebanho: RegRebanho[];
  partos: RegParto[];
  iatfs: RegIatf[];
}

const SEMEN = ['Patida (sêmen)', 'Partida (sêmen)'];

function faltando(tab: Tabela, obrig: string[][]): string[] {
  return obrig.filter((nomes) => coluna(tab, ...nomes) < 0).map((nomes) => nomes[0]);
}

export function montarModelo(e: {
  rebanho: Tabela | null;
  partos: Tabela[];
  reproducao: Tabela | null;
}): { ok: true; modelo: Modelo; avisos: string[] } | { ok: false; erro: string } {
  if (!e.rebanho) return { ok: false, erro: 'Aba RebanhoProd não encontrada ou vazia.' };
  const avisos: string[] = [];

  const R = e.rebanho;
  const obrigR = [['ID A'], ['ID animal'], ['ID Mãe'], ['ID Pai'], ['Data de nascimento'], ['Sexo']];
  const fr = faltando(R, obrigR);
  if (fr.length) return { ok: false, erro: `RebanhoProd sem as colunas: ${fr.join(', ')}.` };
  const cr = {
    idRebanho: coluna(R, 'ID rebanho'),
    A: coluna(R, 'ID A'),
    id: coluna(R, 'ID animal'),
    tag: coluna(R, 'ID eletrônica'),
    mae: coluna(R, 'ID Mãe'),
    pai: coluna(R, 'ID Pai'),
    nasc: coluna(R, 'Data de nascimento'),
    sexo: coluna(R, 'Sexo'),
    fazenda: coluna(R, 'Fazenda'),
    idM: coluna(R, 'ID M'),
    idP: coluna(R, 'ID P'),
    manejo: coluna(R, 'N° de manejo', 'N manejo'),
  };
  const rebanho: RegRebanho[] = R.linhas.map((l, k) => {
    const nascTxt = celula(l, cr.nasc);
    return {
      linha: k + 2,
      idRebanho: celula(l, cr.idRebanho),
      A: celula(l, cr.A),
      id: celula(l, cr.id),
      tag: celula(l, cr.tag),
      mae: celula(l, cr.mae),
      pai: celula(l, cr.pai),
      nascTxt,
      nasc: serialDia(nascTxt),
      sexo: celula(l, cr.sexo),
      fazenda: celula(l, cr.fazenda),
      idM: celula(l, cr.idM),
      idP: celula(l, cr.idP),
      manejo: celula(l, cr.manejo),
    };
  });

  const partos: RegParto[] = [];
  for (const P of e.partos) {
    const fp = faltando(P, [['ID A'], ['ID animal'], ['ID Mãe'], ['Data de nascimento'], ['Sexo']]);
    if (fp.length) {
      avisos.push(`Aba ${P.aba} sem as colunas: ${fp.join(', ')} — partos dela ficaram fora.`);
      continue;
    }
    const cp = {
      idRebanho: coluna(P, 'ID rebanho'),
      idM: coluna(P, 'ID M'),
      idP: coluna(P, 'ID P'),
      A: coluna(P, 'ID A'),
      id: coluna(P, 'ID animal'),
      tag: coluna(P, 'ID eletrônica'),
      mae: coluna(P, 'ID Mãe'),
      pai: coluna(P, 'ID Pai'),
      nasc: coluna(P, 'Data de nascimento'),
      sexo: coluna(P, 'Sexo'),
      metodo: coluna(P, 'Método'),
      previsto: coluna(P, 'Parto previsto'),
    };
    P.linhas.forEach((l, k) => {
      const nascTxt = celula(l, cp.nasc);
      const temAlgo = celula(l, cp.id) || celula(l, cp.mae) || nascTxt;
      if (!temAlgo) return;
      partos.push({
        aba: P.aba,
        linha: k + 2,
        idRebanho: celula(l, cp.idRebanho),
        idM: celula(l, cp.idM),
        idP: celula(l, cp.idP),
        A: celula(l, cp.A),
        id: celula(l, cp.id),
        tag: celula(l, cp.tag),
        mae: celula(l, cp.mae),
        pai: celula(l, cp.pai),
        nascTxt,
        nasc: serialDia(nascTxt),
        sexo: celula(l, cp.sexo),
        metodo: celula(l, cp.metodo),
        previsto: serialDia(celula(l, cp.previsto)),
      });
    });
  }

  const iatfs: RegIatf[] = [];
  const Q = e.reproducao;
  if (!Q) {
    avisos.push('Aba Reproduçao não encontrada — nenhuma checagem de pai foi feita.');
  } else {
    const fq = faltando(Q, [['ID animal'], ['Data IATF'], SEMEN]);
    if (fq.length) {
      avisos.push(`Reproduçao sem as colunas: ${fq.join(', ')} — nenhuma checagem de pai foi feita.`);
    } else {
      const cq = {
        id: coluna(Q, 'ID animal'),
        data: coluna(Q, 'Data IATF'),
        semen: coluna(Q, ...SEMEN),
        tag: coluna(Q, 'ID eletrônica'),
        previsto: coluna(Q, 'Parto previsto'),
        A: coluna(Q, 'ID A'),
        ident: coluna(Q, 'Identificação'),
        manejo: coluna(Q, 'N° de manejo', 'N manejo'),
        sisbov: coluna(Q, 'SISBOV'),
      };
      Q.linhas.forEach((l, k) => {
        const dataTxt = celula(l, cq.data);
        const idTxt = celula(l, cq.id);
        if (!idTxt && !dataTxt) return;
        iatfs.push({
          linha: k + 2,
          idTxt,
          nomes: [...new Set([U(idTxt), U(celula(l, cq.ident)), U(celula(l, cq.manejo))].filter(Boolean))],
          tags: [...new Set([t(celula(l, cq.tag)), t(celula(l, cq.sisbov))].filter(Boolean))],
          A: celula(l, cq.A),
          data: serialDia(dataTxt),
          dataTxt,
          semen: celula(l, cq.semen),
          previsto: serialDia(celula(l, cq.previsto)),
        });
      });
    }
  }

  return { ok: true, modelo: { rebanho, partos, iatfs }, avisos };
}
