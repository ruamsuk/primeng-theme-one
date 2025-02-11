import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header.component';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, Toast],
  template: `
    <p-toast/>
    <div class="p-3">
      <app-header/>
      <router-outlet/>
    </div>
  `,
  styles:
    `
      :host ::ng-deep .p-toast-message {
        @apply font-sarabun italic text-2xl;
      }

      :host ::ng-deep .p-toast-detail {
        @apply italic text-lg;
      }

      :host ::ng-deep .p-toast-summary {
        @apply text-lg !important;
      }
    `,
})
export class AppComponent {

}
