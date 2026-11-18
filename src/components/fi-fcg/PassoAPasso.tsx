/** Passo a passo curto do topo do Questionário e da Meta. Texto do Felipe, em primeira pessoa. */
export const PASSOS = [
  'Entre no painel com o seu e-mail.',
  'Abra o Questionário e responda as perguntas marcadas em amarelo.',
  'Embaixo de cada uma há uma sugestão: use, ou troque pela sua, e salve.',
  'Conforme você responde, eu monto o painel: metas, lotação e economia.',
];

export function PassoAPasso() {
  return (
    <ol className="max-w-prose space-y-0.5 rounded-xl border border-border bg-card p-4 text-sm">
      {PASSOS.map((p, i) => (
        <li key={p}>
          <span className="mr-1.5 font-semibold text-primary">{i + 1})</span>
          {p}
        </li>
      ))}
    </ol>
  );
}
