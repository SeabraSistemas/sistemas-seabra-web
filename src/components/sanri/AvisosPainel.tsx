'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ROTULO_SITUACAO,
  ROTULO_TIPO,
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
function CartaoMensagem({ tipo, texto, qtd }: { tipo: TipoAviso; texto: string; qtd: number }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
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
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-campo bg-ink px-4 py-3 font-mono text-sm leading-relaxed text-sage-100">
        {texto}
      </pre>
      <div className="flex flex-wrap gap-2">
        <PainelBotao onClick={copiar}>{copiado ? 'Copiado' : 'Copiar'}</PainelBotao>
        <a href={linkWhatsapp(texto)} target="_blank" rel="noopener noreferrer" className={botao.contorno}>
          Abrir no WhatsApp
        </a>
      </div>
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
          Todo dia às 6h o robô da Seabra manda estas duas mensagens no grupo da Sanri, com os dados lançados no app. O diagnóstico
          de gestação lista quem tem de {textos?.dgDiasMin ?? 60} a 155 dias de cobertura e ainda não teve DG nela; só vai quando há
          cabra na lista. Se o envio falhar, ele tenta de novo até as 8h30. Aqui dá para ver a mensagem de qualquer dia e mandar à mão.
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
          <CartaoMensagem tipo="dg" texto={textos.dg} qtd={textos.dgQtd} />
          <CartaoMensagem tipo="manejos" texto={textos.manejos} qtd={textos.manejosQtd} />
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
