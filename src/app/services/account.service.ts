import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  updateDoc,
  where
} from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { Account } from '../models/account.model';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  firestore: Firestore = inject(Firestore);

  constructor() {
  }

  loadAccounts(): Observable<Account[]> {
    const dbInstance = collection(this.firestore, 'accounts');
    const userQuery = query(dbInstance, orderBy('date', 'desc'));
    return collectionData(userQuery, {idField: 'id'}) as Observable<Account[]>;
    //   .pipe(
    //   map((data) => {
    //     console.log(JSON.stringify(data, null, 2));
    //     return data.map((account) => ({
    //       ...account,
    //       details: account['details'],
    //       amount: account['amount'],
    //       isInCome: account['isInCome'],
    //     }));
    //   })
    // );
  }

  addAccount(account: any) {
    if (typeof account.amount === 'string') {
      const number = account.amount.replace(/[^0-9]/g, '');
      account.amount = parseFloat(number);
    }

    const dummy = {
      date: account.date,
      details: account.details,
      amount: parseFloat(String(account.amount)),
      create: new Date(),
      modify: new Date(),
      isInCome: account.isInCome ? account.isInCome : false,
      remark: account.remark,
    };
    const ref = collection(this.firestore, 'accounts');
    return from(addDoc(ref, dummy));
  }

  deleteAccount(id: string | undefined) {
    const docInstance = doc(this.firestore, 'accounts', `${id}`);
    return from(deleteDoc(docInstance));
  }

  updateAccount(account: any) {
    if (typeof account.amount === 'string') {
      const number = account.amount.replace(/[^0-9]/g, '');
      account.amount = parseFloat(number);
    }
    const ref = doc(this.firestore, 'accounts', `${account.id}`);
    return from(updateDoc(ref, {...account, modify: new Date()}));
  }

  /**
   * load account with query
   *
   ** ปรับปรุงการค้นหาให้มีระเบียบลดความซ้ำซ้อน */
  searchDateTransactions(start: Date, end: Date, isIncome: boolean) {
    const db = collection(this.firestore, 'accounts');
    const q = query(
      db,
      where('date', '>=', start),
      where('date', '<=', end),
      where('isInCome', '==', isIncome),
      orderBy('date', 'asc'),
    );
    return collectionData(q, {idField: 'id'}).pipe(
      map((data: any[]) =>
        data.map((item) => ({
          ...item,
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0'), // ตรวจสอบและแปลง amount
        })),
      ),
    );
  }

  /** search date between & detail not cash back */
  searchDesc(start: Date, end: Date, description: string): Observable<any> {
    const db = collection(this.firestore, 'accounts');
    const q = query(
      db,
      where('date', '>=', start),
      where('date', '<=', end),
      where('details', '>=', description),
      where('details', '<=', description + '\uf8ff'),
      orderBy('date', 'desc'),
    );
    return collectionData(q, {idField: 'id'}).pipe(
      map((data: any[]) =>
        data.map((item) => ({
          ...item,
          amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || '0'), // ตรวจสอบและแปลง amount
        })),
      ),
    );
  }
}
