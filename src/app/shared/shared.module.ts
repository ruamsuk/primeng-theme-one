import { NgModule } from '@angular/core';
import { Avatar, AvatarModule } from 'primeng/avatar';
import { Toolbar, ToolbarModule } from 'primeng/toolbar';
import { Button, ButtonDirective, ButtonModule } from 'primeng/button';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Password, PasswordModule } from 'primeng/password';
import { Card, CardModule } from 'primeng/card';
import { PrimeTemplate } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { Toast, ToastModule } from 'primeng/toast';
import { TieredMenu, TieredMenuModule } from 'primeng/tieredmenu';
import { Menubar, MenubarModule } from 'primeng/menubar';
import { Menu, MenuModule } from 'primeng/menu';
import { Ripple, RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { IconField, IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Textarea, TextareaModule } from 'primeng/textarea';
import { ProgressSpinner, ProgressSpinnerModule } from 'primeng/progressspinner';
import { Tooltip, TooltipModule } from 'primeng/tooltip';

@NgModule({
  imports: [
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
  ],
  providers: [  ]
})
export class SharedModule {}
