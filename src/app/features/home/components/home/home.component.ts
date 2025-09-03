import { Component } from '@angular/core';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule, DecimalPipe, CommonModule, FooterComponent, NavVarComponent,
    CardCanchaComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
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
      disponible: true,
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
      disponible: false,
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
      disponible: false,
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

  constructor() { }

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


}
