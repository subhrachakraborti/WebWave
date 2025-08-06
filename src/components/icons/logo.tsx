import { cn } from '@/lib/utils';
import React from 'react';

const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <path d="M4 12h2.5c.7 0 1.4.3 1.9.8s.8 1.2.8 1.9v0c0 .7-.3 1.4-.8 1.9s-1.2.8-1.9.8H4" />
      <path d="M9.2 17.7c.5.5 1.2.8 1.9.8h3.8c.7 0 1.4-.3 1.9-.8s.8-1.2.8-1.9v-2.1c0-.7-.3-1.4-.8-1.9s-1.2-.8-1.9-.8h-6.2" />
      <path d="M20 12h-2.5c-.7 0-1.4-.3-1.9-.8s-.8-1.2-.8-1.9v0c0-.7.3-1.4.8-1.9s1.2-.8 1.9-.8H20" />
    </svg>
  );
};

export default Logo;
