import { Component } from '@angular/core';
import { DeckFamily } from '@core/models/family.model';

@Component({
  selector: 'app-advance-deck-list',
  templateUrl: './advance-deck-list.component.html',
  styleUrls: ['./advance-deck-list.component.scss']
})
  familias: DeckFamily[] = [];
  mostrarModal = false;

  onAbrirModal() {
    this.mostrarModal = true;
  }

  onCerrarModal() {
    this.mostrarModal = false;
  }

  onCrearFamilia(data: { nombre: string; descripcion: string }) {
    const nuevaFamilia: DeckFamily = {
      id: `fam-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      nombre: data.nombre,
      descripcion: data.descripcion,
      fechaCreacion: new Date(),
      mazos: []
    };
    this.familias.push(nuevaFamilia);
    this.mostrarModal = false;
  }
}
