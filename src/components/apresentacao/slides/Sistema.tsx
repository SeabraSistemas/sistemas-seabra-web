import Image from 'next/image';
import { Check, CircleAlert, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GraficoBarras } from '../GraficoBarras';
import { TEMA_CLARO, dominioRedondo, ticksRedondos } from '../graficos';
import { ListaTopicos, SeloIlustrativo } from '../partes';
import type { BlocoSistema, NivelAlerta, SlideSistema } from '../tipos';

const LOGO = {
  src: '/images/apresentacao-ovinos/logo-seabra-gerenciamento.png',
  alt: 'Seabra — Sistemas de Gerenciamento',
  largura: 1400,
  altura: 321,
};

const JANELA = { largura: 1040, barra: 88, respiro: 28 };
/** Largura útil de um bloco dentro da janela (tira respiro e borda do cartão). */
const LARGURA_BLOCO = JANELA.largura - JANELA.respiro * 2 - 2;

/**
 * Status fixos da skill dataviz (good/warning/critical), sempre com ícone:
 * a cor nunca carrega o significado sozinha.
 */
const NIVEL: Record<NivelAlerta, { cor: string; tinta: string; fundo: string; Icone: LucideIcon }> = {
  info: { cor: '#2a78d6', tinta: '#ffffff', fundo: 'transparent', Icone: Info },
  ok: { cor: '#0ca30c', tinta: '#ffffff', fundo: 'transparent', Icone: Check },
  alerta: { cor: '#fab219', tinta: '#111827', fundo: '#fff8e6', Icone: TriangleAlert },
  critico: { cor: '#d03b3b', tinta: '#ffffff', fundo: '#fdeeee', Icone: CircleAlert },
};

/**
 * "No sistema": o assunto do bloco numa tela do Sistema Seabra. A janela é
 * clara como o app, e é o único lugar do deck com o logo de gerenciamento.
 */
export function Sistema({ slide }: { slide: SlideSistema }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute bottom-[110px] left-[120px] top-[100px] flex w-[640px] flex-col">
        <p className="deck-rotulo">No sistema</p>
        <h2 className="deck-titulo mt-[22px] text-[76px] text-foreground">{slide.titulo}</h2>
        {slide.itens && (
          <div className="mt-[44px] flex flex-1 flex-col justify-center">
            <ListaTopicos itens={slide.itens.map((texto) => ({ texto }))} estilo="lista" tamanho="medio" />
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-[14px]">
          {slide.ilustrativo && <SeloIlustrativo />}
          {slide.emDesenvolvimento && (
            <p className="rounded-full border border-primary/60 px-[18px] py-[8px] text-[18px] uppercase tracking-[0.16em] text-primary">
              Em desenvolvimento
            </p>
          )}
        </div>
      </div>

      <div
        className="absolute bottom-[90px] right-[100px] top-[90px] overflow-hidden rounded-[22px] bg-white shadow-2xl"
        style={{ width: JANELA.largura }}
      >
        <div
          className="flex items-center justify-between border-b border-[#e5e7eb] px-[32px]"
          style={{ height: JANELA.barra }}
        >
          <Image
            src={LOGO.src}
            alt={LOGO.alt}
            width={LOGO.largura}
            height={LOGO.altura}
            loading="eager"
            className="h-[46px] w-auto"
          />
          <p className="text-[21px] text-[#6b7280]">{slide.tela.titulo}</p>
        </div>
        <div
          className="flex flex-col gap-[20px] bg-[#f3f5f8]"
          style={{ height: `calc(100% - ${JANELA.barra}px)`, padding: JANELA.respiro }}
        >
          {slide.tela.blocos.map((bloco, i) => (
            <Bloco key={i} bloco={bloco} />
          ))}
        </div>
      </div>
    </div>
  );
}

const CARTAO = 'rounded-[14px] border border-[#e5e7eb] bg-white';

function Bloco({ bloco }: { bloco: BlocoSistema }) {
  switch (bloco.tipo) {
    case 'metricas':
      return (
        <div className="grid gap-[16px]" style={{ gridTemplateColumns: `repeat(${bloco.itens.length}, 1fr)` }}>
          {bloco.itens.map((item) => (
            <div key={item.rotulo} className={cn(CARTAO, 'px-[22px] py-[18px]')}>
              <p className="text-[18px] leading-tight text-[#6b7280]">{item.rotulo}</p>
              <p className="mt-[8px] text-[34px] font-semibold leading-none tracking-tight text-[#111827]">
                {item.valor}
              </p>
              {item.detalhe && <p className="mt-[8px] text-[16px] leading-tight text-[#6b7280]">{item.detalhe}</p>}
            </div>
          ))}
        </div>
      );

    case 'tabela':
      return (
        <div className={cn(CARTAO, 'overflow-hidden')}>
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#f9fafb]">
              <tr>
                {bloco.colunas.map((coluna) => (
                  <th
                    key={coluna}
                    scope="col"
                    className="px-[20px] py-[14px] text-[16px] font-semibold uppercase tracking-[0.06em] text-[#6b7280]"
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloco.linhas.map((linha, i) => {
                const estado = bloco.estados?.[i];
                return (
                  <tr
                    key={linha.join('|')}
                    className="border-t border-[#eef0f3]"
                    style={estado ? { background: NIVEL[estado].fundo } : undefined}
                  >
                    {linha.map((celula, j) => (
                      <td key={j} className="px-[20px] py-[13px] text-[21px] tabular-nums text-[#111827]">
                        <span className="flex items-center gap-[10px]">
                          {j === 0 && estado && <Marca nivel={estado} tamanho={24} />}
                          {celula}
                        </span>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );

    case 'alertas':
      return (
        <div className={cn(CARTAO, 'divide-y divide-[#eef0f3]')}>
          {bloco.itens.map((item) => (
            <p key={item.texto} className="flex items-center gap-[16px] px-[20px] py-[15px] text-[21px] leading-snug text-[#111827]">
              <Marca nivel={item.nivel} tamanho={34} />
              {item.texto}
            </p>
          ))}
        </div>
      );

    case 'grafico': {
      const maximo = Math.max(...bloco.valores, bloco.referencia?.valor ?? 0);
      const dominio: [number, number] = [0, dominioRedondo(maximo)];
      const meta = bloco.referencia?.valor;
      const temAbaixo = meta !== undefined && bloco.valores.some((v) => v < meta);
      return (
        <div className={cn(CARTAO, 'px-[20px] pb-[10px] pt-[16px]')}>
          <div className="mb-[10px] flex items-center justify-between gap-[20px] text-[18px] text-[#374151]">
            <p className="font-semibold">{bloco.titulo}</p>
            {bloco.referencia && (
              <p className="flex items-center gap-[18px] text-[#6b7280]">
                <span className="flex items-center gap-[8px]">
                  <span aria-hidden className="h-[2px] w-[26px] bg-[#374151]" />
                  {bloco.referencia.rotulo}
                </span>
                {temAbaixo && (
                  <span className="flex items-center gap-[8px]">
                    <span aria-hidden className="size-[12px] rounded-[3px]" style={{ background: TEMA_CLARO.abaixo }} />
                    abaixo da meta
                  </span>
                )}
              </p>
            )}
          </div>
          <GraficoBarras
            forma={bloco.forma}
            rotulos={bloco.rotulos}
            valores={bloco.valores}
            unidade={bloco.unidade}
            largura={LARGURA_BLOCO - 42}
            altura={bloco.altura ?? 230}
            dominio={dominio}
            ticks={ticksRedondos(dominio[1])}
            referencia={bloco.referencia?.valor}
            destacarAbaixo
            tema={TEMA_CLARO}
            atraso={250}
          />
        </div>
      );
    }
  }
}

function Marca({ nivel, tamanho }: { nivel: NivelAlerta; tamanho: number }) {
  const { cor, tinta, Icone } = NIVEL[nivel];
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{ width: tamanho, height: tamanho, background: cor }}
      role="img"
      aria-label={nivel === 'critico' ? 'crítico' : nivel === 'alerta' ? 'atenção' : nivel}
    >
      <Icone style={{ width: tamanho * 0.58, height: tamanho * 0.58, color: tinta }} strokeWidth={2.5} aria-hidden />
    </span>
  );
}
