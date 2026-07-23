import { getTranslations } from 'next-intl/server';
import type { Ancestral, Genealogia } from '@/lib/criadores/types';

/**
 * Árvore genealógica horizontal compacta (protótipo v12): 3 gerações a partir do
 * snapshot jsonb. Traço à esquerda azul = macho, rosa = fêmea; nome (serif) ou o
 * número quando não há nome. Conectores são puro CSS (ver vitrine.css .gtree).
 * Só renderiza o ramo que existe; sem pai e sem mãe → retorna null.
 */
type Sexo = 'm' | 'f';

function fmt(a?: Ancestral): string | null {
  if (!a) return null;
  const nome = a.nome?.trim();
  if (nome) return nome;
  const numero = a.numero?.trim();
  if (numero) return `Nº ${numero}`;
  return null;
}

function branch(
  anc: Ancestral | undefined,
  sexo: Sexo,
  childM: React.ReactNode,
  childF: React.ReactNode,
): React.ReactNode {
  const label = fmt(anc);
  if (!label) return null;
  const hasKids = Boolean(childM || childF);
  return (
    <div className="b">
      <span className={sexo === 'f' ? 'lbl f' : 'lbl'}>{label}</span>
      {hasKids && (
        <div className="ch">
          {childM}
          {childF}
        </div>
      )}
    </div>
  );
}

export async function GenealogiaArvore({ genealogia: g }: { genealogia: Genealogia }) {
  const t = await getTranslations('criadores');
  const leaf = (anc: Ancestral | undefined, sexo: Sexo) => branch(anc, sexo, null, null);

  const pai = branch(
    g.pai,
    'm',
    branch(g.avo_pp, 'm', leaf(g.bis_ppp, 'm'), leaf(g.bis_ppm, 'f')),
    branch(g.avo_pm, 'f', leaf(g.bis_pmp, 'm'), leaf(g.bis_pmm, 'f')),
  );
  const mae = branch(
    g.mae,
    'f',
    branch(g.avo_mp, 'm', leaf(g.bis_mpp, 'm'), leaf(g.bis_mpm, 'f')),
    branch(g.avo_mm, 'f', leaf(g.bis_mmp, 'm'), leaf(g.bis_mmm, 'f')),
  );

  if (!pai && !mae) return null;

  return (
    <div className="ficha-gen">
      <div className="fg-head">
        <h3>{t('genealogiaLabel')}</h3>
        <span className="glegend">
          <i className="m" />
          {t('genMacho')}
          <i className="f" />
          {t('genFemea')}
        </span>
      </div>
      <div className="gtree-wrap">
        <div className="gtree">
          {pai}
          {mae}
        </div>
      </div>
    </div>
  );
}
