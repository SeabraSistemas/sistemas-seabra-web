import type { Apresentacao } from '@/components/apresentacao/tipos';

/**
 * Palestra do Dr. Geraldo Jonas da Silva sobre manejo na ovinocultura de
 * corte, com o Sistema Seabra entrando como ferramenta dentro de cada assunto.
 * Rota: /apresentacao/ovinos-corte (noindex, fora do [locale], só pt).
 *
 * FOTOS
 * Coloque o arquivo em public/images/apresentacao-ovinos/ com o nome exato do
 * `src`. Enquanto ele não existir, o slide mostra o `briefing` no lugar — não
 * precisa editar nada aqui para a foto aparecer.
 */

const PASTA = '/images/apresentacao-ovinos';

export const ovinosCorte: Apresentacao = {
  titulo: 'Produção contínua e tecnificada de ovinos de corte',
  slides: [
    {
      id: 'capa',
      tipo: 'capa',
      titulo: 'Produção contínua e tecnificada de ovinos de corte',
      apresentador: 'Dr. Geraldo Jonas da Silva',
      cargo: 'Médico-veterinário',
      foto: {
        src: `${PASTA}/01-capa.jpg`,
        alt: 'Rebanho de ovinos de corte em pasto ao fim da tarde',
        briefing:
          'Rebanho de ovinos de corte (Dorper ou Santa Inês) em pasto, luz baixa de fim de tarde. Horizontal, sem gente em primeiro plano.',
      },
      notas:
        'Agradecer o convite e a presença.\n\nEm uma frase: hoje o assunto é como produzir cordeiro o ano inteiro, no padrão que o frigorífico precisa, e quais ferramentas tornam isso gerenciável no dia a dia.',
    },
    {
      id: 'bio',
      tipo: 'bio',
      rotulo: 'Formação',
      nome: 'Dr. Geraldo Jonas da Silva',
      itens: [
        { texto: 'Medicina Veterinária', instituicao: 'UFMG' },
        { texto: 'Mestrado em Microbiologia/Micologia', instituicao: 'ICB · UFMG' },
        { texto: 'Inspetor técnico', instituicao: 'ABCC' },
        { texto: 'Inspetor técnico', instituicao: 'ARCO' },
        { texto: 'Exportação e importação de animais' },
        { texto: 'Responsável técnico', instituicao: 'Ovinocultura Cara Preta' },
      ],
      logos: [
        { src: `${PASTA}/02-logo-ufmg.png`, alt: 'UFMG', largura: 250, altura: 79 },
        { src: `${PASTA}/02-logo-arco.png`, alt: 'ARCO — Associação Brasileira de Criadores de Ovinos', largura: 396, altura: 127 },
        { src: `${PASTA}/02-logo-abcc.png`, alt: 'ABCC — Associação Brasileira dos Criadores de Caprinos', largura: 243, altura: 246 },
        { src: `${PASTA}/02-logo-cara-preta.png`, alt: 'Ovinocultura Cara Preta', largura: 275, altura: 271 },
        { src: `${PASTA}/02-logo-orimus.png`, alt: "Orimu's Consultoria Técnica e Projetos", largura: 242, altura: 114 },
      ],
      foto: {
        src: `${PASTA}/02-geraldo.jpg`,
        alt: 'Dr. Geraldo Jonas da Silva',
        briefing:
          'Retrato do Dr. Geraldo no curral ou no campo, meio corpo, olhando para a câmera. Vertical funciona.',
        posicao: '50% 25%',
      },
      notas:
        'Trajetória em 30 segundos: formação na UFMG, inspeção técnica na ABCC e na ARCO, exportação e importação de animais, e a responsabilidade técnica na Ovinocultura Cara Preta.\n\nPonte para o assunto: o que vou mostrar vem dessa vivência de campo.',
    },
    {
      id: 'oferta-365-dias',
      tipo: 'foto-cheia',
      secao: 'O mercado e o gargalo',
      titulo: '365 dias por ano',
      legenda: 'O frigorífico compra regularidade: o mesmo padrão de carcaça, todo mês.',
      foto: {
        src: `${PASTA}/03-frigorifico.jpg`,
        alt: 'Carcaças de cordeiro padronizadas na câmara fria do frigorífico',
        briefing:
          'Carcaças de cordeiro padronizadas na câmara fria do frigorífico, ou lote uniforme de cordeiros terminados no confinamento.',
      },
      notas:
        'O frigorífico não compra cordeiro, compra regularidade: escala de abate cheia toda semana e carcaça no mesmo padrão.\n\nQuem entrega isso negocia melhor. A pergunta que guia a palestra: como sair da safra concentrada para a oferta contínua?',
    },
  ],
};
