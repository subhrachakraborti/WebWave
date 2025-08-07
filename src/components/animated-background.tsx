
'use client';
import { MessageCircle, Lock, Send, Shield, Mail, MessagesSquare } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const icons = [MessageCircle, Lock, Send, Shield, Mail, MessagesSquare];

const AnimatedBackground = () => {
    const [renderedIcons, setRenderedIcons] = useState<JSX.Element[]>([]);

    useEffect(() => {
        const generatedIcons = Array.from({ length: 20 }).map((_, i) => {
            const Icon = icons[i % icons.length];
            const style = {
                left: `${Math.random() * 100}vw`,
                animationDuration: `${Math.random() * 10 + 10}s`, // 10s to 20s
                animationDelay: `${Math.random() * 10}s`,
            };
            const size = Math.random() * 24 + 16; // 16px to 40px
            return <Icon key={i} className="floating-icon text-primary/30" style={style} size={size} />;
        });
        setRenderedIcons(generatedIcons);
    }, []);


  return (
    <div className="absolute top-0 left-0 w-full h-full z-0">
        {renderedIcons}
    </div>
  );
};

export default AnimatedBackground;
