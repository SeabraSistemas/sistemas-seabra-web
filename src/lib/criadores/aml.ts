/**
 * Mapa canonico label -> numero oficial da caracteristica da AML (Avaliacao
 * Morfologica Linear). Espelha EXATAMENTE a lista de `vitrine_montar_aml` em
 * seabra-app-main/migrations/vitrine_09_snapshot_aml.sql — mesma ordem, mesmos
 * acentos. O numero e o `ord` daquela funcao; hoje o snapshot da vitrine so
 * grava [label, valor] (sem o ord), entao normalize.ts usa este mapa para
 * recuperar o numero a partir do label.
 *
 * Femea tem as 16; macho perde as 7 de ubere (5,7,10,11,12,13,14) e sobra
 * 1,2,3,4,6,8,9,15,16 — os "buracos" saem sozinhos porque o ponto de ubere
 * vem NULL do banco e e removido do array antes de chegar aqui.
 *
 * Quando vitrine_19_aml_ord.sql (app) passar a gravar o ord dentro do proprio
 * ponto ([ord, label, valor]), normalize.ts prefere o ord do snapshot e este
 * mapa vira só um fallback para snapshots antigos.
 */
export const AML_NUMERO: Record<string, number> = {
  'Mobilidade': 1,
  'Largura de peito': 2,
  'Profundidade corporal': 3,
  'Ângulo de garupa': 4,
  'Profundidade de úbere': 5,
  'Membros post. (lateral)': 6,
  'Ligamento anterior de úbere': 7,
  'Capacidade': 8,
  'Largura de garupa': 9,
  'Ligamento posterior de úbere': 10,
  'Volume de úbere': 11,
  'Ligamento suspensório médio': 12,
  'Posição dos tetos': 13,
  'Diâmetro dos tetos': 14,
  'Membros post. (anterior)': 15,
  'Estrutura óssea': 16,
};

/** Total de caracteristicas na escala oficial (usado para normalizar o radar). */
export const AML_MAX_EIXOS = 16;
