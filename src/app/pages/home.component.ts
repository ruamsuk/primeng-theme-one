import { Component, inject, OnInit, signal } from '@angular/core';
import { Image } from '../models/images.model';
import { ImagesSelectorService } from '../services/images-selector.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
  template: `
    <div class="container mx-auto p-4 my-5">
      <!-- Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Repeat for each image -->
        @for (item of images; track $index) {
          <div class="rounded-lg overflow-hidden shadow-lg bg-gray-800">
            <p-image [src]="item.src" preview="true" [alt]="item.alt" class="w-full h-auto object-cover"
                     loading="lazy">
              <ng-template #indicator>
                <i class="pi pi-search-plus"></i>
              </ng-template>

              <!-- Placeholder Effect (Skeleton Loader) -->
              <ng-template #placeholder>
                <div class="w-full h-auto bg-gray-700 animate-pulse"></div>
              </ng-template>

              <!-- Image with Lazy Loading -->
              <ng-template #image>
                <img [src]="item.src" [alt]="item.alt" loading="lazy"
                     class="w-full h-auto object-cover blur-md opacity-0 transition-all duration-700"
                     (load)="onImageLoad($event)">
              </ng-template>

              <!-- Preview Image -->
              <ng-template #preview let-style="style" let-previewCallback="previewCallback">
                <img [src]="item.src" [alt]="item.alt" [style]="style" loading="lazy" (click)="previewCallback()">
              </ng-template>
            </p-image>
            <div class="p-4">
              <h3 class="text-lg font-semibold">{{ item.title }}</h3>
              <p class="text-gray-400">{{ item.description }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: ``
})
export class HomeComponent implements OnInit {
  private readonly imagesService: ImagesSelectorService = inject(ImagesSelectorService);
  images: Image[] = [];
  isLoading = signal(true);

  ngOnInit(): void {
    // Fetch images from the service
    this.imagesService.getImages().then((data) => {
      this.images = data;
      this.isLoading.set(false);
    });
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.remove('blur-md', 'opacity-0'); // เอา Blur ออก
    img.classList.add('opacity-100'); // ทำให้ภาพค่อยๆ ชัดขึ้น
  }
}
