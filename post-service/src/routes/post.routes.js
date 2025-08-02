import express from "express"
import { createPost, deleteSinglepost, getAllpost, getSinglepost } from "../controllers/post-controller.js"
import { authenticateReq } from "../middleware/authmiddleware.js"
import validateToken from "../middleware/validatetoken.js"

const router = express.Router()

//Router.use(authenticateReq) //this means every req will go this as a middleware
//Why i comment the upper line cause when i hit endpoint from api gateway where we can easily get userId as we adding x-user-id it works
//But when i wanted to run this post-service independently then it won't get userId and that cause an issue
//so we created validateToken
router.post("/create-post", validateToken, authenticateReq, createPost);
router.get("/get-posts", validateToken, authenticateReq, getAllpost);
router.get("/get-single-post", validateToken, authenticateReq, getSinglepost);
router.delete("/delete-single-post", validateToken, authenticateReq, deleteSinglepost);

export default router