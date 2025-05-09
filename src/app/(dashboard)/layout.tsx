// src/app/(dashboard)/layout.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, Menu } from 'lucide-react';

import Sidebar from '@/components/sidebar/sidebar';
import Topbar from '@/components/topbar/topbar';
import { Button } from '@/components/ui/button';
import { PageTitleProvider } from '@/context/PageTitleContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      if (isMobileView && sidebarOpen) setSidebarOpen(false);
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, [sidebarOpen]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  return (
    <PageTitleProvider>
      <div className="flex h-screen bg-white">
        {isMobile && !sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <div
          className={`
            transition-all duration-300 ease-in-out z-50
            ${isMobile ? 'fixed' : 'relative'}
            ${!sidebarOpen && isMobile ? '-translate-x-full' : 'translate-x-0'}
          `}
        >
          <Sidebar />
        </div>

        <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
          <Topbar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>

        {sidebarOpen && isMobile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </PageTitleProvider>
  );
}
