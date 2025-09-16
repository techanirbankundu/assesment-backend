import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpire
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwtRefreshSecret);
};

// Generate token pair
export const generateTokenPair = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    industryType: user.industryType
  };

  return {
    accessToken: generateToken(payload),
    refreshToken: generateRefreshToken(payload)
  };
};
