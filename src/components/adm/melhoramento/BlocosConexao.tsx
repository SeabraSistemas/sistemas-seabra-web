import { VAZIO, formatarInteiro } from '@/lib/adm/format';
import type { VinculosNaVisao } from '@/lib/adm/areas/melhoramento';
import type { ReprodutorConector } from '@/lib/melhoramento/conexao';
import { ROTULO_MOTIVO_VINCULO, type ResumoConexao } from '@/lib/melhoramento/vinculos';
import { cn } from '@/lib/utils';

/**
 * CONEXÃO GENÉTICA ENTRE FAZENDAS e o CADASTRO ÚNICO DE REPRODUTORES — só na
 * página /adm/melhoramento, a única que junta fazendas.
 *
 * Mostra (a) a conexão de hoje, com os vínculos confirmados aplicados (sem
 * nenhum, é a conta de antes); (b) quanto de conexão existiria se os
 * candidatos fossem confirmados; (c) a lista dos candidatos, com o motivo, e
 * como confirmar por SQL. A confirmação pela tela fica para depois.
 */

function resumoTexto(r: ResumoConexao): string {
  if (r.conectores.length === 0) return 'nenhum reprodutor com filhos em duas ou mais fazendas';
  return (
    `${formatarInteiro(r.conectores.length)} reprodutor(es) conector(es), ${formatarInteiro(r.fazendasLigadas)} fazendas ligadas ` +
    `em ${formatarInteiro(r.componentes.length)} grupo(s), ${formatarInteiro(r.paresDeFazendas)} par(es) de fazendas, ` +
    `${formatarInteiro(r.filhasDosConectores)} filhos dos conectores`
  );
}

export function ConexaoVinculos({
  conectores,
  vinculos,
  nomeFazenda,
  totalFazendas,
  progenie,
}: {
  conectores: ReprodutorConector[];
  vinculos: VinculosNaVisao;
  nomeFazenda: (id: number) => string;
  totalFazendas: number;
  progenie: 'filhas' | 'filhos';
}) {
  const c = vinculos.conexao;
  return (
    <section
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm',
        conectores.length === 0 ? 'border-red-900/60 bg-red-950/25 text-red-100' : 'border-border bg-card text-muted-foreground',
      )}
    >
      <h2 className="text-base text-foreground">Conexão genética entre fazendas</h2>
      {conectores.length === 0 ? (
        <p className="mt-1">
          <strong className="font-medium">Nenhum reprodutor tem {progenie} em duas ou mais fazendas</strong> (contado agora
          sobre o pedigree de {formatarInteiro(totalFazendas)} fazendas, com os vínculos confirmados aplicados). Sem esse
          elo, cada fazenda é a própria régua: o EBV de um animal da fazenda A e o de um da fazenda B não são
          comparáveis, e nenhum ranking entre fazendas pode ser feito com estes modelos.
        </p>
      ) : (
        <p className="mt-1">
          {formatarInteiro(conectores.length)} reprodutor(es) com {progenie} em 2+ fazendas — conexão existe, mas só
          vale para as fazendas que eles ligam.
        </p>
      )}

      <div className="mt-3 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-muted-foreground">
        <h3 className="text-sm text-foreground">Cadastro único de reprodutores</h3>
        {!c ? (
          <p className="mt-1 text-xs">Candidatos indisponíveis: {vinculos.motivo}</p>
        ) : (
          <>
            <p className="mt-1">
              {formatarInteiro(c.candidatos)} candidato(s) não confirmado(s), {formatarInteiro(c.confirmados)} confirmado(s)
              e {formatarInteiro(c.rejeitados)} rejeitado(s). Nada é ligado sem confirmação humana: o módulo usa só os
              confirmados.
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs">
              <li>
                <strong className="font-medium text-foreground">Hoje (confirmados):</strong> {resumoTexto(c.atual)}.
              </li>
              <li>
                <strong className="font-medium text-foreground">Se todos os candidatos fossem confirmados:</strong>{' '}
                {resumoTexto(c.seConfirmados)}
                {c.seConfirmados.componentes.length > 0 &&
                  ` — grupos: ${c.seConfirmados.componentes.map((g) => g.map(nomeFazenda).join(' + ')).join('; ')}`}
                .
              </li>
            </ul>
          </>
        )}
      </div>

      {vinculos.candidatos.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">
            Pares de fazendas diferentes com registro, número (5+ caracteres) ou nome (3+ letras) iguais, os dois machos e
            pelo menos um deles pai; pais e nascimento reforçam, e contradição de nascimento ou de pais descarta. Para
            confirmar, no editor SQL do Supabase:{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px] text-foreground">
              update melhoramento.reprodutor_vinculo set confirmacao = &apos;confirmado&apos;, confirmado_por = &apos;Felipe&apos;,
              confirmado_em = now() where id = …;
            </code>{' '}
            (detalhes em supabase/melhoramento/melhoramento_03_vinculos.sql).
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="py-1.5 pe-3 font-normal">id</th>
                  <th className="py-1.5 pe-3 font-normal">Motivo</th>
                  <th className="py-1.5 pe-3 font-normal">Animal A</th>
                  <th className="py-1.5 pe-3 font-normal">Animal B</th>
                  <th className="py-1.5 font-normal">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vinculos.candidatos.map(({ vinculo: v, a, b }) => (
                  <tr key={v.id} className="align-top">
                    <td className="py-1 pe-3 font-mono text-xs">{v.id}</td>
                    <td className="py-1 pe-3 text-xs">{v.motivos.map((m) => ROTULO_MOTIVO_VINCULO[m] ?? m).join(', ')}</td>
                    <td className="py-1 pe-3">
                      {nomeFazenda(v.propriedadeA)} · {a.numero ?? `#${v.animalA}`}
                      {a.nome && <span className="text-muted-foreground"> · {a.nome}</span>}
                      <span className="text-xs text-muted-foreground"> · {formatarInteiro(a.filhos)} {progenie}</span>
                    </td>
                    <td className="py-1 pe-3">
                      {nomeFazenda(v.propriedadeB)} · {b.numero ?? `#${v.animalB}`}
                      {b.nome && <span className="text-muted-foreground"> · {b.nome}</span>}
                      <span className="text-xs text-muted-foreground"> · {formatarInteiro(b.filhos)} {progenie}</span>
                    </td>
                    <td className={cn('py-1 text-xs', v.confirmacao === 'confirmado' ? 'text-emerald-200' : 'text-muted-foreground')}>
                      {v.confirmacao === 'confirmado'
                        ? `confirmado${v.confirmadoPor ? ` por ${v.confirmadoPor}` : ''}`
                        : v.confirmacao === 'rejeitado'
                          ? 'rejeitado'
                          : 'não confirmado'}
                      {v.observacao ? ` · ${v.observacao}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {vinculos.candidatos.length === 0 && c && (
        <p className="mt-2 text-xs text-muted-foreground">{VAZIO} nenhum candidato gerado para esta espécie.</p>
      )}
    </section>
  );
}
