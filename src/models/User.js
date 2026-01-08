const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Evita la ricompilazione del modello se già esiste
const User = mongoose.models.User || mongoose.model("User", new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  name: { 
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}));

// Hash della password prima di salvare
if (!User.schema.pre) {
  User.schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
}

// Metodo per confrontare le password
if (!User.schema.methods.comparePassword) {
  User.schema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };
}

module.exports = User; 