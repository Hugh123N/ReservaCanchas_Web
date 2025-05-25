// Angular
import { Injectable } from '@angular/core';
// Translation
import { TranslateService } from '@ngx-translate/core';
import { defaultLanguage } from '../config/locale.config';

export interface Locale {
  lang: string;
  data: Object;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private langIds: any = [];

  constructor(private translate: TranslateService) {
    this.translate.addLangs([defaultLanguage]);
    this.translate.setDefaultLang(defaultLanguage);
  }

  loadTranslations(...args: Locale[]): void {
    const locales = [...args];

    locales.forEach(locale => {
      this.translate.setTranslation(locale.lang, locale.data, true);
      this.langIds.push(locale.lang);
    });

    this.translate.addLangs(this.langIds);
  }

  setLanguage(lang: string) {
    if (lang) {
      this.translate.use(this.translate.getDefaultLang());
      this.translate.use(lang);
      localStorage.setItem('language', lang);
    }
  }

  getSelectedLanguage(): any {
    return localStorage.getItem('language') || this.translate.getDefaultLang();
  }
}
