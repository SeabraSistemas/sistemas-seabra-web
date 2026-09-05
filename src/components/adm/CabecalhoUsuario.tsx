'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Check, Copy } from 'lucide-react';
import { PapelBadge } from '@/components/adm/PapelBadge';
import { ABAS_CLIENTE } from '@/lib/adm/areas/contrato';
import { SeletorPropriedade } from '@/components/adm/SeletorPropriedade';
import { formatarDiasRelativo, formatarInteiro } from '@/lib/adm/format';
import { faixaDeScore } from '@/lib/adm/metricas';
import type { Escopo, HealthScore } from '@/lib/adm/types';
import { cn } from '@/lib/utils';

/**
 * O cabeçalho fixo da ficha do cliente — quem é, de quem são os dados, e para
 * onde ir.
 *
 * STICKY não é estética. O painel navega entre cinco abas com a mesma cara; o
 * erro mais caro possível aqui é o Felipe olhar o rebanho de um cliente achando
 * que é de outro. O nome e o `#id` ficam colados no topo justamente para que
 * esse engano exija ignorar a tela, não apenas distrair-se.
 *
 * POR QUE 'use client' num bloco que é quase todo texto — duas razões concretas,
 * ambas irredutíveis:
 *  · a aba ativa depende do pathname, e layout do App Router não recebe rota;
 *  · `#11954` é COPIÁVEL (D1). O número do usuário é a identidade do painel e o
 *    que o Felipe cola no WhatsApp, no Asaas e na conversa com o suporte —
 *    copiar à mão um número de 5 dígitos é onde o dígito errado entra.
 *
 * O que este componente NÃO faz: resolver qual propriedade está em foco. Isso é
 * do <SeletorPropriedade>, que lê `?prop=` sozinho. Ver a nota do layout.
 */

/**
 * As abas vêm de ABAS_CLIENTE, em src/lib/adm/areas/contrato.ts — não de uma
 * lista local.
 *
 * Motivo: o dossiê comercial também precisa saber quais áreas existem e quais
 * entram no documento impresso (a flag `noDossie`). Duas listas paralelas
 * divergem na primeira aba nova, e o sintoma é silencioso: a aba existe, a rota
 * responde, e ela simplesmente não aparece na navegação.
 *
 * A ordem é a do desenho — do rebanho para o comercial.
 */
const ABAS = ABAS_CLIENTE.map((aba) => ({
  sufixo: aba.slug === '' ? '' : `/${aba.slug}`,
  rotulo: aba.rotulo,
}));

const CLASSE_FAIXA: Record<HealthScore['faixa'], string> = {
  saudavel: 'border-emerald-900/60 bg-emerald-950/40 text-emerald-300',
  atencao: 'border-amber-900/60 bg-amber-950/40 text-amber-300',
  risco: 'border-red-900/60 bg-red-950/40 text-destructive',
};

const ROTULO_FAIXA: Record<HealthScore['faixa'], string> = {
  saudavel: 'saudável',
  atencao: 'atenção',
  risco: 'risco',
};

export function CabecalhoUsuario({ escopo }: { escopo: Escopo }) {
  const { usuario } = escopo;
  const pathname = usePathname();
  const params = useSearchParams();

  const base = `/adm/u/${usuario.id}`;
  // A propriedade em foco atravessa a troca de aba. Perder o `?prop=` ao clicar
  // em "Rebanho" jogaria o técnico de volta para a carteira consolidada sem ele
  // pedir — e os números mudariam sem explicação.
  const prop = params.get('prop');
  const sufixoUrl = prop ? `?prop=${encodeURIComponent(prop)}` : '';

  return (
    <header className="sticky top-0 z-30 -mx-4 border-b border-border bg-background/95 px-4 pb-0 pt-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl leading-tight">{usuario.nome}</h1>

        <PapelBadge papel={usuario.papel} />
        <NumeroCopiavel id={usuario.id} />
        <Bandeiras escopo={escopo} />

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <Pastilha titulo="Sinal de vida: data do último lançamento em qualquer módulo (D2)">
            {usuario.ultimo_lancamento_em
              ? `Lançou ${formatarDiasRelativo(usuario.dias_sem_lancar)}`
              : 'Nunca lançou'}
          </Pastilha>
          <Saude escopo={escopo} />
        </div>
      </div>

      <div className="mt-2.5">
        <SeletorPropriedade escopo={escopo} />
      </div>

      <nav className="-mb-px mt-3 flex gap-1 overflow-x-auto" aria-label="Seções do cliente">
        {ABAS.map((aba) => {
          const href = `${base}${aba.sufixo}`;
          // Prefixo e não igualdade em `/tabelas`: a página genérica do escape
          // hatch (`/tabelas/rebanho`) é filha dela e precisa manter a aba acesa.
          const ativa = aba.sufixo === '' ? pathname === base : pathname.startsWith(href);
          return (
            <Link
              key={aba.rotulo}
              href={`${href}${sufixoUrl}`}
              aria-current={ativa ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors',
                ativa
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {aba.rotulo}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

/**
 * `#11954` — a identidade primária do painel (D1: `usuarios.id`, e não o
 * `numero_criador` da ABCC/ARCO, que é de outro domínio e pode estar vazio).
 * Clicar copia só o número, sem o `#`: é o que se cola numa busca ou num filtro.
 */
function NumeroCopiavel({ id }: { id: number }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1400);
    } catch {
      // Clipboard exige contexto seguro e permissão. Falhar em silêncio é o
      // certo: o número continua na tela para ser selecionado à mão, e um alerta
      // de erro por um clique de conveniência seria pior que o problema.
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      title="Copiar o número do usuário"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-xs tabular-nums text-muted-foreground transition-colors hover:text-foreground"
    >
      #{id}
      {copiado ? (
        <Check size={12} strokeWidth={2} className="text-primary" aria-hidden />
      ) : (
        <Copy size={12} strokeWidth={1.8} aria-hidden />
      )}
      <span className="sr-only">{copiado ? 'copiado' : 'copiar'}</span>
    </button>
  );
}

/**
 * Health score como pastilha. O número inteiro vem da view (`adm.usuarios_lista`),
 * NUNCA recalculado aqui: é ele que ordena a lista mestra, e um segundo cálculo
 * no cliente faria a pastilha discordar da ordenação que trouxe o Felipe até
 * aqui. A explicação dos 5 componentes fica na aba Visão geral.
 *
 * Score nulo não é zero — é "não dá para pontuar ainda", e a pastilha diz por quê:
 * os guard-rails da view são conta com menos de 14 dias, sem animal vivo, ou sem
 * assinatura própria (o colaborador herda o acesso do produtor).
 */
function Saude({ escopo }: { escopo: Escopo }) {
  const { usuario } = escopo;

  if (usuario.health_score === null) {
    const motivo =
      usuario.animais_ativos === 0
        ? 'sem rebanho'
        : usuario.status_efetivo === null
          ? 'sem assinatura própria'
          : 'conta com menos de 14 dias';
    return <Pastilha titulo={`Sem health score — ${motivo}`}>Sem score · {motivo}</Pastilha>;
  }

  const faixa = faixaDeScore(usuario.health_score);
  return (
    <span
      title="Health score 0-100 — risco de churn. Detalhamento na aba Visão geral."
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        CLASSE_FAIXA[faixa],
      )}
    >
      <span className="tabular-nums">{formatarInteiro(usuario.health_score)}</span>
      <span className="opacity-80">{ROTULO_FAIXA[faixa]}</span>
    </span>
  );
}

/**
 * As bandeiras que mudam a leitura de TODOS os números da ficha. `is_tester` e
 * `is_demo` são o caso claro: sem elas, uma conta de teste com 4 animais entra
 * na carteira como cliente pequeno e some dentro da média.
 */
function Bandeiras({ escopo }: { escopo: Escopo }) {
  const { usuario } = escopo;
  const itens: { rotulo: string; titulo: string }[] = [];

  if (!usuario.ativo) itens.push({ rotulo: 'Inativo', titulo: 'usuarios.ativo = false' });
  if (usuario.is_tester) itens.push({ rotulo: 'Tester', titulo: 'Conta de teste — fora das médias da carteira' });
  if (usuario.is_demo) itens.push({ rotulo: 'Demo', titulo: 'Conta de demonstração comercial' });
  if (usuario.sem_auth) {
    itens.push({ rotulo: 'Sem login', titulo: 'usuarios.uuid nulo: não entra pelo Supabase Auth' });
  }
  if (!usuario.onboarding_finalizado) {
    itens.push({ rotulo: 'Onboarding aberto', titulo: 'Cadastro nunca foi concluído no app' });
  }

  if (itens.length === 0) return null;

  return (
    <span className="flex flex-wrap items-center gap-1">
      {itens.map((item) => (
        <span
          key={item.rotulo}
          title={item.titulo}
          className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
        >
          {item.rotulo}
        </span>
      ))}
    </span>
  );
}

function Pastilha({ children, titulo }: { children: React.ReactNode; titulo?: string }) {
  return (
    <span
      title={titulo}
      className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
    >
      {children}
    </span>
  );
}
