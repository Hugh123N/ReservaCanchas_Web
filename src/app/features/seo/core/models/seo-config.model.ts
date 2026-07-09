export interface SeoConfig {
  titulo: string;
  descripcion: string;
  url: string;
  imagen?: string;
  keywords?: string[];
}

export interface SeoResolution {
  ciudad: any | null;
  deporte: any | null;
  esValido: boolean;
  urlCanonical: string;
}

export interface SitemapUrl {
  loc: string;
  changefreq: string;
  priority: number;
}
