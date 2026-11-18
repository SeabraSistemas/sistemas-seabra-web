import { redirect } from 'next/navigation';
import { HOME_HREF } from '@/lib/fi-fcg/config';

/** Aba oculta em 18/11/2026: já está no Sistema Seabra. O código antigo está no histórico do git. */
export default function PartosPage() {
  redirect(HOME_HREF);
}
