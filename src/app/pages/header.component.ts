import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { NgClass, NgOptimizedImage } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Router, RouterLink } from '@angular/router';
import { UserProfileComponent } from '../auth/user-profile.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-header',
  imports: [
    SharedModule,
    NgClass,
    RouterLink,
    NgOptimizedImage,
  ],
  template: `
    <p-menubar [model]="items">
      <ng-template #start>
        <img ngSrc="/images/primeng.png" priority alt="logo" height="51" width="48">
      </ng-template>
      <ng-template #start let-item let-root="root">
        @if (item.route) {
          <ng-container>
            <a [routerLink]="item.route" class="p-menubar-item-link">
              <span [class]="item.icon"></span>
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </ng-container>
        }
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
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService: ToastService = inject(ToastService);
  public dialogService: DialogService = inject(DialogService);

  items: MenuItem[] | undefined;
  subitems: MenuItem[] | undefined;
  ref: DynamicDialogRef | undefined;
  currentUser = this.authService.currentUser;

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
        route: 'landing',
        icon: 'pi pi-home',
      },
      {
        label: 'ระบบบัญชี',
        icon: 'pi pi-database',
        items: [
          {
            label: 'รายการบัญชี',
            icon: 'pi pi-list',
            command: () => this.router.navigateByUrl('/account'),
          },
          {
            label: 'ตามช่วงเวลา',
            icon: 'pi pi-calendar-clock',
            route: '/account/between',
          },
          {
            label: 'ช่วงเวลาและรายการ',
            icon: 'pi pi-calendar-plus',
            route: '/account/between-detail',
          },
          {
            label: 'ตลอดทั้งปี',
            icon: 'pi pi-book',
            route: '/account/allyear',
          },
        ],
      },
      {
        label: 'บัตรเครดิต',
        icon: 'pi pi-credit-card',
        items: [
          {
            label: 'รายการเครดิต',
            icon: 'pi pi-list',
            route: '/credit/credit-list',
          },
          {
            label: 'ตามช่วงเวลา',
            icon: 'pi pi-clock',
            route: '/credit/between',
          },
          {
            label: 'ตลอดปี',
            icon: 'pi pi-book',
            route: '/credit/allyear',
          },
        ],
      },
      {
        label: 'ความดันโลหิต',
        icon: 'pi pi-heart',
        items: [
          {
            label: 'Blood List',
            icon: 'pi pi-list',
            route: '/bloods/blood-list',
          },
          {
            label: 'Time period',
            icon: 'pi pi-calendar-clock',
            route: '/bloods/blood-time-period',
          },
          {
            label: 'Year period',
            icon: 'pi pi-calendar-plus',
            route: '/bloods/blood-year-period',
          },
        ],
      },
      {
        label: 'กำหนดเดือน',
        icon: 'pi pi-calendar',
        items: [
          {
            label: 'แสดงวันที่กำหนด',
            icon: 'pi pi-book',
            route: '/monthly',
          },
        ],
      },
      {
        label: 'จัดการผู้ใช้',
        icon: 'pi pi-users',
        items: [
          {
            label: 'รายชื่อผู้ใช้',
            icon: 'pi pi-users',
            route: '/manage-user',
          },
        ],
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout().then();
        },
      },
    ];
    this.subitems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => this.userDialog(),
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
      {
        label: 'Help',
        icon: 'pi pi-question',
        command: () => {
          this.messageService.showInfo(
            'Information message',
            'This is a information message',
          );
        },
      }
    ];
  }

  async logout(): Promise<void> {
    await this.authService
      .logout()
      .then(() => this.router.navigateByUrl('/auth/login'));
  }

  private userDialog() {
    this.ref = this.dialogService.open(UserProfileComponent, {
      data: this.currentUser(),
      header: 'User Details',
      width: '500px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '500px',
        '640px': '500px',
      },
      closable: true,
    });
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.destroy();
  }
}
