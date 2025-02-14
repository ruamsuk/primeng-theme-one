import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Account } from '../models/account.model';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AccountService } from '../services/account.service';
import { NgxCurrencyDirective } from 'ngx-currency';
import { NgClass } from '@angular/common';
import { ToastService } from '../services/toast.service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [SharedModule, NgxCurrencyDirective, NgClass, ToggleSwitch, DatePicker],
  template: `
    <div>
      <div class="my-2">
        <hr class="h-px bg-gray-500 border-0"/>
      </div>

      <div class="flex flex-wrap flex-col justify-center">
        <form [formGroup]="accountForm" (ngSubmit)="saveAccount()">
          <input type="hidden"/><!--/ focus this element -->
          <div class="grid grid-cols-1 gap-4">
            <div>
              @if (isDateValid) {
                <label [ngClass]="{ 'p-error': isDateValid }" for="date"
                       class="-mb-2">วันที่ทำรายการ</label
                >
              } @else {
                <label for="date">วันที่ทำรายการ</label>
              }
              <p-datepicker
                formControlName="date"
                [showIcon]="true"
                [iconDisplay]="'input'"
                inputId="icondisplay"
                appendTo="body" styleClass="w-full"></p-datepicker>
              @if (isDateValid; as messages) {
                <small class="block p-error pl-2 font-semibold">
                  {{ messages }}
                </small>
              }
            </div>
            <div>
              @if (isDetailsValid) {
                <label [ngClass]="{ 'p-error': isDetailsValid }" for="details"
                >รายการ</label
                >
              } @else {
                <label for="details">รายการ</label>
              }
              <input
                pInputText
                formControlName="details"
                name="details"
                class="w-full"
              />
              @if (isDetailsValid; as messages) {
                <small class="block p-error pl-2 font-semibold">
                  {{ messages }}
                </small>
              }
            </div>
            <div>
              @if (isAmountValid) {
                <label [ngClass]="{ 'p-error': isAmountValid }" for="amount"
                >จำนวนเงิน</label
                >
              } @else {
                <label>จำนวนเงิน</label>
              }
              <input
                class="w-full"
                pInputText
                currencyMask
                formControlName="amount"
              />
              @if (isAmountValid; as messages) {
                <small class="block p-error pl-2 font-semibold">
                  {{ messages }}
                </small>
              }
            </div>
            <div>
              <label for="remark">หมายเหตุ</label>
              <input
                pInputText
                formControlName="remark"
                name="remark"
                class="w-full"
              />
            </div>

          </div><!--/ grid-cols-1-->
          <div class="flex justify-content-start my-3 gap-3">
            <p-toggleswitch formControlName="isInCome"/>
            <span [ngClass]="{
            'text-green-500': isIncomeMsg == 'รายรับ',
            'text-orange-400': isIncomeMsg == 'รายจ่าย',
            }">{{ isIncomeMsg }}</span>
          </div>
          <div>
            <div class="mb-2">
              <hr class="h-px bg-gray-400 border-0 mb-1"/>
            </div>

            <div class="flex my-3">
              <p-button
                label="Cancel"
                severity="secondary"
                styleClass="w-full"
                class="w-full mr-2"
                (onClick)="close(false)"
              />
              <p-button
                label="Save"
                [disabled]="accountForm.invalid"
                styleClass="w-full"
                class="w-full"
                (onClick)="saveAccount()"
              />
            </div>
          </div>
        </form>
      </div>

    </div>
  `,
  styles: `
    label,
    input {
      font-family: Sarabun, sans-serif;
    }
  `,
})
export class AccountsComponent implements OnInit, OnDestroy {
  message = inject(ToastService);
  accountService = inject(AccountService);
  ref = inject(DynamicDialogRef);
  acc = inject(DynamicDialogConfig);

  account!: Account;
  isIncomeMsg: string = 'รายจ่าย';

  accountForm = new FormGroup({
    id: new FormControl(null),
    date: new FormControl<Date | null>(null),
    details: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required),
    create: new FormControl(''),
    modify: new FormControl(''),
    isInCome: new FormControl(false),
    remark: new FormControl(''),
  });

  constructor() {

  }

  ngOnInit() {
    this.accountForm.get('isInCome')?.valueChanges.subscribe((value) => {
      this.isIncomeMsg = value ? 'รายรับ' : 'รายจ่าย';
    });
    if (this.acc.data) {
      this.account = this.acc.data;
      this.accountForm.patchValue({
        id: this.acc.data.id,
        date: this.acc.data.date.toDate(),
        details: this.acc.data.details,
        amount: this.acc.data.amount,
        create: this.acc.data.create,
        modify: this.acc.data.modify,
        isInCome: this.acc.data.isInCome,
        remark: this.acc.data.remark,
      });
    }
  }

  get isDateValid(): any {
    const control = this.accountForm.get('date');
    const isInValid = control?.invalid && control.touched;
    if (isInValid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid date';
    }
  }

  get isDetailsValid(): any {
    const control = this.accountForm.get('details');
    const isInValid = control?.invalid && control.touched;
    if (isInValid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid date';
    }
  }

  get isAmountValid(): any {
    const control = this.accountForm.get('amount');
    const isInValid = control?.invalid && control.touched;
    if (isInValid) {
      return control.hasError('required')
        ? 'This field is required'
        : 'Enter a valid amount';
    }
  }

  saveAccount() {
    if (this.accountForm.invalid) return;

    const account = this.accountForm.value;
    if (this.acc.data) {
      this.accountService.updateAccount(account).subscribe({
        next: () => {
          this.message.showSuccess(
            'Successfully',
            'Updated account successfully.',
          );
        },
      });
    } else {
      this.accountService.addAccount(account).subscribe({
        next: () =>
          this.message.showSuccess(
            'Successfully',
            'Added account successfully.',
          ),
        error: (error: any) =>
          this.message.showError('Error', `${error.message}`),
      });
    }
    this.close(true);
  }

  ngOnDestroy() {
    if (this.ref) this.ref.close();
  }

  close(edit: boolean) {
    this.ref.close(edit);
  }
}
