/* eslint-disable @next/next/no-img-element -- SVG estático impresso no PDF; <Image> não ajuda aqui */
import { EMPRESA, LINKS } from '@/data/orcamentos';
import { brl, dataBR, lerNumero, somarDias, totais, totalItem } from '@/lib/orcamentos/valores';
import type { Orcamento } from './estado';

const semProtocolo = (url: string) => url.replace(/^https:\/\/(www\.)?/, '');

/** A folha A4 — prévia na tela e, na impressão, o próprio PDF. */
export function Folha({ o }: { o: Orcamento }) {
  const itens = o.itens.filter((i) => i.nome.trim() || lerNumero(i.valor) > 0);
  const t = totais(itens, o.desconto);
  const dias = Math.max(0, Math.round(lerNumero(o.validadeDias)));
  const linhasCliente = [
    ['CNPJ/CPF', o.documento],
    ['Endereço', o.endereco],
    ['Contato', o.contato],
  ].filter(([, v]) => v.trim());

  return (
    <article className="orc-folha">
      <header className="orc-topo">
        <div className="orc-marca">
          <img src="/images/logo-icon-recorte.svg" alt="" className="orc-logo" />
          <div>
            <p className="orc-razao">{EMPRESA.razaoSocial}</p>
            <p className="orc-miudo">CNPJ {EMPRESA.cnpj}</p>
            <p className="orc-miudo">{EMPRESA.endereco}</p>
            <p className="orc-miudo">{EMPRESA.cidade}</p>
          </div>
        </div>
        <div className="orc-doc">
          <p className="orc-titulo">Orçamento</p>
          <dl>
            <dt>Data</dt>
            <dd>{dataBR(o.data)}</dd>
            {dias > 0 && (
              <>
                <dt>Válido até</dt>
                <dd>{dataBR(somarDias(o.data, dias))}</dd>
              </>
            )}
          </dl>
        </div>
      </header>

      <section className="orc-cliente">
        <p className="orc-rotulo">Cliente</p>
        <p className="orc-cliente-nome">{o.cliente.trim() || '—'}</p>
        {linhasCliente.length > 0 && (
          <p className="orc-cliente-linhas">
            {linhasCliente.map(([k, v]) => (
              <span key={k}>
                <b>{k}:</b> {v}
              </span>
            ))}
          </p>
        )}
      </section>

      <table className="orc-tabela">
        <thead>
          <tr>
            <th className="qtd">Qtd</th>
            <th>Descrição</th>
            <th className="num">Valor un.</th>
            <th className="num">Total</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 && (
            <tr>
              <td colSpan={4} className="orc-vazio">
                Nenhum item
              </td>
            </tr>
          )}
          {itens.map((i) => (
            <tr key={i.id}>
              <td className="qtd">{i.qtd.trim() || '1'}</td>
              <td>
                <p className="orc-item-nome">{i.nome}</p>
                {i.detalhe.trim() && <p className="orc-item-detalhe">{i.detalhe}</p>}
              </td>
              <td className="num">{brl(lerNumero(i.valor))}</td>
              <td className="num">{brl(totalItem(i))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="orc-totais">
        {t.desconto > 0 && (
          <>
            <dt>Subtotal</dt>
            <dd>{brl(t.subtotal)}</dd>
            <dt>Desconto</dt>
            <dd>− {brl(t.desconto)}</dd>
          </>
        )}
        <dt className="orc-total-rotulo">Total</dt>
        <dd className="orc-total">{brl(t.total)}</dd>
      </dl>

      <div className="orc-base">
        <section className="orc-condicoes">
          <p className="orc-rotulo">Condições</p>
          <dl>
            {o.pagamento.trim() && (
              <div>
                <dt>Pagamento</dt>
                <dd>{o.pagamento}</dd>
              </div>
            )}
            {o.prazo.trim() && (
              <div>
                <dt>Prazo de entrega</dt>
                <dd>{o.prazo}</dd>
              </div>
            )}
            {dias > 0 && (
              <div>
                <dt>Validade da proposta</dt>
                <dd>
                  {dias} {dias === 1 ? 'dia' : 'dias'} (até {dataBR(somarDias(o.data, dias))})
                </dd>
              </div>
            )}
            {o.observacoes.trim() && (
              <div>
                <dt>Observações</dt>
                <dd>{o.observacoes}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="orc-conheca">
          <p className="orc-conheca-titulo">Conheça o Sistema Seabra</p>
          <p className="orc-miudo">Gestão de rebanho de caprinos, ovinos e bovinos — no celular, offline e na web.</p>
          <ul>
            {LINKS.map((l) => (
              <li key={l.url}>
                <span>{l.rotulo}</span>
                <a href={l.url}>{semProtocolo(l.url)}</a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="orc-rodape">
        <p>
          {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj} · WhatsApp <a href={EMPRESA.whatsapp}>{EMPRESA.telefone}</a> ·{' '}
          {EMPRESA.email} · {EMPRESA.site}
        </p>
      </footer>
    </article>
  );
}
