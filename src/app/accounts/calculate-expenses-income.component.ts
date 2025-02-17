import { ChangeDetectorRef, Component, HostListener, OnInit, } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { FormControl } from '@angular/forms';
import { catchError, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { YearSummary } from '../models/account.model';
import { SelectorService } from '../services/selector.service';
import { IncomeExpenseService } from '../services/income-expense.service';
import { map } from 'rxjs/operators';
import { InfinityToZeroPipe } from '../pipe/infinity-to-zero-pipe.pipe';
import { AsyncPipe, CurrencyPipe, NgClass } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-calculate-expenses-income',
  standalone: true,
  imports: [
    SharedModule,
    InfinityToZeroPipe,
    AsyncPipe,
    CurrencyPipe,
    NgClass,
  ],
  template: `
    <div class="flex justify-center items-center h-15rem">
      <p-card class=" mt-4 w-full md:w-[20rem] overflow-hidden">
        <p class="font-tasadith text-xl -mt-3 my-2 text-green-400 text-center">
          รายปี
        </p>
        <p-floatLabel class="w-full px-2">
          <p-treeSelect
            containerStyleClass="w-full"
            [formControl]="selectedYear"
            [options]="year"
            (onNodeSelect)="searchAllYear()"
            appendTo="body"
          />
          <label for="treeSelect" class="ml-2">เลือกปี</label>
        </p-floatLabel>
      </p-card>
    </div>
    @if (incomeExpenseSummaryArray$ | async; as summaryArray) {
      <ng-container>
        @if (summaryArray.length > 0) {
          <div class="flex justify-center items-center mt-5">
            <div class="table-container">
              <p-table
                [value]="summaryArray ?? []"
                [rowHover]="true"
                [columns]="cols"
                [loading]="loading"
                [tableStyle]="{ 'min-width': '650px' }"
                scrollHeight="400px"
                class="table-container"
              >
                <ng-template #caption>
                  <div class="flex justify-between">
                    <span class="text-green-400 font-thasadith font-semibold text-xl ">
                      ค่าใช้จ่ายในรอบปี:
                      <span class="ml-2 text-orange-400 text-lg">
                        {{ showYear }}
                      </span>
                    </span>
                    <p-button icon="pi pi-refresh"/>
                  </div>
                </ng-template>
                <ng-template #header let-columns>
                  <tr>
                    @for (col of columns; track $index) {
                      <th>{{ col.header }}</th>
                    }
                  </tr>
                </ng-template>
                <ng-template #body let-rowData let-columns="columns">
                  <tr>
                    <td>{{ rowData.index }}</td>
                    <td>{{ rowData.month }}</td>
                    <td>
                      {{ rowData.income | infinityToZero | currency: '' : '' }}
                    </td>
                    <td>
                      {{ rowData.expense | infinityToZero | currency: '' : '' }}
                    </td>
                    <td
                      [ngClass]="{
                        'negative-balance': rowData.balance < 0,
                        'positive-balance': rowData.balance >= 0,
                      }"
                    >
                      {{ rowData.balance | infinityToZero | currency: '' : '' }}
                    </td>
                  </tr>
                </ng-template>
                <ng-template #footer>
                  <tr>
                    <td colspan="2">รวม</td>
                    <td>
                      {{ totalIncome | infinityToZero | currency: '' : '' }}
                    </td>
                    <td
                      [ngClass]="{
                        'negative-balance': totalBalance < 0,
                        'positive-balance': totalBalance >= 0,
                      }"
                    >
                      {{ totalExpense | infinityToZero | currency: '' : '' }}
                    </td>
                    <td
                      [ngClass]="{
                        'negative-balance': totalBalance < 0,
                        'positive-balance': totalBalance >= 0,
                      }"
                    >
                      {{ totalBalance | infinityToZero | currency: '' : '' }}
                    </td>
                  </tr>
                </ng-template>
                <ng-template #emptymessage>
                  <tr>
                    <td colspan="6">
                      <span class="text-center text-orange-400 text-xl font-semibold">
                        ไม่พบข้อมูล
                      </span>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>
        } @else {
          <div class="text-center text-orange-400 text-base md:text-lg  mt-5">
          </div>
        }
      </ng-container>
    }
    @if (loading) {
      <div class="loading-shade">
        <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
      </div>
    }
  `,
  styles: `
    .negative-balance {
      color: red;
    }

    .positive-balance {
      color: #90ee90; /* สีเขียวเลม่อน */
    }
  `,
})
export class CalculateExpensesIncomeComponent implements OnInit {
  selectedYear = new FormControl();
  loading = false;
  isMobile: boolean = false;
  year: any[] = [];
  showYear: string = '';
  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBalance: number = 0;

  cols: any[] = [
    {field: 'index', header: 'ลำดับ'},
    {field: 'month', header: 'เดือน'},
    {field: 'income', header: 'รายรับ', pipe: 'currency'},
    {field: 'expense', header: 'รายจ่าย', pipe: 'currency'},
    {field: 'balance', header: 'คงเหลือ', pipe: 'currency'},
  ];

  // Observables สำหรับเก็บข้อมูลและแปลงข้อมูลให้เหมาะกับการแสดงผล
  incomeExpenseSummary$: Observable<YearSummary> = of({}); // เก็บข้อมูลจาก service
  incomeExpenseSummaryArray$: Observable<any[]> = of([]); // แปลงข้อมูลเป็น array สำหรับ PrimeNG Data Table

  constructor(
    private incomeExpenseService: IncomeExpenseService,
    private selectService: SelectorService,
    public message: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.selectService.getYear().then((year) => {
      this.year = year;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth < 768;
  }

  searchAllYear() {
    this.showYear = this.selectedYear.value.label;

    // สร้าง Observable ที่ดึงข้อมูลจาก service เมื่อค่า selectedYear เปลี่ยนแปลง
    this.incomeExpenseSummary$ = this.selectedYear.valueChanges.pipe(
      startWith(this.selectedYear.value.label), // เริ่มต้นด้วยค่าปีที่กรอกเข้ามา
      tap(() => (this.loading = true)),
      switchMap((year) =>
        this.incomeExpenseService.getIncomeExpenseSummary(year),
      ),
      catchError((err) => {
        this.message.showError('Error', err.messages);
        this.loading = false;
        return of({});
      }),
    ); // เรียกใช้ service

    // แปลงข้อมูลจาก incomeExpenseSummary$ ให้เป็น array เพื่อใช้กับ PrimeNG Data Table
    this.incomeExpenseSummaryArray$ = this.incomeExpenseSummary$.pipe(
      map((summary) => {
        const summaryArray = Object.entries(summary).map(
          ([month, data], index) => ({
            month,
            ...data,
            index: index + 1,
          }),
        );

        // คำนวณผลรวมของ income, expense, และ balance
        this.totalIncome = summaryArray.reduce(
          (sum, item) => sum + item.income,
          0,
        );
        this.totalExpense = summaryArray.reduce(
          (sum, item) => sum + item.expense,
          0,
        );
        this.totalBalance = summaryArray.reduce(
          (sum, item) => sum + item.balance,
          0,
        );
        // หน่วงให้ loading หยุดแสดง
        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 100);

        return summaryArray;
      }),
    ); // <--
  }
}
