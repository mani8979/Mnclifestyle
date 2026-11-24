import StoreLayoutClient from '@/components/store/StoreLayoutClient';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreLayoutClient>{children}</StoreLayoutClient>;
}
