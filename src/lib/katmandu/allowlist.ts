/**
 * Lista de usuários liberados pro /katmandu. Estática por decisão do Felipe:
 * mais simples que ler a aba "User Manager" da planilha via Sheets API — isso
 * evitaria depender da service account só pra logar (os DADOS dos dashboards
 * continuam vindo da planilha de verdade, só o gate de acesso é local).
 *
 * Adicionar/remover usuário aqui é só editar este array.
 */
export const USUARIOS_PERMITIDOS = [
  'felipeseabracl@gmail.com',
  'cvdsilva@hotmail.com',
  'gustavoweber2017@gmail.com',
];
