"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  Settings, 
  Heart, 
  Download, 
  LogOut,
  ChevronDown
} from "lucide-react";

interface UserMenuProps {
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    full_name?: string;
    email: string;
    avatar?: string;
    avatar_url?: string;
    role?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push(getTranslatedRoute('/', language));
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    router.push(getTranslatedRoute(path, language));
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || user.avatar_url} alt={`${user.firstName || user.full_name} ${user.lastName}`} />
            <AvatarFallback className="text-xs">
              {(user.firstName || user.full_name?.split(' ')[0] || 'U')[0]}{(user.lastName || user.full_name?.split(' ')[1] || 'U')[0]}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName || user.full_name} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleNavigation("/dashboard")}>
          <User className="mr-2 h-4 w-4" />
          <span>{t('nav.dashboard')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation("/dashboard?tab=profile")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>{t('common.profile')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation("/dashboard?tab=activity")}>
          <Heart className="mr-2 h-4 w-4" />
          <span>{t('common.favorite')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNavigation("/dashboard?tab=activity")}>
          <Download className="mr-2 h-4 w-4" />
          <span>{t('common.download')}</span>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation("/admin")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>{t('nav.admin')}</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t('nav.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
