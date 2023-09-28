import jwt from "jsonwebtoken";
import userModel from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/errorHandling.js";

export const auth = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization?.startsWith(process.env.BEARER)) {
    return next(new Error("Not authorized or in-valid bearer", { cause: 401 }));
  }

  const token = authorization.split(process.env.BEARER)[1];

  if (!token) {
    return next(new Error("token is required ", { cause: 400 }));
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded?.id) {
      return next(new Error("Invalid token payload", { cause: 400 }));
    }
    const user = await userModel.findById(decoded.id);

    if (!user) {
      return next(new Error("Not registered user", { cause: 404 }));
    }

    req.user = { id: user._id, email: user.email };
    return next();
  } catch (error) {
    if (error == "TokenExpiredError: jwt expired") {
      const user = await userModel.findOne({ token: token });
      const newToken = jwt.sign(
        { userName: user.userName, id: user._id },
        process.env.USER_TOKEN_SIGNATURE,
        { expiresIn: 60 * 60 }
      );
      user.token = newToken;
      await user.save();
      return res
        .status(200)
        .json({ message: "Token refreshed !", Token: newToken });
    }
  }
});
