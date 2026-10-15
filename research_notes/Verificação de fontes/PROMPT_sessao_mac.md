# Pedido para colar numa sessão aberta no Mac mini

Como usar: no app do Claude, no Mac mini, abra uma sessão nova no ambiente local `sistemas-seabra-web`. Selecione o modelo **Sonnet 5.5**, que é bom para verificação e extração. Depois cole tudo o que está abaixo da linha.

---

Você vai aprofundar e verificar uma pesquisa sobre modelos de avaliação genética (DEP/EPD, PTA, BLUP, ssGBLUP, índices) para a Sistema Seabra. A pesquisa foi feita numa sessão na nuvem que não alcançava as bases acadêmicas, só a busca web. Por isso os relatórios foram escritos a partir de resumos e trechos, e muitas equações e números estão marcados [não verificado], [conferido numericamente] ou "atribuição a confirmar". Você roda no Mac do usuário, com acesso normal à internet.

## Material
Na branch `claude/wizardly-dirac-q4tdzd` do repositório SeabraSistemas/sistemas-seabra-web:
- `reports/Avaliação genética de bovinos de corte.md` e as notas em `research_notes/Avaliação genética de bovinos de corte/`
- `reports/Avaliação genética de bovinos leiteiros.md` e as notas em `research_notes/Avaliação genética de bovinos leiteiros/`

## Regras de segurança (o repositório local é do usuário)
1. Não altere a cópia de trabalho atual nem a branch em uso. Nada de checkout, stash, reset, clean ou commit nela.
2. Trabalhe num worktree separado:
   git fetch origin claude/wizardly-dirac-q4tdzd
   git worktree add -b verificacao-fontes-tmp ../seabra-verificacao-fontes origin/claude/wizardly-dirac-q4tdzd
3. Crie arquivos só em `research_notes/Verificação de fontes/`. Não edite os relatórios nem as notas existentes; as correções serão aplicadas pela sessão principal.
4. Baixe PDFs para uma pasta fora do repositório, por exemplo ~/seabra-pdfs-tmp. Nunca faça commit de PDFs. Leia os PDFs com a ferramenta Read.
5. Use curl e Python 3 com a biblioteca padrão. Não instale pacotes e não mude configurações globais.
6. Não envie e-mail nem dados do usuário a nenhum serviço. Não use parâmetro mailto.
7. Use só fontes legítimas:
   - OpenAlex (`open_access.oa_url`);
   - Crossref;
   - Europe PMC e PMC;
   - SciELO;
   - páginas e PDFs de acesso aberto das editoras (Genetics Selection Evolution, PLoS ONE, Genetics, Journal of Dairy Science, Frontiers, MDPI, Animal Bioscience);
   - repositórios institucionais (Embrapa Alice e Infoteca, HAL/INRAE, teses USP, UNESP, UFV, UFMG, UNL Digital Commons, ARS/AIPL);
   - versões de autor;
   - páginas oficiais (BIF Guidelines, ANCP, ABCZ, Geneplus, Angus, BREEDPLAN, CDCB, Interbull, ICAR, Lactanet, Embrapa Gado de Leite).

   Não use Sci-Hub, LibGen nem qualquer outra fonte não autorizada, e não contorne paywalls.
8. Artigos pagos: registre os metadados e coloque o artigo na lista de "artigos para obter". O usuário pode obtê-los legalmente (CAPES/CAFe, biblioteca, pedido ao autor) e depois deixar os PDFs em ~/seabra-pdfs-usuario para leitura.
9. Ao terminar:
   git pull --rebase origin claude/wizardly-dirac-q4tdzd
   git push origin HEAD:claude/wizardly-dirac-q4tdzd
   Depois remova o worktree e a branch temporária: git worktree remove ../seabra-verificacao-fontes e git branch -D verificacao-fontes-tmp.

## Tarefa 1: verificar os dois relatórios
Para cada relatório, por prioridade:
1. **Equações.** Confira cada equação contra a fonte primária quando ela for de acesso aberto e diga se a forma do relatório bate. Notação equivalente conta como confirmada; diferenças substantivas devem ser apontadas.
   - Corte: H⁻¹ (Aguilar et al. 2010; Legarra et al. 2009; Christensen & Lund 2010), G (VanRaden 2008), APY (Misztal et al. 2014), limiar (Gianola & Foulley 1983), Daetwyler et al. 2008, Meuwissen et al. 2001, Legarra & Reverter 2018, Garrick et al. 2009, Meuwissen & Luo 1992, Hazel 1943, acurácia BIF e Possible Change (BIF Guidelines), Dempster & Lerner.
   - Leite: TIM e Procedure 2 da ICAR, best prediction (VanRaden 1997), Wood 1967, Wilmink 1987, Ali & Schaeffer 1987, regressão aleatória (Jamrozik & Schaeffer 1997; Schaeffer 2004), ECS (Wiggans & Shook 1987), ECM (Sjaunja 1990), DPR (VanRaden et al. 2004), SMGS (Van Tassell et al. 2003), Weibull (Ducrocq), tolerância ao calor (Ravagnolo & Misztal 2000), multi-step (VanRaden et al. 2009), DYD (VanRaden & Wiggans 1991), MACE (Schaeffer 1994), REL = DE/(DE + k), heterozigose e modelo multirracial (Elzo).
2. **Referências.** Confirme que cada referência citada com autor e ano existe e que ano, periódico, volume, páginas e DOI estão certos.
3. **Números atribuídos a fontes.** Confira herdabilidades, acurácias, pesos de índices (iABCZ, IQG, MGTe, NM$ 2025, TPI 2026, IPGL, IPG, ISG) e datas de adoção do single-step.

## Tarefa 2: aprofundar bovinos de corte com leitura de texto completo
Feche as lacunas do relatório de corte lendo os documentos completos:
- pesos atuais do MGTe (ANCP);
- modelo e software do PMGZ (ABCZ) e do Geneplus;
- tabelas de ajuste por idade da vaca (BIF e programas brasileiros);
- escala de acurácia usada por ANCP, ABCZ e Geneplus;
- fórmula de Possible Change;
- repetibilidade do peso à desmama;
- benchmarks brasileiros atuais de cria (Embrapa e consultorias com metodologia publicada);
- uso de prioris informativas em rebanhos pequenos de corte;
- status do single-step nos programas brasileiros em 2025 e 2026.

Leia também, em texto completo, revisões de referência sobre avaliação genética de corte em zebuínos tropicais e registre os modelos que cada uma descreve, com as equações copiadas literalmente.

## Entregáveis em `research_notes/Verificação de fontes/`
- `verificacao_corte.md` e `verificacao_leite.md`.
  - No topo, um resumo com as contagens: verificados, confirmados, a corrigir, não confirmados e acesso pago.
  - Depois, uma tabela por item com as colunas: seção do relatório | afirmação ou equação | fonte (URL/DOI) | status (confirmado / corrigir / não confirmado / acesso pago) | correção proposta com citação literal curta da fonte.
- `aprofundamento_corte.md`: dados novos, cada um com a URL de onde veio.
- `artigos_para_obter.md`: artigos pagos importantes, com DOI, explicando por que cada um importa.

Seja literal: copie equações e números como aparecem na fonte. Nunca invente DOI, número ou citação. Ao final, escreva um resumo de 5 a 10 linhas com o hash do commit enviado.
