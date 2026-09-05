/**
 * Badge do papel do usuário (`usuarios.regra_de_acesso`).
 *
 * As cores vêm de `PAPEL_INFO` em `src/lib/adm/types.ts`, que por sua vez
 * espelha `lista_usuarios_widget.dart` do app: o técnico é verde no celular do
 * Felipe e tem que ser verde aqui também — cor de papel é vocabulário, e trocá-la
 * entre as duas telas custa uma leitura errada por dia.
 *
 * O caso `null` existe de verdade e é o motivo de o componente existir em vez de
 * um `<Badge>` solto: `regra_de_acesso` chega vazia ou com valor fora da união
 * (dado sujo), e `mapearUsuario()` em queries.ts devolve `null` nesse caso.
 * Renderizar isso como um papel qualquer — o primeiro do Record, ou 'produtor'
 * por default — inventaria uma permissão que a conta não tem. Aqui vira
 * "Sem papel", que é o que o banco de fato diz.
 */

import { Badge } from '@/components/ui/badge';
import { PAPEL_INFO, type Papel } from '@/lib/adm/types';
import { cn } from '@/lib/utils';

export function PapelBadge({
  papel,
  className,
}: {
  papel: Papel | null | undefined;
  className?: string;
}) {
  if (!papel) {
    return (
      <Badge variant="outline" className={cn('border-border text-muted-foreground', className)} title="usuarios.regra_de_acesso vazia ou fora da lista conhecida">
        Sem papel
      </Badge>
    );
  }

  const info = PAPEL_INFO[papel];
  return (
    <Badge variant="outline" className={cn(info.classe, className)}>
      {info.rotulo}
    </Badge>
  );
}
