"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute } from "@/lib/url-translations";
import Link from "next/link";

export const NavMenu = (props: NavigationMenuProps) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/songs', language)}>{t('nav.songs')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/piano-chords', language)}>{t('chord.piano')} {t('nav.chords')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/artists', language)}>{t('common.artist')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/about', language)}>{t('nav.about')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/resources', language)}>{t('nav.resources')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={getTranslatedRoute('/contact', language)}>{t('nav.contact')}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {user?.role === 'admin' && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href={getTranslatedRoute('/admin', language)} className="text-purple-600 font-medium">{t('nav.admin')}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
