import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import {
  AvisoInterno,
  ComoLemosMelhoramento,
  PainelDiagnostico,
  Rankings,
  TabelaValidacao,
} from '@/components/adm/melhoramento/BlocosMelhoramento';
import { getMelhoramentoFazenda, listarFazendasMelhoramento } from '@/lib/adm/areas/melhoramento';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { formatarDataHora, formatarInteiro } from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';
import type { PropriedadeEscopo } from '@/lib/adm/types';
import type { AnaliseFazenda } from '@/lib/melhoramento/analise';
import {
  CARACTERISTICAS,
  ESPECIES_MELHORAMENTO,
  ORDEM_CARACTERISTICAS,
  especieValida,
  type CaracteristicaChave,
  type EspecieChave,
} from '@/lib/melhoramento/tipos';
import { cn } from '@/lib/utils';

/**
 * Aba Melhoramento — análise INTERNA de melhoramento genético sobre o rebanho
 * DESTE cliente. Só o Felipe vê (gate e auditoria `abriu_usuario` no layout
 * da ficha); `noDossie: false`, então nada daqui vai para a peça comercial.
 *
 * Três perguntas, nesta ordem, e a ordem importa:
 *   1. os dados desta fazenda permitem concluir alguma coisa? (diagnóstico)
 *   2. qual modelo prevê melhor a lactação seguinte AQUI? (validação)
 *   3. só então: quem são as melhores fêmeas e reprodutores por modelo.
 * Ranking sem as duas primeiras seria um número bonito sem lastro.
 *
 * NADA DE OUTRA FAZENDA aparece aqui: a análise lê só as linhas desta
 * propriedade, e o resumo entre fazendas e os candidatos a mesmo reprodutor
 * moram em /adm/melhoramento, que é a única tela que junta clientes.
 *
 * Somente leitura e cálculo sob demanda: nada é gravado.
 */
export const dynamic = 'force-dynamic';

const TETO_FAZENDAS = 15;

export default async function MelhoramentoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const usuarioId = Number(id);
  const sp = await searchParams;
  const selecao = lerSelecaoParam(sp.prop);

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;
  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;

  if (alvos.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <p className="painel text-sm text-muted-foreground">
          Sem propriedade no escopo — melhoramento analisa o rebanho de uma fazenda, e esta conta não alcança nenhuma.
        </p>
      </div>
    );
  }

  if (alvos.length > 1) {
    return <EscolherFazenda propriedades={alvos.slice(0, TETO_FAZENDAS)} total={alvos.length} usuarioId={usuarioId} />;
  }

  const propriedade = alvos[0];
  const um = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return (
    <UmaFazenda
      propriedade={propriedade}
      usuarioId={usuarioId}
      especiePedida={especieValida(um(sp.esp))}
      caracteristicaPedida={um(sp.carac)}
    />
  );
}

async function EscolherFazenda({
  propriedades,
  total,
  usuarioId,
}: {
  propriedades: PropriedadeEscopo[];
  total: number;
  usuarioId: number;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AvisoInterno />
      <p className="painel text-sm text-muted-foreground">
        Este usuário alcança {formatarInteiro(total)} propriedades. Melhoramento não consolida: cada fazenda é a própria
        régua (EBV de fazendas sem reprodutor em comum não se comparam). Escolha uma.
        {total > propriedades.length && ` Mostrando as ${propriedades.length} primeiras — use o seletor acima.`}
      </p>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {propriedades.map((p) => (
          <li key={p.id} className="px-4 py-3">
            <Link
              href={`/adm/u/${usuarioId}/melhoramento?prop=${p.id}`}
              className="text-sm text-foreground underline underline-offset-4"
            >
              {p.nome}
            </Link>
            <span className="ms-2 text-xs text-muted-foreground">{formatarInteiro(p.animais_ativos)} animais ativos</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function UmaFazenda({
  propriedade,
  usuarioId,
  especiePedida,
  caracteristicaPedida,
}: {
  propriedade: PropriedadeEscopo;
  usuarioId: number;
  especiePedida: EspecieChave | null;
  caracteristicaPedida: string | undefined;
}) {
  // Quais espécies desta fazenda têm rebanho — a fazenda pode ter cabras e ovelhas.
  const fazRes = await listarFazendasMelhoramento({ propriedadeId: propriedade.id });
  if (!fazRes.ok) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <EstadoVazio resultado={fazRes} />
      </div>
    );
  }
  const especies = fazRes.dados
    .filter((f) => especieValida(f.especie) != null)
    .sort((a, b) => b.lactacoes - a.lactacoes);
  if (especies.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <AvisoInterno />
        <p className="painel text-sm text-muted-foreground">
          {propriedade.nome} não tem cabras nem ovelhas cadastradas. Bovinos de corte ficam fora desta versão:{' '}
          {ESPECIES_MELHORAMENTO.bovino_corte.motivo}
        </p>
      </div>
    );
  }
  const especie =
    (especiePedida && especies.find((e) => e.especie === especiePedida)?.especie) ?? especies[0].especie;
  const esp = especieValida(especie)!;
  const caracteristica: CaracteristicaChave = ORDEM_CARACTERISTICAS.includes(caracteristicaPedida as CaracteristicaChave)
    ? (caracteristicaPedida as CaracteristicaChave)
    : 'media_diaria';

  const res = await getMelhoramentoFazenda(propriedade.id, esp);
  const base = `/adm/u/${usuarioId}/melhoramento?prop=${propriedade.id}`;

  return (
    <div className="flex flex-col gap-5">
      <AvisoInterno />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {especies.map((e) => (
            <Pilula
              key={e.especie}
              href={`${base}&esp=${e.especie}&carac=${caracteristica}`}
              ativa={e.especie === esp}
            >
              {ESPECIES_MELHORAMENTO[especieValida(e.especie)!].rotulo} · {formatarInteiro(e.lactacoes)} lactações
            </Pilula>
          ))}
          <span className="mx-1 h-4 w-px bg-border" aria-hidden />
          {ORDEM_CARACTERISTICAS.map((c) => (
            <Pilula key={c} href={`${base}&esp=${esp}&carac=${c}`} ativa={c === caracteristica}>
              {CARACTERISTICAS[c].rotulo}
              {CARACTERISTICAS[c].principal ? ' (principal)' : ''}
            </Pilula>
          ))}
        </div>
        {res.ok && (
          <p className="text-xs text-muted-foreground">
            Calculado em {formatarDataHora(new Date(res.dados.calculadoEm))} · {res.dados.analise.versaoMotor} · cache
            de 5 min
          </p>
        )}
      </div>

      {!res.ok ? (
        <EstadoVazio resultado={res} />
      ) : (
        <Conteudo analise={res.dados.analise} caracteristica={caracteristica} />
      )}
    </div>
  );
}

function Conteudo({
  analise: a,
  caracteristica,
}: {
  analise: AnaliseFazenda;
  caracteristica: CaracteristicaChave;
}) {
  const c = a.caracteristicas.find((x) => x.caracteristica === caracteristica) ?? null;
  return (
    <>
      <PainelDiagnostico diagnostico={a.diagnostico} />

      {!a.rodouModelos ? (
        <p className="painel text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Modelos não rodaram.</strong> {a.motivoSemModelos}
        </p>
      ) : !c ? (
        <p className="painel text-sm text-muted-foreground">
          {CARACTERISTICAS[caracteristica].rotulo}: poucas lactações aproveitáveis para rodar os modelos nesta
          característica.
        </p>
      ) : (
        <>
          <TabelaValidacao validacao={c.validacao} modelos={a.modelos} caracteristica={caracteristica} />
          {c.avisos.length > 0 && (
            <ul className="painel list-disc pl-8 text-sm text-muted-foreground">
              {c.avisos.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <Rankings caracteristica={c} modelos={a.modelos} tipo="femeas" />
          <Rankings caracteristica={c} modelos={a.modelos} tipo="reprodutores" />
          <p className="text-xs text-muted-foreground">
            BLUP: {c.blup.map((b) => `${b.metodo === 'densa' ? 'Cholesky denso' : `Gauss-Seidel (${formatarInteiro(b.iteracoes)} voltas)`}, ${formatarInteiro(b.incognitas)} incógnitas`).join(' · ')}
            . {formatarInteiro(c.registros)} lactações de {formatarInteiro(c.femeas)} fêmeas em{' '}
            {formatarInteiro(c.grupos)} grupos.
          </p>
        </>
      )}

      <ComoLemosMelhoramento config={a.config} modelos={a.modelos} />
    </>
  );
}

function Pilula({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativa ? 'page' : undefined}
      className={cn(
        'rounded-full border px-3 py-1 text-xs transition-colors',
        ativa
          ? 'border-primary/60 bg-primary/10 text-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}
