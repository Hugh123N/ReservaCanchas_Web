import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { BaseService } from '@base/services/base.service';
import { AuthService } from '@core/auth/services/auth.service';
import { ResponseDto } from '@base/models/api/response.dto';
import { ResponseBaseDto } from '@base/models/api/response-base.dto';
import { CreateCanchaFavorita } from '../model/canchaFaborita/createCanchaFaborita.model';
import { GetCanchaFavorita } from '../model/canchaFaborita/getCanchaFaborita.model';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class CanchaFavoritaService extends BaseService {

  // Estado reactivo de favoritos (Map: idCancha -> GetCanchaFavorita)
  private favoritosMap = signal<Map<number, GetCanchaFavorita>>(new Map());

  // Signal readonly para consumo externo
  public readonly favoritos = this.favoritosMap.asReadonly();

  public readonly idsCanchasFavoritas = computed(() =>
    Array.from(this.favoritosMap().keys())
  );

  public readonly cantidadFavoritos = computed(() =>
    this.favoritosMap().size
  );

  constructor(
    http: HttpClient,
    private authService: AuthService
  ) {
    super(http, `${environment.backend.baseApiUrl}/CanchaFavorita`);
  }

  isFavorito(idCancha: number): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    return this.favoritosMap().has(idCancha);
  }

  getFavorito(idCancha: number): GetCanchaFavorita | undefined {
    return this.favoritosMap().get(idCancha);
  }

  async cargarFavoritosUsuario(): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.limpiarFavoritos();
      return;
    }

    const user = this.authService.loadUserProfile();
    if (!user?.id) {
      console.warn('Usuario no autenticado, no se pueden cargar favoritos');
      this.limpiarFavoritos();
      return;
    }

    try {
      const response = await firstValueFrom(
        this.getRequest<ResponseDto<GetCanchaFavorita[]>>(`/list/${user.id}`)
      );

      if (response.isValid && response.data) {
        const newMap = new Map<number, GetCanchaFavorita>();
        response.data.forEach((fav: GetCanchaFavorita) => {
          newMap.set(fav.idCancha, fav);
        });
        this.favoritosMap.set(newMap);
      }
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      this.limpiarFavoritos();
    }
  }

  limpiarFavoritos(): void {
    this.favoritosMap.set(new Map());
  }

  async agregarFavorito(idCancha: number): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }

    const user = this.authService.loadUserProfile();
    if (!user?.id) {
      throw new Error('Usuario no autenticado');
    }

    const createDto: CreateCanchaFavorita = {
      idUsuario: user.id,
      idCancha: idCancha,
      fechaAgregado: new Date().toISOString()
    };

    try {
      const response = await firstValueFrom(
        this.create(createDto)
      );

      if (response.isValid && response.data) {
        const newMap = new Map(this.favoritosMap());
        newMap.set(idCancha, response.data);
        this.favoritosMap.set(newMap);
      }
    } catch (error) {
      console.error('Error al agregar favorito:', error);
      throw error;
    }
  }

  async eliminarFavorito(idCancha: number): Promise<void> {
    const favorito = this.getFavorito(idCancha);
    if (!favorito) {
      console.warn('La cancha no está en favoritos');
      return;
    }

    try {
      const response = await firstValueFrom(
        this.delete(favorito.idCancha, favorito.idUsuario)
      );

      if (response.isValid) {
        // Actualizar estado local
        const newMap = new Map(this.favoritosMap());
        newMap.delete(idCancha);
        this.favoritosMap.set(newMap);
      }
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      throw error;
    }
  }

  async toggleFavorito(idCancha: number): Promise<void> {
    if (this.isFavorito(idCancha)) {
      await this.eliminarFavorito(idCancha);
    } else {
      await this.agregarFavorito(idCancha);
    }
  }

  create(body: CreateCanchaFavorita): Observable<ResponseDto<GetCanchaFavorita>> {
    return this.postRequest<CreateCanchaFavorita, ResponseDto<GetCanchaFavorita>>('', body);
  }

  delete(id: number, idUsuario: string): Observable<ResponseBaseDto> {
    return this.deleteRequest<ResponseBaseDto>(`/${id}/${idUsuario}`);
  }

  get(id: number): Observable<ResponseDto<GetCanchaFavorita>> {
    return this.getRequest<ResponseDto<GetCanchaFavorita>>(`/${id}`);
  }
}
