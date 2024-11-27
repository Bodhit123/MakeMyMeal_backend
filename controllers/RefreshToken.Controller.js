const LoginModel = require("../models/login.model");
const jwt = require("jsonwebtoken");

async function RefreshTokenController(req, res) {
  const cookies = req.cookies;
 
  if (!cookies?.refreshToken) return res.sendStatus(401);

  const refreshToken = cookies.refreshToken;

  const foundUser = await LoginModel.findOne({ refreshToken }).exec();

  if (!foundUser) return res.sendStatus(403); //Forbidden

  jwt.verify(
    refreshToken,
    process.env.jwt_refresh_token_secret_key,
    (err, decoded) => {
      if (err || foundUser._id.toString() !== decoded.userId)
        return res.sendStatus(403);
      const accessToken = jwt.sign(
        { userId: decoded.userId },
        process.env.jwt_access_token_secret_key,
        {
          expiresIn: "5m",
        }
      );
      console.log(accessToken);
      res.json({ accessToken });
    }
  );
}

module.exports = RefreshTokenController;
