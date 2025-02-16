import { ChangeDetectorRef, Component, HostListener, inject, OnDestroy, OnInit, signal, } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AccountService } from '../services/account.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Account } from '../models/account.model';
import { SharedModule } from '../shared/shared.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../services/auth.service';
import { Table } from 'primeng/table';
import { AccountsComponent } from './accounts.component';
import { AccountDetailComponent } from './account-detail.component';
import { FormControl } from '@angular/forms';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { ToastService } from '../services/toast.service';
import { CurrencyPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [SharedModule, ThaiDatePipe, CurrencyPipe, NgClass],
  template: `
    <div class="table-container align-items-center justify-content-center mt-3">
      @if (loading()) {
        <div class="loading-shade">
          <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
        </div>
      }

      <div class="p-card">
        <p-table
          #dt
          [value]="accounts"
          [rowHover]="true"
          [rows]="10"
          [loading]="loading()"
          [paginator]="true"
          [globalFilterFields]="['details', 'remark']"
          [tableStyle]="{ 'min-width': '40rem' }"
        >
          <ng-template pTemplate="caption">
            <div class="flex align-items-center justify-content-between">
              <span>
                <p-button
                  (click)="showDialog('')"
                  [disabled]="!admin"
                  size="small"
                  icon="pi pi-plus"
                />
              </span>
              <span
                class="hidden md:block font-thasadith text-sky-400 text-2xl font-semibold ml-auto"
              >
                รายการค่าใช้จ่าย
              </span>
              <p-iconField iconPosition="left" styleClass="ml-auto">
                <p-inputIcon>
                  <i class="pi pi-search"></i>
                </p-inputIcon>
                <input
                  class="sarabun"
                  pInputText
                  [formControl]="searchValue"
                  pTooltip="หารายการ หรือหมายเหตุ"
                  tooltipPosition="bottom"
                  placeholder="ค้นหา .."
                  type="text"
                  (input)="dt.filterGlobal(getValue($event), 'contains')"
                />
                @if (searchValue.value) {
                  <span class="icons" (click)="clear(dt)">
                    <i class="pi pi-times" style="font-size: 1rem"></i>
                  </span>
                }
              </p-iconField>
            </div>
          </ng-template>
          <ng-template #header>
            <tr>
              <th style="width: 80px; margin-left: 5px;">#</th>
              <th style="min-width: 150px">
                <div class="flex align-items-center sm:ml-0">วันที่</div>
              </th>
              <th style="min-width: 150px">
                <div class="flex align-items-center">รายการ</div>
              </th>
              <th style="min-width: 120px" [ngClass]="{ 'hide-on-mobile': isMobile }">
                <div class="flex align-items-center">จำนวนเงิน</div>
              </th>
              <th style="min-width: 140px" [ngClass]="{ 'hide-on-mobile': isMobile }">
                <div class="flex align-items-center">หมายเหตุ</div>
              </th>
              <th style="min-width: 120px">
                <div class="flex align-items-center">Action</div>
              </th>
              <th style="min-width: 100px">*</th>
            </tr>
          </ng-template>
          <ng-template #body let-account let-i="rowIndex">
            <tr [ngClass]="{ 'row-income': account.isInCome }">
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ currentPage * rowsPerPage + i + 1 }}
              </td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ account.date | thaiDate }}
              </td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ account.details }}
              </td>
              <td
                [ngClass]="{
                  isIncome: account.isInCome,
                  'hide-on-mobile': isMobile,
                }"
              >
                {{ account.amount | currency: '' : '' }}
              </td>
              <td
                [ngClass]="{
                  isIncome: account.isInCome,
                  'hide-on-mobile': isMobile,
                }"
              >
                {{ account.remark }}
              </td>
              <td>
                <i
                  pTooltip="รายละเอียด"
                  (click)="onDetail(account)"
                  tooltipPosition="bottom"
                  class="pi pi-list text-blue-600 cursor-pointer"
                ></i>
                @if (admin) {
                  <i
                    pTooltip="แก้ไข"
                    (click)="showDialog(account)"
                    tooltipPosition="bottom"
                    class="pi pi-pen-to-square mx-3 text-yellow-700 cursor-pointer hover:text-yellow-500"
                  ></i>
                  <p-confirmPopup/>
                  <i
                    pTooltip="ลบข้อมูล"
                    (click)="conf($event, account.id)"
                    tooltipPosition="bottom"
                    class="pi pi-trash text-red-400 cursor-pointer hover:text-red-600"
                  ></i>
                }
              </td>
              <td>
                @if (account.isInCome) {
                  <span class="flex justify-content-start ml-2 text-green-400"
                  >รายรับ</span
                  >
                }
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: ``,
})
export class AccountListComponent implements OnInit, OnDestroy {
  accountService = inject(AccountService);
  authService = inject(AuthService);
  confirmService = inject(ConfirmationService);
  dialogService = inject(DialogService);
  message = inject(ToastService);
  cd = inject(ChangeDetectorRef);

  currentPage = 0;
  rowsPerPage = 10;

  admin: boolean = false;
  isMember: boolean = false;
  isMobile: boolean = false;
  loading = signal(false);
  accounts!: Account[];
  account!: Account;
  ref: DynamicDialogRef | undefined;
  searchValue = new FormControl('');

  constructor(private cdr: ChangeDetectorRef) {
    this.chkRole();
    this.getRole();
    this.getAccounts();
    this.cd.markForCheck();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
  }

  getRole() {
    this.authService.isAdmin().then((isAdmin) => {
      this.admin = isAdmin;
    });
  }

  chkRole() {
    this.authService.userProfile$.pipe().subscribe((user: any) => {
      this.admin = user?.role === 'admin' || user?.role === 'manager';
      this.isMember = user?.role === 'member';
    });
  }

  getAccounts() {
    this.loading.set(true);

    this.accountService
      .loadAccounts()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data: Account[]) => {
          this.accounts = data;
          this.loading.set(false);
        },
        error: (error: any) => {
          this.message.showError('Error', error.message);
          this.loading.set(false);
        },
        complete: () => {
          setTimeout(() => {
            this.loading.set(false);
            this.cdr.detectChanges();
          }, 100);
        },
      });
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  /**
   * ลบรายการ โดยยืนยันก่อนลบ
   * */
  conf(event: Event, id: string) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'ต้องการลบรายการนี้?',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Nope',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Okay',
        severity: 'warn'
      },
      accept: () => {
        this.accountService.deleteAccount(id).subscribe({
          next: () =>
            this.message.showWarn('Warning', 'ลบรายการแล้ว!'),
          error: (error: any) =>
            this.message.showError('Error', `${error.message}`),
        });
      },
      reject: () => {
        this.message.showInfo('Information', 'ยกเลิกการลบ.');
      },
    });
  }

  /**
   * ลบข้อความในช่องค้นหา
   * */
  clear(table: Table) {
    table.clear();
    this.searchValue.setValue('');
  }

  showDialog(account: any) {
    let header = account ? 'แก้ไขรายการ' : 'เพิ่มรายการ';

    this.ref = this.dialogService.open(AccountsComponent, {
      data: account,
      header: header,
      width: '360px',
      modal: true,
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '360px',
        '640px': '360px',
      },
      closable: true,
    });
  }

  onDetail(account: any) {
    this.ref = this.dialogService.open(AccountDetailComponent, {
      data: account,
      header: 'รายละเอียดบัญชี',
      width: '360px',
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '360px',
        '640px': '360px',
        '390px': '360px',
      },
      closable: true,
    });
  }

  ngOnDestroy(): void {
    if (this.ref) this.ref.close();
  }
}
