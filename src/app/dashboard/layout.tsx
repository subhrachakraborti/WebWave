import ChatSidebar from '@/components/chat/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-background">
      <ChatSidebar />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}