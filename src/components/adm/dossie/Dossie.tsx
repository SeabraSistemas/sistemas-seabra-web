import { CapaDossie, type DadosCapa } from '@/components/adm/dossie/CapaDossie';
import { BarrasOrdenadas, FichaNumeros, SecaoDossie } from '@/components/adm/dossie/SecaoDossie';
import { DistribuicaoBarras } from '@/components/adm/charts/DistribuicaoBarras';
import { DistribuicaoDonut } from '@/components/adm/charts/DistribuicaoDonut';
import { NuvemPesoIdade } from '@/components/adm/charts/NuvemPesoIdade';
import { RadarAml } from '@/components/adm/charts/RadarAml';
import { SERIES, SERIES_PAPEL } from '@/components/adm/charts/theme';
import { SerieTemporal } from '@/components/adm/charts/SerieTemporal';
import { ESCALA_AML, pontosDoRadar } from '@/lib/adm/areas/avaliacoes';
import { etapasDoFunil, funilInvertido } from '@/lib/adm/areas/reproducao';
import type { LinhaAvaliacoes, LinhaCrescimento, LinhaReproducao } from '@/lib/adm/areas/contrato';
import { VAZIO, formatarInteiro, formatarLitros, formatarNumero, formatarPercentual } from '@/lib/adm/format';
import type { VisaoGeralPropriedade } from '@/lib/adm/types';

/**
 * O corpo do dossiê comercial (decisão D4).
 *
 * NÃO É UM DASHBOARD. A diferença não é decorativa e organiza todo este arquivo:
 *
 *  · o dashboard é lido por quem já sabe do que se trata; o dossiê é lido pelo
 *    CRIADOR, que recebe o PDF por WhatsApp e pode nunca ter aberto o painel.
 *    Por isso cada seção tem um resumo em português comercial e uma janela de
 *    apuração dita por extenso;
 *  · o dashboard mostra o que existe; o dossiê SÓ MOSTRA O QUE TEM SUBSTÂNCIA.
 *    Uma seção sem dado não vira "—", ela desaparece: uma peça de venda com
 *    metade dos campos vazios trabalha contra quem a envia;
 *  · o dashboard rola; o dossiê PAGINA. As quebras estão no CSS
 *    (src/app/adm/dossie.css), e é lá que mora a decisão de fundo claro na
 *    impressão — papel escuro é ilegível e gasta tinta.
 *
 * OS GRÁFICOS SÃO OS MESMOS DO PAINEL, não cópias. Duplicá-los para o papel
 * criaria duas verdades sobre o mesmo número, e a versão do dossiê é justamente
 * a que ninguém lembraria de atualizar. Eles se adaptam ao papel pelas
 * variáveis CSS que o `@media print` sobrescreve.
 */

export interface DadosDossie {
  capa: DadosCapa;
  visao: VisaoGeralPropriedade;
  reproducao: LinhaReproducao | null;
  crescimento: LinhaCrescimento | null;
  avaliacoes: LinhaAvaliacoes | null;
}

/** Uma seção só entra no documento se tiver o que dizer. */
function temProducao(v: VisaoGeralPropriedade): boolean {
  return (v.producao30d ?? 0) > 0 || v.producaoDiaria90d.length > 0;
}

function temReproducao(r: LinhaReproducao | null): r is LinhaReproducao {
  return r != null && (r.coberturas_12m > 0 || r.partos_12m > 0 || r.diagnosticos_12m > 0);
}

function temCrescimento(c: LinhaCrescimento | null): c is LinhaCrescimento {
  return c != null && (c.nuvem_peso_idade ?? []).length > 0;
}

function temAvaliacao(a: LinhaAvaliacoes | null): a is LinhaAvaliacoes {
  return a != null && a.amls_total > 0 && (a.media_por_ponto ?? []).length > 0;
}

/**
 * A regra que o §3 de src/app/adm/dossie.css descreve — DERIVADA de SERIES, e
 * não uma segunda cópia dos hexes.
 *
 * Por que precisa ser CSS e não uma prop: o recharts pinta a cor como ATRIBUTO
 * de apresentação no SVG (`fill="#f0d3b0"`), e qualquer declaração de autor
 * vence atributo de apresentação. Daí o seletor por atributo com o hex exato —
 * é o único jeito de rebaixar a paleta sem duplicar os componentes de gráfico.
 *
 * Sem `@media print` de propósito: a folha já é clara NA TELA, e o ponto do
 * dossiê é que o que se revisa seja, byte a byte, o que o cliente recebe. Uma
 * paleta de tela e outra de papel traria de volta o problema que o CSS alerta.
 */
function cssDaEscalaDeImpressao(): string {
  return SERIES.map((tela, i) => {
    const papel = SERIES_PAPEL[i];
    if (papel === tela) return '';
    return (
      `.dossie [fill="${tela}"]{fill:${papel}}` +
      `.dossie [stroke="${tela}"]{stroke:${papel}}`
    );
  }).join('');
}

export function Dossie({ dados }: { dados: DadosDossie }) {
  const { capa, visao, reproducao, crescimento, avaliacoes } = dados;

  /**
   * A numeração é DERIVADA da lista de seções presentes, não incrementada
   * durante o render.
   *
   * O porquê do formato: seção que some não pode deixar buraco na sequência —
   * "01, 03, 05" denuncia o que foi omitido, e num documento comercial isso
   * levanta exatamente a pergunta que a peça não quer levantar. E derivar de
   * uma lista, em vez de um contador que avança a cada JSX, mantém o componente
   * puro: um contador mutável dá resultado diferente se o React renderizar duas
   * vezes, que é o que ele faz em modo estrito.
   */
  const secoes = [
    'rebanho',
    ...(temProducao(visao) ? ['producao'] : []),
    ...(temReproducao(reproducao) ? ['reproducao'] : []),
    ...(temCrescimento(crescimento) ? ['crescimento'] : []),
    ...(temAvaliacao(avaliacoes) ? ['avaliacoes'] : []),
  ];
  const numeroDa = (chave: string) => secoes.indexOf(chave) + 1;

  return (
    <article className="dossie">
      {/* Rebaixa a escala dos gráficos para o fundo branco da folha. Fica dentro
          do <article> para valer só aqui, e nunca no painel escuro. */}
      <style dangerouslySetInnerHTML={{ __html: cssDaEscalaDeImpressao() }} />

      <CapaDossie dados={capa} />

      <SecaoDossie
        numero={numeroDa('rebanho')}
        titulo="Retrato do rebanho"
        resumo="A composição do plantel hoje: quantos animais, de que categorias e de que idades."
        janela="posição atual"
      >
        <FichaNumeros
          itens={[
            { rotulo: 'Animais ativos', valor: formatarInteiro(visao.animaisAtivos) },
            { rotulo: 'Fêmeas', valor: formatarInteiro(visao.femeas) },
            { rotulo: 'Machos', valor: formatarInteiro(visao.machos) },
            { rotulo: 'Em lactação', valor: formatarInteiro(visao.lactantes) },
            { rotulo: 'Gestantes', valor: formatarInteiro(visao.gestantes) },
          ]}
        />

        {visao.porCategoria.length > 0 && (
          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Por categoria</h3>
            <DistribuicaoDonut dados={visao.porCategoria} altura={260} />
          </div>
        )}

        {visao.porRaca.length > 0 && (
          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Por raça</h3>
            <DistribuicaoBarras dados={visao.porRaca} altura={220} larguraRotulo={140} mostrarPercentual />
          </div>
        )}

        {visao.piramideEtaria.length > 0 && (
          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Faixas etárias</h3>
            {/*
              <BarrasOrdenadas>, e não <DistribuicaoBarras>: a segunda é um
              RANKING — ordena do maior para o menor e a faixa com zero animais
              desaparece. Numa distribuição etária a ordem É a informação (a
              forma da curva de reposição), e a faixa vazia é justamente o dado
              que se quer ver. Nas barras do painel isso passaria; num PDF que
              vai ao criador, seria um documento afirmando outra coisa.
            */}
            <BarrasOrdenadas
              itens={visao.piramideEtaria.map((f) => ({ rotulo: f.rotulo, valor: f.valor }))}
              vazio="Sem animais ativos."
            />
          </div>
        )}
      </SecaoDossie>

      {temProducao(visao) && (
        <SecaoDossie
          numero={numeroDa('producao')}
          titulo="Produção de leite"
          resumo="O que o tanque recebeu e como a produção se comportou nos últimos meses."
          janela="últimos 90 dias"
        >
          <FichaNumeros
            itens={[
              { rotulo: 'Produção · 30 dias', valor: formatarLitros(visao.producao30d) },
              { rotulo: 'Média por dia', valor: formatarLitros(visao.mediaProducaoDia) },
              { rotulo: 'Média por lactante/dia', valor: visao.mediaPorLactanteDia == null ? VAZIO : formatarLitros(visao.mediaPorLactanteDia, 2) },
              { rotulo: 'Dias em lactação (média)', valor: visao.mediaDel == null ? VAZIO : formatarNumero(visao.mediaDel, 0) },
            ]}
          />

          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Produção diária</h3>
            {/*
              buracos="vazio": dia sem lançamento NÃO é dia de zero litro, é dia
              não medido. Num documento que vai para o cliente, uma queda a pique
              inventada é pior que uma lacuna honesta.
            */}
            <SerieTemporal
              series={[{ chave: 'producao', nome: 'Litros do tanque', pontos: visao.producaoDiaria90d }]}
              granularidade="dia"
              buracos="vazio"
              altura={240}
              formato="litros"
            />
          </div>
        </SecaoDossie>
      )}

      {temReproducao(reproducao) && (
        <SecaoDossie
          numero={numeroDa('reproducao')}
          titulo="Reprodução"
          resumo="O ciclo reprodutivo do rebanho: coberturas, diagnósticos e partos."
          janela="últimos 12 meses"
        >
          <FichaNumeros
            itens={[
              { rotulo: 'Coberturas', valor: formatarInteiro(reproducao.coberturas_12m) },
              { rotulo: 'Taxa de prenhez', valor: reproducao.taxa_prenhez == null ? VAZIO : formatarPercentual(reproducao.taxa_prenhez) },
              { rotulo: 'Partos', valor: formatarInteiro(reproducao.partos_12m) },
              { rotulo: 'Prolificidade', valor: reproducao.prolificidade_media == null ? VAZIO : formatarNumero(reproducao.prolificidade_media, 2) },
              { rotulo: 'Abortos', valor: formatarInteiro(reproducao.abortos_12m) },
            ]}
          />

          {(() => {
            // Derivado das colunas ESCALARES, não do jsonb `funil`: se a view
            // for uma versão antiga sem aquela coluna, o funil ainda sai.
            const etapas = etapasDoFunil(reproducao);
            if (!etapas.some((e) => e.valor > 0)) return null;
            return (
              <div className="dossie-grafico">
                <h3 className="text-sm font-medium">Do serviço ao parto</h3>
                {/*
                  Ordem declarada e régua fixa no TOPO do funil. Com escala
                  relativa ao maior item, um criador que lança o parto e não
                  lança a cobertura veria "Partos" como barra cheia acima de
                  "Coberturas" — o funil desenhado de cabeça para baixo.
                */}
                <BarrasOrdenadas
                  itens={etapas.map((e) => ({
                    rotulo: e.rotulo,
                    valor: e.valor,
                    nota:
                      e.conversao == null
                        ? undefined
                        : `${formatarPercentual(e.conversao)} da etapa anterior`,
                  }))}
                  maximo={etapas[0].valor}
                  larguraRotulo="46mm"
                  vazio="Sem evento reprodutivo no período."
                />
                {funilInvertido(etapas) && (
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    Alguma etapa aparece acima da anterior. O aplicativo exige o registro do
                    nascimento e não exige o da cobertura nem o do diagnóstico — a diferença é
                    lançamento que faltou, não desempenho do rebanho.
                  </p>
                )}
              </div>
            );
          })()}
        </SecaoDossie>
      )}

      {temCrescimento(crescimento) && (
        <SecaoDossie
          numero={numeroDa('crescimento')}
          titulo="Crescimento"
          resumo="O peso de cada animal comparado à meta da própria fazenda."
          janela="pesagens dos últimos 12 meses"
        >
          <FichaNumeros
            itens={[
              { rotulo: 'Pesagens', valor: formatarInteiro(crescimento.pesagens_12m) },
              { rotulo: 'Ganho médio diário', valor: crescimento.gmd_medio == null ? VAZIO : `${formatarNumero(crescimento.gmd_medio, 3)} kg` },
              { rotulo: 'Abaixo da meta', valor: formatarInteiro(crescimento.abaixo_da_meta) },
            ]}
          />

          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Peso por idade</h3>
            <NuvemPesoIdade
              pontos={crescimento.nuvem_peso_idade ?? []}
              pesoIdealDesmame={crescimento.peso_ideal_desmame}
              idadeDesmame={crescimento.idade_desmame}
              pesoIdealEntradaReproducao={crescimento.peso_ideal_entrada_reproducao}
              altura={280}
            />
          </div>
        </SecaoDossie>
      )}

      {temAvaliacao(avaliacoes) && (
        <SecaoDossie
          numero={numeroDa('avaliacoes')}
          titulo="Avaliação morfológica"
          resumo="O perfil de conformação do rebanho, ponto a ponto, na escala oficial da AML."
          janela="todas as avaliações já realizadas"
        >
          <FichaNumeros
            itens={[
              { rotulo: 'Avaliações', valor: formatarInteiro(avaliacoes.amls_total) },
              { rotulo: 'Pontuação média', valor: avaliacoes.pontuacao_media == null ? VAZIO : formatarNumero(avaliacoes.pontuacao_media, 1) },
              { rotulo: 'Medidas corporais', valor: formatarInteiro(avaliacoes.medidas_total) },
            ]}
          />

          <div className="dossie-grafico">
            <h3 className="text-sm font-medium">Perfil do rebanho</h3>
            <RadarAml
              pontos={pontosDoRadar(avaliacoes.media_por_ponto)}
              escala={ESCALA_AML}
              total={avaliacoes.pontuacao_media}
              rotuloTotal="pontuação média"
              altura={300}
            />
            {/*
              A ressalva viaja com o gráfico. Sem ela, um criador que receba o
              PDF lê o polígono como nota escolar e conclui que o rebanho é
              ruim — a AML é escala biológica, e em vários pontos o ideal fica
              no meio.
            */}
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              A escala da avaliação morfológica vai de 1 a {ESCALA_AML} e descreve conformação, não
              qualidade: em vários pontos o desejável fica no meio da escala, e não no extremo.
            </p>
          </div>
        </SecaoDossie>
      )}

      <footer className="dossie-fechamento">
        <p className="text-sm">
          Relatório gerado a partir dos lançamentos do SeabraApp. Os números refletem o que foi
          registrado no aplicativo nas janelas indicadas em cada seção.
        </p>
        <p className="mt-2 text-sm">
          <strong className="font-medium">Sistema Seabra</strong> · software de gestão para o
          agronegócio · sistemaseabra.com.br
        </p>
      </footer>
    </article>
  );
}

