'use client';

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AmlData } from '@/lib/criadores/normalize';
import { AmlBloco } from './AmlBloco';
import { MedidasChips } from './MedidasChips';
import { LactacaoAberta } from './LactacaoAberta';
import { CarrosselEncerradas } from './CarrosselEncerradas';
import { ProgeniePerf } from './ProgeniePerf';
import { Filhas } from './Filhas';

/** Métrica serializável vinda de metricasDe(animal). */
type Metrica = { label: string; valor: string; sufixo?: string };

/** Medida do snapshot: [label, valor, unidade]. */
type Medida = [string, number, string];

/** Lactação serializável (snapshot); campos ausentes quando não há dado. */
type Lactacao = {
  aberta?: { dias: number; med: number; pts: [number, number][] };
  enc?: {
    ordem: number;
    ano: number;
    total: number;
    dias: number;
    media: number;
    pts?: [number, number][];
  }[];
};

/** Filhas serializável (snapshot). */
type FilhasData = {
  total: number;
  publicadas: { slug: string; nome: string | null; numero: string; sexo: 'macho' | 'femea'; foto: string | null }[];
};

/** Progênie serializável (snapshot); sem `cats` → o bloco não aparece. */
type ProgenieData = {
  conf?: number;
  total_filhas?: number | null;
  cats?: { n: string; v: number; sub: [string, number][] }[];
};

/** Tempo que cada aba fica no ar no rodízio automático. Também alimenta a
 * animação do risco da aba ativa (--vit-rodizio em vitrine.css), pra barra e
 * troca andarem juntas a partir de um valor só. */
const RODIZIO_MS = 5000;

/** prefers-reduced-motion como store externa: useSyncExternalStore entrega o
 * valor real já no primeiro render do cliente, e `false` no do servidor (que
 * não conhece a preferência de quem visita), sem risco de hidratação. */
const REDUZ_MOVIMENTO = '(prefers-reduced-motion: reduce)';
function inscreveMovimento(aoMudar: () => void) {
  const mq = window.matchMedia(REDUZ_MOVIMENTO);
  mq.addEventListener('change', aoMudar);
  return () => mq.removeEventListener('change', aoMudar);
}
const leMovimento = () => window.matchMedia(REDUZ_MOVIMENTO).matches;
const leMovimentoNoServidor = () => false;

/**
 * Abas da ficha (protótipo v12). Duas abas SEMPRE existem:
 *  - "Produção · Progênie": mostra os stats de produção presentes (metricasDe);
 *    sem dado → nota discreta. Curva de lactação / progênie / filhas são Fase B/C.
 *  - "AML · Medidas": bloco AML (se há avaliação) e/ou Medidas (se há); senão placeholder.
 *
 * Rodízio automático: as duas abas se alternam sozinhas a cada RODIZIO_MS
 * enquanto o visitante não interage. Quase ninguém clica na segunda aba, então
 * a avaliação morfológica (AML) passava despercebida — o rodízio a põe na
 * frente sem tirar nada de ninguém. O primeiro clique (na aba ou dentro do
 * painel) fixa a aba pra sempre: quem parou pra ler uma característica não
 * pode ver a página trocar embaixo da leitura.
 *
 * Só roda quando as duas abas têm conteúdo de verdade — alternar com um
 * "em breve" seria piscar à toa — e nunca com prefers-reduced-motion.
 */
export function FichaTabs({
  metricas,
  aml,
  medidas,
  lactacao,
  filhas,
  progenie,
  criadorSlug,
}: {
  metricas: Metrica[];
  aml: AmlData | null;
  medidas: Medida[];
  lactacao: Lactacao;
  filhas: FilhasData;
  progenie: ProgenieData;
  criadorSlug: string;
}) {
  const t = useTranslations('criadores');

  const temProducao =
    !!lactacao.aberta ||
    (lactacao.enc?.length ?? 0) > 0 ||
    metricas.length > 0 ||
    (progenie.cats?.length ?? 0) > 0 ||
    filhas.publicadas.length > 0;
  const temAml = !!aml || medidas.length > 0;

  // Ficha sem nada de produção mas com AML abre direto no AML: melhor que
  // pousar num "em breve" e ficar lá (sem produção não há rodízio).
  const [tab, setTab] = useState<'pl' | 'ta'>(!temProducao && temAml ? 'ta' : 'pl');
  const [fixado, setFixado] = useState(false);
  const semMovimento = useSyncExternalStore(inscreveMovimento, leMovimento, leMovimentoNoServidor);

  const rodiziando = !fixado && !semMovimento && temProducao && temAml;

  useEffect(() => {
    if (!rodiziando) return;
    const id = setInterval(() => setTab((atual) => (atual === 'pl' ? 'ta' : 'pl')), RODIZIO_MS);
    return () => clearInterval(id);
  }, [rodiziando]);

  /** Clique/foco numa aba: troca e encerra o rodízio de vez. */
  function fixar(alvo: 'pl' | 'ta') {
    setTab(alvo);
    setFixado(true);
  }

  return (
    <>
      <div
        className={`tabs${rodiziando ? ' rodizio' : ''}`}
        role="tablist"
        style={{ '--vit-rodizio': `${RODIZIO_MS}ms` } as CSSProperties}
      >
        <button
          type="button"
          className="tab"
          role="tab"
          aria-selected={tab === 'pl'}
          onClick={() => fixar('pl')}
          onFocus={() => setFixado(true)}
        >
          {t('abaProducaoProgenie')}
        </button>
        <button
          type="button"
          className="tab"
          role="tab"
          aria-selected={tab === 'ta'}
          onClick={() => fixar('ta')}
          onFocus={() => setFixado(true)}
        >
          {t('abaAmlMedidas')}
        </button>
      </div>

      {/* Clicar em qualquer ponto dos painéis também fixa: quem abriu uma
          lactação ou foi ler uma característica está lendo, não esperando.
          A div só existe pra ser esse alvo de clique — não tem estilo. */}
      <div className="panels" onClick={() => setFixado(true)}>
        <div className="panel" role="tabpanel" hidden={tab !== 'pl'}>
          {lactacao.aberta && <LactacaoAberta aberta={lactacao.aberta} />}
          {lactacao.enc && lactacao.enc.length > 0 && <CarrosselEncerradas enc={lactacao.enc} />}
          {metricas.length > 0 && (
            <div className="stats">
              {metricas.map((m) => (
                <div className="stat" key={m.label}>
                  <div className="v">
                    {m.valor}
                    {m.sufixo && <small> {m.sufixo}</small>}
                  </div>
                  <div className="l">{m.label}</div>
                </div>
              ))}
            </div>
          )}
          <ProgeniePerf progenie={progenie} />
          <Filhas filhas={filhas} criadorSlug={criadorSlug} />
          {!temProducao && (
            <div className="block">
              <div className="empty-note">
                <Info size={13} strokeWidth={1.8} />
                {t('emBreveProducao')}
              </div>
            </div>
          )}
        </div>

        <div className="panel" role="tabpanel" hidden={tab !== 'ta'}>
          {aml && <AmlBloco aml={aml} />}
          {medidas.length > 0 && <MedidasChips medidas={medidas} />}
          {!temAml && (
            <div className="block">
              <div className="empty-note">
                <Info size={13} strokeWidth={1.8} />
                {t('emBreveAml')}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
