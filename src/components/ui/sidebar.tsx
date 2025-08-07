'use client';

import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSidebar } from '@/hooks/use-sidebar-provider';
import { cn } from '@/lib/utils';
import React from 'react';

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      <aside
        ref={ref}
        className={cn(
          'hidden h-full w-full max-w-xs flex-col border-r bg-secondary/20 lg:flex',
          className
        )}
        {...props}
      >
        {children}
      </aside>
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-full max-w-xs p-0">
            {children}
        </SheetContent>
      </Sheet>
    </>
  );
});

Sidebar.displayName = 'Sidebar';


export { Sidebar };
