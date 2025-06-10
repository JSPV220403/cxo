const jwt = require("jsonwebtoken");
const userModel = require("../models/users.model");
const helperUtils = require("./helper.utils");
require("dotenv")?.config();

const utils = {};

utils.validateUser = async (req, res, next) => {
  const errResponse = {
    statusCode: 401,
    message: "Auth Failed",
  };
  console.log("input", req?.body);
  // console.log("headers", req?.headers);
  // console.log("header", req?.header);
  try {
    if (req.headers["authorization"]?.split(" ")?.[1]) {
      const user = jwt.decode(req.headers["authorization"]?.split(" ")?.[1]);

      let verifyUser;
      try {
        verifyUser = jwt.verify(req.headers["authorization"]?.split(" ")?.[1], process?.env?.CHANNEL_JWT_SECRET);
        console.log("Login UserId:", verifyUser?.user_id, req.headers["authorization"]?.split(" ")?.[1]);
        if (!verifyUser?.user_id) {
          return res.status(401).json(errResponse);
        }
  
        if (verifyUser?.user_id !== user?.user_id) {
          return res.status(401).json(errResponse);
        }
  
        if (!user?.user_id) {
          return res.status(401).json(errResponse);
        }
        console.log("auth check 1");
        const data = await userModel.findOne({
          where: {
            userId: verifyUser?.user_id,
          },
        });
        console.log("auth check 2");
        if (!data) {
          return res.status(401).json(errResponse);
        }
        req.user = {
          userId: verifyUser?.user_id,
          workspaceId: data?.companyId,
          userName: data?.userName,
          userType: helperUtils.userTypeHelper(data?.userType)?.userType,
          userStatus: helperUtils.userStatusHelper(data?.userStatus),
          userToken: req.headers["authorization"]?.split(" ")?.[1],
          timeZone: data?.userTimezone || "Asia/Kolkata",
        };
        next();
      } catch (err) {
        console.log({
          decodeData: user ?? "",
          token: req?.headers["authorization"]?.split(" ")?.[1] ?? "",
          jwtError: err,
        });
        return res.status(401).json(errResponse);
      }
    } else {
      return res.status(401).json(errResponse);
    }
  } catch (err) {
    console.log(err);
    return res.status(401).json(errResponse);
  }
};

module.exports = utils;
