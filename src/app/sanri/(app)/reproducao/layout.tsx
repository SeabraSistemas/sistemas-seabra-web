import { ReproducaoAbas } from '@/components/sanri/ReproducaoAbas';

export default function ReproducaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ReproducaoAbas />
      {children}
    </>
  );
}
