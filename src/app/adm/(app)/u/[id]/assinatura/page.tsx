import Link from 'next/link';
import { Lock } from 'lucide-react';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { KpiCard } from '@/components/adm/KpiCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  VAZIO,
  formatarData,
  formatarInteiro,
  formatarMoeda,
  formatarVencimento,
} from '@/lib/adm/format';
import { getAssinatura } from '@/lib/adm/queries';
import { ORIGEM_ACESSO_ROTULO, type AssinaturaResumo, type PagamentoLinha } from '@/lib/adm/types';

/**
 * Aba 10 — Assinatura. A cobrança DO SEABRAAPP, não a economia da fazenda (essa
 * é a aba Financeiro, da Fase 2). Confundir as duas é o erro clássico dessa
 * tela em software de agro.
 *
 * TRÊS REGRAS QUE ESTA TELA NÃO PODE DESFAZER, todas já aplicadas na view:
 *
 * 1. `status_efetivo`, JAMAIS `assinaturas.status` cru. O cru não é rebaixado
 *    para 'vencida' sozinho e não enxerga extensão manual — ler ele daria conta
 *    ativa para quem perdeu o acesso há meses.
 * 2. `plano_id_pendente` NUNCA é o plano atual. É upgrade CONTRATADO E NÃO PAGO;
 *    exibi-lo como vigente repete um vazamento já identificado em auditoria.
 *    Aqui ele aparece com esse nome, e separado.
 * 3. O VALOR REAL não é o de tabela. `view_status_assinatura.valor_mensal` é
 *    preço de tabela: ignora desconto de associação, ignora cortesia e trata
 *    plano anual como mensal. Os dois aparecem lado a lado até o Felipe confiar
 *    na troca — e o real vai ser MENOR que o número que o app mostra hoje.
 *
 * SOMENTE LEITURA (D3). Onde caberiam "estender acesso" e "cancelar" há um aviso
 * de Fase 2, e não um botão morto: botão que não faz nada é pior que botão
 * ausente. Quando a escrita entrar, ela vai proxiar a Edge `asaas-admin-actions`
 * — nunca UPDATE direto, senão o Asaas dessincroniza e a cobrança fica sem trilha.
 */

export default async function AssinaturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuarioId = Number(id);

  const res = await getAssinatura(usuarioId);
  if (!res.ok) return <EstadoVazio resultado={res} />;

  const { resumo, pagamentos } = res.dados;
  const semAssinatura = resumo.planoNome === null && resumo.statusEfetivo === null;

  return (
    <div className="flex flex-col gap-8">
      {semAssinatura && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Esta conta não tem assinatura própria. É o normal do colaborador, que acessa o app pela
          assinatura do produtor dono — e é também um dos guard-rails que deixam o health score em
          branco.
        </p>
      )}

      <Cards resumo={resumo} />
      <Detalhes resumo={resumo} />
      <FaseDois />
      <Pagamentos pagamentos={pagamentos} usuarioId={usuarioId} />
    </div>
  );
}

function Cards({ resumo }: { resumo: AssinaturaResumo }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <KpiCard rotulo="Plano atual" valor={resumo.planoNome ?? VAZIO} />
      <KpiCard
        rotulo="Status"
        valor={maiuscula(resumo.statusEfetivo)}
        detalhe="status_efetivo da view, nunca assinaturas.status cru"
      />
      <KpiCard
        rotulo="Acesso"
        valor={resumo.acessoAtivo ? 'Ativo' : 'Sem acesso'}
        detalhe="vencimento no futuro OU extensão manual — não há mais período de graça"
      />
      <KpiCard
        rotulo="Origem do acesso"
        valor={resumo.origemAcesso ? ORIGEM_ACESSO_ROTULO[resumo.origemAcesso] : VAZIO}
        detalhe="os quatro baldes não se sobrepõem"
      />

      <KpiCard
        rotulo="Valor real / mês"
        valor={formatarMoeda(resumo.valorRealMensal)}
        detalhe="normalizado por ciclo, já com desconto"
        destaque
      />
      <KpiCard
        rotulo="Valor de tabela / mês"
        valor={formatarMoeda(resumo.valorTabelaMensal)}
        detalhe="o que o app soma hoje — ignora desconto, cortesia e ciclo anual"
      />
      <KpiCard
        rotulo="Acesso até"
        valor={formatarData(resumo.dataVencimento)}
        detalhe={resumo.diasRestantes === null ? undefined : formatarVencimento(resumo.diasRestantes)}
      />
      <KpiCard rotulo="Ciclo" valor={maiuscula(resumo.ciclo)} detalhe={`início ${formatarData(resumo.dataInicio)}`} />

      <KpiCard rotulo="Total pago" valor={formatarMoeda(resumo.totalPago)} />
      <KpiCard
        rotulo="Em aberto"
        valor={formatarMoeda(resumo.emAberto)}
        detalhe="cobranças emitidas e não confirmadas pelo Asaas"
        destaque={resumo.emAberto > 0}
      />
    </div>
  );
}

function Detalhes({ resumo }: { resumo: AssinaturaResumo }) {
  const avisos: { titulo: string; texto: string }[] = [];

  if (resumo.planoPendenteNome) {
    avisos.push({
      titulo: `Upgrade pendente: ${resumo.planoPendenteNome}`,
      texto:
        'Plano CONTRATADO e ainda NÃO PAGO. Não é o plano vigente e não entra em nenhuma soma de receita — ' +
        'passa a valer só quando a cobrança for confirmada.',
    });
  }
  if (resumo.extensaoManualAte) {
    avisos.push({
      titulo: `Extensão manual até ${formatarData(resumo.extensaoManualAte)}`,
      texto:
        'Acesso concedido à mão, fora do fluxo de cobrança. É acesso sem receita: aparece como ativo ' +
        'no app e não aparece no MRR.',
    });
  }
  if (resumo.descontoAssociacao) {
    avisos.push({
      titulo: 'Desconto de associação aplicado',
      texto: 'O valor real já está com o desconto. O de tabela, não — é a diferença entre as duas colunas acima.',
    });
  }
  if (resumo.origemAcesso === 'cortesia') {
    avisos.push({
      titulo: 'Cortesia',
      texto:
        'Vencimento em data absurda (o padrão adotado é 2099-12-31). É risco de RECEITA, não de churn — ' +
        'no health score a cortesia pontua cheio de propósito.',
    });
  }

  if (avisos.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {avisos.map((aviso) => (
        <div key={aviso.titulo} className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-sm text-foreground">{aviso.titulo}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{aviso.texto}</p>
        </div>
      ))}
    </section>
  );
}

/**
 * O lugar dos botões que ainda não existem. Escrito, e não escondido: sem este
 * bloco, a pergunta "cadê estender acesso?" volta toda semana — e a resposta
 * ("é leitura, por decisão") é parte do desenho, não uma pendência esquecida.
 */
function FaseDois() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card/50 p-4">
      <h2 className="flex items-center gap-2 text-base">
        <Lock size={15} strokeWidth={1.8} aria-hidden />
        Ações de assinatura — Fase 2
      </h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
        Estender acesso, trocar plano, cancelar e reemitir cobrança ficam de fora do MVP por decisão
        (D3): o painel é somente leitura, e a <code>service_role</code> nunca precisa de INSERT,
        UPDATE ou DELETE. Quando entrarem, vão proxiar a Edge Function{' '}
        <code>asaas-admin-actions</code> — jamais UPDATE direto na tabela, senão o Asaas
        dessincroniza e a alteração fica sem trilha de auditoria.
      </p>
    </section>
  );
}

function Pagamentos({ pagamentos, usuarioId }: { pagamentos: PagamentoLinha[]; usuarioId: number }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg">Cobranças</h2>
        <Link
          href={`/adm/u/${usuarioId}/tabelas/pagamentos`}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Abrir com filtros e exportação
        </Link>
      </div>

      {pagamentos.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhuma cobrança registrada. Conta de cortesia, trial nunca convertido ou acesso só por
          extensão manual chegam aqui vazios — e isso é informação, não falha.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Asaas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagamentos.map((p) => (
                <TableRow key={p.id}>
                  {/* `date` puro do Postgres: formatarData fatia o texto em vez de
                      passar por new Date(), que voltaria um dia depois das 21h. */}
                  <TableCell className="tabular-nums">{formatarData(p.data_vencimento)}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatarData(p.data_pagamento)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatarMoeda(p.valor)}</TableCell>
                  <TableCell>{maiuscula(p.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.metodo_pagamento ?? VAZIO}</TableCell>
                  <TableCell className="text-muted-foreground">{p.tipo_cobranca ?? VAZIO}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {p.asaas_payment_id ?? VAZIO}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {formatarInteiro(pagamentos.length)} cobranças, da mais recente para a mais antiga.
      </p>
    </section>
  );
}

/** Os valores de status e ciclo já são palavras em português no banco ('ativa',
 *  'anual'): capitalizar é honesto e não exige um mapa de tradução que
 *  silenciaria um valor novo aparecendo como vazio. */
function maiuscula(valor: string | null | undefined): string {
  if (!valor) return VAZIO;
  return valor.charAt(0).toUpperCase() + valor.slice(1);
}
