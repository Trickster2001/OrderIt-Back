import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Dish } from "../models/dish.model.js"

const getAllOrders = asyncHandler(async(req, res) => {
    // get all orders from Order Schema
    const orders = await Order.find()
    .populate("dish")
    .populate("customer")

    if(!orders) {
        throw new ApiError(404, "no orders found")
    }

    return res.status(200).json(new ApiResponse(201, orders, "orders are here"))
})

const placeOrder = asyncHandler(async(req, res) => {
    // get all data from body
    // validate data
    // create new order
    const {dishId} = req.params;
    console.log("dish id is ", dishId)
    const customerId = req.user._id;

    if(!dishId) {
        throw new ApiError(404, "dish id required");
    }

    const dish = await Dish.findById(dishId);

    if(!dish) {
        throw new ApiError(404, "no dish found")
    }

    const newOrder = await Order.create({
        dish: dishId,
        customer: customerId
    })

    const createdOrder = await Order.findById(newOrder._id)
    .populate('dish')
    .populate('customer', '-password -refreshToken');

    return res.status(201).json(new ApiResponse(201, createdOrder, "Order placed successfully"));
})

const changeOrderStatus = asyncHandler( async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    try {
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { $set: { status: status }}, { new: true });
        
        if (!updatedOrder) {
            throw new Error('Order not found');
        }

        return res.status(200).json(new ApiResponse(200, updatedOrder, "Status updated successfully"));
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json(new ApiResponse(500, null, "Failed to update order status"));
    }
})

const deleteOrder = asyncHandler( async (req, res) => {
    const { orderId } = req.params;

    await Order.findByIdAndDelete(orderId);

    return res.status(200).json(new ApiResponse(201, {}, "order removed success"))
})

export {getAllOrders, placeOrder, changeOrderStatus, deleteOrder}