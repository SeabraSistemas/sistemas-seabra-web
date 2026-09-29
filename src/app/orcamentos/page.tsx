import { Orcamentos } from '@/components/orcamentos/Orcamento';

/** Gerador de orçamento em PDF (impressão do navegador). Rascunho só no localStorage — ver components/orcamentos/estado.ts. */
export default function OrcamentosPage() {
  return <Orcamentos />;
}
