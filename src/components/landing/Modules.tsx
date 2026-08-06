'use client';

import { useTranslations } from 'next-intl';
import {
  ClipboardList,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

const modules = [
  { icon: ClipboardList, title: 'Cadastro de Animais', description: 'Registro completo de cada animal com histórico de vida.' },
  { icon: BarChart3, title: 'Controle de Produção', description: 'Acompanhamento diário de produção e indicadores.' },
  { icon: Calendar, title: 'Manejo Reprodutivo', description: 'Gestão de cobertura, gestação e partos.' },
  { icon: DollarSign, title: 'Controle Financeiro', description: 'Custos, receitas e análise de rentabilidade.' },
  { icon: Users, title: 'Gestão de Equipe', description: 'Controle de tarefas e produtividade.' },
  { icon: FileText, title: 'Relatórios', description: 'Relatórios automáticos personalizados.' },
];

export function Modules() {
  const t = useTranslations('landing.modules');

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="container-wide relative">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border mb-4">
            <Package className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Recursos Completos</span>
          </div>

          <h2 className="heading-2 text-foreground">{t('title')}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module, index) => (
            <Card
              key={index}
              className={cn(
                'group h-full border-border bg-card',
                'transition-all duration-300 ease-out',
                'hover:shadow-md hover:border-border '
              )}
            >
              <CardContent className="p-6">
                <div className="mb-5">
                  <div className="h-12 w-12 rounded-xl bg-muted border border-border flex items-center justify-center transition-colors duration-300 group-hover:bg-primary/5 group-hover:border-primary/20">
                    <module.icon className="h-6 w-6 text-foreground transition-colors duration-300 group-hover:text-primary" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{module.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
