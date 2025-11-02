"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslatedRoute, getEnglishRoute } from "@/lib/url-translations";
import { USFlag } from "@/components/flags/us-flag";
import { FRFlag } from "@/components/flags/fr-flag";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      flag: 'US', 
      flagEmoji: '🇺🇸',
      FlagComponent: USFlag
    },
    { 
      code: 'fr', 
      name: 'Français', 
      flag: 'FR', 
      flagEmoji: '🇫🇷',
      FlagComponent: FRFlag
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: 'en' | 'fr') => {
    if (newLanguage === language) return;

    // Get the current route without language prefix or query params
    let currentRoute = pathname;
    
    // Remove language prefix if present (/fr/ or /en/)
    const pathParts = currentRoute.split('/').filter(Boolean);
    if (pathParts[0] === 'fr' || pathParts[0] === 'en') {
      currentRoute = '/' + pathParts.slice(1).join('/');
    }
    
    // Remove query params from pathname (we'll preserve them)
    const [basePath] = currentRoute.split('?');
    
    // Get the English base route (in case we're on a French route)
    const englishRoute = getEnglishRoute(basePath);
    
    // Get the translated route for the new language
    const translatedRoute = getTranslatedRoute(englishRoute, newLanguage);
    
    // Update language in context
    setLanguage(newLanguage);
    
    // Preserve query params if any
    const queryString = window.location.search;
    const newUrl = queryString ? `${translatedRoute}${queryString}` : translatedRoute;
    
    // Navigate to the translated route
    router.push(newUrl);
  };

  // Flag component with SVG fallback to emoji
  const FlagIcon = ({ lang }: { lang: typeof languages[0] }) => {
    const FlagSvg = lang.FlagComponent;
    
    return (
      <span className="inline-flex items-center justify-center relative">
        {/* SVG Flag - Primary */}
        <FlagSvg className="w-5 h-4 rounded-sm" />
        {/* Emoji fallback - hidden but available for screen readers */}
        <span className="sr-only" aria-hidden="true">
          {lang.flagEmoji}
        </span>
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full hover:bg-accent">
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline-flex items-center gap-1.5">
            {currentLanguage && <FlagIcon lang={currentLanguage} />}
            {currentLanguage?.name}
          </span>
          <span className="sm:hidden">
            {currentLanguage && <FlagIcon lang={currentLanguage} />}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as 'en' | 'fr')}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <FlagIcon lang={lang} />
              <span>{lang.name}</span>
            </div>
            {language === lang.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
