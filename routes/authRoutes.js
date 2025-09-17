import express from 'express';
import { db } from '../config/database.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { authenticate, optionalAuth } from '../middleware/authMiddleware.js';
import { validateUserRegistration, validateUserLogin, validatePasswordChange } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, industryType = 'other' } = req.body;

    // Check if user already exists
    let existingUser = [];
    try {
      existingUser = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable. Please try again later.'
      });
    }

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await db.insert(users)
      .values({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        industryType
      })
      .returning();

    const user = newUser[0];

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15 // 15 minutes (short-lived)
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = userResult[0];

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null; // 2 hours
      
      await db.update(users)
        .set({
          loginAttempts: newAttempts,
          lockUntil
        })
        .where(eq(users.id, user.id));
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await db.update(users)
        .set({
          loginAttempts: 0,
          lockUntil: null,
          lastLogin: new Date()
        })
        .where(eq(users.id, user.id));
    } else {
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));
    }

    // Generate tokens
    const tokens = generateTokenPair(user);

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15 // 15 minutes (short-lived)
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        ...tokens
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, decoded.id))
      .limit(1);

    if (userResult.length === 0 || !userResult[0].isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const user = userResult[0];

    // Generate new tokens
    const tokens = generateTokenPair(user);

    // Rotate access token cookie
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 15
    });

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Optional (returns user if authenticated, null if not)
router.get('/me', optionalAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated 1'
      });
    }

    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    
    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];
    delete user.password;
    
    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticate, validatePasswordChange, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const userResult = await db.select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Check current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.update(users)
      .set({ password: hashedNewPassword })
      .where(eq(users.id, user.id));

    logger.info('Password changed successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticate, (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just send a success response
    logger.info('User logged out', { userId: req.user.id });

    // Clear access token cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

export default router;