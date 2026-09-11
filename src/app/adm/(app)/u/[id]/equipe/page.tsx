import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, Minus } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import { PapelBadge } from '@/components/adm/PapelBadge';
import { TabelaGenerica } from '@/components/adm/TabelaGenerica';
import { Badge } from '@/components/ui/badge';
import {
  consolidarEquipes,
  getEquipe,
  resumirPermissoes,
  PERMISSAO_SEMPRE_BLOQUEADA,
  PERMISSOES_COLABORADOR,
  type Equipe,
  type PessoaEquipe,
} from '@/lib/adm/areas/equipe';
import { idsDoEscopo, lerSelecaoParam, rotuloDeVinculo, type SelecaoPropriedade } from '@/lib/adm/escopo';
import { VAZIO, formatarDataRelativa, formatarInteiro } from '@/lib/adm/format';
import { contagemAproximada, getEscopo, listarTabela } from '@/lib/adm/queries';
import { chaveRota, getRegistro, listarRegistros, parseColunasParam } from '@/lib/adm/tabelas';
import { cn } from '@/lib/utils';

/**
 * Aba 11 — Equipe. Quem mais mexe nesta conta: o dono, os colaboradores dele e
 * os técnicos que entram de fora.
 *
 * Irmã de Rebanho e Produção no formato — cards em cima, o conteúdo curado no
 * meio, <TabelaGenerica> embaixo com o preset da área —, mas o meio aqui não é
 * gráfico: é a LISTA DE PESSOAS com as permissões de cada uma. Distribuição de
 * permissão não vira barra: ninguém pergunta "quantos por cento do menu está
 * liberado", perguntam "este funcionário consegue lançar venda?".
 *
 * A TABELA DE BAIXO É `tecnico_propriedades`, E NÃO `usuarios` — e o motivo é
 * estrutural, não estético. No catálogo, `usuarios` declara `colunaTenant:
 * 'usuario_id'`, então `listarTabela()` a amarra em `escopo.usuario.id`: a grade
 * viria com exatamente uma linha, a do próprio usuário aberto. Seria uma tabela
 * de equipe mostrando uma pessoa só, sem erro nenhum na tela. Os vínculos de
 * consultoria, esses sim, são por `propriedade_id` e casam com o escopo. A
 * lista de pessoas acima cobre o resto, vinda da view.
 *
 * SOMENTE LEITURA (D3): permissão se mexe no app, e é lá que ela deve continuar
 * sendo mexida enquanto a trilha de auditoria do /adm só souber registrar leitura.
 */

const TABELA = 'tecnico_propriedades';

/**
 * Teto do consolidado — a mesma regra das abas irmãs. Cada propriedade custa uma
 * leitura da view de equipe, e o admin geral alcança todas as 31. Acima disso a
 * aba pede uma escolha; a tabela abaixo continua valendo, porque ela é UMA
 * consulta com `IN (ids)` seja qual for o tamanho do escopo.
 */
const TETO_CONSOLIDADO = 15;

export default async function EquipePage({
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
  const agora = new Date();

  const registro = getRegistro(TABELA);
  if (!registro) notFound();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  // ALLOWLIST antes de qualquer coisa: `?cols=` é texto de fora e só vira
  // projeção depois de passar pelo catálogo.
  const { colunas, rejeitadas } = parseColunasParam(registro, sp.cols);
  // Orçamento de células, não de linhas — é o payload RSC que trava a aba.
  const limite = Math.max(100, Math.min(1000, Math.floor(24_000 / Math.max(colunas.length, 1))));

  const alvos = escopo.selecionada ? [escopo.selecionada] : escopo.propriedades;
  const excedeConsolidado = alvos.length > TETO_CONSOLIDADO;
  const [equipesRes, tabelaRes] = await Promise.all([
    excedeConsolidado ? Promise.resolve([]) : Promise.all(alvos.map((p) => getEquipe(p.id))),
    listarTabela(registro, escopo, { colunas, limite, contarTotal: true }),
  ]);

  const equipes = equipesRes.flatMap((r) => (r.ok ? [r.dados] : []));
  const falhas = equipesRes.filter((r) => !r.ok).length;
  const equipe = equipes.length > 0 ? consolidarEquipes(equipes) : null;
  const consolidado = alvos.length > 1;

  return (
    <div className="flex flex-col gap-6">
      {excedeConsolidado && (
        <p className="painel text-sm text-muted-foreground">
          Este usuário alcança {formatarInteiro(escopo.propriedades.length)} propriedades — acima do
          teto de {TETO_CONSOLIDADO} para somar a equipe numa tela só. Escolha uma fazenda no seletor
          acima. A tabela de vínculos abaixo continua cobrindo o escopo inteiro.
        </p>
      )}

      {alvos.length === 0 && (
        <p className="painel text-sm text-muted-foreground">
          Sem propriedade no escopo — não há equipe para mostrar. Equipe é sempre de uma fazenda:
          colaborador pertence a uma, e consultor se liga a uma.
        </p>
      )}

      {falhas > 0 && (
        <p className="text-sm text-destructive">
          {formatarInteiro(falhas)} de {formatarInteiro(alvos.length)} propriedades não carregaram —
          os números abaixo são só das que responderam.
        </p>
      )}

      {equipe && <Cards equipe={equipe} consolidado={consolidado} agora={agora} />}
      {equipe && <Pessoas equipe={equipe} consolidado={consolidado} agora={agora} />}

      <OutrasTabelas usuarioId={usuarioId} selecao={selecao} />

      <TabelaGenerica
        tabela={chaveRota(registro)}
        linhas={tabelaRes.ok ? tabelaRes.dados.linhas : []}
        total={tabelaRes.ok ? tabelaRes.dados.total : 0}
        colunas={colunas}
        rejeitadas={rejeitadas}
        usuarioId={usuarioId}
        agora={agora.toISOString()}
        aproximado={contagemAproximada(registro)}
        erro={tabelaRes.ok ? null : tabelaRes.detalhe}
        escopoVazio={idsDoEscopo(escopo).length === 0}
        titulo="Vínculos de consultoria"
        descricao={registro.descricao}
        hrefCompleto={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${selecao == null ? '' : `?prop=${selecao}`}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Cards
// ─────────────────────────────────────────────────────────────────────────────

/** A recência mais recente entre as pessoas. Texto ISO comparado como texto: os
 *  dois vêm do mesmo timestamptz, no mesmo formato. */
function ultimaAtribuicao(pessoas: PessoaEquipe[]): string | null {
  let maior: string | null = null;
  for (const p of pessoas) {
    if (p.ultimoLancamentoEm !== null && (maior === null || p.ultimoLancamentoEm > maior)) {
      maior = p.ultimoLancamentoEm;
    }
  }
  return maior;
}

function Cards({ equipe, consolidado, agora }: { equipe: Equipe; consolidado: boolean; agora: Date }) {
  const resumos = equipe.pessoas.map((p) => resumirPermissoes(p));
  const restritos = resumos.filter((r) => r.modo === 'restrito').length;
  const tudoLiberado = resumos.filter((r) => r.modo === 'tudo').length;
  const inativos = Math.max(0, equipe.colaboradores - equipe.colaboradoresAtivos);
  const ultimo = ultimaAtribuicao(equipe.pessoas);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard
        rotulo="Pessoas com acesso"
        valor={formatarInteiro(equipe.pessoas.length)}
        detalhe={consolidado ? 'pessoas distintas, não vínculos' : 'dono, colaboradores e consultores'}
      />
      <KpiCard rotulo="Colaboradores" valor={formatarInteiro(equipe.colaboradores)} />
      <KpiCard
        rotulo="Colaboradores ativos"
        valor={formatarInteiro(equipe.colaboradoresAtivos)}
        detalhe={
          inativos > 0
            ? `${formatarInteiro(inativos)} inativo${inativos === 1 ? '' : 's'} — sem login, dados preservados`
            : 'ativo nulo é conta legada, e legada está ativa'
        }
      />
      <KpiCard
        rotulo="Técnicos vinculados"
        valor={formatarInteiro(equipe.tecnicosVinculados)}
        detalhe={
          consolidado
            ? 'vínculos ativos — o mesmo consultor conta uma vez por fazenda'
            : "tecnico_propriedades com status 'ativo'"
        }
      />

      <KpiCard
        rotulo="Visitas técnicas (12m)"
        valor={formatarInteiro(equipe.visitas12m)}
        detalhe="fluxo grátis, em que o produtor convida — não é consultoria"
      />
      <KpiCard
        rotulo="Colaboradores restritos"
        valor={formatarInteiro(restritos)}
        detalhe={`com lista marcada, de ${formatarInteiro(PERMISSOES_COLABORADOR.length)} itens de menu`}
      />
      <KpiCard
        rotulo="Colaboradores com tudo"
        valor={formatarInteiro(tudoLiberado)}
        detalhe="lista vazia ou nunca configurada — no app isso é acesso total"
      />
      <KpiCard
        rotulo="Último lançamento atribuído"
        valor={ultimo === null ? VAZIO : formatarDataRelativa(ultimo, agora)}
        detalhe="só cadastro de animal e movimentação guardam autor"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// A lista de pessoas
// ─────────────────────────────────────────────────────────────────────────────

function Pessoas({ equipe, consolidado, agora }: { equipe: Equipe; consolidado: boolean; agora: Date }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Pessoas com acesso a esta conta</h2>
        <p className="max-w-2xl text-xs text-muted-foreground">
          Vem de <code>adm.propriedades_escopo</code>, a mesma fonte do seletor de propriedade — não
          há uma segunda definição de vínculo neste painel. O admin geral fica de fora de propósito:
          ele alcança todas as fazendas e apareceria como membro da equipe de todos os clientes.
        </p>
      </div>

      {equipe.pessoas.length === 0 ? (
        <EstadoVazio
          titulo="Ninguém além do dono"
          texto="Nenhum colaborador cadastrado e nenhum técnico vinculado. É o retrato de quem opera o app sozinho — e, comercialmente, de um plano que ainda não precisou de mais assentos."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {equipe.pessoas.map((pessoa) => (
            <Pessoa key={pessoa.usuarioId} pessoa={pessoa} consolidado={consolidado} agora={agora} />
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        <strong className="font-medium text-foreground">Último lançamento por pessoa é parcial.</strong>{' '}
        Só <code>rebanho</code> e <code>movimentacoes</code> guardam quem criou a linha; manejo,
        pesagem, controle leiteiro e produção diária não guardam autor nenhum. Um traço aqui significa
        &ldquo;não dá para atribuir&rdquo;, nunca &ldquo;esta pessoa não trabalha&rdquo; — a recência da conta
        continua sendo a da aba Visão geral, que soma as oito tabelas de trabalho diário.
      </p>
    </section>
  );
}

function Pessoa({
  pessoa,
  consolidado,
  agora,
}: {
  pessoa: PessoaEquipe;
  consolidado: boolean;
  agora: Date;
}) {
  return (
    <li className="painel">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Link
          href={`/adm/u/${pessoa.usuarioId}`}
          className="text-base text-foreground underline-offset-4 hover:underline"
        >
          {pessoa.nome}
        </Link>
        <span className="font-mono text-xs text-muted-foreground">#{pessoa.usuarioId}</span>
        <PapelBadge papel={pessoa.papel} />
        <Badge variant="outline" className="border-border text-muted-foreground">
          {rotuloDeVinculo(pessoa.vinculo)}
        </Badge>
        {!pessoa.ativo && (
          <Badge
            variant="outline"
            className="border-destructive/40 text-destructive"
            title="usuarios.ativo = false: o app barra o login e preserva os dados"
          >
            Inativo
          </Badge>
        )}
        {consolidado && pessoa.propriedades > 1 && (
          <Badge variant="outline" className="border-border text-muted-foreground">
            {formatarInteiro(pessoa.propriedades)} fazendas
          </Badge>
        )}

        <span className="ms-auto text-sm text-muted-foreground">
          {pessoa.ultimoLancamentoEm === null ? (
            <span title="Nenhum cadastro de animal nem movimentação criados por esta pessoa — as demais tabelas não guardam autor">
              lançamento atribuído: {VAZIO}
            </span>
          ) : (
            <>lançou {formatarDataRelativa(pessoa.ultimoLancamentoEm, agora)}</>
          )}
        </span>
      </div>

      <Permissoes pessoa={pessoa} />
    </li>
  );
}

/**
 * O bloco de permissões — a parte da aba que existe para não mentir.
 *
 * `colaborador_permissoes` NULL ou vazio significa TUDO LIBERADO. Renderizar o
 * array cru diria "sem permissões", que lê exatamente como o oposto; por isso
 * `resumirPermissoes()` decide o texto e esta função só desenha. Ver o cabeçalho
 * de src/lib/adm/areas/equipe.ts.
 */
function Permissoes({ pessoa }: { pessoa: PessoaEquipe }) {
  const resumo = resumirPermissoes(pessoa);

  if (resumo.modo === 'nao-se-aplica') {
    return (
      <p className="mt-2 text-sm text-muted-foreground">
        Permissões por menu só existem para colaborador — quem tem outro papel não passa por essa
        trava.
        {pessoa.papel === 'tecnico' &&
          ' O consultor lança o módulo inteiro, menos financeiro, assistente de IA, fotos de animal e colaboradores, que ficam ocultos para ele por decisão de produto.'}
      </p>
    );
  }

  if (resumo.modo === 'tudo') {
    return (
      <div className="mt-3 rounded-xl border border-emerald-900/60 bg-emerald-950/30 px-3 py-2">
        <p className="text-sm text-emerald-300">
          Tudo liberado — acesso aos {formatarInteiro(PERMISSOES_COLABORADOR.length)} itens do menu.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {resumo.motivo === 'nunca-configurado'
            ? 'A lista de permissões está NULA: nunca passou pela tela de permissões do app, e o app trata isso como acesso total.'
            : 'A lista está gravada e VAZIA: alguém abriu a tela de permissões e salvou sem marcar nada — o app trata como acesso total, que é quase certamente o contrário da intenção.'}{' '}
          {PERMISSAO_SEMPRE_BLOQUEADA}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">
        {formatarInteiro(resumo.liberadas.length)} de{' '}
        {formatarInteiro(PERMISSOES_COLABORADOR.length)} itens do menu liberados.
      </p>

      <ul className="flex flex-wrap gap-1.5">
        {PERMISSOES_COLABORADOR.map((permissao) => {
          const liberada = resumo.liberadas.some((p) => p.chave === permissao.chave);
          return (
            <li key={permissao.chave}>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs',
                  liberada
                    ? 'border-emerald-900/60 bg-emerald-950/40 text-emerald-300'
                    : 'border-border bg-secondary text-muted-foreground line-through decoration-muted-foreground/50',
                )}
                title={liberada ? `${permissao.chave}: liberado` : `${permissao.chave}: bloqueado`}
              >
                {liberada ? (
                  <Check className="size-3" aria-hidden />
                ) : (
                  <Minus className="size-3" aria-hidden />
                )}
                {permissao.rotulo}
              </span>
            </li>
          );
        })}
      </ul>

      {resumo.desconhecidas.length > 0 && (
        <p className="text-xs text-amber-300">
          Chaves gravadas que este painel não conhece:{' '}
          <code>{resumo.desconhecidas.join(', ')}</code>. Provavelmente um menu novo do app — a
          pessoa TEM essa permissão, e o catálogo em <code>src/lib/adm/areas/equipe.ts</code> precisa
          ganhar a chave para o rótulo aparecer.
        </p>
      )}

      <p className="text-xs text-muted-foreground">{PERMISSAO_SEMPRE_BLOQUEADA}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

/** Atalhos para as outras tabelas da área, no escape hatch. É o que impede a aba
 *  curada de virar um beco: o que ela não mostra continua a um clique. */
function OutrasTabelas({ usuarioId, selecao }: { usuarioId: number; selecao: SelecaoPropriedade }) {
  const sufixo = selecao == null ? '' : `?prop=${selecao}`;
  const registros = listarRegistros().filter((r) => r.area === 'Conta' && r.nome !== TABELA);

  return (
    <section className="painel">
      <h2 className="text-base">Outras tabelas da conta</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Mesma grade, outro registro do catálogo. Em <strong className="font-medium">Usuários</strong> o
        escopo é a própria conta aberta — é a ficha crua dela, com e-mail e WhatsApp sem máscara, e por
        isso abrir entra na trilha de auditoria.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {registros.map((registro) => (
          <li key={chaveRota(registro)}>
            <Link
              href={`/adm/u/${usuarioId}/tabelas/${chaveRota(registro)}${sufixo}`}
              title={registro.descricao}
              className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {registro.rotulo}
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        <code>visitas_tecnicas</code> — a origem do card de visitas — ainda não está no catálogo, então
        não tem grade própria. É a única fonte desta aba sem caminho de volta para as linhas.
      </p>
    </section>
  );
}
