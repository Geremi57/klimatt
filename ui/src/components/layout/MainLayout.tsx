import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import OnlineStatusBar from './OnlineStatusBar';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <OnlineStatusBar />
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
