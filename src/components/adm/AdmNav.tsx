'use client';

/**
 * Navegação principal do /adm. Mesmo desenho do DashboardNav do /katmandu
 * (pills, ocre no ativo, operador e "Sair" à direita) — o painel novo não é uma
 * segunda linguagem visual, é a mesma casa com outra porta.
 *
 * A diferença que importa está em `ativo()`: no Katmandu a rota é sempre exata,
 * aqui não. A ficha de um cliente vive em `/adm/u/11954/rebanho`, e enquanto o
 * Felipe estiver lá dentro a aba "Usuários" tem que continuar acesa — senão a
 * navegação some justamente quando ele está mais fundo na hierarquia.
 *
 * O logout é um <form method="POST">, não um fetch: precisa funcionar sem
 * JavaScript e o servidor precisa poder revogar o `sid` da sessão (SessaoAdm)
 * antes de responder. Um <a> de logout também seria pré-carregável por scanner
 * de link e derrubaria a sessão sozinho.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface ItemNav {
  href: string;
  rotulo: string;
  /** Rotas que também acendem este item — as fichas que nascem da lista. */
  prefixos?: string[];
}

const ITENS: ItemNav[] = [
  { href: '/adm/carteira', rotulo: 'Carteira' },
  // alcançam pela lista mestra, então as duas pertencem a "Usuários".
  // O diretório do TENANT REAL do banco (93 tabelas carregam propriedade_id).
  // Não tem prefixo próprio de propósito: a ficha de uma fazenda é a do dono,
  // em '/adm/u/', então lá quem acende é "Usuários" — que é onde o operador
  // está de fato.
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
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4', className)}>
      <nav className="flex gap-1">
        {ITENS.map((item) => {
          const aceso = ativo(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={aceso ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                aceso ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {item.rotulo}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="truncate" title={usuario}>
          {usuario}
        </span>
        <form action="/adm/api/logout" method="POST">
          <button type="submit" className="underline underline-offset-2 hover:text-foreground">
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
