// Dados fixos do gerador de orçamentos (/orcamentos): quem emite e o catálogo
// que preenche a linha com um clique. Preço de produto RFID vem de
// rfid-products.ts (mesma fonte da /vendas/produtos); planos seguem
// public/docs-seabra/planos.html — mudou lá, muda aqui.
import { rfidProducts } from './rfid-products';

export const EMPRESA = {
  razaoSocial: 'Seabra Solutions LTDA',
  cnpj: '50.132.061/0001-80',
  endereco: 'R. Quatorze de Julho, 133, Apto 204 H — Estreito',
  cidade: 'Florianópolis/SC · CEP 88075-010',
  telefone: '(21) 99936-6784',
  whatsapp: 'https://wa.me/5521999366784',
  email: 'sistemaseabra@gmail.com',
  site: 'sistemaseabra.com.br',
} as const;

/** Links impressos no orçamento (clicáveis no PDF). */
export const LINKS = [
  { rotulo: 'Planos e valores', url: 'https://www.sistemaseabra.com.br/planos' },
  { rotulo: 'Apresentação do Sistema Seabra', url: 'https://www.sistemaseabra.com.br/apresentacao' },
  { rotulo: 'Site', url: 'https://www.sistemaseabra.com.br' },
] as const;

/** `curto` é o rótulo do botão no editor; `nome` e `detalhe` vão para o PDF. */
export type ItemCatalogo = { curto: string; nome: string; detalhe: string; valor: number };

const precoRfid = (slug: string) => rfidProducts.find((p) => p.slug === slug)?.priceBRL ?? 0;

const PLANOS = [
  { nome: 'Iniciante', mensal: 14.99, anual: 152.9 },
  { nome: 'Intermediário', mensal: 75, anual: 765 },
  { nome: 'Pro', mensal: 150, anual: 1530 },
];

const APP = 'Android, iOS e Web · atualizações incluídas';

export const CATALOGO: ItemCatalogo[] = [
  { curto: 'Microchip', nome: 'Seringa com microchip (ICAR)', detalhe: 'FDX-B 134,2 kHz · ISO 11784/11785', valor: precoRfid('microchip-icar') },
  { curto: 'Leitor PBT', nome: 'Leitor RFID Bluetooth (PBT)', detalhe: 'Leitor portátil FDX-B com Bluetooth', valor: precoRfid('leitor-rfid-bluetooth') },
  { curto: 'Leitor bastão', nome: 'Leitor bastão RFID', detalhe: 'FDX-B com Bluetooth', valor: precoRfid('leitor-bastao') },
  ...PLANOS.map((p) => ({
    curto: `Anuidade ${p.nome}`,
    nome: `Anuidade SeabraApp Pequenos Ruminantes — ${p.nome}`,
    detalhe: `12 meses por propriedade · ${APP}`,
    valor: p.anual,
  })),
  ...PLANOS.map((p) => ({
    curto: `Mensal ${p.nome}`,
    nome: `Mensalidade SeabraApp Pequenos Ruminantes — ${p.nome}`,
    detalhe: `Por propriedade · ${APP}`,
    valor: p.mensal,
  })),
  { curto: 'PAC', nome: 'Envio PAC', detalhe: '', valor: 0 },
  { curto: 'Sedex / deslocamento', nome: 'Envio Sedex / deslocamento', detalhe: '', valor: 0 },
];
