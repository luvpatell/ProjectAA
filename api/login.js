const crypto = require("crypto");

const DEV_USER = process.env.DEV_USER || "";
const DEV_PASS = process.env.DEV_PASS || "";

function sendJSON(res, status, data) {
  res.status(status).json(data);
}

function createToken() {
  const expiry = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${expiry}`;
  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "projecta-secret")
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJSON(res, 405, { success: false, message: "Method not allowed" });
  }

  const { user = "", pass = "" } = req.body || {};

  const enteredUser = String(user).trim();
  const enteredPass = String(pass).trim();

  const userMatch =
    enteredUser.length === DEV_USER.length &&
    crypto.timingSafeEqual(
      Buffer.from(enteredUser),
      Buffer.from(DEV_USER)
    );

  const passMatch =
    enteredPass.length === DEV_PASS.length &&
    crypto.timingSafeEqual(
      Buffer.from(enteredPass),
      Buffer.from(DEV_PASS)
    );

  if (!userMatch || !passMatch) {
    return sendJSON(res, 401, {
      success: false,
      message: "Invalid username or password."
    });
  }

  return sendJSON(res, 200, {
    success: true,
    token: createToken()
  });
};
