import jwt from "jsonwebtoken";
import { asyncHandler } from "../../../utils/errorHandling.js";
import userModel from "../../../../DB/models/userModel.js";
import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../../../utils/cloudinary.js";

const changePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, confirmPassword } = req.body;

  if (newPassword != confirmPassword) {
    return next(new Error("Incorrect confirm password", { cause: 400 }));
  }
  const user = await userModel.findById(req.user.id);

  const match = await bcrypt.compare(newPassword, user.password);
  if (match) {
    return next(
      new Error("New password can't be same as old password", {
        cause: StatusCodes.CONFLICT,
      })
    );
  }

  const hash = await bcrypt.hashSync(newPassword, 8);
  const updatedUser = await userModel.findByIdAndUpdate(
    req.user.id,
    { password: hash },
    { new: true }
  );
  if (updatedUser) {
    return res.status(200).json({ message: "Done" });
  }
});

const getUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select("-password");
  if (!user) {
    return next(new Error("No user found ! ", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", user: user });
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { age, firstName, lastName } = req.body;

  const newUser = await userModel
    .findByIdAndUpdate(req.user.id, { age, firstName, lastName }, { new: true })
    .select(["age", "firstName", "lastName"]);
  if (newUser) {
    return res.status(200).json({ message: "Done", user: newUser });
  }
});

const deleteUser = asyncHandler(async (req, res, next) => {

  const deletedUser = await userModel.findByIdAndDelete(req.user.id);

  if (!deleteUser) {
    return next(new Error("Failed to remove user !", { cause: 400 }));
  }

   //Deleteing coverImages : 
   for (const image of deletedUser.coverImages) {
    cloudinary.uploader
    .destroy(image.public_id)
    .then((result) => console.log(result));
  }

  //Deleting profile image : 

  cloudinary.uploader
    .destroy(deletedUser.profilePicture.public_id)
    .then((result) => console.log(result));

  return res.status(200).json({ message: "User removed successfully !" });
});

const softDelete = asyncHandler(async (req, res, next) => {
  const softDeletedUser = await userModel.findByIdAndUpdate(req.user.id, {
    isDeleted: true,
  });
  if (!softDeletedUser) {
    return next(new Error("Failed to delete user !", { cause: 400 }));
  }
  return res.status(200).json({ message: "User deleted successfully !" });
});

const logout = asyncHandler(async (req, res, next) => {
  const loggedOutUser = await userModel.findByIdAndUpdate(req.user.id, {
    available: false,
  });
  if (!loggedOutUser) {
    return next(
      new Error("Failed to logOut Or user not found !", { cause: 400 })
    );
  }
  return res.status(200).json({ message: "logged out !" });
});

//=========================================

const profilePicture = asyncHandler(async (req, res, next) => {

  //To remove old profile picture before adding new one :
  const user = await userModel.findById(req.user.id)

  cloudinary.uploader
    .destroy(user.profilePicture.public_id)
    .then((result) => console.log(result));

  // fs.unlink(user.profilePicture , (err)=>{
  //     if(err){console.log(err);}
  // })

  //Add new profile picture
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `Trello/user/${req.user.id}/profile` }
  );
    
  const updatedUser = await userModel.findByIdAndUpdate(
    { _id: req.user.id },
    { profilePicture: { secure_url, public_id } },
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "Done", file: req.file, user: updatedUser });
});

const coverImages = asyncHandler(async (req, res, next) => {

  const coverImages = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `Trello/user/${req.user.id}/cover` }
    );

    coverImages.push({
      secure_url: `${secure_url}`,
      public_id: `${public_id}`,
    });
  }
  const updatedUser = await userModel.findByIdAndUpdate(
    { _id: req.user.id },
    { $push: { coverImages: [...coverImages] } },
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "Done", user: updatedUser, files: req.files });
});

const deleteCoverImages = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  

  for (const image of user.coverImages) {
    // fs.unlink(image, (err) => {
    //   if (err) {
    //     return next(
    //       new Error("Failed to delete cover image/s !", { cause: 400 })
    //     );
    //   }
    // });
    cloudinary.uploader
    .destroy(image.public_id, {resource_type: 'image', invalidate: true, type: 'authenticated'})
    .then((result) => console.log(result));
  }

  await userModel.findByIdAndUpdate(req.user.id, { $set: { coverImages: [] } });
  return res
    .status(200)
    .json({ message: "Cover images were successfully deleted !" });
});

const deleteProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  cloudinary.uploader
    .destroy(user.profilePicture.public_id, {resource_type: 'image', invalidate: true, type: 'authenticated'})
    .then((result) => console.log(result));

//   fs.unlink(user.profilePicture, (err) => {
//     if (err) {
//       return next(
//         new Error("Failed to delete profile picture !", { cause: 400 })
//       );
//     }
//   });
//   await userModel.findByIdAndUpdate(req.user.id, { profilePicture: null });

  return res
    .status(200)
    .json({ message: "Picture was successfully deleted !" });
});

export {
  changePassword,
  updateUser,
  deleteUser,
  softDelete,
  logout,
  profilePicture,
  coverImages,
  deleteProfilePicture,
  deleteCoverImages,
  getUser,
};
