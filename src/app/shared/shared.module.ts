import { NgModule } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonDirective, ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { MenubarModule } from 'primeng/menubar';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DatePickerModule } from 'primeng/datepicker';
import { ImageModule } from 'primeng/image';

@NgModule({
  imports: [
    AvatarModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    TableModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    PasswordModule,
    PrimeTemplate,
    ReactiveFormsModule,
    ButtonDirective,
    TieredMenuModule,
    MenuModule,
    MenubarModule,
    RippleModule,
    IconFieldModule,
    InputIconModule,
    ConfirmPopupModule,
    TextareaModule,
    ProgressSpinnerModule,
    IconFieldModule,
    TooltipModule,
    TableModule,
    InputSwitchModule,
    ImageModule,
  ],
  exports: [
    AvatarModule,
    ButtonModule,
    CardModule,
    TableModule,
    ToolbarModule,
    ToastModule,
    InputTextModule,
    PasswordModule,
    PrimeTemplate,
    ReactiveFormsModule,
    ButtonDirective,
    TieredMenuModule,
    MenuModule,
    MenubarModule,
    RippleModule,
    IconFieldModule,
    InputIconModule,
    ConfirmPopupModule,
    TextareaModule,
    ProgressSpinnerModule,
    IconFieldModule,
    TooltipModule,
    TableModule,
    InputSwitchModule,
    ImageModule,
  ],
  providers: []
})
export class SharedModule {
}
