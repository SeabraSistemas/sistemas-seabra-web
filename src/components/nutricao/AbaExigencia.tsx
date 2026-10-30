'use client';

import { fasesNrc, leiteEstimadoKg, niveisDaFase, avisosDaSerie, sugerirNivelOrdenha } from '@/lib/nutricao/nrc';
import { categoriasFormulador } from '@/lib/nutricao/formulador';
import {
  CMS_MANTENCA_INTERCEPTO_PLANILHA,
  CMS_MANTENCA_INTERCEPTO_TEXTO,
  COMPOSICAO_MEDIA_RODRIGUES,
  FAIXA_LEITE_RODRIGUES,
  NOME_ORDEM,
  consumoMsLactacao,
  consumoMsMantenca,
  type OrdemLactacao,
} from '@/lib/nutricao/lactacao';
import type { TresExigencias } from '@/lib/nutricao/exigencias';
import type { Exigencia, NutrienteExigido } from '@/lib/nutricao/tipos';
import { Aviso, Botao, Info, NumeroInput, Opcoes, Rotulo, Secao, Selecao } from '@/components/nutricao/ui';
import { numero, pct } from '@/components/nutricao/formato';
import type { EstadoAnimal } from '@/components/nutricao/estado';
import { cn } from '@/lib/utils';

type Props = {
  animal: EstadoAnimal;
  mudar: (parcial: Partial<EstadoAnimal>) => void;
  ex: TresExigencias;
};

export function AbaExigencia({ animal, mudar, ex }: Props) {
  const fases = fasesNrc();
  const niveis = niveisDaFase(animal.faseNrc);
  const peso = animal.pesoKg;
  const sugerido = ex.serie && peso && animal.leiteKg ? sugerirNivelOrdenha(animal.faseNrc, peso, animal.leiteKg) : null;
  const consulta = ex.consulta;

  return (
    <div className="space-y-4">
      <Secao
        titulo="Animal"
        info={
          <>
            <p>Os dados do animal são <b>digitados à mão</b> e ficam só neste navegador. Nada é enviado nem gravado no banco.</p>
            <p>Peso e leite alimentam as três colunas ao mesmo tempo.</p>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Rotulo texto="Peso vivo" htmlFor="peso" info={<p>Peso da cabra em kg. O NRC 2007 tem valores de 20 a 90 kg (50 a 150 kg para bodes); entre dois pesos da tabela o valor é interpolado.</p>} />
            <NumeroInput id="peso" valor={peso} aoMudar={(n) => mudar({ pesoKg: n })} sufixo="kg" casas={1} />
          </div>
          <div className="space-y-1">
            <Rotulo
              texto="Leite"
              htmlFor="leite"
              info={
                <>
                  <p>Produção de leite da cabra, em kg por dia (1 L ≈ 1,03 kg).</p>
                  <p>Entra no consumo de MS (lactação) e na exigência líquida de Rodrigues. Na ordenha do NRC o leite é só uma referência para escolher o nível.</p>
                </>
              }
            />
            <NumeroInput id="leite" valor={animal.leiteKg} aoMudar={(n) => mudar({ leiteKg: n })} sufixo="kg/dia" casas={2} />
          </div>
        </div>
      </Secao>

      <div className="grid gap-4 lg:grid-cols-3">
        <Secao
          titulo="1 · Formulador"
          info={
            <>
              <p>Tabela de exigências do formulador do Silas Greca: <b>um valor fixo por categoria</b>, que não muda com o peso nem com o leite.</p>
              <p>Cabra em lactação e cabra recém-parida têm os mesmos números, e o consumo é sempre 2,4 kg de MS.</p>
            </>
          }
        >
          <div className="space-y-1">
            <Rotulo texto="Categoria" htmlFor="categoria" />
            <Selecao id="categoria" valor={animal.categoriaId} aoMudar={(v) => mudar({ categoriaId: v })}>
              {categoriasFormulador().map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Selecao>
          </div>
        </Secao>

        <Secao
          titulo="2 · NRC 2007"
          info={
            <>
              <p>Tabelas do <b>NRC 2007</b> (pequenos ruminantes) compiladas por Susan Schoenian no Maryland Dairy Goat Ration Evaluator, em kg.</p>
              <p>Cada linha usa um degrau de NDT da dieta (≈53%, 66% ou 80%). O peso é interpolado <b>dentro do mesmo degrau</b>; quando o NRC troca de degrau entre dois pesos, não dá para interpolar e você escolhe o ponto vizinho.</p>
            </>
          }
        >
          <div className="space-y-1">
            <Rotulo texto="Fase" htmlFor="fase" />
            <Selecao
              id="fase"
              valor={animal.faseNrc}
              aoMudar={(fase) => {
                const primeira = niveisDaFase(fase)[0];
                mudar({ faseNrc: fase, serieNrcId: primeira.id, degrau: 'abaixo' });
              }}
            >
              {fases.map((f) => (
                <option key={f.fase} value={f.fase}>
                  {f.nome}
                </option>
              ))}
            </Selecao>
          </div>

          <div className="space-y-1">
            <Rotulo
              texto="Nível"
              info={<p>Na ordenha o nível é a produção de leite (baixa, média, alta); nas demais fases, o número de crias ou o tipo de manejo. Em ordenha, o leite ao lado é a estimativa do NRC para o peso informado.</p>}
            />
            <Opcoes
              rotuloAria="Nível do NRC"
              valor={animal.serieNrcId}
              aoMudar={(id) => mudar({ serieNrcId: id, degrau: 'abaixo' })}
              opcoes={niveis.map((s) => {
                const leite = peso ? leiteEstimadoKg(s, peso) : null;
                return { valor: s.id, rotulo: leite != null ? `${s.nivel.replace(' produção', '')} · ≈${numero(leite, 1)} kg` : s.nivel };
              })}
            />
            {sugerido && ex.serie && sugerido.id !== ex.serie.id && (
              <Botao className="mt-1 w-full text-left" onClick={() => mudar({ serieNrcId: sugerido.id, degrau: 'abaixo' })}>
                Pelo leite informado, o mais próximo é {sugerido.nivel.toLowerCase()} — usar
              </Botao>
            )}
          </div>

          {consulta?.situacao === 'troca-de-degrau' && consulta.vizinhos && (
            <div className="space-y-1">
              <Rotulo
                texto="Ponto vizinho"
                info={
                  <p>
                    Entre {consulta.vizinhos.abaixo.pesoKg} e {consulta.vizinhos.acima.pesoKg} kg o NRC muda o degrau de NDT. Misturar os dois pontos criaria uma dieta que o NRC não calculou, então vale o ponto que você escolher.
                  </p>
                }
              />
              <Opcoes
                rotuloAria="Ponto vizinho do NRC"
                valor={animal.degrau}
                aoMudar={(v) => mudar({ degrau: v })}
                opcoes={[
                  { valor: 'abaixo', rotulo: `${consulta.vizinhos.abaixo.pesoKg} kg · NDT ${consulta.vizinhos.abaixo.degrau}%` },
                  { valor: 'acima', rotulo: `${consulta.vizinhos.acima.pesoKg} kg · NDT ${consulta.vizinhos.acima.degrau}%` },
                ]}
              />
            </div>
          )}

          {consulta?.situacao === 'fora-da-faixa' && <Aviso>{consulta.avisos[0]}</Aviso>}
          {ex.serie && avisosDaSerie(ex.serie).map((a) => <Aviso key={a}>{a}</Aviso>)}
        </Secao>

        <Secao
          titulo="3 · Rodrigues et al. 2006"
          info={
            <>
              <p>Equação da <b>exigência líquida de lactação</b> (energia em kcal/dia e proteína em g/dia) de cabras Saanen: Rodrigues et al., <i>Acta Scientiarum. Animal Sciences</i> 28(4):447–452, 2006.</p>
              <p>Foi ajustada com 20 cabras produzindo cerca de {numero(FAIXA_LEITE_RODRIGUES.min, 1)} a {numero(FAIXA_LEITE_RODRIGUES.max, 1)} kg/dia; fora disso o resultado perde o sentido e a tela avisa.</p>
            </>
          }
        >
          <div className="space-y-1">
            <Rotulo texto="Ordem de lactação" />
            <Opcoes<OrdemLactacao>
              rotuloAria="Ordem de lactação"
              valor={animal.ordem}
              aoMudar={(ordem) => {
                const m = COMPOSICAO_MEDIA_RODRIGUES[ordem];
                mudar({ ordem, gorduraPct: m.gorduraPct, proteinaPct: m.proteinaPct, lactosePct: m.lactosePct });
              }}
              opcoes={[
                { valor: 'primeira', rotulo: NOME_ORDEM.primeira },
                { valor: 'demais', rotulo: NOME_ORDEM.demais },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Rotulo texto="Gordura" htmlFor="gordura" info={<p>% de gordura do leite. Ao trocar a ordem de lactação, os três teores voltam à média do estudo.</p>} />
              <NumeroInput id="gordura" valor={animal.gorduraPct} aoMudar={(n) => mudar({ gorduraPct: n })} sufixo="%" casas={2} />
            </div>
            <div className="space-y-1">
              <Rotulo texto="Proteína" htmlFor="proteina" info={<p>% de proteína do leite.</p>} />
              <NumeroInput id="proteina" valor={animal.proteinaPct} aoMudar={(n) => mudar({ proteinaPct: n })} sufixo="%" casas={2} />
            </div>
            <div className="space-y-1">
              <Rotulo texto="Lactose" htmlFor="lactose" info={<p>% de lactose do leite.</p>} />
              <NumeroInput id="lactose" valor={animal.lactosePct} aoMudar={(n) => mudar({ lactosePct: n })} sufixo="%" casas={2} />
            </div>
          </div>
          {ex.rodrigues?.avisos.map((a) => (
            <Aviso key={a}>{a}</Aviso>
          ))}
        </Secao>
      </div>

      <LadoALado ex={ex} />
      <ConsumoPorEquacao peso={peso} leite={animal.leiteKg} ex={ex} />
    </div>
  );
}

function celula(valor: number | null | undefined, formatar: (n: number) => string): string {
  return valor == null || !Number.isFinite(valor) ? '—' : formatar(valor);
}

function LadoALado({ ex }: { ex: TresExigencias }) {
  const f = ex.formulador;
  const n = ex.nrc;
  const r = ex.rodriguesExig;
  const rod = ex.rodrigues;

  const linhas: { rotulo: string; info?: React.ReactNode; a: string; b: string; c: string; destaque?: boolean }[] = [
    {
      rotulo: 'Consumo de MS (kg/dia)',
      info: (
        <>
          <p><b>Formulador:</b> 2,4 kg fixos. <b>NRC:</b> o consumo da tabela. <b>Rodrigues:</b> o consumo vem da equação da planilha de consumo (abaixo), não do artigo.</p>
        </>
      ),
      a: celula(f?.cmsKg, (x) => numero(x, 2)),
      b: celula(n?.cmsKg, (x) => numero(x, 2)),
      c: celula(r?.cmsKg, (x) => numero(x, 2)),
      destaque: true,
    },
    ...linhaNutriente('NDT', 'ndt', f, n, 'kg/dia', 1, 2),
    ...linhaNutriente('PB', 'pb', f, n, 'g/dia', 1, 0),
    ...linhaNutriente('Ca', 'ca', f, n, 'g/dia', 2, 1),
    ...linhaNutriente('P', 'p', f, n, 'g/dia', 2, 1),
    {
      rotulo: 'Energia líquida de lactação (kcal/dia)',
      info: <p>Só a parte líquida da lactação (o leite que sai). Não inclui mantença, gestação nem as perdas de conversão da dieta, por isso não é comparável com o NDT das outras colunas.</p>,
      a: '—',
      b: '—',
      c: celula(rod?.energiaKcal, (x) => numero(x, 0)),
    },
    {
      rotulo: 'Proteína líquida de lactação (g/dia)',
      a: '—',
      b: '—',
      c: celula(rod?.proteinaG, (x) => numero(x, 0)),
    },
    {
      rotulo: 'Por kg de leite',
      info: <p>Energia (kcal) e proteína (g) líquidas por kg de leite produzido. O AFRC 1998 usa 678 kcal e 29 g por kg.</p>,
      a: '—',
      b: '—',
      c: rod?.energiaKcalPorKg != null ? `${numero(rod.energiaKcalPorKg, 0)} kcal · ${numero(rod.proteinaGPorKg, 1)} g` : '—',
    },
  ];

  const avisosGerais = [...(f?.avisos ?? []), ...(n?.avisos ?? [])];
  const queda = f?.cmsKg && n?.cmsKg ? (f.cmsKg - n.cmsKg) / n.cmsKg : null;

  return (
    <Secao
      titulo="Lado a lado"
      info={
        <>
          <p>As três fontes para o mesmo animal. <b>—</b> é dado que a fonte não traz.</p>
          <p>Concentrações (% da MS) do NRC e do formulador são comparáveis; a de Rodrigues dá só a lactação líquida.</p>
        </>
      }
    >
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[21rem] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="px-1 pb-2 font-medium" />
              <th className="px-1 pb-2 text-right font-semibold text-foreground">
                Formulador
                <div className="font-normal text-muted-foreground">{ex.categoria?.nome ?? '—'}</div>
              </th>
              <th className="px-1 pb-2 text-right font-semibold text-foreground">
                NRC 2007
                <div className="font-normal text-muted-foreground">{ex.serie ? `${ex.serie.nivel}` : '—'}</div>
              </th>
              <th className="px-1 pb-2 text-right font-semibold text-foreground">
                Rodrigues
                <div className="font-normal text-muted-foreground">2006</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.rotulo} className={cn('border-t border-border', l.destaque && 'bg-secondary/60')}>
                <th className="border-t border-border px-1 py-2 text-left align-top font-normal">
                  <span className="flex items-start gap-0.5">
                    <span>{l.rotulo}</span>
                    {l.info && <Info titulo={l.rotulo}>{l.info}</Info>}
                  </span>
                </th>
                <td className="border-t border-border px-1 py-2 text-right align-top tabular-nums">{l.a}</td>
                <td className="border-t border-border px-1 py-2 text-right align-top tabular-nums">{l.b}</td>
                <td className="border-t border-border px-1 py-2 text-right align-top tabular-nums">{l.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {queda != null && queda < -0.03 && (
        <Aviso nivel="info">
          O consumo fixo do formulador ({numero(f?.cmsKg, 2)} kg de MS) fica {numero(Math.abs(queda) * 100, 0)}% abaixo do NRC ({numero(n?.cmsKg, 2)} kg): com tão pouca MS a cabra não come a energia que a concentração pede.
        </Aviso>
      )}
      {avisosGerais.map((a) => (
        <Aviso key={a} nivel="info">
          {a}
        </Aviso>
      ))}
    </Secao>
  );
}

function linhaNutriente(nome: string, chave: NutrienteExigido, f: Exigencia | null, n: Exigencia | null, unidade: string, casasPct: number, casasAbs: number) {
  return [
    {
      rotulo: `${nome} (% da MS)`,
      a: celula(f?.[chave].frac, (x) => pct(x, casasPct)),
      b: celula(n?.[chave].frac, (x) => pct(x, casasPct)),
      c: '—',
    },
    {
      rotulo: `${nome} (${unidade})`,
      info: chave === 'ndt' ? <p>No formulador a quantidade é <b>derivada</b>: concentração fixa × consumo fixo de MS. No NRC é o valor da tabela.</p> : undefined,
      a: celula(f?.[chave].absoluto, (x) => numero(x, casasAbs)),
      b: celula(n?.[chave].absoluto, (x) => numero(x, casasAbs)),
      c: '—',
    },
  ];
}

function ConsumoPorEquacao({ peso, leite, ex }: { peso: number | null; leite: number | null; ex: TresExigencias }) {
  if (peso == null || peso <= 0) return null;
  const lactacao = consumoMsLactacao(peso, leite ?? 0);
  const mantenca = consumoMsMantenca(peso, CMS_MANTENCA_INTERCEPTO_TEXTO);
  const mantencaPlanilha = consumoMsMantenca(peso, CMS_MANTENCA_INTERCEPTO_PLANILHA);
  const usaLactacao = ex.prenheOuLactacao;

  return (
    <Secao
      titulo="Consumo de MS por equação"
      info={
        <>
          <p>Duas equações da planilha &ldquo;Consumo de MS Caprinos&rdquo; (fonte não citada). A que vale para a fase escolhida no NRC fica em verde.</p>
          <p>O texto da planilha dizia <b>0,522 + 0,0135·PV</b>, mas a célula usava <b>0,552</b>: 0,03 kg/dia a mais. Aqui as duas aparecem.</p>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className={cn('rounded-xl border p-3', usaLactacao ? 'border-ok bg-ok-soft' : 'border-border')}>
          <p className="text-sm font-medium">Prenhe ou em lactação</p>
          <p className="text-xs text-muted-foreground">0,062 · PV^0,75 + 0,305 · leite</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{numero(lactacao, 4)} kg MS/dia</p>
        </div>
        <div className={cn('rounded-xl border p-3', !usaLactacao ? 'border-ok bg-ok-soft' : 'border-border')}>
          <p className="text-sm font-medium">Mantença (adultos)</p>
          <p className="text-xs text-muted-foreground">0,522 + 0,0135 · PV</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{numero(mantenca, 3)} kg MS/dia</p>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            Planilha (0,552): {numero(mantencaPlanilha, 3)} kg · diferença +{numero(mantencaPlanilha - mantenca, 3)} kg
          </p>
        </div>
      </div>
    </Secao>
  );
}
