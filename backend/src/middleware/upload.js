import multer from "multer";

const storage = multer.memoryStorage();
const DEFAULT_FILE_SIZE_LIMIT = 30 * 1024 * 1024;

export function createUpload(fileSize = DEFAULT_FILE_SIZE_LIMIT) {
  return multer({
    storage,
    limits: {
      fileSize
    }
  });
}

export const upload = createUpload();
export const pptUpload = createUpload(100 * 1024 * 1024);
