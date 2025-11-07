"use client";

import React from 'react';
import { Music, Github, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslatedRoute } from '@/lib/url-translations';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Music className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PhinAccords</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={getTranslatedRoute('/songs', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('nav.songs')}</Link></li>
              <li><Link href={getTranslatedRoute('/piano-chords', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('chord.piano')} {t('nav.chords')}</Link></li>
              <li><Link href={getTranslatedRoute('/artists', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('common.artist')}</Link></li>
              <li><Link href={getTranslatedRoute('/about', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.resources')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={getTranslatedRoute('/resources', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('footer.allResources')}</Link></li>
              <li><Link href={getTranslatedRoute('/resources', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('footer.learning')}</Link></li>
              <li><Link href={getTranslatedRoute('/resources', language)} className="text-muted-foreground hover:text-primary transition-colors">{t('footer.community')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.contact')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">business@heavenkeys.ca</span>
              </div>
              <div className="flex items-center space-x-2">
                <Github className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Heavenkeys Ltd.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Heavenkeys Ltd. {t('footer.rights')}
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.privacy')}</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;