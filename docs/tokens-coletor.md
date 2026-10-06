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

1. **Tabela.** `supabase/tokens/tokens_01_uso.sql` (já aplicada no projeto Caprinos Leiteiros, o mesmo que o `/adm` lê).
2. **No PC (Windows).** Atualize o repositório (`git pull origin main`) e cole no PowerShell. O bloco gera o segredo, grava `~\.seabra-tokens.json`, copia o segredo para a área de transferência e cria a tarefa que roda o coletor em segundo plano a cada login:
   ```powershell
   $repo = "C:\Coding\Web\React\sistemas-seabra-web"   # ajuste se o repositório estiver em outro lugar
   $b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
   $secret = ($b | ForEach-Object { $_.ToString('x2') }) -join ''
   $json = (@{ secret = $secret; maquina = $env:COMPUTERNAME } | ConvertTo-Json)
   [IO.File]::WriteAllText("$HOME\.seabra-tokens.json", $json)
   Set-Clipboard $secret
   $acao = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -Command `"node '$repo\scripts\tokens-coletor.mjs' --loop`""
   Register-ScheduledTask -TaskName "Seabra Tokens" -Action $acao -Trigger (New-ScheduledTaskTrigger -AtLogOn) -Force | Out-Null
   Start-ScheduledTask -TaskName "Seabra Tokens"
   "Segredo copiado. Cole na Vercel como TOKENS_COLETOR_SECRET."
   ```
   Sem permissão para criar a tarefa? Abra o PowerShell como administrador. Outro PC: rode o mesmo bloco **sem gerar outro segredo** — troque a linha do `$secret` pelo valor que já está na Vercel; o `maquina` já sai com o nome do computador.
3. **Vercel.** Cadastre o segredo (que está na área de transferência) em Settings → Environment Variables → `TOKENS_COLETOR_SECRET`, marcado como *Sensitive*, em Production. Depois faça **Redeploy** do último deploy.
4. **Conferir sem enviar:** `node scripts\tokens-coletor.mjs --dry` mostra quantos tokens achou.

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
