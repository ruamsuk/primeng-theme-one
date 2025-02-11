import { Component, HostListener, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header.component';
import { AuthService } from './services/auth.service';
import { PrimeNG } from 'primeng/config';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Toast],
  template: `
    <p-toast/>
    <div class="p-1">
      <app-header/>
      <router-outlet/>
    </div>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly primeConfig: PrimeNG = inject(PrimeNG);

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  resetTimer() {
    this.authService.resetTimer();
  }

  ngOnInit(): void {
    this.authService.getTranslations()
      .subscribe((translations) => {
        this.primeConfig.setTranslation(translations);
      });
  }
}
