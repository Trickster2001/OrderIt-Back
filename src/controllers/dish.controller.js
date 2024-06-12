import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Dish } from "../models/dish.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllDishes = asyncHandler(async (req, res) => {
  // get all dishes
  const dishes = await Dish.find();
  return res
    .status(200)
    .json(new ApiResponse(200, dishes, "all dishes are here"));
});

const getOneDish = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  const dish = await Dish.findById(dishId);

  if (!dish) {
    return new ApiError(404, "No dish found");
  }

  return res.status(200).json(new ApiResponse(201, dish, "dish is here"));
});

const addDish = asyncHandler(async (req, res) => {
  // get data from body
  // validate the data
  // check for image
  // add data to db

  const { title, price } = req.body;

  if ([title, price].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }

  const dishLocalPath = req.file?.path;

  if (!dishLocalPath) {
    throw new ApiError(400, "dish image is required");
  }

  const dishImage = await uploadOnCloudinary(dishLocalPath);

  if (!dishImage) {
    return new ApiError(400, "dish image not uploaded on cloud");
  }

  const dish = await Dish.create({
    title,
    dishImage: dishImage.url,
    price,
  });

  const createdDish = await Dish.findById(dish._id);

  if (!createdDish) {
    throw new ApiError(500, "Something went wrong when creating a dish");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, createdDish, "dish added success"));
});

// const updateDish = asyncHandler( async (req, res) => {
//     const { dishId } = req.params;
//     const { title, price } = req.body;

//     const dishLocalPath = req.file?.path;

//     if(!dishLocalPath) {
//         throw new ApiError(400, "dish image is required")
//     }

//     const dishImage = await uploadOnCloudinary(dishLocalPath);

//     if(!dishImage) {
//         return new ApiError(400, "dish image not uploaded on cloud");
//     }

//     const updatedDish = await Dish.findByIdAndUpdate(
//         dishId,
//         {
//             $set: {
//                 title,
//                 price,
//                 dishImage: dishImage.url
//             }
//         }
//     )

//     if(!updatedDish) {
//         throw new ApiError(500, "Something went wrong when updating the dish")
//     };

//     return res.status(200).json(new ApiResponse(201, updatedDish, "dish updated success"))
// })

const updateDish = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  const { title, price } = req.body;

  let updatedDish = {};

  if (title) {
    updatedDish.title = title;
  }

  if (price) {
    updatedDish.price = price;
  }

  if (req.file) {
    const dishImageLocal = req.file?.path;

    if (!dishImage) {
      throw new ApiError(400, "Failed to upload dish image to cloud");
    }

    const dishImage = await uploadOnCloudinary(dishImageLocal);

    if (!dishImage) {
      return new ApiError(400, "dish image not uploaded on cloud");
    }

    updatedDish.dishImage = dishImage.url;
  }

  console.log(updatedDish);

  const myDish = await Dish.findByIdAndUpdate(dishId, { $set: updatedDish}, { new: true})

  if (!myDish) {
    throw new ApiError(500, "Failed to update the dish");
}

return res.status(200).json(new ApiResponse(200, myDish, "Dish updated successfully"));
});

const deleteDish = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  const deletedDish = await Dish.findByIdAndDelete(dishId);

  if (!deletedDish) {
    throw new ApiError(500, "Something went wrong when deleting the dish");
  }

  return res.status(200).json(new ApiResponse(201, {}, "dish deleted success"));
});

export { getAllDishes, getOneDish, addDish, updateDish, deleteDish };
