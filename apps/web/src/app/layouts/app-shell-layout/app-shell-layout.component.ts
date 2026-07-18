import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SessionStore } from '@state/session.store';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './app-shell-layout.component.html',
  styleUrl: './app-shell-layout.component.scss',
})
export class AppShellLayoutComponent {
  private readonly sessionStore = inject(SessionStore);

  readonly user = this.sessionStore.user;
  readonly isMobile = signal(window.innerWidth < 768);
  readonly sidenavOpened = signal(!this.isMobile());

  readonly navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/capture', label: 'Capture', icon: 'photo_camera' },
    { path: '/wardrobe', label: 'Wardrobe', icon: 'checkroom' },
    { path: '/profile', label: 'Profile', icon: 'person' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize() {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (mobile) {
      this.sidenavOpened.set(false);
    }
  }

  toggleSidenav() {
    this.sidenavOpened.update(v => !v);
  }

  logout() {
    this.sessionStore.logout();
  }
}
