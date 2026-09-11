import Link from 'next/link';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import {
  FLUXO_LIMITE,
  LISTA_LIMITE,
  TIPO_LOCALIZACAO,
  TIPO_LOTE,
  destinoDe,
  destinosMaisComuns,
  fluxos,
  lerTipo,
  listarMovimentacoes,
  maisMovimentados,
  origemDe,
  resumoMovimentacoes,
  rotuloDoTipo,
  serieMovimentacoes,
  type AnimalMovimentado,
  type Destino,
  type Fluxo,
  type ResumoMovimentacoes,
} from '@/lib/adm/areas/movimentacoes';
import type { LinhaMovimentacao } from '@/lib/adm/areas/contrato';
import { lerSelecaoParam, type SelecaoPropriedade } from '@/lib/adm/escopo';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarNumero,
  formatarPercentual,
} from '@/lib/adm/format';
import { getEscopo } from '@/lib/adm/queries';

/**
 * MOVIMENTAÇÕES — para onde o rebanho anda.
 *
 * A aba Estrutura conta baias, lotes e setores PARADOS. Esta tela mostra o
 * movimento entre eles: os caminhos mais percorridos, os destinos que mais
 * recebem, e os animais que vivem trocando de lugar.
 *
 * ⚠️ OS DOIS TIPOS NÃO SE SOMAM SEM RESSALVA, e por isso têm filtro: 'lote' é
 * decisão de manejo (o animal mudou de grupo) e 'localização' é lugar físico
 * (mudou de baia ou setor). O total sozinho não distingue manejo por lote bem
 * feito de animal trocando de curral toda semana.
 */
export const dynamic = 'force-dynamic';

export default async function MovimentacoesPage({
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
  const tipo = lerTipo(sp.tipo);

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;

  if (!alvo) {
    return (
      <div className="flex flex-col gap-4">
        <VoltarParaEstrutura usuarioId={usuarioId} sufixo={sufixo} />
        <p className="painel text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Sem propriedade no escopo — não há movimentação para mostrar.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. Lote e baia com o mesmo nome em fazendas diferentes são lugares diferentes — escolha uma no seletor acima.`}
        </p>
      </div>
    );
  }

  const [todosRes, filtradoRes] = await Promise.all([
    listarMovimentacoes(alvo.id, null),
    tipo === null ? Promise.resolve(null) : listarMovimentacoes(alvo.id, tipo),
  ]);
  if (!todosRes.ok) return <EstadoVazio resultado={todosRes} />;
  if (filtradoRes && !filtradoRes.ok) return <EstadoVazio resultado={filtradoRes} />;

  const todos = todosRes.dados;
  const movs = filtradoRes ? filtradoRes.dados : todos;

  const resumoGeral = resumoMovimentacoes(todos);
  const resumo = resumoMovimentacoes(movs);
  const caminhos = fluxos(movs);
  const destinos = destinosMaisComuns(movs);
  const rotativos = maisMovimentados(movs);
  const serie = serieMovimentacoes(movs);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <VoltarParaEstrutura usuarioId={usuarioId} sufixo={sufixo} />
        <h1 className="mt-1 text-lg">
          Movimentações{tipo === null ? '' : ` · ${rotuloDoTipo(tipo)}`}
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatarInteiro(todos.length)} movimentações no histórico desta fazenda.
        </p>
      </div>

      <Tipos
        resumo={resumoGeral}
        atual={tipo}
        usuarioId={usuarioId}
        selecao={selecao}
      />

      {movs.length === 0 ? (
        <p className="painel text-sm text-muted-foreground">
          {todos.length === 0
            ? 'Nenhuma movimentação registrada. Sem ela não há histórico de onde o animal esteve — e o lote de hoje vira a única informação de localização que existe.'
            : 'Nenhuma movimentação deste tipo. Escolha outro acima.'}
        </p>
      ) : (
        <>
          <Cards resumo={resumo} />

          {serie.length > 1 && (
            <section className="painel">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base">Movimentações por mês</h2>
                <p className="text-xs text-muted-foreground">
                  O ritmo do manejo — pico costuma ser formação de lote de cobertura ou desmame.
                </p>
              </div>
              <div className="mt-3">
                <SerieTemporal
                  series={[{ chave: 'movs', nome: 'Movimentações', pontos: serie }]}
                  granularidade="mes"
                  buracos="zero"
                  formato="inteiro"
                  altura={240}
                />
              </div>
            </section>
          )}

          {caminhos.length > 0 && <Caminhos caminhos={caminhos} resumo={resumo} />}

          {destinos.length > 0 && <Destinos destinos={destinos} />}

          {rotativos.length > 0 && <Rotativos animais={rotativos} />}

          <Tabela movs={movs} usuarioId={usuarioId} sufixo={sufixo} />
        </>
      )}
    </div>
  );
}

function VoltarParaEstrutura({ usuarioId, sufixo }: { usuarioId: number; sufixo: string }) {
  return (
    <Link
      href={`/adm/u/${usuarioId}/estrutura${sufixo}`}
      className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
    >
      ← Estrutura
    </Link>
  );
}

function Tipos({
  resumo,
  atual,
  usuarioId,
  selecao,
}: {
  resumo: ResumoMovimentacoes;
  atual: string | null;
  usuarioId: number;
  selecao: SelecaoPropriedade;
}) {
  const base = `/adm/u/${usuarioId}/estrutura/movimentacoes`;
  const prop = selecao == null ? '' : `prop=${selecao}&`;

  const opcoes = [
    { chave: null, rotulo: 'Todas', quantidade: resumo.movimentacoes },
    { chave: TIPO_LOTE, rotulo: rotuloDoTipo(TIPO_LOTE), quantidade: resumo.porLote },
    { chave: TIPO_LOCALIZACAO, rotulo: rotuloDoTipo(TIPO_LOCALIZACAO), quantidade: resumo.porLocalizacao },
  ].filter((o) => o.quantidade > 0 || o.chave === null);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Tipo de movimentação</h2>
        <p className="text-xs text-muted-foreground">
          Trocar de lote é decisão de manejo; trocar de baia é lugar físico.
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {opcoes.map((opcao) => (
          <Link
            key={opcao.chave ?? 'todas'}
            href={opcao.chave === null ? `${base}${prop ? `?${prop.slice(0, -1)}` : ''}` : `${base}?${prop}tipo=${opcao.chave}`}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              atual === opcao.chave
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {opcao.rotulo} <span className="tabular-nums opacity-70">{formatarInteiro(opcao.quantidade)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Cards({ resumo }: { resumo: ResumoMovimentacoes }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        rotulo="Movimentações"
        valor={formatarInteiro(resumo.movimentacoes)}
        detalhe={`em ${formatarInteiro(resumo.dias)} dias distintos`}
      />
      <KpiCard
        rotulo="Animais movidos"
        valor={formatarInteiro(resumo.animais)}
        detalhe="animais distintos no recorte"
      />
      <KpiCard
        rotulo="Movimentos por animal"
        valor={resumo.mediaPorAnimal === null ? VAZIO : formatarNumero(resumo.mediaPorAnimal, 1)}
        detalhe="a rotatividade do rebanho"
      />
      <KpiCard
        rotulo="Animal que mais mudou"
        valor={formatarInteiro(resumo.maisMovimentado)}
        detalhe="movimentações de um único animal"
      />
      <KpiCard
        rotulo="Sem origem"
        valor={formatarInteiro(resumo.semOrigem)}
        // Não é buraco de cadastro: é a primeira movimentação de cada animal, que
        // por definição não tem de onde.
        detalhe="a primeira movimentação do animal não tem de onde"
      />
      <KpiCard
        rotulo="Última movimentação"
        valor={resumo.ultima ? formatarData(resumo.ultima) : VAZIO}
        detalhe={resumo.primeira ? `desde ${formatarData(resumo.primeira)}` : undefined}
      />
    </div>
  );
}

function Caminhos({ caminhos, resumo }: { caminhos: Fluxo[]; resumo: ResumoMovimentacoes }) {
  const maior = Math.max(...caminhos.map((c) => c.movimentacoes), 1);

  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Caminhos mais percorridos</h2>
        <p className="text-xs text-muted-foreground">
          Só movimentações com origem — {formatarInteiro(resumo.semOrigem)} são a primeira do animal
          e não têm de onde.
        </p>
      </div>

      <ol className="mt-3 flex flex-col gap-1.5">
        {caminhos.map((caminho) => (
          <li
            key={`${caminho.origem}-${caminho.destino}`}
            className="grid grid-cols-[minmax(0,16rem)_1fr_6rem] items-center gap-3 text-sm"
          >
            <span className="truncate text-foreground">
              {caminho.origem} <span className="text-muted-foreground">→</span> {caminho.destino}
            </span>
            <span className="h-3 rounded-full bg-secondary" aria-hidden>
              <span
                className="block h-full rounded-full bg-primary"
                style={{ width: `${(caminho.movimentacoes / maior) * 100}%` }}
              />
            </span>
            <span className="text-right tabular-nums text-foreground">
              {formatarInteiro(caminho.movimentacoes)}
              <span className="ms-1 text-xs text-muted-foreground">
                {formatarInteiro(caminho.animais)} an.
              </span>
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Mostrando os {formatarInteiro(Math.min(caminhos.length, FLUXO_LIMITE))} caminhos mais usados.
        Movimentações e animais são números diferentes: o mesmo animal pode fazer o mesmo caminho
        várias vezes.
      </p>
    </section>
  );
}

function Destinos({ destinos }: { destinos: Destino[] }) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Destinos que mais recebem</h2>
        <p className="text-xs text-muted-foreground">
          Aqui entram todas as movimentações — o destino existe sempre.
        </p>
      </div>

      <ul className="mt-3 flex flex-col divide-y divide-border">
        {destinos.map((destino) => (
          <li key={destino.destino} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="truncate text-foreground">{destino.destino}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {formatarInteiro(destino.movimentacoes)}
              <span className="ms-1 text-xs">
                {destino.fracao === null ? VAZIO : formatarPercentual(destino.fracao)} ·{' '}
                {formatarInteiro(destino.animais)} animais
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rotativos({ animais }: { animais: AnimalMovimentado[] }) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Animais que mais mudaram de lugar</h2>
        <p className="text-xs text-muted-foreground">
          Os {formatarInteiro(Math.min(animais.length, LISTA_LIMITE))} com mais movimentações.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 text-right font-normal">Movimentações</th>
              <th className="py-1.5 pe-3 font-normal">Último destino</th>
              <th className="py-1.5 font-normal">Quando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {animais.map((animal) => (
              <tr key={animal.animal_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">{animal.nome?.trim() || animal.numero}</span>
                  {animal.categoria && (
                    <span className="ms-2 text-xs text-muted-foreground">{animal.categoria}</span>
                  )}
                </td>
                <td className="py-1.5 pe-3 text-right tabular-nums text-foreground">
                  {formatarInteiro(animal.movimentacoes)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{animal.ultimoDestino ?? VAZIO}</td>
                <td className="py-1.5 tabular-nums text-muted-foreground">
                  {animal.ultimaData ? formatarData(animal.ultimaData) : VAZIO}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        Animal com dezenas de movimentações ou é o que a fazenda usa para completar lote — e vive sem
        grupo estável — ou é lançamento repetido. Nos dois casos a lista é o começo da investigação.
      </p>
    </section>
  );
}

function Tabela({
  movs,
  usuarioId,
  sufixo,
}: {
  movs: LinhaMovimentacao[];
  usuarioId: number;
  sufixo: string;
}) {
  return (
    <section className="painel">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base">Movimentações</h2>
        <p className="text-xs text-muted-foreground">
          {formatarInteiro(movs.length)} registros, do mais recente.
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="py-1.5 pe-3 font-normal">Animal</th>
              <th className="py-1.5 pe-3 font-normal">Data</th>
              <th className="py-1.5 pe-3 font-normal">Tipo</th>
              <th className="py-1.5 pe-3 font-normal">De</th>
              <th className="py-1.5 font-normal">Para</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movs.slice(0, 100).map((mov) => (
              <tr key={mov.movimentacao_id}>
                <td className="py-1.5 pe-3">
                  <span className="text-foreground">
                    {mov.nome_animal?.trim() || mov.numero_animal}
                  </span>
                </td>
                <td className="py-1.5 pe-3 tabular-nums text-muted-foreground">
                  {formatarData(mov.data_movimentacao)}
                </td>
                <td className="py-1.5 pe-3 text-muted-foreground">{rotuloDoTipo(mov.tipo)}</td>
                <td className="py-1.5 pe-3 text-muted-foreground">
                  {origemDe(mov) ?? <span className="text-xs">entrada</span>}
                </td>
                <td className="py-1.5 text-foreground">{destinoDe(mov) ?? VAZIO}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
        {movs.length > 100 && <>Mostrando as 100 mais recentes de {formatarInteiro(movs.length)}. </>}
        Para todas as colunas, abra a{' '}
        <Link
          href={`/adm/u/${usuarioId}/tabelas/movimentacoes${sufixo}`}
          className="text-foreground underline underline-offset-4"
        >
          tabela de movimentações
        </Link>
        .
      </p>
    </section>
  );
}
