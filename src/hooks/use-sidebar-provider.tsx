'use client';

import { createContext, useContext, useState, Dispatch, SetStateAction } from 'react';

interface SidebarContextType {
  openMobile: boolean;
  setOpenMobile: Dispatch<SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <SidebarContext.Provider value={{ openMobile, setOpenMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
