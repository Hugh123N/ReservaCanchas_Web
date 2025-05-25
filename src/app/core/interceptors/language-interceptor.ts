import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { defaultLanguage, languageMapping } from '../config/locale.config';
import { TranslationService } from '../services/translation.service';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  constructor(private translationService: TranslationService) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let selectedLanguage = this.translationService.getSelectedLanguage();
    let acceptLanguage = languageMapping.get(selectedLanguage) ?? defaultLanguage;

    request = request.clone({
      setHeaders: {
        'Accept-Language': `${acceptLanguage}`
      }
    });
    return next.handle(request);
  }
}
