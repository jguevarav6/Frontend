import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ItemsService, Item } from '../../data-access/items.service';

@Component({
  selector: 'app-item-detail',
  templateUrl: './item-detail.component.html',
  styleUrls: ['./item-detail.component.scss'],
})
export class ItemDetailComponent implements OnInit {
  // item: guarda los datos del detalle una vez cargados
  item: Item | null = null;
  // Flags para la UI
  loading = false; // indicador de carga
  error: string | null = null; // mensaje de error para mostrar

  // ActivatedRoute para leer parámetros de la ruta (ej. /items/:id)
  constructor(private route: ActivatedRoute, private itemsSvc: ItemsService) {}

  // Al iniciarse el componente leemos el parámetro 'id' de la ruta y
  // solicitamos el detalle al servicio. Validamos que el id sea numérico.
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id')); // lee :id de la URL
    if (Number.isNaN(id)) {
      this.error = 'ID inválido';
      return;
    }
    this.fetch(id);
  }

  /**
   * fetch
   * Solicita el detalle del item al servicio y actualiza la UI según el
   * resultado: asigna item en caso exitoso o setea un mensaje de error.
   */
  fetch(id: number) {
    this.loading = true;
    this.error = null;

    // Primero intentamos obtener el item desde LocalStorage (si fue creado/guardado localmente)
    const local = this.itemsSvc.getLocalItem(id);
    if (local) {
      this.item = local;
      this.loading = false;
      return;
    }

    // Si no existe localmente, consultamos la API externa
    this.itemsSvc.getItem(id).subscribe({
      next: (data) => {
        this.item = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle';
        this.loading = false;
      },
    });
  }
}
