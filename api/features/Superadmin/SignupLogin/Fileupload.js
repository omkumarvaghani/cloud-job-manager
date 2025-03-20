
const multer = require("multer");
const path = require("path");

const storageConfig = multer.diskStorage({
  destination: path.join(__dirname, "uploads"),
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilterConfig = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Please upload a JPEG or PNG."));
  }
};

const upload = multer({
  storage: storageConfig,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter: fileFilterConfig,
});

module.exports = upload;
