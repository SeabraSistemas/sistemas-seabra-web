/**
 * CSS completo e isolado do deck do contrato Elmate. Vive como string em vez de
 * um .css importado porque esta rota não carrega globals.css — o deck tem o
 * próprio sistema de tokens e não pode herdar o reset nem o dark mode do
 * Tailwind do site institucional.
 *
 * Paleta: algodão cru frio / índigo de tinturaria / musgo / latão. Grelha de
 * fios de urdidura ao fundo. Claro e escuro por prefers-color-scheme.
 */
export const deckCss = `
:root{
  --ground:#EFF1EE; --panel:#F8F9F6; --panel-2:#E4E7E2;
  --ink:#141B22; --ink-soft:#5B6670; --ink-faint:#8B949B;
  --rule:#D2D7D1; --warp:#DDE1DB;
  --indigo:#27456B; --indigo-soft:#E1E7F0;
  --moss:#415B47; --moss-soft:#E0E8DF;
  --brass:#8A6712; --brass-soft:#F0E8D2;
  --f-display:var(--font-deck-display),"Helvetica Neue",Helvetica,Arial,sans-serif;
  --f-body:var(--font-deck-body),Georgia,"Times New Roman",serif;
  --f-mono:var(--font-deck-mono),ui-monospace,"SFMono-Regular",Menlo,monospace;
  --pad-x:clamp(1.75rem,6vw,7rem);
  --pad-y:clamp(1.75rem,5vh,4.5rem);
  color-scheme:light dark;
}
@media (prefers-color-scheme:dark){
  :root{
    --ground:#12161A; --panel:#191E23; --panel-2:#232A31;
    --ink:#E6E8E3; --ink-soft:#9AA3AB; --ink-faint:#6B747C;
    --rule:#2C343B; --warp:#1D2429;
    --indigo:#82A6D2; --indigo-soft:#1E2B3B;
    --moss:#8AAE90; --moss-soft:#1C2620;
    --brass:#D3A63E; --brass-soft:#2B2417;
  }
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:var(--ground);color:var(--ink);font-family:var(--f-body);-webkit-font-smoothing:antialiased}
img{max-width:100%}

.warp{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:repeating-linear-gradient(90deg,var(--warp) 0 1px,transparent 1px 5rem);opacity:.6}
.deck{position:relative;z-index:1}

.slide{display:none;min-height:100vh;min-height:100dvh;
  padding:var(--pad-y) var(--pad-x) clamp(4.5rem,9vh,6rem);flex-direction:column}
.slide.is-active{display:flex}
@media (prefers-reduced-motion:no-preference){
  .slide.is-active > *{animation:deckrise .5s cubic-bezier(.2,.7,.3,1) backwards}
  .slide.is-active > *:nth-child(2){animation-delay:.06s}
  .slide.is-active > *:nth-child(3){animation-delay:.12s}
  .slide.is-active > *:nth-child(4){animation-delay:.18s}
}
@keyframes deckrise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

.eyebrow{display:flex;align-items:baseline;gap:.9rem;font-family:var(--f-mono);
  font-size:.72rem;font-weight:500;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ink-faint);margin:0 0 clamp(1.25rem,3.5vh,2.5rem)}
.eyebrow .act{color:var(--indigo)}
.eyebrow .sep{color:var(--rule)}
h1{font-family:var(--f-display);font-weight:700;font-size:clamp(2.4rem,6.2vw,5.2rem);
  line-height:1.02;letter-spacing:-.028em;margin:0;text-wrap:balance}
h2{font-family:var(--f-display);font-weight:600;font-size:clamp(1.75rem,3.9vw,3.1rem);
  line-height:1.08;letter-spacing:-.022em;margin:0 0 clamp(1rem,2.5vh,1.75rem);text-wrap:balance}
.lede{font-size:clamp(1.05rem,1.65vw,1.4rem);line-height:1.5;color:var(--ink-soft);
  max-width:60ch;margin:0;font-weight:300}
strong{font-weight:600;color:var(--ink)}
.body-row{flex:1;display:flex;flex-direction:column;justify-content:center;gap:clamp(1rem,3vh,2rem)}

.cover{justify-content:space-between}
.cover-parties{font-family:var(--f-mono);font-size:clamp(.8rem,1.3vw,1rem);letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-soft);display:flex;flex-wrap:wrap;align-items:center;gap:.85rem;margin:0}
.cover-parties .x{color:var(--indigo)}
.cover h1{max-width:16ch}
.cover-foot{display:flex;flex-wrap:wrap;gap:.6rem 2.5rem;align-items:baseline;
  padding-top:clamp(1rem,3vh,2rem);border-top:1px solid var(--rule);
  font-family:var(--f-mono);font-size:.82rem;color:var(--ink-faint);letter-spacing:.04em}

.question{font-family:var(--f-body);font-style:italic;font-weight:300;
  font-size:clamp(1.3rem,2.9vw,2.3rem);line-height:1.35;color:var(--ink-soft);max-width:26ch;margin:0}
.answer{font-family:var(--f-display);font-weight:700;font-size:clamp(4rem,13vw,11rem);
  line-height:.9;letter-spacing:-.04em;color:var(--moss);margin:0}

.thesis{font-family:var(--f-display);font-weight:700;font-size:clamp(2.5rem,8vw,7rem);
  line-height:.98;letter-spacing:-.035em;margin:0}
.thesis .b{display:block}
.thesis .b + .b{color:var(--indigo)}
.thesis-note{max-width:52ch;margin:clamp(1.5rem,4vh,2.75rem) 0 0;font-size:clamp(1.05rem,1.6vw,1.35rem);
  line-height:1.55;color:var(--ink-soft);font-weight:300;border-left:2px solid var(--indigo);padding-left:1.25rem}

.rail{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(7,minmax(0,1fr))}
.step{background:var(--panel);padding:clamp(.85rem,2vh,1.35rem);display:flex;flex-direction:column;gap:.6rem;min-width:0}
.step-n{font-family:var(--f-mono);font-size:.72rem;font-weight:600;letter-spacing:.1em;color:var(--ink-faint)}
.step-t{font-family:var(--f-display);font-weight:600;font-size:clamp(.9rem,1.15vw,1.08rem);
  line-height:1.2;letter-spacing:-.01em;margin:0}
.step-d{font-size:.88rem;line-height:1.4;color:var(--ink-soft);font-weight:300;margin:0;flex:1}
.chip{align-self:flex-start;font-family:var(--f-mono);font-size:.7rem;font-weight:600;
  letter-spacing:.06em;padding:.3rem .55rem;border-radius:2px;white-space:nowrap}
.chip-free{background:var(--moss-soft);color:var(--moss)}
.chip-pay{background:var(--indigo-soft);color:var(--indigo)}
.step.is-pay{background:var(--panel-2)}
.rail-legend{display:flex;flex-wrap:wrap;gap:.6rem 2rem;margin:1.1rem 0 0;font-size:.95rem;
  color:var(--ink-soft);font-weight:300;line-height:1.5}
@media (max-width:960px){.rail{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:560px){.rail{grid-template-columns:1fr}}

.split{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(auto-fit,minmax(19rem,1fr))}
.col{background:var(--panel);padding:clamp(1.25rem,3vh,2.1rem);display:flex;flex-direction:column;gap:1rem}
.col-tag{font-family:var(--f-mono);font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase}
.col-moss .col-tag{color:var(--moss)}
.col-indigo .col-tag{color:var(--indigo)}
.col h3{font-family:var(--f-display);font-weight:600;margin:0;font-size:clamp(1.2rem,2vw,1.65rem);
  letter-spacing:-.015em;line-height:1.15}
.col-def{margin:0;color:var(--ink-soft);font-weight:300;font-size:1.02rem;line-height:1.5}
.col ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.55rem}
.col li{font-size:.98rem;line-height:1.45;color:var(--ink-soft);font-weight:300;padding-left:1.1rem;position:relative}
.col li::before{content:"";position:absolute;left:0;top:.62em;width:.42rem;height:1px;background:var(--ink-faint)}
.col-rule{margin:auto 0 0;padding-top:1rem;border-top:1px solid var(--rule);font-size:.95rem;
  line-height:1.45;color:var(--ink);font-weight:400}

.mock{background:var(--panel);border:1px solid var(--rule);padding:clamp(1.1rem,3vh,1.9rem);max-width:34rem}
.mock-head{font-family:var(--f-mono);font-size:.7rem;letter-spacing:.13em;text-transform:uppercase;
  color:var(--ink-faint);padding-bottom:.85rem;margin:0 0 1.1rem;border-bottom:1px solid var(--rule)}
.mock-label{font-family:var(--f-mono);font-size:.76rem;letter-spacing:.09em;text-transform:uppercase;
  color:var(--ink-soft);margin:0 0 .7rem}
.radios{display:flex;flex-wrap:wrap;gap:.6rem}
.radio{display:flex;align-items:center;gap:.55rem;border:1px solid var(--rule);padding:.6rem .95rem;
  font-family:var(--f-mono);font-size:.85rem;color:var(--ink-soft)}
.radio .dot{width:.75rem;height:.75rem;border-radius:50%;border:1.5px solid var(--ink-faint);flex:none}
.radio.on{border-color:var(--indigo);color:var(--indigo);background:var(--indigo-soft)}
.radio.on .dot{border-color:var(--indigo);box-shadow:inset 0 0 0 2.5px var(--indigo)}
.chain{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem;font-family:var(--f-mono);
  font-size:.85rem;color:var(--ink-soft);margin:1.4rem 0 0}
.chain b{color:var(--ink);font-weight:600}
.chain .arr{color:var(--indigo)}
.two-up{display:grid;gap:clamp(1.5rem,4vw,3.5rem);grid-template-columns:repeat(auto-fit,minmax(18rem,1fr));align-items:center}

.metrics{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(auto-fit,minmax(11rem,1fr))}
.metric{background:var(--panel);padding:clamp(1rem,2.4vh,1.6rem)}
.metric .n{font-family:var(--f-display);font-weight:700;font-size:clamp(1.9rem,4vw,3rem);
  line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums;display:block}
.metric .l{display:block;margin-top:.6rem;font-size:.92rem;line-height:1.35;color:var(--ink-soft);font-weight:300}
.metric.good .n{color:var(--moss)}
.curve{margin-top:clamp(1.25rem,3vh,2rem)}
.curve-title{font-family:var(--f-mono);font-size:.72rem;letter-spacing:.13em;text-transform:uppercase;
  color:var(--ink-faint);margin:0 0 1rem}
.bars{display:flex;flex-direction:column;gap:.5rem}
.bar-row{display:grid;grid-template-columns:minmax(6rem,11rem) 1fr auto;gap:.9rem;align-items:center;font-size:.92rem}
.bar-row .when{font-family:var(--f-mono);font-size:.78rem;color:var(--ink-faint);letter-spacing:.04em}
.bar-track{height:.7rem;background:var(--panel-2);position:relative;overflow:hidden}
.bar-fill{height:100%;background:var(--indigo);opacity:.85;display:block}
.bar-row.fast .bar-fill{background:var(--moss)}
.bar-row .val{font-family:var(--f-mono);font-size:.85rem;font-weight:600;font-variant-numeric:tabular-nums;
  color:var(--ink);min-width:4.5rem;text-align:right}
.bar-row.fast .val{color:var(--moss)}


.ledger{display:flex;flex-direction:column;gap:1px;background:var(--rule);border:1px solid var(--rule)}
.ledger-row{background:var(--panel);padding:clamp(.85rem,2vh,1.25rem) clamp(1rem,2.4vw,1.6rem);
  display:grid;gap:.5rem 1.5rem;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) auto;align-items:baseline}
.ledger-ask{color:var(--ink);font-size:1rem;line-height:1.4;font-weight:400}
.ledger-got{color:var(--ink-soft);font-size:.95rem;line-height:1.4;font-weight:300}
.ledger-cl{font-family:var(--f-mono);font-size:.78rem;font-weight:600;color:var(--moss);
  background:var(--moss-soft);padding:.25rem .5rem;white-space:nowrap;letter-spacing:.04em}
@media (max-width:760px){
  .ledger-row{grid-template-columns:1fr auto}
  .ledger-got{grid-column:1/-1}
}

.exit-cols{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(auto-fit,minmax(17rem,1fr))}
.exit{background:var(--panel);padding:clamp(1.15rem,2.8vh,1.9rem);display:flex;flex-direction:column;gap:.85rem}
.exit h3{font-family:var(--f-display);font-weight:600;margin:0;font-size:clamp(1.05rem,1.7vw,1.35rem);
  letter-spacing:-.012em;line-height:1.2}
.exit p{margin:0;font-size:.97rem;line-height:1.5;color:var(--ink-soft);font-weight:300}
.exit .cl{font-family:var(--f-mono);font-size:.72rem;letter-spacing:.1em;color:var(--ink-faint)}
.exit.hero{background:var(--moss-soft)}
.exit.hero h3{color:var(--moss)}
.exit.hero p{color:var(--ink)}
.exit.hero .cl{color:var(--moss)}

.clauses{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);
  grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))}
.clause{background:var(--panel);padding:clamp(1rem,2.4vh,1.5rem);display:flex;flex-direction:column;gap:.5rem}
.clause .num{font-family:var(--f-mono);font-size:.8rem;font-weight:600;color:var(--brass);letter-spacing:.06em}
.clause .what{font-size:.98rem;line-height:1.45;color:var(--ink-soft);font-weight:300;margin:0}
.clause .what b{color:var(--ink);font-weight:600}
.close-line{margin-top:clamp(1.25rem,3vh,2rem);padding-top:clamp(1rem,2.5vh,1.5rem);
  border-top:1px solid var(--rule);display:flex;flex-wrap:wrap;gap:1rem 2.5rem;align-items:baseline}
.close-line .big{font-family:var(--f-display);font-weight:600;font-size:clamp(1.15rem,2.2vw,1.7rem);letter-spacing:-.015em}
.close-line .why{color:var(--ink-soft);font-weight:300;font-size:1rem;max-width:44ch;line-height:1.45}

.rail-nav{position:fixed;left:0;right:0;bottom:0;z-index:5;display:flex;align-items:center;
  gap:clamp(.6rem,2vw,1.5rem);padding:.7rem var(--pad-x);
  background:color-mix(in srgb,var(--ground) 88%,transparent);
  border-top:1px solid var(--rule);backdrop-filter:blur(8px)}
.acts{display:flex;gap:clamp(.5rem,1.6vw,1.25rem);flex:1;min-width:0}
.act-group{display:flex;flex-direction:column;gap:.4rem;min-width:0}
.act-name{font-family:var(--f-mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;
  color:var(--ink-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ticks{display:flex;gap:3px}
.tick{width:clamp(1rem,2.2vw,2rem);height:3px;background:var(--rule);border:none;padding:0;
  cursor:pointer;transition:background .2s}
.tick:hover{background:var(--ink-faint)}
.tick.done{background:var(--ink-faint)}
.tick.now{background:var(--indigo)}
.tick:focus-visible{outline:2px solid var(--indigo);outline-offset:3px}
.counter{font-family:var(--f-mono);font-size:.75rem;color:var(--ink-faint);
  font-variant-numeric:tabular-nums;white-space:nowrap}
.arrows{display:flex;gap:.35rem}
.arrows button{font-family:var(--f-mono);font-size:.95rem;line-height:1;background:transparent;
  border:1px solid var(--rule);color:var(--ink-soft);width:2rem;height:2rem;cursor:pointer;transition:.2s}
.arrows button:hover:not(:disabled){border-color:var(--indigo);color:var(--indigo)}
.arrows button:disabled{opacity:.35;cursor:default}
.arrows button:focus-visible{outline:2px solid var(--indigo);outline-offset:2px}
@media (max-width:640px){.act-name{display:none}}
`;
