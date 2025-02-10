import { Component, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-header',
  imports: [
    Menubar,
    FormsModule,
    NgClass,
    Tooltip
  ],
  template: `
    <p-menubar [model]="items">
      <ng-template #start>
        <img src="/images/primeng-logo.png" alt="logo">
      </ng-template>
      <ng-template #end>
        <span pTooltip="{{tooltipMsg()}}" class="cursor-pointer pi"
              [ngClass]="{'pi-moon': !isDarkMode(), 'pi-sun': isDarkMode() }"
              (click)="toggleDarkMode()"></span>
      </ng-template>
    </p-menubar>
  `,
  styles: ``
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;
  isDarkMode = signal(false);
  tooltipMsg = signal('Switch to Dark');

  toggleDarkMode() {
    this.isDarkMode.update((current) => !current);
    this.tooltipMsg.set(this.isDarkMode() ? 'Switch to Light' : 'Switch to Dark');

    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('my-app-dark', this.isDarkMode());
    }
  }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Home',
        icon: 'pi pi-home'
      },
      {
        label: 'Features',
        icon: 'pi pi-star'
      },
      {
        label: 'Projects',
        icon: 'pi pi-search',
        items: [
          {
            label: 'Components',
            icon: 'pi pi-bolt'
          },
          {
            label: 'Blocks',
            icon: 'pi pi-server'
          },
          {
            label: 'UI Kit',
            icon: 'pi pi-pencil'
          },
          {
            label: 'Templates',
            icon: 'pi pi-palette',
            items: [
              {
                label: 'Apollo',
                icon: 'pi pi-palette'
              },
              {
                label: 'Ultima',
                icon: 'pi pi-palette'
              }
            ]
          }
        ]
      },
      {
        label: 'Contact',
        icon: 'pi pi-envelope'
      }
    ];
  }

}
