// const multer = require("multer");
// const path = require("node:path");

// const storageConfig = multer.diskStorage({
   
//     destination: path.join(__dirname, "uploads"),
//     filename: (req, file, res) => {
       
//         res(null, Date.now() + "-" + file.originalname);
//     },
// });

// const fileFilterConfig = function(req, file, cb) {
//     if (file.mimetype === "image/jpeg"
//         || file.mimetype === "image/png") {

//         cb(null, true);
//     } else {
        
//         cb(null, false);
//     }
// };

// const upload = multer({
    
//     storage: storageConfig,
//     limits: {

//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter: fileFilterConfig,
// });

// module.exports = upload;


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
  const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Please upload a JPEG, PNG, or PDF."));
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