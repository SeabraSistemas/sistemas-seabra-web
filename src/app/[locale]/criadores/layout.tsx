import './vitrine.css';

/**
 * Layout da vitrine: envolve todas as rotas de /criadores no escopo visual
 * .vitrine-scope (tokens + classes portados do protótipo v12, ver vitrine.css).
 * NÃO desenha header próprio — o site já tem Header/Footer globais; as páginas
 * da vitrine renderizam DENTRO deles. O wrapper é o container de query (@container
 * vit), responsável pela responsividade por largura.
 */
export default function CriadoresLayout({ children }: { children: React.ReactNode }) {
  return <div className="vitrine-scope">{children}</div>;
}
