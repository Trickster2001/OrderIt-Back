import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const dishSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        dishImage: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        recipe: {
            type: String
        },
        ingredients: [
            {
                type: String
            }
        ]
    }, {timestamps: true}
)

dishSchema.plugin(mongooseAggregatePaginate)

export const Dish = mongoose.model("Dish", dishSchema);