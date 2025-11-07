"use client";

import { Button } from "@/components/ui/button";
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Mail, 
  Copy, 
  MessageCircle,
  Link as LinkIcon
} from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  type?: 'song' | 'resource' | 'page';
  className?: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = 'Check this out',
  description = 'Amazing gospel music resource',
  type = 'page',
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this ${type}: ${title}`);
    const body = encodeURIComponent(`${description}\n\n${url}`);
    const emailUrl = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = emailUrl;
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleCopyLink}
      >
        <Copy className="mr-2 h-4 w-4" />
        {copied ? 'Copied!' : 'Copy Link'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleFacebookShare}
      >
        <Facebook className="mr-2 h-4 w-4" />
        Facebook
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleTwitterShare}
      >
        <Twitter className="mr-2 h-4 w-4" />
        Twitter
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleEmailShare}
      >
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        WhatsApp
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={handleLinkedInShare}
      >
        <LinkIcon className="mr-2 h-4 w-4" />
        LinkedIn
      </Button>
    </div>
  );
};

export default ShareButtons;
