'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  QUANDO_CHEGA,
  ROTULO_SITUACAO,
  ROTULO_TIPO,
  TIPOS_AVISO,
  linkWhatsapp,
  situacaoDoEnvio,
  type EnvioAviso,
  type TextosAviso,
  type TipoAviso,
} from '@/lib/sanri/avisos';
import { cn } from '@/lib/utils';
import { Aviso, botao, PainelBotao } from './Controles';
import { EstadoApp } from './EstadoApp';
import { Info } from './Info';

/** "2026-10-15" -> "15/10/2026". */
function diaBR(data: string): string {
  const [a, m, d] = data.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

function horaBR(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

/** Uma mensagem: o texto como vai ao grupo, com Copiar e Abrir no WhatsApp. */
function CartaoMensagem({ tipo, texto, qtd }: { tipo: TipoAviso; texto: string | null; qtd: number }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!texto) return;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <section aria-label={ROTULO_TIPO[tipo]} className="flex flex-col gap-3 rounded-card border border-rule bg-paper p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-ink">{ROTULO_TIPO[tipo]}</h3>
        <span className="text-sm text-ink-2">
          {qtd} {qtd === 1 ? 'animal' : 'animais'}
        </span>
      </div>
      <p className="-mt-2 text-xs font-medium text-ink-2">{QUANDO_CHEGA[tipo]}</p>
      {texto ? (
        <>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-campo bg-ink px-4 py-3 font-mono text-sm leading-relaxed text-sage-100">
            {texto}
          </pre>
          <div className="flex flex-wrap gap-2">
            <PainelBotao onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</PainelBotao>
            <a href={linkWhatsapp(texto)} target="_blank" rel="noopener noreferrer" className={botao.contorno}>
              Abrir no WhatsApp
            </a>
          </div>
        </>
      ) : (
        <p className="text-sm text-ink-2">{tipo === 'controle' ? 'Sem controle leiteiro neste dia.' : 'Sem pesagem neste dia.'}</p>
      )}
    </section>
  );
}

function Envios({ envios }: { envios: EnvioAviso[] }) {
  if (envios.length === 0) return <p className="text-sm text-ink-2">Nenhum envio ainda.</p>;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-ink-2">
          <th className="py-1 font-medium">Dia</th>
          <th className="py-1 font-medium">Aviso</th>
          <th className="py-1 font-medium">Hora</th>
          <th className="py-1 font-medium">Situação</th>
        </tr>
      </thead>
      <tbody>
        {envios.map((e) => {
          const s = situacaoDoEnvio(e);
          return (
            <tr key={`${e.data}-${e.tipo}`} className="border-t border-rule">
              <td className="py-2 pr-2">{diaBR(e.data)}</td>
              <td className="py-2 pr-2">{ROTULO_TIPO[e.tipo]}</td>
              <td className="py-2 pr-2">{horaBR(e.enviadoEm)}</td>
              <td className={cn('py-2 font-semibold', s === 'enviado' ? 'text-sage' : s === 'falhou' ? 'text-erro' : 'text-aviso')}>
                {ROTULO_SITUACAO[s]}
                {e.tentativas > 1 ? ` (${e.tentativas}ª tentativa)` : ''}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function AvisosPainel({
  configurado,
  ok,
  carregadoEm,
  textos,
  grupo,
  envios,
  data,
  hoje,
}: {
  configurado: boolean;
  ok: boolean;
  carregadoEm: number | null;
  textos: TextosAviso | null;
  grupo: { nome: string | null; ativo: boolean } | null;
  envios: EnvioAviso[];
  data: string;
  hoje: string;
}) {
  const router = useRouter();

  function irPara(nova: string) {
    if (!nova) return;
    router.push(nova === hoje ? '/sanri/avisos' : `/sanri/avisos?data=${nova}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <EstadoApp configurado={configurado} ok={ok} carregadoEm={carregadoEm} />

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-ink">Avisos do dia</h2>
        <Info>
          O robô da Seabra manda estas mensagens no grupo, com os dados lançados no app: manejos todo dia às 6h; diagnóstico de
          gestação ({textos?.dgDiasMin ?? 60} a 155 dias de cobertura, sem DG nela) e partos da semana na segunda às 6h; controle
          leiteiro e pesagem às 20h dos dias em que houve — até 15 animais vai a lista de cada um, acima disso o resumo por baia. Se
          o envio falhar, ele tenta de novo por 2 horas. Aqui dá para ver as mensagens de qualquer dia e mandar à mão.
        </Info>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-ink-1">Dia</span>
          <input
            type="date"
            value={data}
            onChange={(e) => irPara(e.target.value)}
            className="h-11 rounded-campo border border-rule-strong bg-paper px-3 text-base text-ink"
          />
        </label>
        {data !== hoje && (
          <PainelBotao variante="discreto" onClick={() => irPara(hoje)}>
            Voltar para hoje
          </PainelBotao>
        )}
      </div>

      {!grupo ? (
        <Aviso tom="aviso">O robô ainda não está no grupo da Sanri — nada sai sozinho até ele entrar.</Aviso>
      ) : !grupo.ativo ? (
        <Aviso tom="aviso">Envio automático desligado.</Aviso>
      ) : null}

      {textos ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {TIPOS_AVISO.map((t) => (
            <CartaoMensagem key={t} tipo={t} texto={textos[t]} qtd={textos[`${t}Qtd` as const]} />
          ))}
        </div>
      ) : (
        ok && <Aviso tom="erro">Não foi possível montar os avisos deste dia.</Aviso>
      )}

      <section aria-label="Envios ao grupo" className="flex flex-col gap-2 rounded-card border border-rule bg-paper p-4 shadow-card">
        <h3 className="text-base font-bold text-ink">Envios ao grupo{grupo?.nome ? ` · ${grupo.nome}` : ''}</h3>
        <Envios envios={envios} />
      </section>
    </div>
  );
}
