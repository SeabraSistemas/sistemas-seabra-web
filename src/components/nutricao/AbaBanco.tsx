'use client';

import { ChevronDown, ChevronUp, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NOME_GRUPO, ORDEM_GRUPOS, alimentoOriginal, avisosDoAlimento, foiEditado, novoAlimentoVazio, type EdicoesBanco } from '@/lib/nutricao/alimentos';
import type { Alimento, GrupoAlimento } from '@/lib/nutricao/tipos';
import { numero, pct, reais } from '@/components/nutricao/formato';
import { Aviso, Botao, NumeroInput, Rotulo, Secao, Selecao, Selo } from '@/components/nutricao/ui';
import { cn } from '@/lib/utils';

type CampoComposicao = 'ms' | 'pb' | 'ndt' | 'fdn' | 'ca' | 'p' | 'ee' | 'mm' | 'cnf' | 'amido';

const CAMPOS: { chave: CampoComposicao; rotulo: string; sufixo: string; info: string }[] = [
  { chave: 'ms', rotulo: 'Matéria seca', sufixo: '% MN', info: 'Quanto do alimento, como vem do cocho, é matéria seca (o resto é água). Em % da matéria natural.' },
  { chave: 'pb', rotulo: 'PB', sufixo: '% MS', info: 'Proteína bruta. A ureia passa de 100% porque a conta é o equivalente proteico (281%).' },
  { chave: 'ndt', rotulo: 'NDT', sufixo: '% MS', info: 'Nutrientes digestíveis totais: a energia do alimento. Só a gordura pura passa de 100%.' },
  { chave: 'fdn', rotulo: 'FDN', sufixo: '% MS', info: 'Fibra em detergente neutro: a fibra que enche o rúmen.' },
  { chave: 'ca', rotulo: 'Ca', sufixo: '% MS', info: 'Cálcio.' },
  { chave: 'p', rotulo: 'P', sufixo: '% MS', info: 'Fósforo.' },
  { chave: 'ee', rotulo: 'EE', sufixo: '% MS', info: 'Extrato etéreo: a gordura.' },
  { chave: 'mm', rotulo: 'MM', sufixo: '% MS', info: 'Matéria mineral (cinzas).' },
  { chave: 'cnf', rotulo: 'CNF', sufixo: '% MS', info: 'Carboidratos não fibrosos (açúcares, amido, pectina).' },
  { chave: 'amido', rotulo: 'Amido', sufixo: '% MS', info: 'Amido: parte do CNF, nunca maior que ele.' },
];

export function AbaBanco({ banco, edicoes, mudar }: { banco: Alimento[]; edicoes: EdicoesBanco; mudar: (e: EdicoesBanco) => void }) {
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState('');
  const [novoGrupo, setNovoGrupo] = useState<GrupoAlimento>('concentrado');
  const ids = useMemo(() => new Set(edicoes.criados.map((a) => a.id)), [edicoes.criados]);

  const editar = (alimento: Alimento, campo: CampoComposicao | 'preco', valor: number | null) => {
    if (ids.has(alimento.id)) {
      mudar({ ...edicoes, criados: edicoes.criados.map((a) => (a.id === alimento.id ? { ...a, [campo]: valor } : a)) });
      return;
    }
    const original = alimentoOriginal(alimento.id);
    const atual = { ...(edicoes.alteracoes[alimento.id] ?? {}) };
    if (original && original[campo] === valor) delete atual[campo];
    else atual[campo] = valor;
    const alteracoes = { ...edicoes.alteracoes };
    if (Object.keys(atual).length === 0) delete alteracoes[alimento.id];
    else alteracoes[alimento.id] = atual;
    mudar({ ...edicoes, alteracoes });
  };

  const voltarOriginal = (id: string) => {
    const alteracoes = { ...edicoes.alteracoes };
    delete alteracoes[id];
    mudar({ ...edicoes, alteracoes });
  };

  const criar = () => {
    const nome = novoNome.trim();
    if (!nome) return;
    const id = `meu-${Date.now().toString(36)}`;
    mudar({ ...edicoes, criados: [...edicoes.criados, novoAlimentoVazio(id, nome, novoGrupo)] });
    setNovoNome('');
    setAberto(id);
  };

  const filtro = busca.trim().toLowerCase();
  const visiveis = banco.filter((a) => filtro === '' || a.nome.toLowerCase().includes(filtro));
  const total = Object.keys(edicoes.alteracoes).length + edicoes.criados.length;

  return (
    <div className="space-y-4">
      <Secao
        titulo="Banco de alimentos"
        info={
          <>
            <p>O banco é o do formulador do Silas Greca (uso autorizado por ele), com <b>correções só nesta versão</b>: as planilhas originais ficam como estão.</p>
            <p>O que está suspeito aparece com aviso e pode ser editado. As edições ficam <b>só neste navegador</b>.</p>
            <p>Dado vazio (sem número) conta como zero na dieta, e a tela avisa quando um ingrediente usado tem dado faltando.</p>
          </>
        }
      >
        <div className="space-y-1">
          <Rotulo texto="Buscar" htmlFor="busca" />
          <input
            id="busca"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome do alimento"
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
        </div>
        {total > 0 && <p className="text-sm text-muted-foreground">{total} alimento{total > 1 ? 's' : ''} com edição ou criado{total > 1 ? 's' : ''} por você.</p>}
      </Secao>

      {ORDEM_GRUPOS.map((g) => {
        const itens = visiveis.filter((a) => a.grupo === g);
        if (itens.length === 0) return null;
        return (
          <section key={g} className="space-y-2">
            <h2 className="px-1 text-base">{NOME_GRUPO[g]}</h2>
            <ul className="space-y-2">
              {itens.map((a) => (
                <ItemBanco
                  key={a.id}
                  alimento={a}
                  aberto={aberto === a.id}
                  aoAlternar={() => setAberto(aberto === a.id ? null : a.id)}
                  editado={foiEditado(edicoes, a.id)}
                  criado={ids.has(a.id)}
                  aoEditar={(campo, v) => editar(a, campo, v)}
                  aoVoltar={() => voltarOriginal(a.id)}
                  aoExcluir={() => {
                    mudar({ ...edicoes, criados: edicoes.criados.filter((x) => x.id !== a.id) });
                    setAberto(null);
                  }}
                />
              ))}
            </ul>
          </section>
        );
      })}

      <Secao titulo="Novo alimento" info={<p>Cria um alimento seu (análise de laboratório, ingrediente da região). Fica só neste navegador; depois é só preencher a composição.</p>}>
        <div className="space-y-1">
          <Rotulo texto="Nome" htmlFor="novo-nome" />
          <input
            id="novo-nome"
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                e.preventDefault();
                criar();
              }
            }}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30"
          />
        </div>
        <div className="space-y-1">
          <Rotulo texto="Grupo" htmlFor="novo-grupo" />
          <Selecao id="novo-grupo" valor={novoGrupo} aoMudar={(v) => setNovoGrupo(v as GrupoAlimento)}>
            {ORDEM_GRUPOS.map((g) => (
              <option key={g} value={g}>
                {NOME_GRUPO[g]}
              </option>
            ))}
          </Selecao>
        </div>
        <Botao variante="primario" desabilitado={novoNome.trim() === ''} onClick={criar} className="w-full">
          <Plus className="size-4" /> Criar alimento
        </Botao>
      </Secao>
    </div>
  );
}

function ItemBanco({
  alimento: a,
  aberto,
  aoAlternar,
  editado,
  criado,
  aoEditar,
  aoVoltar,
  aoExcluir,
}: {
  alimento: Alimento;
  aberto: boolean;
  aoAlternar: () => void;
  editado: boolean;
  criado: boolean;
  aoEditar: (campo: CampoComposicao | 'preco', v: number | null) => void;
  aoVoltar: () => void;
  aoExcluir: () => void;
}) {
  const avisos = avisosDoAlimento(a);
  const graves = avisos.filter((x) => x.nivel !== 'info').length;
  const original = alimentoOriginal(a.id);
  const Seta = aberto ? ChevronUp : ChevronDown;

  return (
    <li className={cn('rounded-2xl border bg-card', graves > 0 ? 'border-warn/50' : 'border-border')}>
      <button type="button" onClick={aoAlternar} aria-expanded={aberto} className="flex min-h-14 w-full items-center gap-2 px-3 py-2 text-left">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{a.nome}</p>
          <p className="text-xs text-muted-foreground tabular-nums">
            MS {pct(a.ms, 0)} · PB {pct(a.pb, 1)} · NDT {pct(a.ndt, 0)} · {a.preco == null ? 'sem preço' : reais(a.preco)}
          </p>
        </div>
        {criado && <Selo nivel="neutro">seu</Selo>}
        {editado && <Selo nivel="ok">editado</Selo>}
        {graves > 0 && <Selo nivel="aviso">⚠ {graves}</Selo>}
        <Seta className="size-5 shrink-0 text-muted-foreground" />
      </button>

      {aberto && (
        <div className="space-y-3 border-t border-border p-3">
          {avisos.map((av) => (
            <Aviso key={av.texto} nivel={av.nivel}>
              {av.texto}
            </Aviso>
          ))}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CAMPOS.map((c) => {
              const valor = a[c.chave];
              const doOriginal = original?.[c.chave];
              const mudou = original != null && doOriginal !== valor;
              return (
                <div key={c.chave} className="space-y-1">
                  <Rotulo texto={c.rotulo} info={<p>{c.info}</p>} />
                  <NumeroInput
                    rotuloAria={`${c.rotulo} de ${a.nome}`}
                    valor={valor == null ? null : Number((valor * 100).toFixed(4))}
                    aoMudar={(n) => aoEditar(c.chave, n == null ? null : n / 100)}
                    sufixo={c.sufixo}
                    placeholder="sem dado"
                    casas={4}
                    max={c.chave === 'pb' || c.chave === 'ndt' ? 1000 : 100}
                  />
                  {mudou && <p className="text-xs text-muted-foreground tabular-nums">planilha: {doOriginal == null ? 'sem dado' : `${numero(doOriginal * 100, 2)}%`}</p>}
                </div>
              );
            })}
            <div className="space-y-1">
              <Rotulo texto="Preço" info={<p>R$ por kg de matéria natural. Vazio = sem preço (diferente de R$ 0,00).</p>} />
              <NumeroInput rotuloAria={`Preço de ${a.nome}`} valor={a.preco} aoMudar={(n) => aoEditar('preco', n)} sufixo="R$/kg" placeholder="sem preço" casas={3} />
              {original != null && original.preco !== a.preco && <p className="text-xs text-muted-foreground tabular-nums">planilha: {original.preco == null ? 'sem preço' : reais(original.preco)}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {editado && (
              <Botao onClick={aoVoltar}>
                <RotateCcw className="size-4" /> Voltar ao original
              </Botao>
            )}
            {criado && (
              <Botao variante="perigo" onClick={aoExcluir}>
                <Trash2 className="size-4" /> Excluir
              </Botao>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
