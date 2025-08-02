import express from "express"
import validateToken from "../middleware/validateToken.js"
import authenticationReq from "../middleware/authmiddleware.js"
import { uploadMedia } from "../controllers/mediaController.js"
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


router.post("/file-upload", validateToken, authenticationReq, () => {
    upload(req, res, function(err){
        if(err instanceof multer.MulterError){
            logger.error('Multer error while uploading..', err)
            return res.status(400).send({
                message : 'Multer error while uploading',
                error : err.message,
                stack : err.stack
            })
        }else if(err){
             logger.error("Unknown error while uploading..", err);
             return res.status(400).send({
               message: "Multer error while uploading",
               error: err.message,
               stack: err.stack,
             });
        }
        if(!req.file){
            logger.error("No file error while uploading..", err);
            return res.status(400).send({
              message: "Multer error while uploading",
              error: err.message,
              stack: err.stack,
            });
        }
        next()
    })
}, uploadMedia)

export default router