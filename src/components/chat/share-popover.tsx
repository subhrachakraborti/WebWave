
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharePopoverProps {
  code: string;
}

export function SharePopover({ code }: SharePopoverProps) {
  const [shareLink, setShareLink] = useState('');
  const { toast } = useToast();

  const handleOpen = () => {
    // This will only work on the client, which is fine for this component.
    const url = window.location.href;
    setShareLink(url);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: 'Copied!',
        description: text === shareLink ? 'Link copied to clipboard.' : 'Code copied to clipboard.'
    });
  }

  return (
    <Popover onOpenChange={(open) => open && handleOpen()}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="md:w-auto md:px-4">
          <Share2 className="h-5 w-5 md:mr-2" />
          <span className="sr-only md:not-sr-only">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Share Chatroom</h4>
            <p className="text-sm text-muted-foreground">
              Anyone with this link or code can join.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="link">Share Link</Label>
            <div className="flex items-center gap-2">
              <Input id="link" value={shareLink} readOnly />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(shareLink)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Room Code</Label>
            <div className="flex items-center gap-2">
              <Input id="code" value={code} readOnly />
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(code)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
