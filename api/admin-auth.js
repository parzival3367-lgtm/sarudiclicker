const { timingSafeEqual } = require("node:crypto");

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: "Admin authentication is not configured" });
  }

  const password = req.body?.password;
  if (typeof password !== "string") {
    return res.status(400).json({ error: "Password is required" });
  }

  const submitted = Buffer.from(password);
  const expected = Buffer.from(adminPassword);
  const isValid = submitted.length === expected.length
    && timingSafeEqual(submitted, expected);

  if (!isValid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  return res.status(200).json({ authenticated: true });
};
