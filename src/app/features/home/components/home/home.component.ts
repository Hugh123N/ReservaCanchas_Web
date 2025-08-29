import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { NavVarComponent } from '@shared/components/nav-var/nav-var.component';

interface Cancha {
  id: number
  nombre: string
  tipo: string
  ubicacion: string
  precio: number
  imagen: string
  disponible: boolean
  calificacion: number
  caracteristicas: string[]
}

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule, MatDividerModule, MatToolbarModule, FlexLayoutModule,DecimalPipe,CommonModule, FooterComponent, NavVarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  canchasEjemplo: Cancha[] = [
    {
      id: 1,
      nombre: "Cancha Fútbol Premium",
      tipo: "Fútbol 11",
      ubicacion: "Zona Norte, Ciudad",
      precio: 80000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: true,
      calificacion: 4.8,
      caracteristicas: ["Césped natural", "Iluminación LED", "Vestuarios", "Estacionamiento"],
    },
    {
      id: 2,
      nombre: "Court Tenis Club",
      tipo: "Tenis",
      ubicacion: "Centro, Ciudad",
      precio: 45000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: true,
      calificacion: 4.6,
      caracteristicas: ["Superficie dura", "Iluminación nocturna", "Alquiler raquetas"],
    },
    {
      id: 3,
      nombre: "Basket Arena",
      tipo: "Básquetbol",
      ubicacion: "Zona Sur, Ciudad",
      precio: 35000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: false,
      calificacion: 4.7,
      caracteristicas: ["Cancha cubierta", "Piso de madera", "Gradas", "Aire acondicionado"],
    },
    {
      id: 4,
      nombre: "Padel Center",
      tipo: "Pádel",
      ubicacion: "Zona Este, Ciudad",
      precio: 55000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: true,
      calificacion: 4.9,
      caracteristicas: ["Cristal templado", "Césped sintético", "Climatizada"],
    },
    {
      id: 5,
      nombre: "Fútbol 5 Express",
      tipo: "Fútbol 5",
      ubicacion: "Zona Oeste, Ciudad",
      precio: 40000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: true,
      calificacion: 4.4,
      caracteristicas: ["Césped sintético", "Techada", "Vestuarios", "Buffet"],
    },
    {
      id: 6,
      nombre: "Volley Beach",
      tipo: "Vóley Playa",
      ubicacion: "Zona Costera, Ciudad",
      precio: 30000,
      imagen: "/placeholder.svg?height=200&width=300",
      disponible: true,
      calificacion: 4.5,
      caracteristicas: ["Arena importada", "Al aire libre", "Duchas", "Bar"],
    },
  ]

  constructor() { }

  onReservarCancha(cancha: Cancha) {
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
