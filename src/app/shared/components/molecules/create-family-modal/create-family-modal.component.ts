import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-create-family-modal',
  templateUrl: './create-family-modal.component.html',
  styleUrls: ['./create-family-modal.component.scss']
})
export class CreateFamilyModalComponent {
  nombre = '';
  descripcion = '';
  @Output() crear = new EventEmitter<{ nombre: string; descripcion: string }>();
  @Output() cerrar = new EventEmitter<void>();

  onCrear() {
    if (this.nombre.trim()) {
      this.crear.emit({ nombre: this.nombre, descripcion: this.descripcion });
    }
  }

  onCerrar() {
    this.cerrar.emit();
  }
}
