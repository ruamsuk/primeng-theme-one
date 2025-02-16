import { Injectable } from '@angular/core';
import { Image } from '../models/images.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesSelectorService {

  // Method to return the list of images
  imagesList(): Image[] {
    return [
      {src: '/images/01.jpg', alt: 'Image 1', title: '', description: 'สะพานพระสังฆราช'},
      {src: '/images/14.jpg', alt: 'Image 2', title: '', description: 'รุ่งอรุณ ณ แควใหญ่'},
      {src: '/images/03.jpg', alt: 'Image 3', title: '', description: 'รุ่งอรุณ ณ แควใหญ่'},
      {src: '/images/16.jpg', alt: 'Image 16', title: '', description: 'รุ่งอรุณ ณ แควใหญ่สกายวอล์ค'},
      {src: '/images/05.jpg', alt: 'Image 5', title: '', description: 'ชุมชนแพล่อง แพเทค'},
      {src: '/images/06.jpg', alt: 'Image 6', title: '', description: 'ชุมชนแพล่อง แพเทค'},
      {src: '/images/07.jpg', alt: 'Image 7', title: '', description: 'หอพระประวัติ พระสังฆราช'},
      {src: '/images/08.jpg', alt: 'Image 8', title: '', description: 'สองแควบรรจบ ต้นแม่น้ำแม่กลอง'},
      {src: '/images/09.jpg', alt: 'Image 9', title: '', description: 'สกายวอล์คเมืองกาญจน์'},
      {src: '/images/10.jpg', alt: 'Image 10', title: '', description: 'สวนสาธารณ ริมแควใหญ่'},
      {src: '/images/11.jpg', alt: 'Image 11', title: '', description: 'เส้นทางออกกำลังกาย'},
      {src: '/images/12.jpg', alt: 'Image 12', title: '', description: 'เส้นทางเพื่อสุขภาพที่ดี'},
      {src: '/images/13.jpg', alt: 'Image 13', title: '', description: 'เส้นทางเพื่อสุขภาพที่ดี'},
      {src: '/images/02.jpg', alt: 'Image 02', title: '', description: 'เส้นทางเพื่อสุขภาพที่ดี'},
      {src: '/images/15.jpg', alt: 'Image 15', title: '', description: 'เส้นทางเพื่อสุขภาพที่ดี'},
      {src: '/images/04.jpg', alt: 'Image 04', title: '', description: 'เส้นทางเพื่อสุขภาพที่ดี'},
    ];
  }

  // Method to fetch images (can be replaced with an HTTP call in the future)
  getImages(): Promise<Image[]> {
    return Promise.resolve(this.imagesList());
  }
}
