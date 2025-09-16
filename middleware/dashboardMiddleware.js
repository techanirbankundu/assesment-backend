import { IndustryService } from '../services/IndustryService.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to determine dashboard route based on user's industry type
 */
export const getDashboardRoute = (req, res, next) => {
  try {
    const industryType = req.user?.industryType;
    
    if (!industryType) {
      return res.status(400).json({
        success: false,
        message: 'Industry type not set. Please update your profile.'
      });
    }

    // Set dashboard route based on industry
    const dashboardRoutes = {
      tour: '/dashboard/tour',
      travel: '/dashboard/travel', 
      logistics: '/dashboard/logistics',
      other: '/dashboard/generic'
    };

    req.dashboardRoute = dashboardRoutes[industryType] || dashboardRoutes.other;
    req.industryType = industryType;
    
    next();
  } catch (error) {
    logger.error('Dashboard routing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error determining dashboard route'
    });
  }
};

/**
 * Middleware to load industry-specific dashboard data
 */
export const loadDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const industryType = req.user.industryType;

    // Load dashboard data
    const dashboardData = await IndustryService.getDashboardData(userId, industryType);
    
    // Load navigation menu
    const navigation = IndustryService.getIndustryNavigation(industryType);
    
    console.log(navigation);
    console.log(dashboardData);

    req.dashboardData = dashboardData;
    req.navigation = navigation;
    
    next();
  } catch (error) {
    logger.error('Dashboard data loading error:', error);
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard data'
    });
  }
};

/**
 * Middleware to validate industry access
 */
export const validateIndustryAccess = (allowedIndustries) => {
  return (req, res, next) => {
    const userIndustry = req.user?.industryType;
    
    if (!allowedIndustries.includes(userIndustry)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This feature is not available for your industry type.'
      });
    }
    
    next();
  };
};
