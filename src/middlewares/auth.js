const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Autenticazione richiesta" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token non valido" });
  }
};

exports.admin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accesso negato: richiesti privilegi di amministratore" });
    }
    next();
  } catch (error) {
    res.status(403).json({ message: "Errore di autorizzazione" });
  }
}; 