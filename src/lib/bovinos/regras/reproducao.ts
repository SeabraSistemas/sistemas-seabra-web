import { U, nk, semenValido } from '@/lib/bovinos/texto';
import type { Modelo } from '@/lib/bovinos/modelo';
import type { Indices } from '@/lib/bovinos/identidade';
import type { Problema } from '@/lib/bovinos/tipos';

/** A mesma vaca inseminada duas vezes no mesmo dia com sêmens diferentes — o pai do bezerro fica indefinido. */
export function regrasReproducao(modelo: Modelo, ind: Indices): Problema[] {
  const grupos = new Map<string, typeof modelo.iatfs>();
  for (const x of modelo.iatfs) {
    if (x.data == null || !semenValido(x.semen)) continue;
    const quem = ind.porA.has(x.A) ? `A:${x.A}` : `N:${U(x.idTxt)}`;
    const k = `${quem}|${x.data}`;
    grupos.set(k, [...(grupos.get(k) ?? []), x]);
  }
  const out: Problema[] = [];
  for (const [k, lista] of grupos) {
    const semens = new Set(lista.map((x) => nk(x.semen)));
    if (semens.size < 2) continue;
    out.push({
      id: `iatf-mesmo-dia|${k}`,
      regra: 'iatf-mesmo-dia',
      severidade: 'manual',
      aba: 'Reproduçao',
      linha: lista[0].linha,
      animal: lista[0].idTxt,
      resumo: `${lista[0].idTxt} em ${lista[0].dataTxt}: ${[...new Set(lista.map((x) => x.semen))].join(' e ')}.`,
      prova: lista.map((x) => `L${x.linha}: ${x.semen}`),
      bloqueios: [],
      correcao: null,
    });
  }
  return out;
}
