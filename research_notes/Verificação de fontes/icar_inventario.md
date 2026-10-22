# Inventário de documentos do ICAR para download

**Origem:** varredura do site icar.org feita em 22/10/2026 pelo Claude no Chrome do usuário (153 itens; links testados por requisição HEAD, segundo o relatório dele). **Esta sessão não abriu nenhum desses links** (a rede do ambiente estava em Confiável), então nada aqui foi lido nem conferido por nós. Este arquivo reúne os itens prioritários para o SeabraApp e a lista do que o ICAR não tem. O inventário completo (153 linhas) fica com o usuário.

Legenda de acesso: **livre** = abre sem login, segundo o inventário. **404/vazio** = o inventário diz que não existe.

## 1. Leitura obrigatória: controle leiteiro e pequenos ruminantes

| Documento | URL | Para quê |
|---|---|---|
| Section 16, Dairy Sheep and Goats (wiki) | https://wiki.icar.org/index.php/Section_16_%E2%80%93_Dairy_Sheep_and_Goats | Norma central de controle leiteiro de caprinos e ovinos: métodos A a E, cálculo de lactação, úbere |
| Section 16 (PDF legado, mesmo conteúdo) | https://www.icar.org/Guidelines/16-Dairy-Sheep-and-Goats.pdf | Leitura offline; conferir se bate com a wiki |
| Section 02, Cattle Milk Recording (wiki) | https://wiki.icar.org/index.php/Section_02_%E2%80%93_Cattle_Milk_Recording | Norma-base de controle leiteiro bovino |
| Section 02, Procedure 1: 24-hour yields | https://www.icar.org/Guidelines/02-Procedure-1-Computing-24-Hour-Yield.pdf | Fórmulas de produção em 24 h (AT/AC) |
| Section 02, Procedure 2: lactation yield | https://www.icar.org/Guidelines/02-Procedure-2-Computing-Lactation-Yield.pdf | TIM, Fleischmann e best prediction: base do `lactacao.py` |
| Ata de Interlaken 2002 (Método E) | https://www.icar.org/Guidelines/Minutes_28_5_2002-Interlaken-Method-E.pdf | Define o método E citado na Section 16 |
| Section 15, Data Exchange (ICAR ADE) | https://wiki.icar.org/index.php/Section_15_%E2%80%93_Data_Exchange | Padrão de troca de dados, para integrar o SeabraApp |
| Section 15 (PDF legado) | https://www.icar.org/Guidelines/15-Data-Exchange.pdf | Idem |
| Section 21, carne, reprodução e características maternas em ovinos e caprinos (**só o PDF legado; a wiki está vazia**) | https://www.icar.org/Guidelines/21-Meat-reproduction-and-maternal-traits-in-sheep-and-goats.pdf | Prolificidade e reprodução |

## 2. Planilhas de referência (para validar o motor)

| Documento | URL |
|---|---|
| Dia a partir de amostra única, Jenko | https://www.icar.org/Guidelines/Calculation-daily-yield-from-single-sample-by-Jenko.xlsx |
| % de gordura diária a partir de amostra única, Gerke | https://www.icar.org/Guidelines/Calculation-daily-fat-percentage-from-single-sample-by-Gerke.xlsx |
| DeLorenzo e Wiggans, 2 ordenhas | https://www.icar.org/wp-content/uploads/documents/Open_DeLorenzo-APP-2x-milking-english.xlsx |
| DeLorenzo e Wiggans, 3 ordenhas | https://www.icar.org/wp-content/uploads/documents/Open_DeLorenzo-APP-3x-milking-english.xlsx |
| Liu, AT | https://www.icar.org/wp-content/uploads/documents/Open_AT-calculation-Liu.xlsx |

## 3. Conformação e avaliação linear

| Documento | URL | Observação |
|---|---|---|
| Section 05, Conformation Recording (wiki) | https://wiki.icar.org/index.php/Section_05_%E2%80%93_Conformation_Recording | Tem subseção de caprinos leiteiros e Appendix 4 (traços padrão para cabras) |
| Section 05 (PDF legado) | https://www.icar.org/Guidelines/05-Conformation-Recording.pdf | Idem |
| Spehar, rumo a diretrizes ICAR de conformação em ovinos leiteiros (Verona 2026, resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Spehar.pdf | **Ainda não existe norma de conformação de ovinos e caprinos**; isto é a proposta |
| Idem, slides | https://www.icar.org/Documents/Verona-2026/Presentations/TS07_02_Spehar.pdf | |
| Herold, conformação como traço auxiliar em cabras (Bled 2024) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-28-Bled/Herold.pdf | Cabras leiteiras |

## 4. Software e métodos modernos

| Documento | URL | Observação |
|---|---|---|
| BWYPEX, implementação em Python dos métodos de 305 dias (resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS12_van%20Leerdam.pdf | **Verificar a licença e onde está o código** antes de qualquer uso |
| BWYPEX, slides | https://www.icar.org/Documents/Verona-2026/Presentations/TS12_02_van_Leerdam.pdf | |
| MilkBot, curva de lactação bayesiana (Trapanese) | https://www.icar.org/Documents/Verona-2026/Presentations/TS12_05_Trapanese.pdf | Alternativa a Wood e Fleischmann |
| Abordagem não paramétrica de desempenho (Lagarde) | https://www.icar.org/Documents/Verona-2026/Presentations/TS12_01_Lagarde.pdf | |
| Digitalização do setor de caprinos e ovinos com ICAR ADE (resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Ammerlaan-Sieperda.pdf | Arquitetura de dados |

## 5. Ovinos e caprinos: genômica, avaliação internacional e traços

| Documento | URL |
|---|---|
| Salaris, adoção de ferramentas genômicas (resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Salaris.pdf |
| Aldridge, avaliações multinacionais em ovinos (resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Aldridge.pdf |
| Astruc, cooperação Latxa e Manech (resumo) | https://www.icar.org/Documents/Verona-2026/Abstracts/TS07_Astruc.pdf |
| Spehar, uso de dados genômicos em ovinos (Bled 2024) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-28-Bled/Spehar.pdf |
| Astruc, resistência a nematódeos em ovinos leiteiros franceses (Bled 2024) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-28-Bled/Astruc.pdf |
| Fuerst-Waltl, longevidade em ovinos do Tirol (Bled 2024) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-28-Bled/Fuerst-Waltl.pdf |
| Šen, componentes de variância de tamanho de leitegada (Bled 2024) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-28-Bled/Sen.pdf |
| Salaris, esquema de seleção da Sarda na era genômica (Auckland 2018) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-23-Auckland/Salaris.pdf |
| Cesarani, acurácia genômica de ácidos graxos do leite ovino (Auckland 2018) | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-23-Auckland/Cesarani.pdf |
| **Monteiro, identificação eletrônica e visual de ovinos e caprinos no Brasil (Auckland 2018)** | https://www.icar.org/Documents/technical_series/ICAR-Technical-Series-no-23-Auckland/Monteiro.pdf |

## 6. Anais completos

| Edição | URL |
|---|---|
| Technical Series 28, Bled 2024 | https://www.icar.org/wp-content/uploads/documents/ICAR-Technical-Series-28-Bled-2024-Proceedings.pdf |
| Technical Series 23, Auckland 2018 | https://www.icar.org/wp-content/uploads/documents/ICAR-Technical-Series-23-Auckland-2018-Proceedings.pdf |
| Technical Series 29, Anand 2025 | https://www.icar.org/wp-content/uploads/documents/ICAR-Technical-Series-no-29-Anand.pdf |
| Verona 2026, livro de resumos | https://www.icar.org/wp-content/uploads/documents/Book-of-abstracts-2026.pdf |

## 7. Indicadores e benchmarking

| Documento | URL |
|---|---|
| Pesquisa internacional de registro em ovinos e caprinos (2026) | https://www.icar.org/wp-content/uploads/documents/Dairy-Sheep-Goat-Survey-2026.pdf |
| Pesquisa anual de sistemas de controle leiteiro 2024-2025 | https://www.icar.org/wp-content/uploads/documents/Survey-on-milk-recording-systems-in-cows-sheep-and-goats-2024-and-2025.pdf |
| Idem, 2022-2023 | https://www.icar.org/wp-content/uploads/documents/Survey-on-milk-recording-systems-in-cows-sheep-and-goats-2022-and-2023.pdf |
| Pesquisa de caprinos, 2012-2013 | https://www.icar.org/wp-content/uploads/documents/Goat-Survey-2012-2013.pdf |
| Pesquisa de ovinos, 2012-2013 | https://www.icar.org/wp-content/uploads/documents/Sheep-Survey-2012-2013.pdf |

## 8. Saúde e dicionário de dados

| Documento | URL |
|---|---|
| Section 07, Bovine Functional Traits (wiki) | https://wiki.icar.org/index.php/Section_07_%E2%80%93_Bovine_Functional_Traits |
| Chave de códigos de saúde (Claw Health Key, 2018) | https://www.icar.org/wp-content/uploads/documents/ICAR-Claw-Health-Key-coding-20180921.xls |
| Central Health Key, informações adicionais (2018) | https://www.icar.org/wp-content/uploads/documents/ICAR-Central-Health-Key-2018-addinfo-20180921.xls |
| Claw Health Atlas | https://www.icar.org/wp-content/uploads/documents/ICAR_Claw_Health_Atlas.pdf |
| Section 09, Dairy Cattle Genetic Evaluation (wiki) | https://wiki.icar.org/index.php/Section_09_%E2%80%93_Dairy_Cattle_Genetic_Evaluation |

## 9. DNA e parentesco

| Documento | URL |
|---|---|
| Diretrizes de verificação de parentesco por SNP (out/2025) | https://www.icar.org/wp-content/uploads/documents/Guidelines-for-Parentage-Verification-and-Parentage-Discovery-Based-on-SNP-Genotypes-October-2025.pdf |
| Section 04, DNA Technology (PDF legado) | https://www.icar.org/Guidelines/04-DNA-Technology.pdf |

## 10. O que o ICAR não tem (segundo o inventário)

- **Seções 24 (resiliência em ovinos e caprinos) e 25 (avaliação internacional de corte):** páginas vazias; sem PDF legado.
- **Seção 21 na wiki:** vazia; existe só o PDF legado (item acima).
- **Conformação e avaliação linear de ovinos e caprinos:** não há seção própria. Só a subseção de cabras na Section 05, a morfologia de úbere na Section 16 e a proposta de Verona 2026.
- **Relatórios de proficiência de leite ovino e caprino (RS0925, RG1125):** citados sem link.
- **Fichas e certificados dos 10 medidores de leite certificados para ovinos e caprinos:** colunas vazias.
- **Technical Series nº 20:** não aparece na listagem.
- **Links quebrados (404):** procedimento de garantia de qualidade do método AC (2012) e os pôsteres do Claw Atlas.
- **old.icar.org:** certificado SSL inválido; formulários de DNA que apontam para lá ficaram inacessíveis.

## 11. Observações da equipe

- O inventário afirma que o PDF legado da Section 16 traz o mesmo conteúdo da wiki. **Isso não foi conferido:** quando os arquivos forem baixados, comparar a versão em PDF com a wiki antes de citar.
- A Section 16 é a fonte primária do `lactacao.lactacao_pequenos_ruminantes`. Ao ler o texto, conferir as regras do relatório de caprinos (separação das crias, intervalo máximo entre controles, comprimento da lactação) contra a norma oficial. Hoje elas vêm de fontes secundárias e dos pesquisadores.
- Os Anais de Bled 2024 e de Auckland 2018 contêm artigos que os relatórios de ovinos e de caprinos já citam. Vale conferir as citações contra o texto integral.
