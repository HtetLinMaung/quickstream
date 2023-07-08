import {
  brewExpressFuncFindOneOrUpdateOrDeleteByParam,
  throwErrorResponse,
} from "code-alchemy";
import User from "../../../../models/User";
import isApiKeyValid from "../../../../utils/is-api-key-valid";
import bcrypt from "bcrypt";

export default brewExpressFuncFindOneOrUpdateOrDeleteByParam(
  User,
  {
    afterFunctionStart(req) {
      if (!isApiKeyValid(req)) {
        throwErrorResponse(403, "Invalid API key");
      }
    },
    beforeUpdate: async (data, req) => {
      if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      }
    },
  },
  "User not found!",
  "_id",
  "mongoose"
);
