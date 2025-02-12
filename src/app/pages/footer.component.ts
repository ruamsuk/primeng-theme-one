import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer [class.fixed]="isFixedFooter"
            class="w-full text-white bg-gray-800 text-center py-3 transition-all duration-300">
      <div class="flex items-center justify-center space-x-2">
        <p class="hidden md:block text-sm md:text-lg text-gray-400 dark:text-gray-400">
          Copyright &copy; {{ _year }} Ruamsuk&trade; Kanchanaburi.
        </p><i class="pi pi-sparkles opacity-50"></i>
      </div>
    </footer>
  `,
  styles: `
    /* สไตล์สำหรับ footer แบบ fixed */
    .fixed {
      position: fixed; /* ยึด footer ไว้ด้านล่างของ viewport */
      bottom: 0;
      left: 0;
    }
  `
})
export class FooterComponent implements OnInit {
  _year = new Date().getFullYear();
  isFixedFooter = true;

  @HostListener('window:resize', ['$event'])
  @HostListener('window:scroll', ['$event'])
  checkFooterPosition() {
    if (typeof globalThis.window !== 'undefined') {
      const bodyHeight = document.body.offsetHeight;
      const windowHeight = globalThis.window.innerHeight;

      this.isFixedFooter = bodyHeight <= windowHeight;
    }

  }

  ngOnInit(): void {
    this.checkFooterPosition();
  }
}
