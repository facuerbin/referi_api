import { Injectable, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Injectable()
@UseInterceptors(FileInterceptor('file'))
export class ImagesService {
  constructor() {
    return null;
  }

  uploadFile() {
    return null;
  }

  find() {
    return null;
  }

  remove() {
    return null;
  }
}
