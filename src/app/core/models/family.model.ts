export interface DeckFamily {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaCreacion: Date;
  imagenOpcional?: string;
  mazos: Array<{
    id: string;
    nombre: string;
    version: string;
    fecha: Date;
  }>;
}
