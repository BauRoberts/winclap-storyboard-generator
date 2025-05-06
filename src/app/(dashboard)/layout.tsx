// src/app/(dashboard)/layout.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2, Menu } from 'lucide-react';

import Sidebar from '@/components/sidebar/sidebar';
import Topbar from '@/components/topbar/topbar';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set mobile state
  useEffect(() => {
    const checkSize = () => {
      const isMobileView = window.innerWidth < 768;
      setIsMobile(isMobileView);
      
      // Auto-collapse sidebar on mobile
      if (isMobileView && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    // Set initial state
    checkSize();
    
    // Add event listener
    window.addEventListener('resize', checkSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkSize);
  }, [sidebarOpen]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button - only visible on small screens */}
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
      
      {/* Always render sidebar but control visibility with CSS */}
      <div 
        className={`
          transition-all duration-300 ease-in-out z-50
          ${isMobile ? 'fixed' : 'relative'} 
          ${!sidebarOpen && isMobile ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 transition-all duration-300 ease-in-out">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}