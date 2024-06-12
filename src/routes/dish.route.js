import { Router } from "express";
import { addDish, deleteDish, getAllDishes, getOneDish, updateDish } from "../controllers/dish.controller.js"
import { upload } from "../middlewares/multer.middleware.js"


const router = Router()

router.route("/getAllDishes").get(getAllDishes)

router.route("/d/:dishId").get(getOneDish)

router.route("/addDish").post(upload.single("dishImage"), addDish)

router.route("/u/:dishId").patch(upload.single("dishImage"), updateDish)

router.route("/d/:dishId").delete(deleteDish)

export default router;