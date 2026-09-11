'use client';

/**
 * A barra do painel: FIXA no topo, uma linha só.
 *
 * Antes era uma fileira de pílulas com borda embaixo e o nome do operador ao
 * lado — 60px que rolavam junto com a página e sumiam. Agora é uma barra de 48px
 * que fica: a marca à esquerda (o único lugar do painel com a serifa do site
 * fora dos títulos), as áreas globais como abas discretas, e o operador com o
 * botão de sair à direita. Fundo translúcido com blur para a página passar por
 * baixo sem a barra parecer um bloco opaco.
 *
 * O cabeçalho da ficha do cliente (CabecalhoUsuario) também é sticky e se
 * encosta logo abaixo: `top-12` lá é a altura daqui. Mudar uma exige mudar a
 * outra — por isso a altura é a constante ALTURA_BARRA, exportada.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Altura da barra em classes Tailwind: `h-12` aqui, `top-12` em quem encosta. */
export const ALTURA_BARRA = 'h-12';
export const ABAIXO_DA_BARRA = 'top-12';

interface ItemNav {
  href: string;
  rotulo: string;
  /** Rotas que também acendem este item — as fichas que nascem da lista. */
  prefixos?: string[];
}

const ITENS: ItemNav[] = [
  { href: '/adm/carteira', rotulo: 'Carteira' },
  // Onde estão os clientes e quanto pesam — geografia e concentração da base.
  { href: '/adm/panorama', rotulo: 'Panorama' },
  // As fichas de cliente (/adm/u/) nascem da lista de usuários — é o item que
  // fica aceso enquanto o operador está dentro de uma.
  { href: '/adm/usuarios', rotulo: 'Usuários', prefixos: ['/adm/u/'] },
  // O diretório do TENANT REAL do banco (93 tabelas carregam propriedade_id).
  { href: '/adm/propriedades', rotulo: 'Propriedades' },
  { href: '/adm/consultores', rotulo: 'Consultores', prefixos: ['/adm/c/'] },
];

function ativo(pathname: string, item: ItemNav): boolean {
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return (item.prefixos ?? []).some((p) => pathname === p || pathname.startsWith(p));
}

// `usuario` e não `operador` porque é o nome que o DashboardNav do katmandu já
// usa para a mesma coisa — o login da sessão (SessaoAdm.sub).
export function AdmNav({ usuario, className }: { usuario: string; className?: string }) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'sticky top-0 z-40 -mx-4 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
        className,
      )}
    >
      <div className={cn('flex items-center gap-3 sm:gap-5', ALTURA_BARRA)}>
        <Link
          href="/adm/carteira"
          className="flex shrink-0 items-baseline gap-1 font-display text-[17px] leading-none tracking-tight"
          aria-label="Início do painel"
        >
          <span className="text-foreground">Seabra</span>
          <span className="text-primary">Adm</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto" aria-label="Áreas do painel">
          {ITENS.map((item) => {
            const aceso = ativo(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={aceso ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] transition-colors',
                  aceso
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )}
              >
                {item.rotulo}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden max-w-[14rem] truncate sm:inline" title={usuario}>
            {usuario}
          </span>
          <form action="/adm/api/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1 transition-colors hover:border-border hover:text-foreground"
            >
              <LogOut size={13} strokeWidth={1.8} aria-hidden />
              Sair
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
