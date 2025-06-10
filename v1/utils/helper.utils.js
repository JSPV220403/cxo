const jwt = require("jsonwebtoken");

const utils = {};

utils.userTypeHelper = (userType) => {
  const data = [
    {
      userType: "Member",
      number: 0,
    },
    {
      userType: "Owner",
      number: 1,
    },
    {
      userType: "Admin",
      number: 2,
    },
    {
      userType: "Member",
      number: 3,
    },
    {
      userType: "Guest",
      number: 4,
    },
    {
      userType: "Customer",
      number: 5,
    },
  ];

  if (typeof userType === "string") {
    let result = data?.find((each) => each?.userType === userType);
    if (!result) return "";

    return { userTypeInt: result?.number, userType: result?.userType };
  }

  if (typeof userType === "number") {
    let result = data?.find((each) => each?.number === userType);
    if (!result) return "";

    return { userTypeInt: result?.number, userType: result?.userType };
  }
  return "";
};

utils.userStatusHelper = (userStatus) => {
  const data = [
    {
      userStatus: "Active",
      number: 0,
    },
    {
      userStatus: "Active",
      number: 1,
    },
    {
      userStatus: "Inactive",
      number: 2,
    },
    {
      userStatus: "Deactivated",
      number: 3,
    },
  ];

  if (typeof userStatus === "string") {
    const result = data?.find((each) => each?.userStatus === userStatus);
    if (!result) return "";

    return result?.number;
  }

  if (typeof userStatus === "number") {
    const result = data?.find((each) => each?.number === userStatus);
    if (!result) return "";

    return result?.userStatus;
  }
  return "";
};

utils.makeSecret = async (privateKeyString) => {
  const clientId = process.env.APPLE_ID_CLIENT_ID;
  const keyId = process.env.APPLE_ID_KEY_ID;
  const issuer = process.env.APPLE_ID_ISSUER;

  if (!clientId || !keyId || !issuer) {
    throw new Error("Environment variables APPLE_ID_CLIENT_ID, APPLE_ID_KEY_ID, or APPLE_ID_ISSUER are not set.");
  }

  // Format the private key
  const privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKeyString.trim()}\n-----END PRIVATE KEY-----`;

  // Create claims
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const claims = {
    sub: clientId,
    iss: issuer,
    iat: now,
    exp: now + 60 * 60 * 24, // 1 day expiration
    aud: "https://appleid.apple.com",
  };

  // Generate the token
  const token = jwt.sign(claims, privateKey, {
    algorithm: "ES256",
    header: {
      kid: keyId,
    },
  });

  return token;
};

module.exports= utils;