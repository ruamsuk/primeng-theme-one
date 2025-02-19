import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { Monthly } from '../models/monthly.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToastService } from '../services/toast.service';
import { MonthlyService } from '../services/monthly.service';
import { SelectorService } from '../services/selector.service';

@Component({
  selector: 'app-edit-monthly',
  imports: [SharedModule],
  template: `
    <hr class="h-px bg-gray-200 border-0"/>
    <form [formGroup]="monthlyForm" (ngSubmit)="saveMonthly()">
      <div class="grid grid-cols-1 ">
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
          @if (showHint()) {
            <small class="text-orange-100 opacity-50 italic ml-1">
              *ถ้าแก้เดือนแล้วให้ตรวจสอบวันเริ่มและสิ้นสุดใหม่ด้วย
            </small>
          }
        </div>
        <div class="mt-5">
          <label for="autoComplete" class="ml-2">ปี</label>
          <p-autoComplete
            formControlName="year"
            [suggestions]="filteredYear"
            [dropdown]="true"
            (completeMethod)="filterYear()"
            appendTo="body"
            placeholder="เลิอกปี"
            styleClass="w-full"
          />
          @if (showHint()) {
            <small class="text-orange-100 opacity-50 italic ml-1">
              *ถ้าแก้ปีแล้วให้ตรวจสอบวันเริ่มและสิ้นสุดใหม่ด้วย
            </small>
          }
        </div>
      </div><!-- grid-cols-1-->
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
            (onClick)="saveMonthly()"
          />
        </div>
      </div>
      <p-confirmPopup/>
    </form>
  `,
  styles: ``
})
export class EditMonthlyComponent implements OnInit, OnDestroy {
  private ref: DynamicDialogRef = inject(DynamicDialogRef);
  private monthlyData: DynamicDialogConfig = inject(DynamicDialogConfig);
  private message: ToastService = inject(ToastService);
  private monthlyService: MonthlyService = inject(MonthlyService);
  private selectService: SelectorService = inject(SelectorService);

  monthly!: Monthly;
  year: any[] = [];
  filteredMonth: any;
  filteredYear: any;
  showHint = signal(false);

  monthlyForm = new FormGroup({
    id: new FormControl(null),
    month: new FormControl(''),
    year: new FormControl(''),
    datestart: new FormControl('', Validators.required),
    dateend: new FormControl('', Validators.required),
  });

  ngOnInit() {
    if (this.monthlyData.data) {
      this.showHint.set(true);
      const nYear = this.monthlyData.data.year;
      const cYear = `${Number(nYear) + 543} (${nYear})`;
      this.monthlyForm.patchValue({
        id: this.monthlyData.data.id,
        month: this.monthlyData.data.month,
        year: cYear,
        datestart: this.monthlyData.data.datestart.toDate(),
        dateend: this.monthlyData.data.dateend.toDate(),
      });
    } else {
      this.showHint.set(false);
    }
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

  filterYear() {
    this.selectService.getYear().then((year) => {
      this.filteredYear = year.map(y => ({
        ...y,
        label: `${y.label} (${Number(y.label) - 543})`
      }));
    });
  }

  close() {
    this.ref.close();
  }

  ngOnDestroy() {
    if (this.ref) this.ref.close();
  }

  saveMonthly() {
    if (this.monthlyForm.invalid) return;

    const formValue = this.monthlyForm.value;

    // ฟังก์ชันสำหรับดึงปี ค.ศ. จากสตริงหรือ object
    const extractAdYear = (yearValue: string | { label: string } | null | undefined): number => {
      if (!yearValue) {
        throw new Error('Year values is null or undefined');
      }

      let yearString: string;

      if (typeof yearValue === 'object' && yearValue.label) {
        // ถ้าเป็น object ให้ดึงค่าจาก label
        yearString = yearValue.label;
      } else if (typeof yearValue === 'string') {
        // ถ้าเป็นสตริง ให้ใช้ค่าโดยตรง
        yearString = yearValue;
      } else {
        throw new Error('Invalid year format');
      }

      // ใช้ regex เพื่อดึงปี ค.ศ. ออกมา
      const match = yearString.match(/\((\d{4})\)/);
      if (match && match[1]) {
        return parseInt(match[1], 10); // แปลงเป็นตัวเลข
      } else {
        throw new Error('Cannot extract AD year from the provided value');
      }
    };

    try {
      // ดึงปี ค.ศ. ออกจากค่าในฟิลด์ year
      const adYear = extractAdYear(formValue.year);

      // สร้างข้อมูลที่จะบันทึก โดยแทนที่ค่า year ด้วยปี ค.ศ.
      const dataToSave = {
        id: formValue.id,
        month: formValue.month,
        year: adYear, // ใช้ปี ค.ศ. เท่านั้น
        datestart: formValue.datestart,
        dateend: formValue.dateend,
      };

      // บันทึกข้อมูล (เช่น ส่งไปยัง API หรือประมวลผลต่อ)
      if (this.monthlyData.data) {
        this.monthlyService.updateMonthly(dataToSave).subscribe({
          next: () =>
            this.message.showSuccess('Successfully', 'Updated Successfully.'),
          error: (err) => this.message.showError('Error', err.message),
          complete: () => this.close(),
        });
      } else {
        this.monthlyService.addMonthly(dataToSave).subscribe({
          next: () => this.message.showSuccess('Successfully', 'Add Monthly Successfully.'),
          error: err => this.message.showSuccess('Error', err.message),
          complete: () => this.close(),
        });
      }
    } catch (error: any) {
      this.message.showError('Error', error.message);
      console.error('Error extracting AD year:', error);
    }
  }
}
