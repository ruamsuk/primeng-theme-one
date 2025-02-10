import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './pages/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="p-3">
      <app-header/>
      <router-outlet/>
    </div>
  `,
  styles: [],
})
export class AppComponent {

}
