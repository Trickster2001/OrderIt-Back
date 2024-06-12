import { Router } from "express";
import { changeOrderStatus, deleteOrder, getAllOrders } from "../controllers/order.controller.js";
import { placeOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/allOrders").get(getAllOrders);

router.route("/placeOrder/:dishId").post(verifyJWT, placeOrder);

router.route("/s/:orderId").patch( upload.single("status"), changeOrderStatus);

router.route("/d/:orderId").delete(deleteOrder)

export default router