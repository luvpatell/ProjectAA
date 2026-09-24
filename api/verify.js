const crypto = require("crypto");

function sendJSON(res, status, data) {
  res.status(status).json(data);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJSON(res, 405, { valid: false });
  }

  const { token = "" } = req.body || {};
  const parts = String(token).split(".");

  if (parts.length !== 2) {
    return sendJSON(res, 401, { valid: false });
  }

  const [expiry, signature] = parts;
  const expiryNumber = Number(expiry);

  if (!expiryNumber || Date.now() >= expiryNumber) {
    return sendJSON(res, 401, { valid: false });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET || "projecta-secret")
    .update(expiry)
    .digest("hex");

  if (signature !== expectedSignature) {
    return sendJSON(res, 401, { valid: false });
  }

  return sendJSON(res, 200, {
    valid: true
  });
};
