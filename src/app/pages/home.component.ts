import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-home',
  imports: [
    Card,
    Button
  ],
  template: `
    <div class="flex justify-center items-center mx-auto w-[70%]">
      <p-card [style]="{ width: '25rem', overflow: 'hidden' }" class="mt-5 shadow-md">
        <ng-template #header>
          <img alt="Card" class="w-full" src="https://primefaces.org/cdn/primeng/images/card-ng.jpg"/>
        </ng-template>
        <ng-template #title> Advanced Card</ng-template>
        <ng-template #subtitle> Card subtitle</ng-template>
        <p class="text-left md:text-justify">
          เอ็นเตอร์เทนเด้อตุ๋ย หน่อมแน้มช็อคตุ๊กตุ๊กจอหงวนโปรเจกเตอร์ จ๊าบสต๊อกยาวีทับซ้อนโฟม วีนพีเรียดสโตร์
          แรลลีโดมิโน
          สะบึมส์แบรนด์ <span class="font-bold text-red-400">กีวีคอนโดมิเนียม</span> แฟร์แฮปปี้กรรมาชนบร็อกโคลีแซมบ้า
          ไฟลต์โชห่วย
          ทัวร์ง่าวอัลไซเมอร์
          จูเนียร์แคนูมาร์กแมคเคอเรล พรีเซ็นเตอร์เคอร์ฟิวออสซี่ดราม่าวอล์ก โบ้ยซีรีส์ล็อบบี้คอนเฟิร์มไลน์
          โปรเจ็คท์โคโยตี้โยเกิร์ตแอพพริคอท ใช้งาน คาแรคเตอร์
        </p>
        <ng-template #footer>
          <div class="flex gap-4 mt-1">
            <p-button label="Cancel" severity="secondary" class="w-full" [outlined]="true" styleClass="w-full"/>
            <p-button label="Save" class="w-full" styleClass="w-full"/>
          </div>
        </ng-template>
      </p-card>
    </div>
    <div class="flex justify-center">
      <p class="font-thasadith text-xl mt-5">
        จูเนียร์แคนูมาร์กแมคเคอเรล พรีเซ็นเตอร์เคอร์ฟิวออสซี่ดราม่าวอล์ก โบ้ยซีรีส์ล็อบบี้คอนเฟิร์มไลน์
        โปรเจ็คท์โคโยตี้โยเกิร์ตแอพพริคอท ใช้งาน คาแรคเตอร์
      </p>
    </div>
  `,
  styles: ``
})
export class HomeComponent {

}
