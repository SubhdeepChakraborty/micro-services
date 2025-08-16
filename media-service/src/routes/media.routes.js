import express from "express"
import validateToken from "../middleware/validateToken.js"
import authenticationReq from "../middleware/authmiddleware.js"
import { getAllMedia, uploadMedia } from "../controllers/mediaController.js"
import multer from "multer"
import logger from "../utils/logger.js"

const router = express.Router()

//configure multer
const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fieldSize : 5 * 1024 * 1024
    }
}).single('file')


const multerUploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      const isMulterError = err instanceof multer.MulterError;
      logger.error(`${isMulterError ? "Multer" : "Unknown"} error`, err);
      return res.status(400).send({
        message: `${isMulterError ? "Multer" : "Upload"} error`,
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    next();
  });
};

router.post("/file-upload", validateToken, authenticationReq, multerUploadMiddleware, uploadMedia)
router.get('/get', validateToken, authenticationReq, getAllMedia)

export default router