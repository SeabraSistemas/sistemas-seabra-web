// GERADO por scripts/nutricao-gerar-dados.mjs — não editar à mão.
// Fonte: NRC 2007 (Nutrient Requirements of Small Ruminants) pelo Maryland Dairy Goat Ration Evaluator
// (Susan Schoenian, 2015), convertido de libras para kg. Pesos no valor nominal da tabela (60 kg, não 59,9).
// Exigência diária por animal: consumo de MS (kg), NDT (kg), PB, Ca e P (g); ndtFrac/pbFrac = concentração na MS.
// O NRC trabalha em degraus de NDT da dieta (≈53%, 66% e 80%): ver degrauNdt() em src/lib/nutricao/nrc.ts.
// Fora do arquivo: aba Kids (cabritos), de outro formato.
import type { SerieNrc } from '@/lib/nutricao/tipos';

export const FASES_NRC: Record<string, string> = {
  "mantenca": "Mantença e cobertura",
  "gestacao-inicial": "Gestação — início",
  "gestacao-final": "Gestação — final",
  "lactacao-amamentando": "Lactação — cabra amamentando",
  "ordenha-inicio": "Ordenha — início da lactação",
  "ordenha-meio": "Ordenha — meio da lactação",
  "ordenha-fim": "Ordenha — fim da lactação",
  "bodes": "Bodes"
};

export const SERIES_NRC: SerieNrc[] = [
  {
    ...{"id":"mantenca/mantenca","fase":"mantenca","faseNome":"Mantença e cobertura","nivel":"Mantença"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.589,"ndtKg":0.309,"pbG":39.9,"caG":1.3,"pG":0.9,"ndtFrac":0.5246,"pbFrac":0.0677},
      {"pesoKg":30,"cmsKg":0.798,"ndtKg":0.429,"pbG":53.9,"caG":1.6,"pG":1.2,"ndtFrac":0.5376,"pbFrac":0.0675},
      {"pesoKg":40,"cmsKg":0.998,"ndtKg":0.529,"pbG":66.9,"caG":1.9,"pG":1.5,"ndtFrac":0.5301,"pbFrac":0.067},
      {"pesoKg":50,"cmsKg":1.178,"ndtKg":0.619,"pbG":78.8,"caG":2.1,"pG":1.7,"ndtFrac":0.5255,"pbFrac":0.0669},
      {"pesoKg":60,"cmsKg":1.347,"ndtKg":0.718,"pbG":89.8,"caG":2.39,"pG":2,"ndtFrac":0.533,"pbFrac":0.0667},
      {"pesoKg":70,"cmsKg":1.517,"ndtKg":0.798,"pbG":100.8,"caG":2.59,"pG":2.2,"ndtFrac":0.526,"pbFrac":0.0664},
      {"pesoKg":80,"cmsKg":1.676,"ndtKg":0.888,"pbG":111.8,"caG":2.79,"pG":2.39,"ndtFrac":0.5298,"pbFrac":0.0667},
      {"pesoKg":90,"cmsKg":1.826,"ndtKg":0.968,"pbG":121.7,"caG":2.99,"pG":2.59,"ndtFrac":0.5301,"pbFrac":0.0666},
    ],
  },
  {
    ...{"id":"mantenca/cobertura","fase":"mantenca","faseNome":"Mantença e cobertura","nivel":"Cobertura"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.649,"ndtKg":0.349,"pbG":43.9,"caG":1.4,"pG":1,"ndtFrac":0.5378,"pbFrac":0.0676},
      {"pesoKg":30,"cmsKg":0.878,"ndtKg":0.469,"pbG":58.9,"caG":1.7,"pG":1.3,"ndtFrac":0.5342,"pbFrac":0.0671},
      {"pesoKg":40,"cmsKg":1.098,"ndtKg":0.579,"pbG":72.8,"caG":2,"pG":1.6,"ndtFrac":0.5273,"pbFrac":0.0663},
      {"pesoKg":50,"cmsKg":1.297,"ndtKg":0.689,"pbG":86.8,"caG":2.3,"pG":1.9,"ndtFrac":0.5312,"pbFrac":0.0669},
      {"pesoKg":60,"cmsKg":1.487,"ndtKg":0.788,"pbG":98.8,"caG":2.59,"pG":2.1,"ndtFrac":0.5299,"pbFrac":0.0664},
      {"pesoKg":70,"cmsKg":1.666,"ndtKg":0.878,"pbG":110.8,"caG":2.79,"pG":2.39,"ndtFrac":0.527,"pbFrac":0.0665},
      {"pesoKg":80,"cmsKg":1.836,"ndtKg":0.978,"pbG":122.7,"caG":3.09,"pG":2.59,"ndtFrac":0.5327,"pbFrac":0.0668},
      {"pesoKg":90,"cmsKg":2.006,"ndtKg":1.068,"pbG":133.7,"caG":3.29,"pG":2.89,"ndtFrac":0.5324,"pbFrac":0.0667},
    ],
  },
  {
    ...{"id":"gestacao-inicial/1-cria","fase":"gestacao-inicial","faseNome":"Gestação — início","nivel":"1 cria"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.699,"ndtKg":0.369,"pbG":61.9,"caG":3.39,"pG":1.8,"ndtFrac":0.5279,"pbFrac":0.0886},
      {"pesoKg":30,"cmsKg":0.938,"ndtKg":0.499,"pbG":80.8,"caG":3.79,"pG":2.1,"ndtFrac":0.532,"pbFrac":0.0861},
      {"pesoKg":40,"cmsKg":1.148,"ndtKg":0.609,"pbG":97.8,"caG":4.09,"pG":2.39,"ndtFrac":0.5305,"pbFrac":0.0852},
      {"pesoKg":50,"cmsKg":1.347,"ndtKg":0.718,"pbG":113.8,"caG":4.29,"pG":2.69,"ndtFrac":0.533,"pbFrac":0.0845},
      {"pesoKg":60,"cmsKg":1.537,"ndtKg":0.818,"pbG":128.7,"caG":4.59,"pG":2.99,"ndtFrac":0.5322,"pbFrac":0.0837},
      {"pesoKg":70,"cmsKg":1.716,"ndtKg":0.908,"pbG":142.7,"caG":4.89,"pG":3.19,"ndtFrac":0.5291,"pbFrac":0.0832},
      {"pesoKg":80,"cmsKg":1.886,"ndtKg":0.998,"pbG":166.6,"caG":5.09,"pG":3.39,"ndtFrac":0.5292,"pbFrac":0.0883},
      {"pesoKg":90,"cmsKg":2.056,"ndtKg":1.088,"pbG":169.6,"caG":5.29,"pG":3.69,"ndtFrac":0.5292,"pbFrac":0.0825},
    ],
  },
  {
    ...{"id":"gestacao-inicial/2-crias","fase":"gestacao-inicial","faseNome":"Gestação — início","nivel":"2 crias"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.609,"ndtKg":0.399,"pbG":66.9,"caG":4.89,"pG":2.3,"ndtFrac":0.6552,"pbFrac":0.1099},
      {"pesoKg":30,"cmsKg":0.998,"ndtKg":0.529,"pbG":93.8,"caG":5.39,"pG":2.79,"ndtFrac":0.5301,"pbFrac":0.094},
      {"pesoKg":40,"cmsKg":1.227,"ndtKg":0.649,"pbG":112.8,"caG":5.69,"pG":3.09,"ndtFrac":0.5289,"pbFrac":0.0919},
      {"pesoKg":50,"cmsKg":1.437,"ndtKg":0.758,"pbG":130.7,"caG":5.99,"pG":3.39,"ndtFrac":0.5275,"pbFrac":0.091},
      {"pesoKg":60,"cmsKg":1.637,"ndtKg":0.868,"pbG":147.7,"caG":6.29,"pG":3.69,"ndtFrac":0.5302,"pbFrac":0.0902},
      {"pesoKg":70,"cmsKg":1.826,"ndtKg":0.968,"pbG":163.7,"caG":6.59,"pG":3.89,"ndtFrac":0.5301,"pbFrac":0.0896},
      {"pesoKg":80,"cmsKg":2.016,"ndtKg":1.068,"pbG":179.6,"caG":6.79,"pG":4.19,"ndtFrac":0.5298,"pbFrac":0.0891},
      {"pesoKg":90,"cmsKg":2.185,"ndtKg":1.158,"pbG":194.6,"caG":6.99,"pG":4.39,"ndtFrac":0.53,"pbFrac":0.0891},
    ],
  },
  {
    ...{"id":"gestacao-inicial/3-ou-mais-crias","fase":"gestacao-inicial","faseNome":"Gestação — início","nivel":"3 ou mais crias"},
    linhas: [
      {"pesoKg":30,"cmsKg":1.038,"ndtKg":0.549,"pbG":100.8,"caG":6.79,"pG":3.39,"ndtFrac":0.5289,"pbFrac":0.0971},
      {"pesoKg":40,"cmsKg":1.277,"ndtKg":0.679,"pbG":122.7,"caG":7.09,"pG":3.69,"ndtFrac":0.5317,"pbFrac":0.0961},
      {"pesoKg":50,"cmsKg":1.487,"ndtKg":0.788,"pbG":140.7,"caG":7.38,"pG":3.99,"ndtFrac":0.5299,"pbFrac":0.0946},
      {"pesoKg":60,"cmsKg":1.696,"ndtKg":0.898,"pbG":158.7,"caG":7.68,"pG":4.29,"ndtFrac":0.5295,"pbFrac":0.0936},
      {"pesoKg":70,"cmsKg":1.886,"ndtKg":0.998,"pbG":175.6,"caG":7.98,"pG":4.49,"ndtFrac":0.5292,"pbFrac":0.0931},
      {"pesoKg":80,"cmsKg":2.076,"ndtKg":1.098,"pbG":192.6,"caG":8.28,"pG":4.79,"ndtFrac":0.5289,"pbFrac":0.0928},
      {"pesoKg":90,"cmsKg":2.265,"ndtKg":1.197,"pbG":208.6,"caG":8.48,"pG":5.09,"ndtFrac":0.5285,"pbFrac":0.0921},
    ],
  },
  {
    ...{"id":"gestacao-final/1-cria","fase":"gestacao-final","faseNome":"Gestação — final","nivel":"1 cria"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.599,"ndtKg":0.479,"pbG":81.8,"caG":3.29,"pG":1.7,"ndtFrac":0.7997,"pbFrac":0.1366},
      {"pesoKg":30,"cmsKg":0.948,"ndtKg":0.629,"pbG":111.8,"caG":3.79,"pG":2.2,"ndtFrac":0.6635,"pbFrac":0.1179},
      {"pesoKg":40,"cmsKg":1.148,"ndtKg":0.758,"pbG":133.7,"caG":4.09,"pG":2.39,"ndtFrac":0.6603,"pbFrac":0.1165},
      {"pesoKg":50,"cmsKg":1.666,"ndtKg":0.888,"pbG":165.7,"caG":4.79,"pG":3.09,"ndtFrac":0.533,"pbFrac":0.0995},
      {"pesoKg":60,"cmsKg":1.886,"ndtKg":0.998,"pbG":186.6,"caG":5.09,"pG":3.39,"ndtFrac":0.5292,"pbFrac":0.0989},
      {"pesoKg":70,"cmsKg":2.106,"ndtKg":1.118,"pbG":205.6,"caG":5.39,"pG":3.69,"ndtFrac":0.5309,"pbFrac":0.0976},
      {"pesoKg":80,"cmsKg":2.305,"ndtKg":1.217,"pbG":223.5,"caG":5.69,"pG":3.99,"ndtFrac":0.528,"pbFrac":0.097},
      {"pesoKg":90,"cmsKg":2.495,"ndtKg":1.317,"pbG":240.5,"caG":5.89,"pG":4.29,"ndtFrac":0.5279,"pbFrac":0.0964},
    ],
  },
  {
    ...{"id":"gestacao-final/2-crias","fase":"gestacao-final","faseNome":"Gestação — final","nivel":"2 crias"},
    linhas: [
      {"pesoKg":20,"cmsKg":0.679,"ndtKg":0.539,"pbG":104.8,"caG":4.99,"pG":2.39,"ndtFrac":0.7938,"pbFrac":0.1543},
      {"pesoKg":30,"cmsKg":0.888,"ndtKg":0.709,"pbG":132.7,"caG":5.19,"pG":2.69,"ndtFrac":0.7984,"pbFrac":0.1494},
      {"pesoKg":40,"cmsKg":1.277,"ndtKg":0.848,"pbG":164.7,"caG":5.79,"pG":3.19,"ndtFrac":0.6641,"pbFrac":0.129},
      {"pesoKg":50,"cmsKg":1.487,"ndtKg":0.988,"pbG":188.6,"caG":6.09,"pG":3.49,"ndtFrac":0.6644,"pbFrac":0.1268},
      {"pesoKg":60,"cmsKg":1.686,"ndtKg":1.118,"pbG":212.6,"caG":6.39,"pG":3.69,"ndtFrac":0.6631,"pbFrac":0.1261},
      {"pesoKg":70,"cmsKg":1.866,"ndtKg":1.237,"pbG":232.5,"caG":6.59,"pG":3.99,"ndtFrac":0.6629,"pbFrac":0.1246},
      {"pesoKg":80,"cmsKg":2.056,"ndtKg":1.367,"pbG":255.5,"caG":6.89,"pG":4.29,"ndtFrac":0.6649,"pbFrac":0.1243},
      {"pesoKg":90,"cmsKg":2.784,"ndtKg":1.477,"pbG":297.4,"caG":7.88,"pG":5.19,"ndtFrac":0.5305,"pbFrac":0.1068},
    ],
  },
  {
    ...{"id":"gestacao-final/3-ou-mais-crias","fase":"gestacao-final","faseNome":"Gestação — final","nivel":"3 ou mais crias"},
    linhas: [
      {"pesoKg":30,"cmsKg":0.938,"ndtKg":0.748,"pbG":146.7,"caG":6.69,"pG":3.29,"ndtFrac":0.7974,"pbFrac":0.1564},
      {"pesoKg":40,"cmsKg":1.138,"ndtKg":0.908,"pbG":175.6,"caG":6.99,"pG":3.49,"ndtFrac":0.7979,"pbFrac":0.1543},
      {"pesoKg":50,"cmsKg":1.317,"ndtKg":1.048,"pbG":199.6,"caG":7.18,"pG":3.79,"ndtFrac":0.7957,"pbFrac":0.1516},
      {"pesoKg":60,"cmsKg":1.776,"ndtKg":1.178,"pbG":234.5,"caG":7.78,"pG":4.39,"ndtFrac":0.6633,"pbFrac":0.132},
      {"pesoKg":70,"cmsKg":1.976,"ndtKg":1.307,"pbG":258.5,"caG":8.08,"pG":4.69,"ndtFrac":0.6614,"pbFrac":0.1308},
      {"pesoKg":80,"cmsKg":2.165,"ndtKg":1.437,"pbG":281.4,"caG":8.38,"pG":4.89,"ndtFrac":0.6637,"pbFrac":0.13},
      {"pesoKg":90,"cmsKg":2.355,"ndtKg":1.557,"pbG":304.4,"caG":8.58,"pG":5.19,"ndtFrac":0.6611,"pbFrac":0.1293},
    ],
  },
  {
    ...{"id":"lactacao-amamentando/1-cria","fase":"lactacao-amamentando","faseNome":"Lactação — cabra amamentando","nivel":"1 cria"},
    linhas: [
      {"pesoKg":30,"cmsKg":1.207,"ndtKg":0.639,"pbG":137.7,"caG":5.29,"pG":3.29,"ndtFrac":0.5294,"pbFrac":0.1141},
      {"pesoKg":40,"cmsKg":1.477,"ndtKg":0.788,"pbG":165.7,"caG":5.69,"pG":3.69,"ndtFrac":0.5335,"pbFrac":0.1122},
      {"pesoKg":50,"cmsKg":1.726,"ndtKg":0.918,"pbG":190.6,"caG":5.99,"pG":3.99,"ndtFrac":0.5319,"pbFrac":0.1104},
      {"pesoKg":60,"cmsKg":1.976,"ndtKg":1.048,"pbG":215.5,"caG":6.39,"pG":4.29,"ndtFrac":0.5304,"pbFrac":0.1091},
      {"pesoKg":70,"cmsKg":2.205,"ndtKg":1.168,"pbG":238.5,"caG":6.69,"pG":4.69,"ndtFrac":0.5297,"pbFrac":0.1082},
      {"pesoKg":80,"cmsKg":2.425,"ndtKg":1.287,"pbG":260.5,"caG":6.99,"pG":4.99,"ndtFrac":0.5307,"pbFrac":0.1074},
      {"pesoKg":90,"cmsKg":2.644,"ndtKg":1.397,"pbG":281.4,"caG":7.28,"pG":5.29,"ndtFrac":0.5284,"pbFrac":0.1064},
    ],
  },
  {
    ...{"id":"lactacao-amamentando/2-crias","fase":"lactacao-amamentando","faseNome":"Lactação — cabra amamentando","nivel":"2 crias"},
    linhas: [
      {"pesoKg":40,"cmsKg":1.966,"ndtKg":1.048,"pbG":264.4,"caG":9.48,"pG":5.89,"ndtFrac":0.5331,"pbFrac":0.1345},
      {"pesoKg":50,"cmsKg":2.295,"ndtKg":1.217,"pbG":304.4,"caG":9.88,"pG":6.29,"ndtFrac":0.5303,"pbFrac":0.1326},
      {"pesoKg":60,"cmsKg":2.605,"ndtKg":1.377,"pbG":341.3,"caG":10.28,"pG":6.69,"ndtFrac":0.5286,"pbFrac":0.131},
      {"pesoKg":70,"cmsKg":2.904,"ndtKg":1.537,"pbG":376.2,"caG":10.78,"pG":7.09,"ndtFrac":0.5293,"pbFrac":0.1295},
      {"pesoKg":80,"cmsKg":3.173,"ndtKg":1.686,"pbG":408.1,"caG":11.08,"pG":7.48,"ndtFrac":0.5314,"pbFrac":0.1286},
      {"pesoKg":90,"cmsKg":3.453,"ndtKg":1.826,"pbG":441.1,"caG":11.48,"pG":7.88,"ndtFrac":0.5288,"pbFrac":0.1277},
    ],
  },
  {
    ...{"id":"lactacao-amamentando/3-ou-mais-crias","fase":"lactacao-amamentando","faseNome":"Lactação — cabra amamentando","nivel":"3 ou mais crias"},
    linhas: [
      {"pesoKg":50,"cmsKg":2.285,"ndtKg":1.517,"pbG":394.2,"caG":12.97,"pG":7.78,"ndtFrac":0.6639,"pbFrac":0.1725},
      {"pesoKg":60,"cmsKg":2.585,"ndtKg":1.716,"pbG":441.1,"caG":13.37,"pG":8.18,"ndtFrac":0.6638,"pbFrac":0.1706},
      {"pesoKg":70,"cmsKg":2.874,"ndtKg":1.906,"pbG":485,"caG":13.77,"pG":8.58,"ndtFrac":0.6632,"pbFrac":0.1688},
      {"pesoKg":80,"cmsKg":3.932,"ndtKg":2.086,"pbG":557.8,"caG":15.27,"pG":10.08,"ndtFrac":0.5305,"pbFrac":0.1419},
      {"pesoKg":90,"cmsKg":4.261,"ndtKg":2.255,"pbG":598.7,"caG":15.77,"pG":10.48,"ndtFrac":0.5292,"pbFrac":0.1405},
    ],
  },
  {
    ...{"id":"ordenha-inicio/baixa-producao","fase":"ordenha-inicio","faseNome":"Ordenha — início da lactação","nivel":"Baixa produção","leiteLbDia":[10.2,14.1]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.275,"ndtKg":1.816,"pbG":485,"caG":16.07,"pG":9.38,"ndtFrac":0.7982,"pbFrac":0.2132},
      {"pesoKg":60,"cmsKg":2.575,"ndtKg":2.046,"pbG":540.9,"caG":16.47,"pG":9.78,"ndtFrac":0.7946,"pbFrac":0.2101},
      {"pesoKg":70,"cmsKg":3.433,"ndtKg":2.275,"pbG":616.7,"caG":17.66,"pG":10.88,"ndtFrac":0.6627,"pbFrac":0.1796},
      {"pesoKg":80,"cmsKg":3.752,"ndtKg":2.485,"pbG":669.6,"caG":18.16,"pG":11.38,"ndtFrac":0.6623,"pbFrac":0.1785},
      {"pesoKg":90,"cmsKg":4.051,"ndtKg":2.684,"pbG":718.5,"caG":18.56,"pG":11.78,"ndtFrac":0.6626,"pbFrac":0.1774},
    ],
  },
  {
    ...{"id":"ordenha-inicio/media-producao","fase":"ordenha-inicio","faseNome":"Ordenha — início da lactação","nivel":"Média produção","leiteLbDia":[12.8,17.68]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.654,"ndtKg":2.106,"pbG":590.8,"caG":19.66,"pG":11.38,"ndtFrac":0.7935,"pbFrac":0.2226},
      {"pesoKg":60,"cmsKg":2.994,"ndtKg":2.385,"pbG":658.6,"caG":20.14,"pG":11.88,"ndtFrac":0.7966,"pbFrac":0.22},
      {"pesoKg":70,"cmsKg":3.323,"ndtKg":2.634,"pbG":722.5,"caG":20.66,"pG":12.27,"ndtFrac":0.7927,"pbFrac":0.2174},
      {"pesoKg":80,"cmsKg":3.622,"ndtKg":2.884,"pbG":782.4,"caG":21.06,"pG":12.67,"ndtFrac":0.7962,"pbFrac":0.216},
      {"pesoKg":90,"cmsKg":3.922,"ndtKg":3.123,"pbG":840.2,"caG":21.45,"pG":13.07,"ndtFrac":0.7963,"pbFrac":0.2142},
    ],
  },
  {
    ...{"id":"ordenha-inicio/alta-producao","fase":"ordenha-inicio","faseNome":"Ordenha — início da lactação","nivel":"Alta produção","leiteLbDia":[15.4,21.1]},
    linhas: [
      {"pesoKg":50,"cmsKg":3.024,"ndtKg":2.405,"pbG":695.5,"caG":23.35,"pG":13.47,"ndtFrac":0.7953,"pbFrac":0.23},
      {"pesoKg":60,"cmsKg":3.413,"ndtKg":2.714,"pbG":776.4,"caG":23.85,"pG":13.97,"ndtFrac":0.7952,"pbFrac":0.2275},
      {"pesoKg":70,"cmsKg":3.782,"ndtKg":3.004,"pbG":851.2,"caG":24.35,"pG":14.47,"ndtFrac":0.7943,"pbFrac":0.2251},
      {"pesoKg":80,"cmsKg":4.131,"ndtKg":3.283,"pbG":921.1,"caG":24.85,"pG":14.97,"ndtFrac":0.7947,"pbFrac":0.223},
      {"pesoKg":90,"cmsKg":4.461,"ndtKg":3.553,"pbG":988.9,"caG":25.35,"pG":15.37,"ndtFrac":0.7965,"pbFrac":0.2217},
    ],
  },
  {
    ...{"id":"ordenha-meio/baixa-producao","fase":"ordenha-meio","faseNome":"Ordenha — meio da lactação","nivel":"Baixa produção","leiteLbDia":[7.3,10.1]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.674,"ndtKg":1.776,"pbG":424.1,"caG":16.66,"pG":9.88,"ndtFrac":0.6642,"pbFrac":0.1586},
      {"pesoKg":60,"cmsKg":2.994,"ndtKg":1.986,"pbG":471,"caG":17.06,"pG":10.28,"ndtFrac":0.6633,"pbFrac":0.1573},
      {"pesoKg":70,"cmsKg":4.121,"ndtKg":2.185,"pbG":548.8,"caG":18.66,"pG":11.88,"ndtFrac":0.5302,"pbFrac":0.1332},
      {"pesoKg":80,"cmsKg":4.481,"ndtKg":2.375,"pbG":593.8,"caG":19.16,"pG":12.37,"ndtFrac":0.53,"pbFrac":0.1325},
      {"pesoKg":90,"cmsKg":4.82,"ndtKg":2.555,"pbG":635.7,"caG":19.56,"pG":12.77,"ndtFrac":0.5301,"pbFrac":0.1319},
    ],
  },
  {
    ...{"id":"ordenha-meio/media-producao","fase":"ordenha-meio","faseNome":"Ordenha — meio da lactação","nivel":"Média produção","leiteLbDia":[9.2,12.6]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.595,"ndtKg":2.066,"pbG":493,"caG":19.66,"pG":11.28,"ndtFrac":0.7961,"pbFrac":0.19},
      {"pesoKg":60,"cmsKg":3.473,"ndtKg":2.305,"pbG":569.8,"caG":20.86,"pG":12.47,"ndtFrac":0.6637,"pbFrac":0.1641},
      {"pesoKg":70,"cmsKg":3.822,"ndtKg":2.535,"pbG":623.7,"caG":21.36,"pG":12.97,"ndtFrac":0.6633,"pbFrac":0.1632},
      {"pesoKg":80,"cmsKg":4.141,"ndtKg":2.744,"pbG":673.6,"caG":21.75,"pG":13.37,"ndtFrac":0.6626,"pbFrac":0.1627},
      {"pesoKg":90,"cmsKg":4.461,"ndtKg":2.954,"pbG":720.5,"caG":22.15,"pG":13.87,"ndtFrac":0.6622,"pbFrac":0.1615},
    ],
  },
  {
    ...{"id":"ordenha-meio/alta-producao","fase":"ordenha-meio","faseNome":"Ordenha — meio da lactação","nivel":"Alta produção","leiteLbDia":[11,12.2]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.954,"ndtKg":2.345,"pbG":578.8,"caG":23.25,"pG":13.37,"ndtFrac":0.7938,"pbFrac":0.1959},
      {"pesoKg":60,"cmsKg":3.293,"ndtKg":2.624,"pbG":641.7,"caG":23.65,"pG":13.77,"ndtFrac":0.7968,"pbFrac":0.1949},
      {"pesoKg":70,"cmsKg":3.622,"ndtKg":2.874,"pbG":701.5,"caG":24.15,"pG":14.27,"ndtFrac":0.7935,"pbFrac":0.1937},
      {"pesoKg":80,"cmsKg":4.71,"ndtKg":3.123,"pbG":788.3,"caG":25.65,"pG":15.67,"ndtFrac":0.6631,"pbFrac":0.1674},
      {"pesoKg":90,"cmsKg":5.059,"ndtKg":3.353,"pbG":843.2,"caG":26.15,"pG":16.17,"ndtFrac":0.6628,"pbFrac":0.1667},
    ],
  },
  {
    ...{"id":"ordenha-fim/baixa-producao","fase":"ordenha-fim","faseNome":"Ordenha — fim da lactação","nivel":"Baixa produção","leiteLbDia":[4.4,6.1]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.734,"ndtKg":1.447,"pbG":335.3,"caG":16.66,"pG":9.98,"ndtFrac":0.5293,"pbFrac":0.1226},
      {"pesoKg":60,"cmsKg":3.074,"ndtKg":1.627,"pbG":374.2,"caG":17.16,"pG":10.38,"ndtFrac":0.5293,"pbFrac":0.1217},
      {"pesoKg":70,"cmsKg":3.393,"ndtKg":1.796,"pbG":411.1,"caG":17.66,"pG":10.88,"ndtFrac":0.5293,"pbFrac":0.1212},
      {"pesoKg":80,"cmsKg":3.692,"ndtKg":1.956,"pbG":445.1,"caG":18.06,"pG":11.28,"ndtFrac":0.5298,"pbFrac":0.1206},
      {"pesoKg":90,"cmsKg":3.992,"ndtKg":2.116,"pbG":479,"caG":18.46,"pG":11.68,"ndtFrac":0.5301,"pbFrac":0.12},
    ],
  },
  {
    ...{"id":"ordenha-fim/media-producao","fase":"ordenha-fim","faseNome":"Ordenha — fim da lactação","nivel":"Média produção","leiteLbDia":[5.5,7.6]},
    linhas: [
      {"pesoKg":50,"cmsKg":3.133,"ndtKg":1.657,"pbG":400.2,"caG":20.36,"pG":12.07,"ndtFrac":0.5289,"pbFrac":0.1277},
      {"pesoKg":60,"cmsKg":3.513,"ndtKg":1.866,"pbG":447.1,"caG":20.86,"pG":12.57,"ndtFrac":0.5312,"pbFrac":0.1273},
      {"pesoKg":70,"cmsKg":3.872,"ndtKg":2.046,"pbG":489,"caG":21.36,"pG":13.07,"ndtFrac":0.5284,"pbFrac":0.1263},
      {"pesoKg":80,"cmsKg":4.211,"ndtKg":2.235,"pbG":528.9,"caG":21.85,"pG":13.47,"ndtFrac":0.5308,"pbFrac":0.1256},
      {"pesoKg":90,"cmsKg":4.53,"ndtKg":2.405,"pbG":566.8,"caG":22.25,"pG":13.97,"ndtFrac":0.5309,"pbFrac":0.1251},
    ],
  },
  {
    ...{"id":"ordenha-fim/alta-producao","fase":"ordenha-fim","faseNome":"Ordenha — fim da lactação","nivel":"Alta produção","leiteLbDia":[6.6,9.1]},
    linhas: [
      {"pesoKg":50,"cmsKg":2.814,"ndtKg":1.866,"pbG":437.1,"caG":23.05,"pG":13.17,"ndtFrac":0.6631,"pbFrac":0.1553},
      {"pesoKg":60,"cmsKg":3.942,"ndtKg":2.096,"pbG":517.9,"caG":24.55,"pG":14.67,"ndtFrac":0.5317,"pbFrac":0.1314},
      {"pesoKg":70,"cmsKg":4.341,"ndtKg":2.295,"pbG":566.8,"caG":25.15,"pG":15.17,"ndtFrac":0.5287,"pbFrac":0.1306},
      {"pesoKg":80,"cmsKg":4.71,"ndtKg":2.495,"pbG":611.7,"caG":25.65,"pG":15.67,"ndtFrac":0.5297,"pbFrac":0.1299},
      {"pesoKg":90,"cmsKg":5.069,"ndtKg":2.684,"pbG":655.6,"caG":26.15,"pG":16.17,"ndtFrac":0.5295,"pbFrac":0.1293},
    ],
  },
  {
    ...{"id":"bodes/mantenca","fase":"bodes","faseNome":"Bodes","nivel":"Mantença"},
    linhas: [
      {"pesoKg":50,"cmsKg":1.357,"ndtKg":0.718,"pbG":85.8,"caG":2.39,"pG":2,"ndtFrac":0.5291,"pbFrac":0.0632},
      {"pesoKg":75,"cmsKg":1.836,"ndtKg":0.968,"pbG":115.8,"caG":2.99,"pG":2.59,"ndtFrac":0.5272,"pbFrac":0.0631},
      {"pesoKg":100,"cmsKg":2.275,"ndtKg":1.207,"pbG":143.7,"caG":3.69,"pG":3.19,"ndtFrac":0.5305,"pbFrac":0.0632},
      {"pesoKg":125,"cmsKg":2.684,"ndtKg":1.427,"pbG":169.6,"caG":4.19,"pG":3.79,"ndtFrac":0.5317,"pbFrac":0.0632},
      {"pesoKg":150,"cmsKg":3.084,"ndtKg":1.637,"pbG":194.6,"caG":4.79,"pG":4.29,"ndtFrac":0.5308,"pbFrac":0.0631},
    ],
  },
  {
    ...{"id":"bodes/pre-cobertura","fase":"bodes","faseNome":"Bodes","nivel":"Pré-cobertura"},
    linhas: [
      {"pesoKg":50,"cmsKg":1.487,"ndtKg":0.788,"pbG":93.8,"caG":2.59,"pG":2.1,"ndtFrac":0.5299,"pbFrac":0.0631},
      {"pesoKg":75,"cmsKg":2.016,"ndtKg":1.068,"pbG":127.7,"caG":3.29,"pG":2.89,"ndtFrac":0.5298,"pbFrac":0.0633},
      {"pesoKg":100,"cmsKg":2.505,"ndtKg":1.327,"pbG":157.7,"caG":3.99,"pG":3.49,"ndtFrac":0.5297,"pbFrac":0.063},
      {"pesoKg":125,"cmsKg":2.954,"ndtKg":1.567,"pbG":186.6,"caG":4.59,"pG":4.09,"ndtFrac":0.5305,"pbFrac":0.0632},
      {"pesoKg":150,"cmsKg":3.393,"ndtKg":1.796,"pbG":213.6,"caG":5.19,"pG":4.69,"ndtFrac":0.5293,"pbFrac":0.063},
    ],
  },
];
