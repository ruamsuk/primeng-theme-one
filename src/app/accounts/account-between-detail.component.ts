import { Component, inject, signal, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, of, switchMap, take, } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { AccountService } from '../services/account.service';
import { FormControl } from '@angular/forms';
import { Account } from '../models/account.model';
import { AuthService } from '../services/auth.service';
import { SharedModule } from '../shared/shared.module';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountsComponent } from './accounts.component';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { DatePicker } from 'primeng/datepicker';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-account-between-detail',
  standalone: true,
  imports: [SharedModule, ThaiDatePipe, CurrencyPipe, DatePicker, NgClass],
  template: `
    @if (loading()) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }
    <div
      class="flex flex-wrap p-fluid justify-center items-center mt-2"
    >
      <p-card class="w-full md:w-[35rem] overflow-hidden">
        <div class="text-center font-thasadith text-sky-500 text-base md:text-2xl -mt-3 mb-2">
          <span>รายการตามช่วงเวลาและรายการ</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <p-datePicker
              [iconDisplay]="'input'"
              [showIcon]="true"
              [formControl]="selectedDates"
              selectionMode="range"
              inputId="icondisplay"
              name="date"
              appendTo="body"
              placeholder="วันเริ่มต้น - วันสิ้นสุด"
              (onSelect)="onSelect()"
              [readonlyInput]="true" styleClass="w-full"
            ></p-datePicker>
          </div>
          <div>
            <p-iconfield>
              <input
                type="text"
                pInputText
                name="detail" placeholder="รายการ"
                [formControl]="searchDetail" class="w-full"
              />
              <p-inputicon styleClass="pi pi-book"/>
            </p-iconfield>
          </div>
        </div>
      </p-card>
    </div>
    @if (account) {
      <div class="flex justify-around items-center mt-3">
        <p-table
          #tb
          [value]="account"
          [scrollable]="true"
          [rowHover]="true"
          scrollHeight="400px"
          [tableStyle]="{ 'min-width': '35vw' }"
          styleClass="p-datatable-striped"
        >
          <ng-template #caption>
            <div class="flex items-center justify-between">
              <span class="text-orange-400 font-bold text-2xl font-thasadith">
                รายการของ: <span class="text-green-400 ml-2"> {{ title }}</span>
              </span>
              <p-button icon="pi pi-refresh" (click)="resetAll(tb)"/>
            </div>
          </ng-template>
          <ng-template #header>
            <tr>
              <th>#</th>
              <th style="min-width: 120px">
                <div>วันที่</div>
              </th>
              <th style="min-width: 120px">
                <div>จำนวนเงิน</div>
              </th>
              <th style="min-width: 150px">
                <div>หมายเหตุ</div>
              </th>
              <th style="min-width: 150px">
                <div>Action</div>
              </th>
              <th>-</th>
            </tr>
          </ng-template>
          <ng-template #body let-account let-rowIndex="rowIndex">
            <tr [ngClass]="{ 'row-income': account.isInCome }">
              <td>{{ rowIndex + 1 }}</td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ account.date | thaiDate }}
              </td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ account.amount | currency: '' : '' }}
              </td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                {{ account.remark }}
              </td>
              <td>
                @if (admin()) {
                  <i
                    pTooltip="แก้ไข"
                    (click)="showDialog(account)"
                    tooltipPosition="bottom"
                    class="pi pi-pen-to-square mx-2 text-sky-600 cursor-pointer"
                  ></i>
                  <p-confirmPopup/>
                  <i
                    pTooltip="ลบข้อมูล"
                    (click)="conf_($event, account.id)"
                    tooltipPosition="bottom"
                    class="pi pi-trash text-amber-500 cursor-pointer"
                  ></i>
                }
              </td>
              <td [ngClass]="{ isIncome: account.isInCome }">
                @if (account.isInCome) {
                  <span>รายรับ</span>
                }
              </td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="6">
                <span class="center text-orange-400 text-lg ">
                  ไม่มีข้อมูลรายรับ, รายจ่าย
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template #summary>
            <div
              class="flex items-center justify-around font-thasadith font-bold text-lg/10 bg-gray-900">
              <span>
                รายรับ:
                <span class="text-green-500 mx-3">
                  {{ totalIncome() | currency: '':'' }}
                </span>
                บาท
              </span>
              <span>
                รายจ่าย:
                <span class="text-orange-400 mx-3">
                   {{ totalExpense() | currency: '':'' }}
                </span>
                บาท
              </span>
              <span>
                @if (balance() < 0) {
                  เกินดุล:
                  <span class="text-orange-400 mx-3">
                    {{ balance() | currency: '' : '' }}
                  </span>
                } @else {
                  คงเหลือ:
                  <span class="text-green-500 mx-3">
                    {{ balance() | currency: '' : '' }}
                  </span>
                }
                บาท
              </span>
            </div>
          </ng-template>
        </p-table>
      </div>
    }
  `,
  styles: ``,
})
export class AccountBetweenDetailComponent {
  selectedDates = new FormControl();
  searchDetail = new FormControl();
  loading = signal(false);
  admin = signal(false);

  totalIncome = signal(0);
  totalExpense = signal(0);
  balance = signal(0);

  @ViewChild('tb') tb: Table | undefined;

  authService = inject(AuthService);
  message = inject(ToastService);
  accountService = inject(AccountService);
  confirmService = inject(ConfirmationService);

  dialogService = inject(DialogService);
  ref: DynamicDialogRef | undefined;

  account!: Account[];
  title: string = '';

  results$: Observable<any> = new Observable();
  private isMember = signal(false);

  constructor() {
    this.results$ = this.searchDetail.valueChanges.pipe(
      debounceTime(600),
      distinctUntilChanged(),
      switchMap((value) => this.resultDetails(value)),
    );
    /** be sure valueChange is work! */
    this.results$.subscribe();
    this.chkRole();
  }

  resultDetails(value: string): Observable<any> {
    const selectedDates = this.selectedDates.value;
    if (
      selectedDates &&
      selectedDates.length === 2 &&
      selectedDates[0] &&
      selectedDates[1]
    ) {
      const start = selectedDates[0];
      const end = selectedDates[1];
      const starter = new Date(start);
      const ender = new Date(end);

      /** avoid same date or end less than begin */
      if (starter >= ender) {
        this.message.showError(
          'Error',
          'วันเริ่มต้นกับวันสิ้นสุดต้องคนละวันกัน',
        );
        return of(null);
      }

      this.loading.set(true);
      this.title = value;

      this.accountService
        .searchDesc(start, end, value)
        .pipe(take(1))
        .subscribe({
          next: (data: any) => {
            this.account = data;
            this.loading.set(false);

            // Call calculateTotals and log the results
            const totals = this.calculateTotals();
            this.totalIncome.set(totals.totalInCome);
            this.totalExpense.set(totals.totalExpenses);
            this.balance.set(totals.balance);
          },
          error: (error: any) => {
            this.loading.set(false);
            this.message.showError('Error', error.message);
            console.log(error.message);
          },
        });
      return of(this.account);
    }
    return of(null);
  }

  calculateTotals() {
    const totalInCome = this.account
      .filter(account => account.isInCome)
      .reduce((sum, account) => sum + account.amount, 0);

    const totalExpenses = this.account
      .filter(account => !account.isInCome)
      .reduce((sum, account) => sum + account.amount, 0);

    const balance = totalInCome - totalExpenses;

    return {totalInCome, totalExpenses, balance};
  }

  /**
   * delete
   * */
  conf_(event: Event, id: string) {
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
          next: () => this.message.showInfo('Info', 'ลบรายการแล้ว!'),
          error: (error: any) =>
            this.message.showError('Error', `${error.message}`),
        });
      },
      reject: () => {
        this.message.showWarn('Warning', 'ยกเลิกการลบ.');
      },
    });
  }

  chkRole() {
    this.authService.userProfile$.pipe().subscribe((user: any) => {
      this.admin.set(user?.role === 'admin' || user?.role === 'manager');
      this.isMember.set(user?.role === 'member');
    });
  }

  // getRole() {
  //   this.authService.isAdmin().then((isAdmin) => {
  //     this.admin = isAdmin;
  //   });
  // }

  showDialog(account: any) {
    let header = account ? 'แก้ไขรายการ' : 'เพิ่มรายการ';

    this.ref = this.dialogService.open(AccountsComponent, {
      data: account,
      header: header,
      width: '360px',
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '360px',
        '640px': '360px',
        '390px': '360px',
      },
    });
    this.ref.onClose.subscribe((data: any) => {
      if (data) {
        this.resultDetails(this.title);
      }
    });
  }

  resetAll(table: Table): void {
    console.log(table);
    table.clear();
    this.searchDetail.setValue(''); // Clear search detail input
    this.selectedDates.setValue(''); // Clear selected dates
    this.title = '';
    this.account = []; // Clear the account data
    this.totalIncome.set(0); // Reset total income
    this.totalExpense.set(0); // Reset total expense
    this.balance.set(0);
  }

  onSelect() {
    // nothing todos.
  }
}
