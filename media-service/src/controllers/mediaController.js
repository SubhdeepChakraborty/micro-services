import logger from "../utils/logger.js"
import uploadMediaFileToCloudinary from "../utils/couldinary.js"
import Media from "../models/media.js"


const uploadMedia = async(req, res) => {
    logger.info('Starting media upload.....')
    try {
        //File not present
        if(!req.file){
            logger.warn('No file found. Please try to add a file')
            res.status(400).send({
              status: false,
              message: "No file found. Please try to add a file",
            });
        }
        //Imp things to get from the file
        const { originalname, mimetype, buffer } = req.file;
        const userId = req.user.userId
        console.log(req.file, "file")
        logger.info(`File details : name=${originalname} type=${mimetype} userId=${userId}`)
        logger.info(`Uploading to cloudinary....`)

        const cloudUpload = await uploadMediaFileToCloudinary(req.file)

        logger.info(cloudUpload)
        logger.info(`Cloudinary upload successfully. Public Id : ${cloudUpload.public_id}`)

        const newlyCreatedMedia = await Media.create({
            publicId : cloudUpload.public_id,
            originalName : originalname,
            mimeType : mimetype,
            url : cloudUpload.secure_url,
            userId : userId
        })

        logger.info(`Created successfully...`)

        return res.status(201).send({
            status : true,
            message : 'File have been uploaded Successfully',
            mediaId : newlyCreatedMedia.userId,
            url : newlyCreatedMedia.url
        })

    } catch (error) {
        logger.error(error)
        return res.status(500).send({
            status : false,
            message : 'Something went wrong..'
        })
    }
}

export {
    uploadMedia
}