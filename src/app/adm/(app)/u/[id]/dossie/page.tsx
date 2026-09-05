import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import '@/app/adm/dossie.css';
import { BotaoImprimir } from '@/components/adm/dossie/BotaoImprimir';
import { Dossie, type DadosDossie } from '@/components/adm/dossie/Dossie';
import { EstadoVazio } from '@/components/adm/EstadoVazio';
import { extrairIp, extrairUserAgent, registrarAcesso } from '@/lib/adm/audit';
import { requireAdmSession } from '@/lib/adm/guard';
import { getAvaliacoes } from '@/lib/adm/areas/avaliacoes';
import { getCrescimento } from '@/lib/adm/areas/crescimento';
import { getReproducao } from '@/lib/adm/areas/reproducao';
import { lerSelecaoParam } from '@/lib/adm/escopo';
import { formatarData, formatarInteiro } from '@/lib/adm/format';
import { getEscopo, getVisaoGeral } from '@/lib/adm/queries';
import { SEGMENTO_ROTULO, type Segmento } from '@/lib/adm/types';

/**
 * O dossiê comercial de um criador — decisão D4.
 *
 * A TÉCNICA: esta é uma PÁGINA REAL com folha de estilo de impressão, e não um
 * PDF gerado por biblioteca. O Ctrl+P do navegador produz o arquivo com
 * fidelidade total de marca (a serifa, a paleta, o logo), a custo zero de
 * dependência. Gerar por `@react-pdf/renderer` obrigaria a reimplementar layout
 * e gráficos, e o resultado nunca bateria com o site — que é exatamente o que
 * uma peça de venda não pode fazer.
 *
 * UMA PROPRIEDADE POR VEZ, sempre. O dossiê é um documento sobre UMA fazenda: é
 * dela o número de criador na capa, e é dela a banda de meta do gráfico de
 * crescimento. Consolidar várias produziria um documento sobre ninguém — então
 * quando o escopo tem mais de uma e nenhuma foi escolhida, a página pede a
 * escolha em vez de somar.
 *
 * ⚠️ Rota deliberadamente FORA da navegação de abas: o dossiê não é uma aba, é
 * uma saída. Chega-se a ele pelo botão PDF do <ExportMenu>.
 */

export default async function DossiePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  // O gate já rodou em (app)/layout.tsx; aqui ele é a fonte do `sid` que amarra
  // a linha da trilha a ESTA sessão.
  const sessao = await requireAdmSession();

  const { id } = await params;
  const usuarioId = Number(id);
  if (!Number.isInteger(usuarioId) || usuarioId <= 0) notFound();

  const sp = await searchParams;
  const selecao = lerSelecaoParam(sp.prop);
  const agora = new Date();

  const escopoRes = await getEscopo(usuarioId, selecao);
  if (!escopoRes.ok) return <EstadoVazio resultado={escopoRes} />;
  const escopo = escopoRes.dados;

  const alvo = escopo.selecionada ?? (escopo.propriedades.length === 1 ? escopo.propriedades[0] : null);

  if (!alvo) {
    return (
      <div className="sem-impressao rounded-2xl border border-border bg-card p-6">
        <h1 className="text-lg">Escolha uma fazenda</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          {escopo.propriedades.length === 0
            ? 'Este usuário não alcança nenhuma propriedade — não há do que fazer um dossiê.'
            : `Este usuário alcança ${formatarInteiro(escopo.propriedades.length)} propriedades. O dossiê é um documento sobre UMA fazenda: é dela o número de criador na capa e a meta de peso do gráfico de crescimento. Selecione a propriedade no seletor acima.`}
        </p>
      </div>
    );
  }

  // A EMISSÃO DO DOSSIÊ É UM EVENTO PRÓPRIO na trilha.
  //
  // O layout da ficha já gravou `abriu_usuario`, mas esse é o MESMO evento das
  // outras doze abas: numa resposta a incidente ele não distingue "olhou a
  // ficha" de "gerou o documento e mandou por WhatsApp" — e o dossiê é a única
  // peça do painel que SAI da empresa. Sem esta linha, a pergunta "foi emitido
  // um dossiê deste criador?" não tem resposta.
  //
  // Registrado AQUI, e não antes: acima a página apenas pede a escolha da
  // fazenda, e gravar lá contaria emissões que não aconteceram. Só depois de
  // `alvo` resolvido existe documento — e só aqui se sabe QUAL propriedade
  // entrou nele (com uma fazenda só não há `?prop=` na URL). Ainda é antes de
  // carregar o dado, como manda audit.ts. `detalhes` leva id e rótulo, nunca
  // valor de campo pessoal.
  const cabecalhos = await headers();
  await registrarAcesso('exportou', {
    sid: sessao.sid,
    ator: sessao.sub,
    alvoTipo: 'usuario',
    alvoId: usuarioId,
    detalhes: { documento: 'dossie', formato: 'pdf', propriedade: alvo.id },
    ip: extrairIp(cabecalhos),
    userAgent: extrairUserAgent(cabecalhos),
  });

  // As quatro leituras do documento, em paralelo. As três de área podem falhar
  // sem derrubar a peça: um dossiê sem a seção de reprodução ainda é um dossiê,
  // e é melhor que uma tela de erro na mão de quem ia mandar o PDF ao cliente.
  const [visaoRes, reproducaoRes, crescimentoRes, avaliacoesRes] = await Promise.all([
    getVisaoGeral(alvo.id),
    getReproducao(alvo.id),
    getCrescimento(alvo.id),
    getAvaliacoes(alvo.id),
  ]);

  if (!visaoRes.ok) return <EstadoVazio resultado={visaoRes} />;

  const segmentos = alvo.segmentos
    .map((s) => SEGMENTO_ROTULO[s as Segmento] ?? s)
    .filter(Boolean)
    .join(' · ');

  const local = [alvo.cidade, alvo.estado].filter(Boolean).join(' — ');

  const dados: DadosDossie = {
    capa: {
      criador: escopo.usuario.nome,
      propriedade: alvo.nome,
      numeroCriador: alvo.numero_criador,
      local: local || null,
      segmentos: segmentos || null,
      animaisAtivos: formatarInteiro(alvo.animais_ativos),
      clienteDesde: escopo.usuario.data_cadastro ? formatarData(escopo.usuario.data_cadastro) : null,
      emitidoEm: formatarData(agora),
      janela: 'últimos 12 meses, salvo indicação em cada seção',
      // Declaração de responsabilidade: numa peça que circula por WhatsApp,
      // quem é o dono do dado precisa estar na capa, não numa nota de rodapé.
      responsavel: alvo.vinculo === 'dono' ? null : (alvo.dono_nome ?? null),
    },
    visao: visaoRes.dados,
    reproducao: reproducaoRes.ok ? reproducaoRes.dados : null,
    crescimento: crescimentoRes.ok ? crescimentoRes.dados : null,
    avaliacoes: avaliacoesRes.ok ? avaliacoesRes.dados : null,
  };

  return (
    <div className="flex flex-col gap-4">
      <BotaoImprimir nomeSugerido={`Dossie ${alvo.nome}`} />
      {/*
        `.dossie-mesa` é a MESA em volta da folha — o vão escuro que faz a
        página branca parecer papel. Ela envolve o documento; não é régua de
        números (esse é o <FichaNumeros>). O `@media print` a neutraliza junto
        com os ancestrais, então nada dela vai para a impressora.
      */}
      <div className="dossie-mesa">
        <Dossie dados={dados} />
      </div>
    </div>
  );
}
