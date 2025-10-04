import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-items-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() logoLoadError = false;
  collapsed = false;

  toggle() {
    this.collapsed = !this.collapsed;
  }
}
