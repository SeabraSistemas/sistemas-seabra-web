import { rotaDesativada } from '@/lib/fi-fcg/desativado';

/** Desativada em 18/11/2026 (ver src/lib/fi-fcg/desativado.ts). O código antigo está no histórico do git. */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST() {
  return rotaDesativada();
}

export function PATCH() {
  return rotaDesativada();
}

export function DELETE() {
  return rotaDesativada();
}
