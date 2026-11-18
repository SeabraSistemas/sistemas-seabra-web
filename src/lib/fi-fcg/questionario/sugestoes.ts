/**
 * Valor inicial sugerido para as perguntas que só o proprietário responde.
 * Sugestão não é resposta: nunca conta como respondida e nunca entra numa
 * conta do painel sem ele confirmar. Duas origens, sempre com etiqueta:
 * "Estimado pelo banco" (com a data da leitura) e "Referência da literatura"
 * (com a fonte). Onde não há número com fonte, não há sugestão.
 */
import type { Citacao } from './perguntas';

export interface Sugestao {
  origem: 'banco' | 'literatura';
  /** o valor sugerido, curto */
  valor: string;
  /** de onde ele sai */
  base: string;
  lidoEm?: string;
  fontes?: Citacao[];
}

const D17 = '17/11/2026';
const D18 = '18/11/2026';
const banco = (valor: string, base: string, lidoEm = D18): Sugestao => ({ origem: 'banco', valor, base, lidoEm });
const lit = (valor: string, base: string, fontes: Citacao[]): Sugestao => ({ origem: 'literatura', valor, base, fontes });
const r = (ref: string, pagina?: string): Citacao => ({ ref, pagina });

export const SUGESTOES: Record<number, Sugestao[]> = {
  18: [
    banco('Entoure por volta dos 24–27 meses, com cerca de 360 kg', 'Primeiro parto aos 38–39 meses; novilhas de 2–3 anos pesam hoje 364–369 kg.', D17),
    lit('230 kg e boa condição corporal; 270 kg se o pasto depois do toque não for bom', 'Recomendação da Embrapa Pantanal para entrada de novilhas na estação (pergunta 32).', [r('R57', 'p.29–30')]),
    lit('Entoure aos 24–30 meses', 'Com esse entoure, o primeiro parto no Pantanal saiu aos 37,5 meses.', [r('R20', 'p.7')]),
  ],
  19: [
    banco('Escore corporal 3 ou mais (escala de 1 a 5)', 'Escore médio das vacas ativas: 3,1; 77 de 1.234 vacas com escore abaixo de 3.'),
    lit('Sanidade, histórico de aborto e condição corporal da vaca com bezerro ao pé', 'Recomendação para entrada de vacas na estação; vaca em condição muito ruim vai para outra invernada e é descartada depois da desmama (pergunta 33).', [r('R57', 'p.30')]),
  ],
  20: [banco('Até 2 IATF por estação, depois o repasse', 'Média de 1,25 IATF por fêmea por estação de 2024 a 2026; cerca de 1 em cada 4 recebe duas, e quase nenhuma recebe três.')],
  22: [
    banco('Descarte recomendado na 1ª vez', 'Das 555 fêmeas vazias no toque de 2025, 514 (93%) já saíram do rebanho.'),
    lit('Descarte quando solteira em dois trabalhos de gado seguidos e vazia no toque', 'Critério de descarte por desempenho da Embrapa Pantanal (pergunta 53).', [r('R57', 'p.38'), r('R5', 'p.11–12')]),
  ],
  23: [banco('Sim, todos', 'Aborto (151 lançados) e intervalo entre partos já saem do banco. Natimorto e morte de bezerro dependem de lançamento: hoje há zero natimorto e 1,2% de mortalidade, abaixo do esperado.')],
  27: [
    banco('Desmama', 'O sistema tem a pesagem de desmama (210 a 300 dias) de 91% das crias de 2025 das duas fazendas: dá para escolher pelo peso já na desmama.'),
    lit('Desmama e sobreano', 'Avaliar na desmama e descartar cerca de 10% das fêmeas (o fundo do lote); reavaliar ao sobreano e reservar novilhas para repor as vacas descartadas no ano (pergunta 152).', [r('R57', 'p.84')]),
  ],
  28: [
    banco('Peso, histórico da mãe e genealogia', 'O sistema tem o peso de desmama de 91% das crias de 2025, a mãe de 55% dos animais e o pai de 38%, e o toque e os partos de cada vaca. A ordem de prioridade é sua.'),
    lit('Desenvolvimento, defeitos físicos, padrão racial e valor da cria da mãe', 'Critérios da Embrapa Pantanal para a novilha de reposição (pergunta 152).', [r('R57', 'p.84')]),
  ],
  30: [
    banco('Vaca adulta: 1 falha', 'Das 555 vazias de 2025, 93% já saíram; das 52 que foram tocadas de novo em 2026, 25 estavam vazias outra vez.'),
    lit('2 falhas seguidas', 'Embrapa Pantanal: solteira em dois trabalhos de gado seguidos e vazia no toque (pergunta 53).', [r('R57', 'p.38')]),
  ],
  31: [
    banco('Abortos repetidos', '7 fêmeas com 2 abortos ou mais lançados.'),
    lit('Vaca que não cria (peituda, rejeita bezerro) e vaca em condição corporal muito ruim', 'Recomendação da Embrapa Pantanal para entrada de vacas na estação (pergunta 33).', [r('R57', 'p.30')]),
  ],
  32: [
    banco('Vaca vazia do último toque e vaca na idade-limite primeiro', 'Hoje são 566 vazias no último toque e 277 vacas com 12 anos ou mais, nas duas fazendas.'),
    lit('Antes de vender: suplementar e vedar; se não der, transferir ou vender', 'Regra da Embrapa Pantanal para cheia longa ou seca extrema. Não achei fonte que ordene as categorias.', [r('R25', 'p.27')]),
  ],
  35: [
    banco('Idade, por volta de 8 meses', 'O peso de desmama que levantei saiu das pesagens por volta de 245 dias de idade; a venda em leilão sai com 227–258 kg.', D17),
    lit('6 a 8 meses', 'Idade de desmama recomendada; 8 meses na fazenda típica do Pantanal em 2023.', [r('R21', 'p.32'), r('R2', 'p.5')]),
  ],
  36: [
    banco('Machos 211–229 kg; fêmeas 180–229 kg', 'Peso real aos ~245 dias nas duas fazendas.', D17),
    lit('Machos 180 kg; fêmeas 165 kg', 'Peso aos 8 meses na fazenda típica do Pantanal em 2023.', [r('R2', 'p.5')]),
  ],
  43: [lit('Humidícola: cerca de 5.000 kg de matéria seca por ha no ano e 0,8 UA/ha', 'Para o pasto nativo: campo limpo e baixadas 3.000, caronal 4.500, campo cerrado 2.200 kg/ha/ano.', [r('R29', 'p.141'), r('R33', 'p.5'), r('R34', 'p.21'), r('R25', 'p.20')])],
  45: [lit('Cerca de 30% da área alaga por 3 a 4 meses', 'Valor da Nhecolândia; na cheia, a invernada estudada perdeu 27% da capacidade.', [r('R41', 'p.104'), r('R25', 'p.20–21')])],
  46: [
    banco('Nenhum', 'O sistema não tem nenhum dado de forragem nem de chuva das duas fazendas.'),
    lit('Avaliação visual pela cobertura do capim principal', 'O guia da Embrapa Pantanal estima a matéria seca pela cobertura da forrageira em cada ambiente.', [r('R28', 'p.8–14')]),
  ],
  49: [banco('Só sal mineral', 'O sistema tem o sal mineral cadastrado como insumo, sem consumo lançado; nenhum proteinado ou ração.')],
  50: [lit('Suplementação e vedação; depois transferência ou venda antecipada', 'Regra da Embrapa Pantanal para cheia longa ou seca extrema.', [r('R25', 'p.27')])],
};

export function sugestoesDe(n: number): Sugestao[] {
  return SUGESTOES[n] ?? [];
}
