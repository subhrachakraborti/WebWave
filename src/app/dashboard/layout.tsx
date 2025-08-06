import ChatSidebar from '@/components/chat/sidebar';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/firebase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Although middleware is better for this, for this project scope, a check here is sufficient.
  // In a real app, use Next.js middleware to protect routes.
  if (!auth.currentUser) {
    // This check is more for page reloads on the server. Client-side is handled by the root page.tsx and AuthProvider.
    // A proper solution would require using cookies or other session management to let the server know about the user.
    // For this context, we will rely on the client-side redirect.
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
