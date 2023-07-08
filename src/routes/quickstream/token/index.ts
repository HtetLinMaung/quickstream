import { brewBlankExpressFunc, throwErrorResponse } from "code-alchemy";
import generateToken from "../../../utils/generate-token";
import isApiKeyValid from "../../../utils/is-api-key-valid";
import { DEFAULT_EXPIRES_IN } from "../../../constants";
import verifyToken from "../../../utils/verify-token";

export default brewBlankExpressFunc(async (req, res) => {
  const { namespacePermissions } = verifyToken(req);
  console.log(namespacePermissions);
  const { location, namespace, filename, permissions, expiresIn } = req.body;

  if (
    !namespacePermissions[namespace] ||
    !namespacePermissions[namespace].includes("r")
  ) {
    throwErrorResponse(401, "Unauthorized access to namespace");
  }

  // check required parameters
  if (!namespace || !permissions || !filename) {
    throwErrorResponse(400, "Missing required parameters");
  }

  const token = generateToken(
    location,
    namespace,
    filename,
    permissions,
    expiresIn || DEFAULT_EXPIRES_IN
  );

  res.json({
    code: 200,
    message: "Token generated successful",
    token,
  });
});
