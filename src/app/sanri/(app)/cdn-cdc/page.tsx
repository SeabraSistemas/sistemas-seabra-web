import { redirect } from 'next/navigation';

/** Primeiro endereço da aba (16/10/2026), antes de CDN e CDC virarem abas separadas. */
export default function CdnCdcPage() {
  redirect('/sanri/cdn');
}
