import multer from "multer";

export function notFound(req, res) {
  res.status(404).json({
    message: `Route not found: ${req.originalUrl}`
  });
}

export function errorHandler(error, req, res, next) {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({
      message: req.originalUrl.includes("/ppts") ? "PPT upload size must be 100 MB or smaller." : "Uploaded file exceeds the allowed size limit."
    });
    return;
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Server error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack
  });
}
