# Coletor do /pedidos — AliExpress

Lê a **sua** conta da AliExpress uma vez por dia e deixa um arquivo com o status de cada pedido
(pagamento, desembaraço aduaneiro, entrega, problemas). A página `/pedidos` mostra isso em cima,
com **Precisa de atenção** e **Mudou desde a última vez**, e embaixo o estoque e as baixas de venda.
Assim você confere por aqui e pode silenciar os avisos de e-mail e WhatsApp da AliExpress.

```
Chrome (perfil só do coletor, logado por você) ─► coletor.mjs ─► ~/.seabra-pedidos/pedidos.json
                                                                        │
http://localhost:3000/pedidos ◄── /pedidos/api/snapshot (rota local) ◄──┘
        └─ estoque, vendas e anotações: localStorage do navegador
```

O coletor **só lê**: nunca digita senha, paga, cancela, confirma recebimento nem abre disputa.
O arquivo fica no seu Mac (permissão 600) e a rota `/pedidos/api/snapshot` não devolve nada na Vercel —
o conteúdo da sua conta não passa por servidor público.

## Instalação (uma vez)

```bash
cd ~/Projects/sistemas-seabra-web/scripts/pedidos-coletor
npm install
node coletor.mjs login
```

O `login` abre o Chrome com um perfil separado. **Entre você mesmo** na conta (senha, código, CAPTCHA)
e, quando a lista de pedidos aparecer, feche a janela. A sessão fica guardada no perfil.

Primeira leitura, olhando o que ele faz:

```bash
node coletor.mjs --visivel --dump
```

`--dump` guarda o texto e o HTML bruto de cada página em `~/.seabra-pedidos/dump/`. É a base para
ajustar a leitura se a AliExpress mudar o layout (os seletores e as frases do `classificar.mjs`
foram escritos sem ver a sua conta e **precisam ser conferidos na primeira rodada**).

## Uso diário

```bash
node coletor.mjs            # grava ~/.seabra-pedidos/pedidos.json
node coletor.mjs --dry      # só mostra o resumo
```

Depois, `npm run dev` no site e abra `http://localhost:3000/pedidos`.

### Agendar todo dia (launchd) — já instalado em 20/10/2026 (08:00)

Crie `~/Library/LaunchAgents/br.com.sistemaseabra.pedidos.plist` (troque o caminho do node se
`which node` for outro) e carregue:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>br.com.sistemaseabra.pedidos</string>
  <key>ProgramArguments</key><array>
    <string>/opt/homebrew/bin/node</string>
    <string>/Users/seabra/Projects/sistemas-seabra-web/scripts/pedidos-coletor/coletor.mjs</string>
  </array>
  <key>StartCalendarInterval</key><dict><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>/tmp/pedidos-coletor.log</string>
  <key>StandardErrorPath</key><string>/tmp/pedidos-coletor.log</string>
</dict></plist>
```

```bash
launchctl load ~/Library/LaunchAgents/br.com.sistemaseabra.pedidos.plist
```

Mac dormindo às 8h = roda quando acordar. Para parar: `launchctl unload` no mesmo arquivo.

## Aviso diário no Telegram

Cada leitura termina mandando uma mensagem: problemas no topo, "desembaraço concluído — hora de olhar o preço
para repor", o que mudou, o que está a caminho (com previsão) e o dólar. Configurar uma vez:

```bash
node notificar.mjs --configurar
```

O comando pede o token de um bot (você cria em 1 minuto no Telegram com o @BotFather), descobre o seu chat sozinho
quando você manda "oi" ao bot e grava tudo em `~/.seabra-pedidos/telegram.json` (permissão 600). Sem esse arquivo
o coletor não avisa nada; `--sem-aviso` pula o aviso numa leitura. `node notificar.mjs --testar` manda uma mensagem de teste.

## Preço do produto (acompanhamento diário)

O coletor abre a página do item do último pedido de cada produto acompanhado, **seleciona a variante** (microchip:
`green 2.12x12mm`, fixa em `ajustes.json`) e lê o preço unitário e o da faixa de lote ("R$ X cada, ≥ 3 peças").
Se a variante não for selecionada, ele recusa a leitura (o preço padrão da página é de outro produto — no microchip da
WSRFID o padrão é um leitor de R$ 72). O histórico fica em `~/.seabra-pedidos/precos.json`, uma leitura por dia.
Avisos no Telegram: queda ≥ 3% **em dólar** (promoção, não só câmbio), menor preço em dólar dos últimos 30 dias,
e abaixo do que você pagou por último. Quais produtos acompanhar: caixa "Acompanhar preço" no `/pedidos` (microchip
ligado, leitor desligado) ou `ajustes.json`.

## Preço com imposto (tela final da compra) — NUNCA faz o pedido

O preço da página não inclui imposto de importação, ICMS e frete; o total real só aparece na tela de revisão da compra.
Autorizado pelo Felipe em 20/10/2026: o coletor clica **somente em "Comprar"** na página do produto (variante
`green 2.12x12mm`, **1 unidade**: acima de 3 o imposto sobe), lê o total (Subtotal, Imposto de importação, ICMS, Frete, Total)
e sai para `about:blank` **sem clicar em mais nada**. "Fazer o pedido", "Confirmar compra", Pix e cartão estão barrados em
código (`PROIBIDO` / `SO_ESTE_BOTAO` em `coletor.mjs`, com teste). Desligar: `ajustes.json` → `"checkout": { "microchip": false }`.
A média de 30 dias considera as leituras diárias **e** o que você pagou nos últimos 60 dias (1 a 3 unidades, mesma variante).

## Quando der problema

| O painel mostra | O que fazer |
|---|---|
| "sessão expirada" | `node coletor.mjs login` e entrar de novo |
| "pediu verificação (CAPTCHA)" | `node coletor.mjs --visivel login`, resolver e fechar |
| "nenhum pedido encontrado… layout" | `node coletor.mjs --visivel --dump` e olhar `~/.seabra-pedidos/dump/` |
| Status errado num pedido | ajustar a frase em `classificar.mjs` + teste em `classificar.test.mjs` |

A falha **não apaga** o que já se sabia: o painel continua mostrando a última leitura boa, com um aviso amarelo.

## Testes

```bash
npm test      # classificador de status + diferenças entre coletas
```
