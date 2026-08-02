import ApiError from "../utils/apiError.util.js";
import httpStatus from "../constants/httpStatusCodes.js";
import { COMMON } from "../constants/messages.js";

const validate = (schema, source = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const message = error.details.map((detail) => detail.message).join(", ");
    return next(
      new ApiError(httpStatus.BAD_REQUEST, "VALIDATION_ERROR", message || COMMON.VALIDATION_ERROR)
    );
  }

  if(source === "query"){
    Object.assign(req.query, value);
  }else{
    req[source] = value;
  }
  next();
};

export default validate;
