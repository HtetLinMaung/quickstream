import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import User from "../../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../../../constants";

export default brewBlankExpressFunc(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({
    username,
  });
  if (!user) {
    throwErrorResponse(404, "User not found!");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    throwErrorResponse(401, "Incorrect password!");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      namespacePermissions: user.namespacePermissions,
    },
    SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
  res.json({
    code: 200,
    message: "Login successful.",
    token,
  });
});
