import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { diskStorage } from 'multer';

type validFileExtension = 'jpg' | 'png' | 'jpeg';
type validMimeType = 'image/jpg' | 'image/png' | 'image/jpeg';

const validFileExtensions: validFileExtension[] = ['jpg', 'png', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/jpg',
  'image/png',
  'image/jpeg',
];

export const saveImageOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const fileName = uuidv4() + fileExtension;

      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = validMimeTypes;
    allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};
