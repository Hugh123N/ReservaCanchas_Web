import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';

import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';
import { CardCanchaComponent } from 'app/features/canchas/components/card-cancha/card-cancha.component';
import { SearchCancha } from 'app/features/canchas/core/model/searchCancha.model';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { Ubigeo } from 'app/features/canchas/core/model/ubigeo/ubigeo.model';
import { map, Observable, startWith, Subscription } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule, DecimalPipe, CommonModule, FooterComponent, NavVarComponent,
    CardCanchaComponent,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {

  private cityControlSub?: Subscription;

  // Variables para el buscador
  selectedCity: string = '';
  selectedDate: Date | null = null;
  selectedTime: string = '';
  selectedSport: string = '';
  selectedUbigeo: Ubigeo | null = null;

  canchasEjemplo: SearchCancha[] = [
    {
      idCancha: 1,
      nombre: "Arena Vóley Pro",
      idTipoCancha: 1,
      descripcion: "Cancha techada con arena especial para torneos de vóley.",
      ubicacion: "Av. Javier Prado Este 1234",
      direccion: "Av. Javier Prado Este 1234, Surco, Lima",
      latitud: -12.105,
      longitud: -76.963,
      precioHora: 45,
      idProveedor: "prov-001",
      codigoUbigeo: "150141",
      idEstadoCancha: 1,
      calificacionPromedio: 4.8,
      tipoCancha: { idTipoCancha: 1, nombre: "Vóley" },
      imagenesCancha: [
        {
          idImagenCancha: 101,
          idCancha: 1,
          urlImagen: "https://picsum.photos/seed/voley/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 1, codigo: "01", nombre: "Aprobado" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150141",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "Surco"
      },
      horariosDisponibles: ["08:00", "10:00", "12:00"]
    },
    {
      idCancha: 2,
      nombre: "Cancha Municipal",
      idTipoCancha: 2,
      descripcion: "Campo de fútbol de césped natural mantenido por la municipalidad.",
      ubicacion: "Av. La Fontana 567",
      direccion: "Av. La Fontana 567, La Molina, Lima",
      latitud: -12.082,
      longitud: -76.935,
      precioHora: 70,
      idProveedor: "prov-002",
      codigoUbigeo: "150135",
      idEstadoCancha: 5,
      calificacionPromedio: 4.1,
      tipoCancha: { idTipoCancha: 2, nombre: "Fútbol 11" },
      imagenesCancha: [
        {
          idImagenCancha: 102,
          idCancha: 2,
          urlImagen: "https://picsum.photos/seed/futbol/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 5, codigo: "05", nombre: "Mantenimiento" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150135",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "La Molina"
      },
      horariosDisponibles: ["14:00", "16:00", "18:00"]
    },
    {
      idCancha: 3,
      nombre: "Fútbol Club Junior",
      idTipoCancha: 2,
      descripcion: "Cancha sintética para fútbol 7, ideal para partidos amistosos.",
      ubicacion: "Av. San Luis 999",
      direccion: "Av. San Luis 999, San Borja, Lima",
      latitud: -12.095,
      longitud: -76.995,
      precioHora: 60,
      idProveedor: "prov-003",
      codigoUbigeo: "150120",
      idEstadoCancha: 2,
      calificacionPromedio: 3.9,
      tipoCancha: { idTipoCancha: 2, nombre: "Fútbol 7" },
      imagenesCancha: [
        {
          idImagenCancha: 103,
          idCancha: 3,
          urlImagen: "https://picsum.photos/seed/futbol7/400/250",
          esPrincipal: true,
          activo: true
        }
      ],
      estadoCancha: { idEstadoCancha: 2, codigo: "02", nombre: "Pendiente" },
      faboritos: [],
      ubigeo: {
        codigoUbigeo: "150120",
        departamento: "Lima",
        provincia: "Lima",
        distrito: "San Borja"
      },
      horariosDisponibles: ["09:00", "11:00", "13:00"]
    }
  ];

  // Control para el autocomplete
  cityControl = new FormControl<Ubigeo | string>('');
  filteredUbigeos: Observable<Ubigeo[]>;

  // Lista de ubigeos (en una aplicación real, esto vendría del backend)
  ubigeos: Ubigeo[] = [
    // Lima
    { codigoUbigeo: '150101', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LIMA' },
    { codigoUbigeo: '150102', departamento: 'LIMA', provincia: 'LIMA', distrito: 'ANCON' },
    { codigoUbigeo: '150103', departamento: 'LIMA', provincia: 'LIMA', distrito: 'ATE' },
    { codigoUbigeo: '150104', departamento: 'LIMA', provincia: 'LIMA', distrito: 'BARRANCO' },
    { codigoUbigeo: '150105', departamento: 'LIMA', provincia: 'LIMA', distrito: 'BREÑA' },
    { codigoUbigeo: '150106', departamento: 'LIMA', provincia: 'LIMA', distrito: 'CARABAYLLO' },
    { codigoUbigeo: '150107', departamento: 'LIMA', provincia: 'LIMA', distrito: 'CHACLACAYO' },
    { codigoUbigeo: '150108', departamento: 'LIMA', provincia: 'LIMA', distrito: 'CHORRILLOS' },
    { codigoUbigeo: '150109', departamento: 'LIMA', provincia: 'LIMA', distrito: 'CIENEGUILLA' },
    { codigoUbigeo: '150110', departamento: 'LIMA', provincia: 'LIMA', distrito: 'COMAS' },
    { codigoUbigeo: '150111', departamento: 'LIMA', provincia: 'LIMA', distrito: 'EL AGUSTINO' },
    { codigoUbigeo: '150112', departamento: 'LIMA', provincia: 'LIMA', distrito: 'INDEPENDENCIA' },
    { codigoUbigeo: '150113', departamento: 'LIMA', provincia: 'LIMA', distrito: 'JESUS MARIA' },
    { codigoUbigeo: '150114', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LA MOLINA' },
    { codigoUbigeo: '150115', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LA VICTORIA' },
    { codigoUbigeo: '150116', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LINCE' },
    { codigoUbigeo: '150117', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LOS OLIVOS' },
    { codigoUbigeo: '150118', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LURIGANCHO' },
    { codigoUbigeo: '150119', departamento: 'LIMA', provincia: 'LIMA', distrito: 'LURIN' },
    { codigoUbigeo: '150120', departamento: 'LIMA', provincia: 'LIMA', distrito: 'MAGDALENA DEL MAR' },
    { codigoUbigeo: '150121', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PUEBLO LIBRE' },
    { codigoUbigeo: '150122', departamento: 'LIMA', provincia: 'LIMA', distrito: 'MIRAFLORES' },
    { codigoUbigeo: '150123', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PACHACAMAC' },
    { codigoUbigeo: '150124', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PUCUSANA' },
    { codigoUbigeo: '150125', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PUENTE PIEDRA' },
    { codigoUbigeo: '150126', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PUNTA HERMOSA' },
    { codigoUbigeo: '150127', departamento: 'LIMA', provincia: 'LIMA', distrito: 'PUNTA NEGRA' },
    { codigoUbigeo: '150128', departamento: 'LIMA', provincia: 'LIMA', distrito: 'RIMAC' },
    { codigoUbigeo: '150129', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN BARTOLO' },
    { codigoUbigeo: '150130', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN BORJA' },
    { codigoUbigeo: '150131', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN ISIDRO' },
    { codigoUbigeo: '150132', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN JUAN DE LURIGANCHO' },
    { codigoUbigeo: '150133', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN JUAN DE MIRAFLORES' },
    { codigoUbigeo: '150134', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN LUIS' },
    { codigoUbigeo: '150135', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN MARTIN DE PORRES' },
    { codigoUbigeo: '150136', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SAN MIGUEL' },
    { codigoUbigeo: '150137', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SANTA ANITA' },
    { codigoUbigeo: '150138', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SANTA MARIA DEL MAR' },
    { codigoUbigeo: '150139', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SANTA ROSA' },
    { codigoUbigeo: '150140', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SANTIAGO DE SURCO' },
    { codigoUbigeo: '150141', departamento: 'LIMA', provincia: 'LIMA', distrito: 'SURQUILLO' },
    { codigoUbigeo: '150142', departamento: 'LIMA', provincia: 'LIMA', distrito: 'VILLA EL SALVADOR' },
    { codigoUbigeo: '150143', departamento: 'LIMA', provincia: 'LIMA', distrito: 'VILLA MARIA DEL TRIUNFO' },

    // Callao
    { codigoUbigeo: '070101', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'CALLAO' },
    { codigoUbigeo: '070102', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'BELLAVISTA' },
    { codigoUbigeo: '070103', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'CARMEN DE LA LEGUA REYNOSO' },
    { codigoUbigeo: '070104', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'LA PERLA' },
    { codigoUbigeo: '070105', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'LA PUNTA' },
    { codigoUbigeo: '070106', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'VENTANILLA' },
    { codigoUbigeo: '070107', departamento: 'CALLAO', provincia: 'PROV. CONST. DEL CALLAO', distrito: 'MI PERU' },

    // Arequipa (principales)
    { codigoUbigeo: '040101', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'AREQUIPA' },
    { codigoUbigeo: '040102', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'ALTO SELVA ALEGRE' },
    { codigoUbigeo: '040103', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'CAYMA' },
    { codigoUbigeo: '040104', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'CERRO COLORADO' },
    { codigoUbigeo: '040105', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'CHARACATO' },
    { codigoUbigeo: '040106', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'CHIGUATA' },
    { codigoUbigeo: '040107', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'JACOBO HUNTER' },
    { codigoUbigeo: '040108', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'LA JOYA' },
    { codigoUbigeo: '040109', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'MARIANO MELGAR' },
    { codigoUbigeo: '040110', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'MIRAFLORES' },
    { codigoUbigeo: '040111', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'MOLLEBAYA' },
    { codigoUbigeo: '040112', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'PAUCARPATA' },
    { codigoUbigeo: '040113', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'POCSI' },
    { codigoUbigeo: '040114', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'POLOBAYA' },
    { codigoUbigeo: '040115', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'QUEQUEÑA' },
    { codigoUbigeo: '040116', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SABANDIA' },
    { codigoUbigeo: '040117', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SACHACA' },
    { codigoUbigeo: '040118', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SAN JUAN DE SIGUAS' },
    { codigoUbigeo: '040119', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SAN JUAN DE TARUCANI' },
    { codigoUbigeo: '040120', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SANTA ISABEL DE SIGUAS' },
    { codigoUbigeo: '040121', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SANTA RITA DE SIGUAS' },
    { codigoUbigeo: '040122', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'SOCABAYA' },
    { codigoUbigeo: '040123', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'TIABAYA' },
    { codigoUbigeo: '040124', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'UCHUMAYO' },
    { codigoUbigeo: '040125', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'VITOR' },
    { codigoUbigeo: '040126', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'YANAHUARA' },
    { codigoUbigeo: '040127', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'YARABAMBA' },
    { codigoUbigeo: '040128', departamento: 'AREQUIPA', provincia: 'AREQUIPA', distrito: 'YURA' }
  ];


  constructor(private router: Router) {
    // Inicializar el observable del autocomplete
    this.filteredUbigeos = this.cityControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchValue = typeof value === 'string' ? value : '';
        return this._filterUbigeos(searchValue);
      })
    );
  }

  ngOnInit() {
    this.cityControlSub = this.cityControl.valueChanges?.subscribe(value => {
      if (typeof value === 'string') {
        this.selectedCity = value;
        this.selectedUbigeo = null;
      } else if (value && typeof value === 'object') {
        this.selectedUbigeo = value;
        this.selectedCity = `${value.distrito}, ${value.provincia}, ${value.departamento}`;
      } else {
        this.selectedCity = '';
        this.selectedUbigeo = null;
      }
    });
  }

  ngOnDestroy() {
    this.cityControlSub?.unsubscribe();
  }

  // Fecha mínima (hoy)
  minDate = new Date();

  // Filtrar ubigeos basado en el texto ingresado
  private _filterUbigeos(value: string): Ubigeo[] {
    if (!value) return [];

    const searchTerms = value.toLowerCase().split(/\s|,/).filter(v => v); // ["lima"], ["lima","ate"]

    const filtered = this.ubigeos.filter(ubigeo => {
      const target = `${ubigeo.distrito} ${ubigeo.provincia} ${ubigeo.departamento}`.toLowerCase();
      return searchTerms.every(term => target.includes(term));
    });

    // Eliminar duplicados por distrito (o puedes elegir provincia si prefieres)
    const unique = new Map<string, Ubigeo>();
    filtered.forEach(ub => {
      if (!unique.has(ub.distrito.toLowerCase())) {
        unique.set(ub.distrito.toLowerCase(), ub);
      }
    });

    return Array.from(unique.values());
  }

  // Función para mostrar el valor en el autocomplete
  displayUbigeo(ubigeo: Ubigeo): string {
    return ubigeo ? `${ubigeo.distrito}, ${ubigeo.provincia}, ${ubigeo.departamento}` : '';
  }







  onReservarCancha(cancha: SearchCancha) {
    console.log("Reservar cancha:", cancha.nombre)
    // Aquí iría la lógica para reservar
  }

  onRegistrarCancha() {
    console.log("Registrar nueva cancha")
    // Aquí iría la navegación al formulario de registro
  }

  onAccesoOperador() {
    console.log("Acceso operador")
    // Aquí iría la navegación al panel de operador
  }

  onBuscarCanchas() {
    const searchParams = {
      fecha: this.selectedDate,
      hora: this.selectedTime,
      deporte: this.selectedSport
    };

    console.log("Búsqueda de canchas:", searchParams);

    // Aquí puedes implementar la lógica de búsqueda
    // Por ejemplo, navegar a una página de resultados con los parámetros
    this.router.navigate(['/canchas'], {
      queryParams: {
        fecha: this.selectedDate?.toISOString().split('T')[0],
        hora: this.selectedTime,
        deporte: this.selectedSport
      }
    });
  }

  // Método para explorar todas las canchas
  onExplorarCanchas() {
    this.router.navigate(['/canchas']);
  }

  // Método para ver todas las canchas destacadas
  onVerTodasLasCanchas() {
    this.router.navigate(['/canchas'], {
      queryParams: { destacadas: 'true' }
    });
  }

  onLimpiarBusqueda() {
    this.selectedCity = '';
    this.selectedDate = null;
    this.selectedTime = '';
    this.selectedSport = '';
    this.selectedUbigeo = null;
    this.cityControl.setValue('');
  }

  // Método para obtener ubigeos (para conectar con el backend)
  // En el futuro, esto se conectaría a tu servicio
  async loadUbigeos(searchTerm: string) {
    // Aquí harías la llamada a tu API del backend
    // Por ejemplo: return this.ubigeoService.searchUbigeos(searchTerm);
    return this.ubigeos.filter(ubigeo =>
      ubigeo.distrito.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubigeo.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ubigeo.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

}
