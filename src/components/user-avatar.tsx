import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  name: string | null | undefined;
  imageUrl?: string | null;
  className?: string;
  userId?: string;
}

const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-pink-500',
];

const adminId = '9hEh9AjoB7QMcd1KymrxpfEHEuL2';

function getAvatarColor(userId?: string): string {
  if (!userId) return 'bg-primary'; 
  if (userId === adminId) return 'bg-red-500';

  // Simple hash function to get a color from the array
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % colors.length);
  return colors[index];
}


export default function UserAvatar({ name, imageUrl, className, userId }: UserAvatarProps) {
  const fallback = name ? name.charAt(0).toUpperCase() : 'U';
  const colorClass = getAvatarColor(userId);
  
  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name || 'User avatar'} />}
      <AvatarFallback className={cn(colorClass, 'text-primary-foreground font-bold')}>
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
