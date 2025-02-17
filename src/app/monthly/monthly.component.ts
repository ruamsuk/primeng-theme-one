import { Component, DestroyRef, inject, OnDestroy, signal } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MonthlyService } from '../services/monthly.service';
import { ToastService } from '../services/toast.service';
import { SelectorService } from '../services/selector.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { Table } from 'primeng/table';
import { ThaiDatePipe } from '../pipe/thai-date.pipe';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CrudMonthlyComponent } from './crud-monthly/crud-monthly.component';
import { ConfirmationService } from 'primeng/api';
import { Monthly } from '../models/monthly.model';
import { AuthService } from '../services/auth.service';
import { ChristianToThaiYearPipe } from '../pipe/christian-to-thai-year.pipe';

@Component({
  selector: 'app-monthly',
  standalone: true,
  imports: [SharedModule, ThaiDatePipe, ChristianToThaiYearPipe],
  template: `
    <div class="card">
      @if (loading()) {
        <div class="loading-shade">
          <p-progressSpinner strokeWidth="4" ariaLabel="loading"/>
        </div>
      }
      <div class="flex justify-center items-center">
        <div class="mt-2">
          <div
            class="flex items-center justify-center bg-black shadow-md rounded-xl"
          >
            <span
              class="font-thasadith text-blue-600 font-semibold md:text-2xl/10 xl:text-xl/10"
            >
              กำหนดวันเริ่มและสิ้นสุดของเดือน
            </span>
          </div>
          <p-table
            #tb
            [value]="monthly"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 20, 30]"
            [paginator]="true"
            [globalFilterFields]="['details', 'remark']"
            [scrollable]="true"
            scrollHeight="800px"
            [tableStyle]="{ 'min-width': '40rem' }"
            styleClass="p-datatable-striped z-0"
          >
            <ng-template #caption>
              <div class="flex items-center justify-between">
                <span>
                  <p-button
                    (click)="showDialog(Monthly)"
                    [disabled]="!admin"
                    size="small"
                    icon="pi pi-plus"
                  />
                </span>
                <p-iconField iconPosition="left" styleClass="ml-auto">
                  <p-inputIcon>
                    <i class="pi pi-search"></i>
                  </p-inputIcon>
                  <input
                    pInputText
                    [(ngModel)]="searchValue"
                    pTooltip="หาเดือน"
                    tooltipPosition="bottom"
                    placeholder="ค้นหา .."
                    type="text"
                    (input)="tb.filterGlobal(getValue($event), 'contains')"
                  />
                  @if (searchValue) {
                    <span class="icons" (click)="clear(tb)">
                      <i class="pi pi-times" style="font-size: 1rem"></i>
                    </span>
                  }
                </p-iconField>
              </div>
            </ng-template>
            <ng-template #header>
              <tr>
                <th pSortableColumn="month">
                  <div>
                    เดือน
                    <p-sortIcon field="เดือน"/>
                  </div>
                </th>
                <th pSortableColumn="year">
                  <div>
                    ปี
                    <p-sortIcon field="ปี"/>
                  </div>
                </th>
                <th>
                  <div>วันเริ่มต้น</div>
                </th>
                <th>
                  <div>วันสิ้นสุด</div>
                </th>
                <th>
                  <div>Action</div>
                </th>
                <th></th>
              </tr>
            </ng-template>
            <ng-template #body let-month>
              <tr>
                <td>{{ month.month }}</td>
                <td>{{ month.year | christianToThaiYear }}</td>
                <td>{{ month.datestart | thaiDate }}</td>
                <td>{{ month.dateend | thaiDate }}</td>
                <td>
                  @if (admin()) {
                    <i
                      pTooltip="แก้ไข"
                      (click)="showDialog(month)"
                      tooltipPosition="bottom"
                      class="pi pi-pen-to-square mr-2 ml-2 text-sky-600"
                    ></i>
                    <p-confirmPopup/>
                    <i
                      pTooltip="ลบข้อมูล"
                      (click)="conf($event, month.id)"
                      tooltipPosition="bottom"
                      class="pi pi-trash text-red-500"
                    ></i>
                  }
                </td>
                <td></td>
              </tr>
            </ng-template>
            <ng-template #emptymessage>
              <tr>
                <td colspan="6">
                  <span class="center text-orange-400 text-lg">
                  ไม่พบข้อมูล
                </span>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      </div>
    </div>
  `,
  styles: `
    i.pi {
      &:hover {
        cursor: pointer;
      }
    }

    .icons {
      position: relative;
      right: 30px;
      top: 3px;
    }
  `,
})
export class MonthlyComponent implements OnDestroy {
  searchValue: string = '';
  year: any[] = [];
  monthly: any[] = [];
  ref: DynamicDialogRef | undefined;
  Monthly!: Monthly;

  dialogService = inject(DialogService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);
  admin = signal(false);
  isMember = signal(false);

  constructor(
    private authService: AuthService,
    private yearSearch: SelectorService,
    private monthlyService: MonthlyService,
    private messageService: ToastService,
    private confirmService: ConfirmationService,
  ) {
    this.yearSearch.getYear().then((year) => {
      this.year = year;
    });
    this.getRole();
    this.getMonthly();
  }

  getMonthly() {
    this.loading.set(true);

    this.monthlyService
      .getSortedMonthlyData()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: any) => {
          this.messageService.showError('Error', err.message);
          console.error(err);
          return of([]);
        }),
      )
      .subscribe((result: any[]) => {
        this.loading.set(false);
        this.monthly = result;
      });
  }

  getRole() {
    this.authService.userProfile$.pipe().subscribe((user: any) => {
      this.admin.set(user?.role === 'admin' || user?.role === 'manager');
      this.isMember.set(user?.role === 'member');
    });
  }

  showDialog(monthly: Monthly) {
    let header = monthly ? `แก้ไขรายการ ${monthly.month}` : 'เพิ่มรายการ';

    this.ref = this.dialogService.open(CrudMonthlyComponent, {
      data: monthly,
      header: header,
      width: '360px',
      contentStyle: {overflow: 'auto'},
      breakpoints: {
        '960px': '360px',
        '640px': '360px',
        '390px': '360px',
      },
    });
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = '';
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  conf(event: Event, id: string) {
    this.confirmService.confirm({
      target: event.target as EventTarget,
      message: 'ต้องการลบรายการนี้?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-warning p-button-sm',
      accept: () => {
        this.monthlyService.deleteMonth(id).subscribe({
          next: () =>
            this.messageService.showInfo('Information', 'ลบรายการแล้ว!'),
          error: (error: any) =>
            this.messageService.showError(
              'Error',
              `${error.message}`,
            ),
        });
      },
      reject: () => {
        this.messageService.showSuccess(
          'Successfully',
          'ยกเลิกการลบ.',
        );
      },
    });
  }

  ngOnDestroy() {
    if (this.ref) this.ref.destroy();
  }
}
