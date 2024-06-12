import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new mongoose.Schema(
    {
        dish: {
            type: Schema.Types.ObjectId,
            ref: "Dish"
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            default: "In Process"
        }
    }, {timestamps: true});

orderSchema.plugin(mongooseAggregatePaginate)

export const Order = mongoose.model("Order", orderSchema);