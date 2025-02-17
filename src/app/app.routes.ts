import { Routes } from '@angular/router';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () =>
  redirectUnauthorizedTo(['auth/login']);
const redirectLoggedInToHome = () =>
  redirectLoggedInTo(['/']);

export const routes: Routes = [
  {
    path: 'home',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./pages/home.component')
      .then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    ...canActivate(redirectLoggedInToHome),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login.component')
          .then(m => m.LoginComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./auth/sign-up.component')
          .then(m => m.SignUpComponent),
      }
    ]
  },
  {
    path: 'account',
    ...canActivate(redirectUnauthorizedToLogin),
    children: [
      {
        path: 'account-list',
        loadComponent: () => import('./accounts/account-list.component')
          .then(m => m.AccountListComponent),
      },
      {
        path: 'account-between',
        loadComponent: () => import('./accounts/account-between.component')
          .then(m => m.AccountBetweenComponent),
      },
      {
        path: 'between-detail',
        loadComponent: () => import('./accounts/account-between-detail.component')
          .then(m => m.AccountBetweenDetailComponent),
      },
      {
        path: 'allyear',
        loadComponent: () => import('./accounts/calculate-expenses-income.component')
          .then(m => m.CalculateExpensesIncomeComponent),
      },
    ]
  },
  {
    path: 'user',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./users/user-list.component')
      .then(m => m.UserListComponent),
  },
  {
    path: 'monthly',
    ...canActivate(redirectUnauthorizedToLogin),
    loadComponent: () => import('./monthly/monthly.component')
      .then(m => m.MonthlyComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];
