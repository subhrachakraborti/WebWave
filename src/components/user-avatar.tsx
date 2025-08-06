import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string | null | undefined;
  imageUrl?: string | null;
  className?: string;
}

export default function UserAvatar({ name, imageUrl, className }: UserAvatarProps) {
  const fallback = name ? name.charAt(0).toUpperCase() : 'U';
  return (
    <Avatar className={className}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name || 'User avatar'} />}
      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
        {fallback}
      </AvatarFallback>
    </Avatar>
  );
}
