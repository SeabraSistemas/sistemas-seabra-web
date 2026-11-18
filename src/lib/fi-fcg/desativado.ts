/**
 * Rotas que gravavam na planilha do AppSheet (ou liam dela para as abas
 * ocultas) foram desligadas em 18/11/2026: gravar na planilha quebra o
 * AppSheet do Sérgio, e esconder a aba não impede um link antigo de gravar.
 * Respondem 410 (Gone) sem tocar na planilha.
 */
export const MENSAGEM_DESATIVADO = 'Função desativada. Use o Sistema Seabra.';

export function rotaDesativada(): Response {
  return Response.json({ erro: MENSAGEM_DESATIVADO }, { status: 410 });
}
