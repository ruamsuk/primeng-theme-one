import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header.component';
import { AuthService } from './services/auth.service';
import { PrimeNG } from 'primeng/config';
import { Toast } from 'primeng/toast';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FooterComponent } from './pages/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Toast, FooterComponent],
  template: `
    <p-toast/>
    @if (currentUser() && emailVerify()) {
      <app-header/>
    }
    <div class="p-1">
      <router-outlet/>
    </div>
    @if (currentUser() && emailVerify()) {
      <app-footer/>
    }
  `,
  styles: `
    :host ::ng-deep .p-toast-message {
      font-family: 'Sarabun', sans-serif;
      font-size: 1.5rem;
      font-style: italic;
    }

    :host ::ng-deep .p-toast-detail {
      font-style: italic;
      font-size: 1.125rem;
    }

    :host ::ng-deep .p-toast-summary {
      font-size: 1.125rem !important;
    }
  `,
})
export class AppComponent implements AfterViewInit, OnInit {
  private readonly authService: AuthService = inject(AuthService);
  private readonly primeConfig: PrimeNG = inject(PrimeNG);
  private readonly isAuth: Auth = inject(Auth);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  emailVerify = signal(false);
  currentUser = this.authService.currentUser;

  @HostListener('window:mousemove')
  @HostListener('window:keydown')
  resetTimer() {
    this.authService.resetTimer();
  }

  ngAfterViewInit() {
    // บังคับ Angular ให้ตรวจจับการเปลี่ยนแปลงของ DOM
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.authService.getTranslations()
      .subscribe((translations) => {
        this.primeConfig.setTranslation(translations);
      });

    onAuthStateChanged(this.isAuth, (user) => {
      this.emailVerify.set(user?.emailVerified || false);
    });

    /** Translate */
    this.translate.addLangs(['en', 'th']);
    this.translate.setDefaultLang('th');
    this.translate.use('th');
    this.translate.get('th')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((lang) => this.primeConfig.setTranslation(lang));
  }
}
