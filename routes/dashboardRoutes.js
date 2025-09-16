import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getDashboardRoute, loadDashboardData, validateIndustryAccess } from '../middleware/dashboardMiddleware.js';
import { IndustryService } from '../services/IndustryService.js';
import { PaymentService } from '../services/PaymentService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();


// @desc    Get user's dashboard based on industry type
// @route   GET /api/dashboard
// @access  Private
router.get('/', authenticate, getDashboardRoute, loadDashboardData, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        dashboard: req.dashboardData,
        navigation: req.navigation,
        dashboardRoute: req.dashboardRoute,
        industryType: req.industryType
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard'
    });
  }
});

// @desc    Get tour industry dashboard
// @route   GET /api/dashboard/tour
// @access  Private (Tour industry only)
router.get('/tour', authenticate, validateIndustryAccess(['tour']), loadDashboardData, async (req, res) => {
  try {
    const dashboardData = await IndustryService.getTourDashboardData(req.user.id);
    
    res.json({
      success: true,
      data: {
        dashboard: dashboardData,
        navigation: IndustryService.getIndustryNavigation('tour'),
        industryType: 'tour'
      }
    });
  } catch (error) {
    logger.error('Tour dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading tour dashboard'
    });
  }
});

// @desc    Get travel industry dashboard
// @route   GET /api/dashboard/travel
// @access  Private (Travel industry only)
router.get('/travel', authenticate, validateIndustryAccess(['travel']), loadDashboardData, async (req, res) => {
  try {
    const dashboardData = await IndustryService.getTravelDashboardData(req.user.id);
    
    res.json({
      success: true,
      data: {
        dashboard: dashboardData,
        navigation: IndustryService.getIndustryNavigation('travel'),
        industryType: 'travel'
      }
    });
  } catch (error) {
    logger.error('Travel dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading travel dashboard'
    });
  }
});

// @desc    Get logistics industry dashboard
// @route   GET /api/dashboard/logistics
// @access  Private (Logistics industry only)
router.get('/logistics', authenticate, validateIndustryAccess(['logistics']), loadDashboardData, async (req, res) => {
  try {
    const dashboardData = await IndustryService.getLogisticsDashboardData(req.user.id);
    
    res.json({
      success: true,
      data: {
        dashboard: dashboardData,
        navigation: IndustryService.getIndustryNavigation('logistics'),
        industryType: 'logistics'
      }
    });
  } catch (error) {
    logger.error('Logistics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading logistics dashboard'
    });
  }
});

// @desc    Get industry profile
// @route   GET /api/dashboard/profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const industryProfile = await IndustryService.getUserIndustryProfile(
      req.user.id, 
      req.user.industryType
    );

    res.json({
      success: true,
      data: {
        industryProfile,
        industryType: req.user.industryType
      }
    });
  } catch (error) {
    logger.error('Industry profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading industry profile'
    });
  }
});

// @desc    Update industry profile
// @route   PUT /api/dashboard/profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { industryType, ...profileData } = req.body;

    // Validate industry type if provided
    if (industryType && !['tour', 'travel', 'logistics', 'other'].includes(industryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid industry type'
      });
    }

    // Update user's industry type if provided
    if (industryType && industryType !== req.user.industryType) {
      try {
        await IndustryService.updateUserIndustryType(req.user.id, industryType);
        req.user.industryType = industryType;
      } catch (e) {
        return res.status(500).json({ success: false, message: 'Failed to update industry type' });
      }
    }

    const activeIndustry = req.user.industryType;

    // If there is no industry-specific data to update, just return current profile
    if (!profileData || Object.keys(profileData).length === 0) {
      const currentProfile = await IndustryService.getUserIndustryProfile(
        req.user.id,
        activeIndustry
      );
      return res.json({
        success: true,
        message: 'Industry updated successfully',
        data: { profile: currentProfile }
      });
    }

    // Update industry-specific profile when data provided
    const updatedProfile = await IndustryService.createOrUpdateIndustryProfile(
      req.user.id,
      activeIndustry,
      profileData
    );

    res.json({
      success: true,
      message: 'Industry profile updated successfully',
      data: {
        profile: updatedProfile
      }
    });
  } catch (error) {
    logger.error('Industry profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating industry profile'
    });
  }
});

// @desc    Get industry-specific navigation
// @route   GET /api/dashboard/navigation
// @access  Private
router.get('/navigation', authenticate, (req, res) => {
  try {
    const navigation = IndustryService.getIndustryNavigation(req.user.industryType);
    
    res.json({
      success: true,
      data: {
        navigation,
        industryType: req.user.industryType
      }
    });
  } catch (error) {
    logger.error('Navigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading navigation'
    });
  }
});

// @desc    Get industry-aware payment options
// @route   GET /api/dashboard/payments/options
// @access  Private
router.get('/payments/options', authenticate, (req, res) => {
  try {
    const methods = PaymentService.getIndustryPaymentOptions(req.user.industryType);
    res.json({ success: true, data: { methods } });
  } catch (error) {
    logger.error('Payment options error:', error);
    res.status(500).json({ success: false, message: 'Error loading payment options' });
  }
});

// @desc    Create a payment intent (placeholder)
// @route   POST /api/dashboard/payments/intent
// @access  Private
router.post('/payments/intent', authenticate, async (req, res) => {
  try {
    const { amount, currency, methodId } = req.body || {};
    if (!amount || !methodId) {
      return res.status(400).json({ success: false, message: 'amount and methodId are required' });
    }
    const intent = await PaymentService.createPaymentIntent({ amount, currency, methodId });
    res.json({ success: true, data: intent });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({ success: false, message: 'Error creating payment intent' });
  }
});

export default router;
