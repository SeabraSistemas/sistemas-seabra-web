import type { RegraId } from '@/lib/bovinos/tipos';

export type GrupoRegra = 'Estrutura' | 'Fazenda' | 'Pai' | 'Mãe e parto' | 'Reprodução';

export interface InfoRegra {
  titulo: string;
  grupo: GrupoRegra;
  /** Uma frase: o que é e por que importa. */
  descricao: string;
}

export const CATALOGO: Record<RegraId, InfoRegra> = {
  'linha-em-branco': {
    titulo: 'Linha em branco',
    grupo: 'Estrutura',
    descricao: 'Animal excluído pelo app que deixou a linha vazia. Abaixo dela a Categoria para de ser copiada.',
  },
  'linha-sem-identificacao': {
    titulo: 'Linha sem identificação',
    grupo: 'Estrutura',
    descricao: 'Linha sem ID rebanho, ID A e ID animal, mas com algum dado digitado — conferir antes de excluir.',
  },
  'formula-ausente': {
    titulo: 'Fórmula que parou',
    grupo: 'Estrutura',
    descricao: 'Animal sem a fórmula de Categoria/Idade/Carimbo. Se for a última linha, os próximos animais também ficam sem.',
  },
  'formula-sobrescrita': {
    titulo: 'Fórmula sobrescrita',
    grupo: 'Estrutura',
    descricao: 'Coluna que deveria ter fórmula tem um valor digitado no lugar.',
  },
  'formula-versoes': {
    titulo: 'Fórmula com versões diferentes',
    grupo: 'Estrutura',
    descricao: 'A mesma coluna tem fórmulas diferentes em linhas diferentes — animais da mesma idade podem cair em categorias diferentes.',
  },
  'sem-chave': {
    titulo: 'Animal sem chave',
    grupo: 'Estrutura',
    descricao: 'Linha com animal mas sem ID A / ID rebanho — o app não liga partos e registros a ele.',
  },
  'chave-duplicada': {
    titulo: 'Chave repetida',
    grupo: 'Estrutura',
    descricao: 'Mesmo ID A ou ID rebanho em mais de uma linha.',
  },
  'data-placeholder': {
    titulo: 'Nascimento de mentira',
    grupo: 'Estrutura',
    descricao: 'Data de nascimento colada em lote (ex.: 01/01/2015) — idade e categoria ficam erradas.',
  },
  'linha-teste': {
    titulo: 'Registro de teste',
    grupo: 'Estrutura',
    descricao: 'Linha com "teste" no ID — pode apagar no app.',
  },
  'fazenda-fora-da-lista': {
    titulo: 'Fazenda errada',
    grupo: 'Fazenda',
    descricao: 'Valor de Fazenda que não é deste cliente (ex.: "Bonito" gravado na Santo Antônio).',
  },
  'pai-preencher': {
    titulo: 'Pai para preencher',
    grupo: 'Pai',
    descricao: 'O nascimento bate com uma IATF da mãe e o Rebanho está sem pai.',
  },
  'pai-trocar': {
    titulo: 'Pai errado',
    grupo: 'Pai',
    descricao: 'O Rebanho tem um sêmen diferente do da IATF que bate com o nascimento.',
  },
  'pai-tirar': {
    titulo: 'Pai que não existe',
    grupo: 'Pai',
    descricao: 'Nenhuma IATF bate com o nascimento (monta livre), mas o Rebanho tem sêmen.',
  },
  'pai-ambiguo': {
    titulo: 'Pai ambíguo',
    grupo: 'Pai',
    descricao: 'Duas IATFs da mãe podem ter gerado o bezerro — a fazenda precisa dizer qual.',
  },
  'gestacao-curta': {
    titulo: 'Gestação curta',
    grupo: 'Pai',
    descricao: 'Nasceu 240 a 269 dias depois da IATF: prematuro da IATF ou já estava prenha de touro.',
  },
  'mae-preencher': {
    titulo: 'Mãe para preencher',
    grupo: 'Mãe e parto',
    descricao: 'O parto tem a mãe e o cadastro do bezerro no Rebanho está sem.',
  },
  'mae-diferente': {
    titulo: 'Mãe diferente',
    grupo: 'Mãe e parto',
    descricao: 'A mãe no Rebanho não é a mesma do parto.',
  },
  'mae-dois-bezerros': {
    titulo: 'Mãe com dois bezerros próximos',
    grupo: 'Mãe e parto',
    descricao: 'A mesma vaca aparece com dois bezerros a menos de 250 dias — num dos partos a mãe está errada.',
  },
  'bezerro-em-partos-de-maes-diferentes': {
    titulo: 'Bezerro em partos de mães diferentes',
    grupo: 'Mãe e parto',
    descricao: 'O mesmo bezerro foi lançado em mais de um parto, com mães diferentes.',
  },
  'parto-duplicado': {
    titulo: 'Parto lançado duas vezes',
    grupo: 'Mãe e parto',
    descricao: 'O mesmo bezerro, da mesma mãe, em mais de uma linha de parto.',
  },
  'parto-sem-animal': {
    titulo: 'Parto sem animal no Rebanho',
    grupo: 'Mãe e parto',
    descricao: 'O bezerro do parto não existe no Rebanho (foi recadastrado sem ligação ou apagado).',
  },
  'previsto-iatf-posterior': {
    titulo: 'Fórmula do parto sem correção',
    grupo: 'Mãe e parto',
    descricao: 'O "Parto previsto" veio de uma IATF feita depois do nascimento — sinal de que a fórmula do AppSheet ainda pega a IATF mais recente.',
  },
  'iatf-mesmo-dia': {
    titulo: 'IATF duplicada',
    grupo: 'Reprodução',
    descricao: 'A mesma vaca com duas inseminações no mesmo dia e sêmens diferentes.',
  },
};

export const ROTULO_SEVERIDADE = { corrigivel: 'Corrigível', manual: 'Manual', info: 'Info' } as const;
