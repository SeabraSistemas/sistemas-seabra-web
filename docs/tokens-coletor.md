# Coletor do /tokens — uso do Claude ao vivo no painel

O painel `/tokens` mostra a sessão (5h) e a semana (7 dias) em %. Quem alimenta é um script
que roda **no seu PC, fora do Claude**: lê os logs que o Claude Code já grava em
`~/.claude/projects/` e manda a contagem de tokens para o site. Não chama nenhuma IA, então
**não gasta nada da cota**.

```
PC (Claude Code grava logs) ─► scripts/tokens-coletor.mjs ─► POST /api/tokens ─► Supabase (tokens_uso)
                                                                                      │
Redmi / qualquer aparelho ─► /tokens  ◄── GET /api/tokens (a cada 60 s + botão Atualizar)
```

## Instalação (uma vez)

1. **Tabela.** Rode `supabase/tokens/tokens_01_uso.sql` no SQL Editor do Supabase do site.
2. **Segredo.** Gere um e depois cadastre na Vercel (Production) como `TOKENS_COLETOR_SECRET` e faça redeploy:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   O site já usa `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`; nada novo além do segredo.
3. **No PC (Windows).** Crie `C:\Users\<você>\.seabra-tokens.json`:
   ```json
   { "secret": "o-mesmo-segredo", "maquina": "pc-casa" }
   ```
   `maquina` é só o nome que aparece no painel; use um nome diferente em cada PC, que o painel soma todos.
4. **Teste sem enviar:** `node scripts\tokens-coletor.mjs --dry` — mostra quantos tokens achou.
5. **Rodar sempre.** Tarefa que abre no login, em segundo plano (ajuste o caminho do repositório):
   ```
   schtasks /create /tn "Seabra Tokens" /sc onlogon /tr "powershell -WindowStyle Hidden -Command node C:\Coding\Web\React\sistemas-seabra-web\scripts\tokens-coletor.mjs --loop"
   ```
   Para iniciar já, sem deslogar: `schtasks /run /tn "Seabra Tokens"`.

## Calibração (o % é estimado)

O Claude não publica o limite em tokens, só o %. Então, **uma vez**, abra o `/tokens` no Redmi e
digite o valor real do Claude:

- **Weekly agora**: o % do limite semanal (o painel já tinha esse campo).
- **Sessão agora**: o % da sessão de 5h (só habilita enquanto houver sessão ativa).

O painel descobre quantos tokens valem 100% e passa a calcular sozinho. Refaça quando quiser
corrigir a deriva. A calibração fica no navegador de cada aparelho.

## Limites que vale saber

- Só conta o que o **Claude Code** grava no disco. Uso no app/site do claude.ai **não aparece**;
  a calibração absorve a fatia média desse uso, mas não o acompanha em tempo real.
- Tokens de cache lido não entram na conta (são baratos); entram entrada, saída e cache criado.
- O dado é tão fresco quanto o coletor: ele envia a cada 60 s. O botão **Atualizar** busca na hora
  o que já está no servidor; não força o PC a enviar de novo. PC desligado = painel avisa "coletor parou".
- A sessão de 5h segue a regra do ccusage (abre na hora cheia da 1ª mensagem); pode diferir
  de poucos minutos do contador oficial.
