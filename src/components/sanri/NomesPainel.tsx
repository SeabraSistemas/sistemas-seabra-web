'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SEXOS,
  anoDe,
  anosDoSeletor,
  letraDoAno,
  nomeCompleto,
  problemaDoNome,
  resumir,
  separarNomes,
  type ConfigNomes,
  type CriaSemNome,
  type NomeLista,
  type Sexo,
} from '@/lib/sanri/nomes';
import { cn } from '@/lib/utils';
import { Aviso, PainelBotao, PainelCampo } from './Controles';
import { EstadoApp } from './EstadoApp';

/** "2026-10-15" -> "15/10/2026". */
function diaBR(data: string | null): string {
  if (!data) return '—';
  const [a, m, d] = data.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

async function chamar(metodo: 'POST' | 'PATCH' | 'DELETE', corpo: unknown): Promise<{ ok: boolean; dados: Record<string, unknown> }> {
  const res = await fetch('/sanri/api/nomes', { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  const dados = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, dados };
}

/** Botão "i": a explicação mora aqui, não solta na tela. */
function Info({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-expanded={aberto}
        aria-label="Como funciona"
        onClick={() => setAberto(!aberto)}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-xs font-bold italic text-ink-1 hover:bg-paper-2"
      >
        i
      </button>
      {aberto && <div className="basis-full rounded-campo bg-paper-2 px-3 py-2 text-sm text-ink-1">{children}</div>}
    </>
  );
}

// ---------------------------------------------------------------- um nome livre

function LinhaLivre({ item, ano, config, proximo }: { item: NomeLista; ano: number; config: ConfigNomes; proximo: boolean }) {
  const router = useRouter();
  const [modo, setModo] = useState<'ver' | 'editar' | 'excluir'>('ver');
  const [texto, setTexto] = useState(item.nome);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const problema = modo === 'editar' ? problemaDoNome(texto, ano, config) : null;

  async function salvar() {
    if (problema) return;
    setOcupado(true);
    setErro(null);
    const r = await chamar('PATCH', { id: item.id, nome: texto });
    setOcupado(false);
    if (!r.ok) return setErro(`Não salvou: ${String(r.dados.erro ?? 'tente de novo')}.`);
    setModo('ver');
    router.refresh();
  }

  async function apagar() {
    setOcupado(true);
    setErro(null);
    const r = await chamar('DELETE', { id: item.id });
    setOcupado(false);
    if (!r.ok) return setErro(`Não excluiu: ${String(r.dados.erro ?? 'tente de novo')}.`);
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-2 border-t border-rule py-2 first:border-t-0">
      {modo === 'editar' ? (
        <div className="flex flex-wrap items-center gap-2">
          <PainelCampo
            autoFocus
            aria-label={`Novo nome no lugar de ${item.nome}`}
            value={texto}
            onChange={(e) => setTexto(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && salvar()}
            className="h-9 max-w-48 flex-1"
          />
          <PainelBotao variante="pequeno" onClick={salvar} disabled={ocupado || problema != null}>
            {ocupado ? 'Salvando…' : 'Salvar'}
          </PainelBotao>
          <PainelBotao variante="discreto" onClick={() => (setModo('ver'), setTexto(item.nome), setErro(null))} disabled={ocupado}>
            Cancelar
          </PainelBotao>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-ink">{item.nome}</span>
            {proximo && <span className="shrink-0 rounded-pill bg-sage-100 px-2 py-0.5 text-xs font-medium text-sage">próximo</span>}
          </span>
          {modo === 'excluir' ? (
            <span className="flex shrink-0 items-center gap-1">
              <span className="text-xs text-ink-1">Excluir?</span>
              <PainelBotao variante="perigo" onClick={apagar} disabled={ocupado}>
                {ocupado ? 'Excluindo…' : 'Sim'}
              </PainelBotao>
              <PainelBotao variante="discreto" onClick={() => setModo('ver')} disabled={ocupado}>
                Não
              </PainelBotao>
            </span>
          ) : (
            <span className="flex shrink-0 gap-1">
              <PainelBotao variante="discreto" onClick={() => setModo('editar')}>
                Editar
              </PainelBotao>
              <PainelBotao variante="perigo" onClick={() => setModo('excluir')}>
                Excluir
              </PainelBotao>
            </span>
          )}
        </div>
      )}
      {problema && texto.trim() !== '' && <p className="text-xs text-erro">{problema}</p>}
      {erro && <Aviso tom="erro">{erro}</Aviso>}
    </li>
  );
}

// ---------------------------------------------------------------- acrescentar

function Acrescentar({ ano, sexo, config, plural }: { ano: number; sexo: Sexo; config: ConfigNomes; plural: string }) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tom: 'ok' | 'aviso' | 'erro'; texto: string } | null>(null);

  const nomes = separarNomes(texto);
  const problemas = nomes.map((n) => ({ nome: n, motivo: problemaDoNome(n, ano, config) })).filter((p) => p.motivo != null);

  async function enviar() {
    if (nomes.length === 0 || problemas.length > 0) return;
    setEnviando(true);
    setResultado(null);
    const r = await chamar('POST', { ano, sexo, texto });
    setEnviando(false);
    if (!r.ok) return setResultado({ tom: 'erro', texto: `Não gravou: ${String(r.dados.erro ?? 'tente de novo')}.` });

    const acrescentados = (r.dados.acrescentados as string[]) ?? [];
    const recusados = (r.dados.recusados as { nome: string; motivo: string }[]) ?? [];
    const nomeadas = Number(r.dados.nomeadas) || 0;
    const partes = [`${acrescentados.length} ${acrescentados.length === 1 ? 'nome acrescentado' : 'nomes acrescentados'}`];
    if (nomeadas > 0) partes.push(`${nomeadas} ${nomeadas === 1 ? 'cria sem nome recebeu' : 'crias sem nome receberam'} nome`);
    if (recusados.length > 0) partes.push(`não entraram: ${recusados.map((x) => `${x.nome} (${x.motivo})`).join(', ')}`);
    setResultado({ tom: recusados.length > 0 ? 'aviso' : 'ok', texto: `${partes.join(' · ')}.` });
    // Mantém no campo só o que foi recusado, para corrigir e reenviar.
    setTexto(recusados.map((x) => x.nome).join('\n'));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink-1">Acrescentar {plural.toLowerCase()}</span>
        <textarea
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={`Um por linha — ${letraDoAno(ano, config)}…`}
          className="w-full min-w-0 rounded-campo border border-rule-strong bg-paper px-3 py-2 text-base uppercase text-ink placeholder:normal-case placeholder:text-ink-2"
        />
      </label>
      {problemas.length > 0 && (
        <Aviso tom="erro">
          {problemas.map((p) => (
            <span key={p.nome} className="block">
              {p.nome}: {p.motivo}
            </span>
          ))}
        </Aviso>
      )}
      <PainelBotao onClick={enviar} disabled={enviando || nomes.length === 0 || problemas.length > 0} className="self-start">
        {enviando ? 'Gravando…' : nomes.length > 1 ? `Acrescentar ${nomes.length}` : 'Acrescentar'}
      </PainelBotao>
      {resultado && <Aviso tom={resultado.tom}>{resultado.texto}</Aviso>}
    </div>
  );
}

// ---------------------------------------------------------------- coluna de um sexo

function ColunaSexo({
  ano,
  sexo,
  plural,
  nomes,
  config,
  semNome,
}: {
  ano: number;
  sexo: Sexo;
  plural: string;
  nomes: NomeLista[];
  config: ConfigNomes;
  semNome: CriaSemNome[];
}) {
  const { livres, usados, proximo } = useMemo(() => resumir(nomes, ano, sexo), [nomes, ano, sexo]);

  return (
    <section aria-label={plural} className="flex flex-col gap-4 rounded-card border border-rule bg-paper p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xl font-bold text-ink">{plural}</h3>
        <span className="text-sm text-ink-2">
          {livres.length} {livres.length === 1 ? 'livre' : 'livres'} · {usados.length} {usados.length === 1 ? 'dado' : 'dados'}
        </span>
      </div>

      {semNome.length > 0 && (
        <Aviso tom="erro">
          {semNome.length} {semNome.length === 1 ? 'cria' : 'crias'} sem nome: {semNome.map((c) => c.numero ?? `#${c.id}`).join(', ')}
        </Aviso>
      )}
      {livres.length === 0 && semNome.length === 0 && <Aviso tom="aviso">Lista vazia — a próxima cria fica sem nome.</Aviso>}
      {proximo && (
        <p className="text-sm text-ink-1">
          Próxima cria: <span className="font-semibold text-ink">{nomeCompleto(proximo.nome, config.sufixo)}</span>
        </p>
      )}

      <Acrescentar ano={ano} sexo={sexo} config={config} plural={plural} />

      {livres.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-ink-1">Livres</h4>
          <ul>
            {livres.map((n) => (
              <LinhaLivre key={n.id} item={n} ano={ano} config={config} proximo={n.id === proximo?.id} />
            ))}
          </ul>
        </div>
      )}

      {usados.length > 0 && (
        <details open={livres.length === 0}>
          <summary className="cursor-pointer text-sm font-semibold text-ink-1">Já dados ({usados.length})</summary>
          <ul className="mt-1">
            {usados.map((n) => (
              <li key={n.id} className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-rule py-2 text-sm first:border-t-0">
                <span className="font-semibold text-ink">{n.animal?.nome ?? n.nome}</span>
                <span className="text-xs text-ink-2">
                  nº {n.animal?.numero ?? '—'} · {diaBR(n.animal?.nascimento ?? null)}
                  {n.animal && !n.animal.ativo ? ' · inativo' : ''}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

// ---------------------------------------------------------------- página

export function NomesPainel({
  configurado,
  ok,
  carregadoEm,
  config,
  nomes,
  semNome,
  anoAtual,
}: {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  config: ConfigNomes | null;
  nomes: NomeLista[];
  semNome: CriaSemNome[];
  anoAtual: number;
}) {
  const anos = useMemo(() => (config ? anosDoSeletor(nomes, anoAtual, config) : []), [nomes, anoAtual, config]);
  const [ano, setAno] = useState(() => Math.max(anoAtual, config?.anoBase ?? anoAtual));

  if (!config) {
    return (
      <div className="flex flex-col gap-5">
        <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />
        {configurado && ok && <Aviso tom="aviso">O nome automático está desligado para a fazenda no banco do app.</Aviso>}
      </div>
    );
  }

  const semNomeDoAno = semNome.filter((c) => anoDe(c.nascimento) === ano);
  const semNomeForaDaLista = semNome.filter((c) => !anos.includes(anoDe(c.nascimento)));

  return (
    <div className="flex flex-col gap-5">
      <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ink">Nomes das crias</h2>
        <Info>
          A cria lançada no app sem nome recebe o primeiro nome livre, em ordem alfabética, da lista do ano em que nasceu e do
          sexo dela, com {config.sufixo ? `"${config.sufixo}"` : 'o sufixo'} no fim. Cada ano tem uma letra. Nome já dado não muda nem sai
          da lista. Se a lista acabar, a cria fica sem nome e recebe assim que você acrescentar mais.
        </Info>
      </div>

      <div role="group" aria-label="Ano" className="flex flex-wrap gap-1.5">
        {anos.map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={ano === a}
            onClick={() => setAno(a)}
            className={cn(
              'rounded-pill border px-4 py-1.5 text-sm font-medium transition-colors',
              ano === a ? 'border-ink bg-ink text-paper' : 'border-rule-strong bg-paper text-ink-1 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {a} · {letraDoAno(a, config)}
          </button>
        ))}
      </div>

      {semNomeForaDaLista.length > 0 && (
        <Aviso tom="aviso">
          Sem nome, de ano sem lista: {semNomeForaDaLista.map((c) => `${c.numero ?? `#${c.id}`} (${diaBR(c.nascimento)})`).join(', ')}
        </Aviso>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {SEXOS.map((s) => (
          <ColunaSexo
            key={s.chave}
            ano={ano}
            sexo={s.chave}
            plural={s.plural}
            nomes={nomes}
            config={config}
            semNome={semNomeDoAno.filter((c) => c.sexo === s.chave)}
          />
        ))}
      </div>
    </div>
  );
}
