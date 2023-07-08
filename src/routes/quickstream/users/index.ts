import {
  brewExpressFuncCreateOrFindAll,
  throwErrorResponse,
} from "code-alchemy";
import User from "../../../models/User";
import isApiKeyValid from "../../../utils/is-api-key-valid";
import bcrypt from "bcrypt";

export default brewExpressFuncCreateOrFindAll(
  User,
  {
    afterFunctionStart(req) {
      if (!isApiKeyValid(req)) {
        throwErrorResponse(403, "Invalid API key");
      }
    },
    beforeCreate: async (req) => {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    },
  },
  "mongoose"
);
