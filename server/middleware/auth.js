import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    // 1. Manually get the token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication Required" });
    }

    // 2. Manually verify the token using your Secret Key
    // This bypasses the "UserId: null" problem
    const verifiedToken = await clerkClient.verifyToken(token);
    const userId = verifiedToken.sub;

    // 3. Check for the admin role in metadata
    const user = await clerkClient.users.getUser(userId);
    
    if (user.publicMetadata?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin Access Denied" });
    }

    next(); // All good! Proceed to the dashboard data
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ success: false, message: "Session Expired. Please log in again." });
  }
};