import multer from "multer";
import crypto from "crypto";

export default {
  storage: multer.diskStorage({
    destination: '../../uploads',
    filename: (request, file, callback) => {
      callback(null, `${
        crypto.randomBytes(6).toString('hex')
      }-${file.originalname}`);
    }
  })
}