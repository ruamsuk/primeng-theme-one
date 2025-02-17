import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal
} from '@angular/core';
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
        <div class="flex items-center">
          <p-avatar
            image="{{ currentUser()?.photoURL }}"
            shape="circle"
            class="mr-2"
          />
          <span
            (click)="menu.toggle($event)"
            class="font-bold text-gray-400 mr-2 cursor-pointer -mt-1"
          >
              {{
              authService.currentUser()?.displayName
                ? authService.currentUser()?.displayName
                : authService.currentUser()?.email
            }}
            <i class="pi pi-angle-down"></i>
            </span>
          <p-menu #menu [model]="subitems" [popup]="true"/>
          <span pTooltip="{{tooltipMsg()}}" class="cursor-pointer pi ml-2"
                [ngClass]="{'pi-moon': !isDarkMode(), 'pi-sun': isDarkMode() }"
                (click)="toggleDarkMode()">
          </span>
        </div>
      </ng-template>
    </p-menubar>
  `,
  styles: `
    .avatar-image img {
      width: 120px; /* กำหนดขนาดที่ต้องการ */
      height: 120px; /* กำหนดขนาดที่ต้องการ */
      object-fit: cover; /* ปรับขนาดภาพให้พอดี */
    }

    .p-menubar {
      position: relative;
      z-index: 1000; /* ปรับค่า z-index ให้สูงกว่า <th> */
    }

    .p-menubar .p-menuitem-link {
      position: relative;
      z-index: 1001; /* ปรับค่า z-index ให้สูงกว่า <th> */
    }
  `
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly authService: AuthService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService: ToastService = inject(ToastService);
  public dialogService: DialogService = inject(DialogService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  isFixedFooter = true;
  _year = new Date().getFullYear();
  items: MenuItem[] | undefined;
  subitems: MenuItem[] | undefined;
  ref: DynamicDialogRef | undefined;
  currentUser = this.authService.currentUser;

  isDarkMode = signal(false);
  tooltipMsg = signal('Switch to Light');

  checkFooterPosition() {
    if (typeof globalThis.window !== 'undefined') {
      const bodyHeight = document.body.offsetHeight; // ความสูงของเนื้อหาทั้งหมด
      const windowHeight = globalThis.window.innerHeight; // ความสูงของ viewport

      // ตรวจสอบว่าเนื้อหามีความสูงน้อยกว่า viewport หรือไม่
      this.isFixedFooter = bodyHeight <= windowHeight;

      // บังคับ Angular ให้ตรวจจับการเปลี่ยนแปลง
      this.cdr.detectChanges();
    }
  }

  ngAfterViewInit() {
    // ใช้ setTimeout เพื่อบังคับให้ตรวจสอบตำแหน่ง footer อีกครั้งหลังจากโหลด DOM เสร็จสิ้น
    setTimeout(() => {
      this.checkFooterPosition();
    }, 0);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkFooterPosition(); // ตรวจสอบตำแหน่ง footer เมื่อขนาดหน้าจอเปลี่ยนแปลง
  }

  toggleDarkMode() {
    this.isDarkMode.update((current) => !current);
    this.tooltipMsg.set(this.isDarkMode() ? 'Switch to Light' : 'Switch to Dark');

    const element = document.querySelector('html');
    if (element !== null) {
      element.classList.toggle('my-app-dark', this.isDarkMode());
    }
  }

  ngOnInit(): void {
    this.checkFooterPosition();
    this.toggleDarkMode();
    this.items = [
      {
        label: 'Home',
        command: () => this.router.navigateByUrl('/'),
        icon: 'pi pi-home',
      },
      {
        label: 'ระบบบัญชี',
        icon: 'pi pi-database',
        items: [
          {
            label: 'รายการบัญชี',
            icon: 'pi pi-list',
            command: () => this.router.navigateByUrl('/account/account-list'),
          },
          {
            label: 'ตามช่วงเวลา',
            icon: 'pi pi-calendar-clock',
            command: () => this.router.navigateByUrl('/account/account-between'),
          },
          {
            label: 'ช่วงเวลาและรายการ',
            icon: 'pi pi-calendar-plus',
            command: () => this.router.navigateByUrl('/account/between-detail'),
          },
          {
            label: 'ตลอดทั้งปี',
            icon: 'pi pi-book',
            command: () => this.router.navigateByUrl('/account/allyear'),
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
            command: () => this.router.navigateByUrl('/monthly'),
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
