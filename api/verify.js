const crypto = require("crypto");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      valid: false
    });
  }

  try {
    const { token } = req.body || {};

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        valid: false
      });
    }

    const secret = process.env.SESSION_SECRET || "";

    if (!secret) {
      return res.status(500).json({
        valid: false,
        message: "Server configuration error."
      });
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return res.status(401).json({
        valid: false
      });
    }

    const expires = Number(parts[0]);
    const receivedSignature = parts[1];

    if (
      !Number.isFinite(expires) ||
      !receivedSignature
    ) {
      return res.status(401).json({
        valid: false
      });
    }

    if (Date.now() >= expires) {
      return res.status(401).json({
        valid: false
      });
    }

    const payload = String(expires);

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (
      receivedSignature.length !==
      expectedSignature.length
    ) {
      return res.status(401).json({
        valid: false
      });
    }

    const valid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );

    if (!valid) {
      return res.status(401).json({
        valid: false
      });
    }

    return res.status(200).json({
      valid: true
    });

  } catch (error) {
    console.error("Verify error:", error);

    return res.status(401).json({
      valid: false
    });
  }
};
