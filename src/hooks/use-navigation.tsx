
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface NavigationContextType {
  isLoading: boolean;
  handleLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Stop loading when navigation is complete
    setIsLoading(false);
  }, [pathname]);

  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const newPath = new URL(e.currentTarget.href).pathname;
    if (newPath !== pathname) {
      setIsLoading(true);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ isLoading, handleLinkClick }}>
      {children}
    </NavigationContext.Provider>
  );
}
