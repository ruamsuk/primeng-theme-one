import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MonthlyService } from '../../services/monthly.service';
import { Monthly } from '../../models/monthly.model';
import { SharedModule } from '../../shared/shared.module';
import { SelectorService } from '../../services/selector.service';
import { ConfirmationService } from 'primeng/api';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-crud-monthly',
  standalone: true,
  imports: [SharedModule],
  template: `
    <hr class="h-px bg-gray-200 border-0"/>
    <form [formGroup]="monthlyForm" (ngSubmit)="saveMonthly($event)">
      <div class="grid grid-cols-1 gap-4">
        <div class="mt-5">
          <label for="autoComplete" class="ml-2">เดือน</label>
          <p-autoComplete
            formControlName="month"
            [suggestions]="filteredMonth"
            [dropdown]="true"
            (completeMethod)="filterMonth($event)"
            appendTo="body"
            placeholder="เลิอกเดือน"
            styleClass="w-full"
          />
        </div>
        <div>
          <label for="treeSelect" class="ml-2">ปี</label>
          <p-treeSelect
            class=""
            containerStyleClass="w-full"
            formControlName="year"
            [options]="year"
            appendTo="body"
            placeholder="เลิอกปี"
          />
        </div>
      </div>
      <div class="my-5">
        <label for="date">วันเริ่มต้น</label>
        <p-datePicker
          [iconDisplay]="'input'"
          [showIcon]="true"
          [inputStyle]="{ width: '90vw' }"
          appendTo="body"
          inputId="icondisplay"
          formControlName="datestart"
          name="datestart"
          styleClass="w-full"
        ></p-datePicker>
      </div>
      <div>
        <label for="date">วันสิ้นสุด</label>
        <p-datePicker
          [iconDisplay]="'input'"
          [showIcon]="true"
          [inputStyle]="{ width: '90vw' }"
          appendTo="body"
          inputId="icondisplay"
          formControlName="dateend"
          name="dateend"
          styleClass="w-full"
        ></p-datePicker>
      </div>
      <div>
        <div class="my-5">
          <hr class="h-px bg-gray-200 border-0 mb-1"/>
        </div>

        <div class="flex mb-1">
          <p-button
            label="Cancel"
            severity="secondary"
            styleClass="w-full"
            class="w-full mr-2"
            (onClick)="close()"
          />
          <p-button
            label="Save"
            [disabled]="monthlyForm.invalid"
            styleClass="w-full"
            class="w-full"
            (onClick)="saveMonthly($event)"
          />
        </div>
      </div>
      <p-confirmPopup/>
    </form>
  `,
  styles: `
    label {
      color: #d3d2d2;;
    }
  `,
})
export class CrudMonthlyComponent implements OnInit, OnDestroy {
  monthly!: Monthly;
  _month: any[] = [];
  year: any[] = [];
  filteredMonth: any;

  monthlyForm = new FormGroup({
    id: new FormControl(null),
    month: new FormControl(''),
    year: new FormControl('', Validators.required),
    datestart: new FormControl('', Validators.required),
    dateend: new FormControl('', Validators.required),
  });

  constructor(
    private ref: DynamicDialogRef,
    private confirmService: ConfirmationService,
    private monthlyData: DynamicDialogConfig,
    private message: ToastService,
    private monthlyService: MonthlyService,
    private selectService: SelectorService,
  ) {

    this.selectService.getMonth().then((month) => {
      this._month = month;
    });
    this.selectService.getYear().then((year) => {
      this.year = year.map(y => ({
        ...y,
        label: `${y.label} (${Number(y.label) - 543})`
      }));
    });
  }

  filterMonth(event: any) {
    const query = event.query.toLowerCase();
    let _month: { label: string, value: string }[];

    this.selectService.getMonth().then((month) => {
      _month = month;
      this.filteredMonth = _month.filter((month) =>
        month.label.toLowerCase().includes(query));
    });
  }

  ngOnInit() {
    if (this.monthlyData.data) {
      this.monthlyForm.patchValue({
        id: this.monthlyData.data.id,
        month: this.monthlyData.data.month,
        year: this.monthlyData.data.year,
        datestart: this.monthlyData.data.datestart.toDate(),
        dateend: this.monthlyData.data.dateend.toDate(),
      });
      console.log(this.monthlyForm.controls['month'].value);
      console.log(this.monthlyData.data.month);
      console.log(this.monthlyData.data.year);
      /**
       * ต่อไปเปลี่ยนปีจาก treeSelect เป็น autoComplete เหมือนเดือน
       * */
    }
  }

  saveMonthly(event: Event) {
    if (this.monthlyForm.invalid) return;

    const monthly = this.monthlyForm.value;
    const convertedYear = Number(String(monthly.year).split(' ')[0]) - 543;
    // const convertedYear = Number(monthly.year?.label.split(' ')[0]) - 543;
    const dataToSave = {
      ...monthly,
      year: convertedYear,
    };

    if (monthly.id) {
      if (monthly.month == null) {
        console.log('monthly.month null');
        this.confirmService.confirm({
          target: event.target as EventTarget,
          message: 'ต้องเลือกเดือนอีกตรั้งก่อน!',
          icon: 'pi pi-exclamation-circle',
          acceptLabel: 'OK',
          acceptButtonStyleClass: 'p-button-sm',
          rejectVisible: false,
          accept: () => {
            return;
          },
        });
      } else {
        this.monthlyService.updateMonthly(dataToSave).subscribe({
          next: () =>
            this.message.showSuccess(
              'Successfully',
              'Updated monthly',
            ),
          error: (err) =>
            this.message.showError('Error', err.message),
          complete: () => this.close(),
        });
      }
    } else {
      console.log(JSON.stringify(dataToSave, null, 2));
      this.monthlyService.addMonthly(dataToSave).subscribe({
        next: () =>
          this.message.showSuccess('Successfully', 'Saved monthly.'),
        error: (err) => this.message.showError('Error', err.message),
        complete: () => this.close(),
      });
    }
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    if (this.ref) this.ref.close();
  }

}
