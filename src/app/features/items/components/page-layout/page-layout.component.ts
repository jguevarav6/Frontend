import { Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent implements OnInit {
  @Input() title: string = '';
  @Input() showBackButton: boolean = true;
  @Input() showForwardButton: boolean = true;

  currentYear = new Date().getFullYear();
  private navigationHistory: string[] = [];
  private currentIndex = -1;

  constructor(
    private location: Location,
    private router: Router
  ) {}

  ngOnInit() {
    // Rastrear navegación
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.navigationHistory.push(event.urlAfterRedirects);
      this.currentIndex = this.navigationHistory.length - 1;
    });
  }

  goBack() {
    if (this.canGoBack()) {
      this.location.back();
    }
  }

  goForward() {
    if (this.canGoForward()) {
      this.location.forward();
    }
  }

  canGoBack(): boolean {
    return window.history.length > 1;
  }

  isMainDashboard(): boolean {
    return this.router.url === '/items' || this.router.url === '/items/';
  }

  canGoForward(): boolean {
    // En navegadores modernos, no hay API para saber si hay historial hacia adelante
    // Pero podemos intentar y el navegador no hará nada si no hay
    return true;
  }
}
