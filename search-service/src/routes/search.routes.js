import express from "express";
import { searchPostController } from "../controllers/searchController.js";
import { authenticationReq } from "../middleware/authentication.js";

const searchRoutes = express.Router()

searchRoutes.get('/posts', authenticationReq, searchPostController)

export default searchRoutes