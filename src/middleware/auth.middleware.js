import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // Bearer token --> Frontend sends it in headers

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1]; //Extract the actual token string

    const decoded = jwt.verify(token, process.env.JWT_SECRET); //Verify token

    req.user = { id: decoded.id }; //Inject user ID into request object for further use
    //Now every controller after this middleware can access req.user.id

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

export default authMiddleware;
