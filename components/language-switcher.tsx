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

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: 'en', name: 'English', flag: 'US', flagEmoji: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: 'FR', flagEmoji: '🇫🇷' }
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

  // Flag component that works better across systems
  const FlagIcon = ({ countryCode, emoji }: { countryCode: string; emoji: string }) => {
    return (
      <span 
        className="inline-block text-lg leading-none" 
        role="img" 
        aria-label={`${countryCode} flag`}
        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {emoji}
      </span>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full hover:bg-accent">
          <Globe className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline flex items-center gap-1.5">
            <FlagIcon countryCode={currentLanguage?.flag || 'US'} emoji={currentLanguage?.flagEmoji || '🇺🇸'} />
            {currentLanguage?.name}
          </span>
          <span className="sm:hidden">
            <FlagIcon countryCode={currentLanguage?.flag || 'US'} emoji={currentLanguage?.flagEmoji || '🇺🇸'} />
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
              <FlagIcon countryCode={lang.flag} emoji={lang.flagEmoji} />
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
