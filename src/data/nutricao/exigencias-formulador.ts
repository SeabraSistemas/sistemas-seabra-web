// GERADO por scripts/nutricao-gerar-dados.mjs — não editar à mão.
// Fonte: tabela de exigências do Formulador de Dietas v1.0 (Silas Greca), 12 categorias de caprino.
// Valores FIXOS por categoria: não variam com peso nem produção (defeito 5 do documento de engenharia reversa).
// NDT, PB, Ca e P em fração da matéria seca; consumo de MS em kg/dia.
import type { CategoriaFormulador } from '@/lib/nutricao/tipos';

export const CATEGORIAS_FORMULADOR: CategoriaFormulador[] = [
  {"id":"cabrito-recem-nascido","nome":"Cabrito recém nascido","ndt":0.8,"pb":0.2617,"ca":0.0082,"p":0.0037,"cmsKg":0.6},
  {"id":"cabrito-mamada-controlada","nome":"Cabrito mamada controlada","ndt":0.7857,"pb":0.1543,"ca":0.0051,"p":0.0024,"cmsKg":1.4},
  {"id":"cabrita-desmamada","nome":"Cabrita desmamada","ndt":0.65,"pb":0.125,"ca":0.0053,"p":0.0022,"cmsKg":1.2},
  {"id":"cabrita-estacao-de-monta","nome":"Cabrita estação de monta","ndt":0.65,"pb":0.1542,"ca":0.0053,"p":0.0022,"cmsKg":1.2},
  {"id":"cabritos-confinamento","nome":"Cabritos confinamento","ndt":0.7688,"pb":0.134,"ca":0.0041,"p":0.0021,"cmsKg":1.5},
  {"id":"cabra-desmamada","nome":"Cabra desmamada","ndt":0.5875,"pb":0.0938,"ca":0.0033,"p":0.0016,"cmsKg":1.6},
  {"id":"cabra-estacao-de-monta","nome":"Cabra estação de monta","ndt":0.5875,"pb":0.0938,"ca":0.0033,"p":0.0016,"cmsKg":1.6},
  {"id":"cabra-inicio-gestacao","nome":"Cabra início gestação","ndt":0.55,"pb":0.09,"ca":0.002,"p":0.0018,"cmsKg":1},
  {"id":"cabra-terco-final-gestacao","nome":"Cabra terço final gestação","ndt":0.6471,"pb":0.1153,"ca":0.0037,"p":0.003,"cmsKg":1.7},
  {"id":"cabra-recem-parida","nome":"Cabra recém parida","ndt":0.65,"pb":0.1621,"ca":0.0044,"p":0.003,"cmsKg":2.4},
  {"id":"cabra-em-lactacao","nome":"Cabra em lactação","ndt":0.65,"pb":0.1621,"ca":0.0044,"p":0.003,"cmsKg":2.4},
  {"id":"reprodutores","nome":"Reprodutores","ndt":0.65,"pb":0.095,"ca":0.003,"p":0.001,"cmsKg":2},
];
