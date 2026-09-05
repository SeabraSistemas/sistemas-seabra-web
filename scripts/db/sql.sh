#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Executa SQL no Supabase do seabra-app-main, via Management API.
#
#   scripts/db/sql.sh "select count(*) from public.usuarios"
#   scripts/db/sql.sh -f supabase/adm/adm_01_schema_e_views.sql
#
# POR QUE ESTE SCRIPT EXISTE, e não um `curl` solto: ele é a superfície que a
# regra de permissão do Claude Code libera. Um `curl` genérico liberado daria
# acesso a TODA a Management API — inclusive trocar a configuração do projeto,
# criar e apagar branches, mexer em chaves. Este arquivo fala com UM endpoint,
# `/database/query`, e nada mais. A permissão fica presa ao que ele faz.
#
# O TOKEN nunca aparece aqui nem no repositório: sai do `.mcp.json` do
# seabra-app-main (que é gitignorado lá) e vive só na memória do processo.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

CFG="${SEABRA_MCP_CONFIG:-$HOME/Projects/seabra-app-main/.mcp.json}"

if [[ ! -f "$CFG" ]]; then
  echo "erro: não achei $CFG — é de lá que sai o token de acesso." >&2
  exit 1
fi

ler_arg() {
  python3 -c "
import json,sys
a = json.load(open('$CFG'))['mcpServers']['supabase']['args']
print(a[a.index('$1') + 1])"
}

TOKEN=$(ler_arg --access-token)
REF=$(ler_arg --project-ref)

# ── a consulta: string direta ou arquivo com -f ──────────────────────────────
if [[ "${1:-}" == "-f" ]]; then
  [[ -f "${2:-}" ]] || { echo "erro: arquivo não encontrado: ${2:-}" >&2; exit 1; }
  ORIGEM="${2}"
  python3 -c "
import json
print(json.dumps({'query': open('$ORIGEM', encoding='utf-8').read()}))" > /tmp/.seabra-q.json
else
  ORIGEM="(inline)"
  QUERY="${1:?uso: sql.sh \"<sql>\"  |  sql.sh -f arquivo.sql}"
  QUERY="$QUERY" python3 -c "
import json, os
print(json.dumps({'query': os.environ['QUERY']}))" > /tmp/.seabra-q.json
fi

RESP=/tmp/.seabra-resp.json
curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  --data @/tmp/.seabra-q.json > "$RESP"
rm -f /tmp/.seabra-q.json

# Erro da API vem como objeto com `message`; sucesso vem como lista de linhas.
python3 - "$RESP" "$ORIGEM" <<'PY'
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception:
    print('  resposta não é JSON:', open(sys.argv[1]).read()[:400], file=sys.stderr)
    sys.exit(1)

if isinstance(d, dict) and ('message' in d or 'error' in d):
    print('  ✗', (d.get('message') or d.get('error')).strip()[:900], file=sys.stderr)
    sys.exit(1)

# Sem linhas = comando aplicado (DDL não devolve resultado).
if not d:
    print('  ✓ aplicado' if sys.argv[2] != '(inline)' else '  ✓ ok (sem linhas)')
else:
    print(json.dumps(d, ensure_ascii=False, indent=2))
PY
