import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-declaracion',
  templateUrl: './declaracion.component.html',
  styleUrls: ['./declaracion.component.scss'],
})
export class DeclaracionComponent {
  years = [2025, 2024, 2023, 2022];

  types = [
    { value: 'renta-210', label: 'Renta 210 (Personas Naturales)' },
    { value: 'renta-110', label: 'Renta 110 (Personas Jurídicas)' },
    { value: 'iva-300',   label: 'IVA 300' },
    { value: 'recibo-490', label: 'Recibo 490' },
  ];

  form = {
    title: '',
    year: '' as string | number,
    type: '',
    description: '',
  };

  files: File[] = [];

  constructor(private router: Router) {}

  onFiles(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.files = input.files ? Array.from(input.files) : [];
  }

  saveDraft() {
    // Aquí podrías llamar a tu servicio para persistir en backend/localStorage
    console.log('Borrador guardado:', { ...this.form, files: this.files });
    alert('Borrador guardado localmente (demo).');
  }

  onSubmit() {
    if (!this.form.title || !this.form.year || !this.form.type) return;
    console.log('Enviar declaración:', { ...this.form, files: this.files });

    // Navega a donde continúe tu flujo (ajusta ruta si corresponde)
    this.router.navigate(['/items']);
  }
}
