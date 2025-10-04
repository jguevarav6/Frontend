import { Component } from '@angular/core';
import { ItemsService, Item } from '../../data-access/items.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.scss']
})
export class ItemFormComponent {
  item: Partial<Item> = { title: '', body: '' };
  isEdit = false;
  idToEdit?: number;

  constructor(private itemsSvc: ItemsService, private router: Router, private route: ActivatedRoute) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.idToEdit = Number(id);
      const existing = this.itemsSvc.getLocalItem(this.idToEdit!);
      if (existing) this.item = { ...existing };
    }
  }

  save() {
    if (this.isEdit && this.idToEdit) {
      this.itemsSvc.updateItem(this.idToEdit, this.item as Partial<Item>);
    } else {
      this.itemsSvc.createItem(this.item as Item);
    }
    this.router.navigate(['/items']);
  }

  cancel() { this.router.navigate(['/items']); }
}
