import { Injectable } from '@angular/core';
import { Monthly } from '../models/monthly.model';
import { from } from 'rxjs';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MonthlyService {
  constructor(private firestore: Firestore) {
  }

  getSortedMonthlyData() {
    const collectionRef = collection(this.firestore, 'monthly');
    const queryRef = query(collectionRef);

    return collectionData(queryRef, {idField: 'id'}).pipe(
      map((data: any[]) => {
          return data.sort((a: Monthly, b: Monthly) => {
            const yearA = Number(a.year);
            const yearB = Number(b.year);
            const monthA = this.thaiMonthToNumber(a.month);
            const monthB = this.thaiMonthToNumber(b.month);

            return yearB - yearA || monthB - monthA;
          });
        }
      )
    );

  }

  addMonthly(monthly: any) {
    const ref = collection(this.firestore, 'monthly');
    return from(addDoc(ref, monthly));
  }

  updateMonthly(data: any) {
    const db = doc(this.firestore, 'monthly', `${data.id}`);
    return from(updateDoc(db, data));
  }

  deleteMonth(id: string | undefined) {
    const docInstance = doc(this.firestore, 'monthly', `${id}`);
    return from(deleteDoc(docInstance));
  }

  thaiMonthToNumber(month: string): number {
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม',
      'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม',
      'พฤศจิกายน', 'ธันวาคม',
    ];
    const index = thaiMonths.indexOf(month);
    return index !== -1 ? index + 1 : 0;
  }

}
