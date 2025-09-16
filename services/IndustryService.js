import { db } from '../config/database.js';
import { users, tourProfiles, travelProfiles, logisticsProfiles } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

export class IndustryService {
  /**
   * Get user's industry profile based on their industry type
   */
  static async getUserIndustryProfile(userId, industryType) {
    try {
      let profile = null;
      
      switch (industryType) {
        case 'tour':
          profile = await db.select()
            .from(tourProfiles)
            .where(eq(tourProfiles.userId, userId))
            .limit(1);
          break;
        case 'travel':
          profile = await db.select()
            .from(travelProfiles)
            .where(eq(travelProfiles.userId, userId))
            .limit(1);
          break;
        case 'logistics':
          profile = await db.select()
            .from(logisticsProfiles)
            .where(eq(logisticsProfiles.userId, userId))
            .limit(1);
          break;
        default:
          throw new Error('Invalid industry type');
      }
      
      return profile[0] || null;
    } catch (error) {
      logger.error('Error getting industry profile:', error);
      throw error;
    }
  }

  /**
   * Create or update industry-specific profile
   */
  static async createOrUpdateIndustryProfile(userId, industryType, profileData) {
    try {
      let result = null;
      
      switch (industryType) {
        case 'tour':
          result = await db.insert(tourProfiles)
            .values({
              userId,
              ...profileData,
              updatedAt: new Date()
            })
            .onConflictDoUpdate({
              target: tourProfiles.userId,
              set: {
                ...profileData,
                updatedAt: new Date()
              }
            })
            .returning();
          break;
        case 'travel':
          result = await db.insert(travelProfiles)
            .values({
              userId,
              ...profileData,
              updatedAt: new Date()
            })
            .onConflictDoUpdate({
              target: travelProfiles.userId,
              set: {
                ...profileData,
                updatedAt: new Date()
              }
            })
            .returning();
          break;
        case 'logistics':
          result = await db.insert(logisticsProfiles)
            .values({
              userId,
              ...profileData,
              updatedAt: new Date()
            })
            .onConflictDoUpdate({
              target: logisticsProfiles.userId,
              set: {
                ...profileData,
                updatedAt: new Date()
              }
            })
            .returning();
          break;
        default:
          throw new Error('Invalid industry type');
      }
      
      return result[0];
    } catch (error) {
      logger.error('Error creating/updating industry profile:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data based on industry type
   */
  static async getDashboardData(userId, industryType) {
    try {
      const baseData = {
        user: await db.select()
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
        industryType
      };

      let industryData = {};

      switch (industryType) {
        case 'tour':
          industryData = await this.getTourDashboardData(userId);
          break;
        case 'travel':
          industryData = await this.getTravelDashboardData(userId);
          break;
        case 'logistics':
          industryData = await this.getLogisticsDashboardData(userId);
          break;
        default:
          industryData = await this.getGenericDashboardData(userId);
      }

      return {
        ...baseData,
        ...industryData
      };
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  /**
   * Tour industry specific dashboard data
   */
  static async getTourDashboardData(userId) {
    // This would include tour-specific metrics, bookings, etc.
    return {
      metrics: {
        totalTours: 0,
        activeTours: 0,
        totalBookings: 0,
        monthlyRevenue: 0,
        averageRating: 0
      },
      recentBookings: [],
      upcomingTours: [],
      popularDestinations: []
    };
  }

  /**
   * Travel industry specific dashboard data
   */
  static async getTravelDashboardData(userId) {
    return {
      metrics: {
        totalBookings: 0,
        activeBookings: 0,
        monthlyRevenue: 0,
        customerSatisfaction: 0,
        topDestinations: 0
      },
      recentBookings: [],
      upcomingTravels: [],
      popularDestinations: []
    };
  }

  /**
   * Logistics industry specific dashboard data
   */
  static async getLogisticsDashboardData(userId) {
    return {
      metrics: {
        totalShipments: 0,
        activeShipments: 0,
        monthlyRevenue: 0,
        onTimeDelivery: 0,
        customerSatisfaction: 0
      },
      recentShipments: [],
      activeShipments: [],
      popularRoutes: []
    };
  }

  /**
   * Generic dashboard data for other industries
   */
  static async getGenericDashboardData(userId) {
    return {
      metrics: {
        totalOrders: 0,
        activeOrders: 0,
        monthlyRevenue: 0,
        customerSatisfaction: 0
      },
      recentActivity: [],
      notifications: []
    };
  }

  /**
   * Get industry-specific navigation menu
   */
  static getIndustryNavigation(industryType) {
    const baseNavigation = [
      { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { name: 'Profile', path: '/dashboard/profile', icon: 'user' },
      { name: 'Payments', path: '/payments', icon: 'credit-card' },
      { name: 'Settings', path: '/dashboard/settings', icon: 'settings' }
    ];

    const industryNavigation = {
      tour: [
        ...baseNavigation,
        { name: 'Tours', path: '/tours', icon: 'map' },
        { name: 'Bookings', path: '/bookings', icon: 'calendar' },
        { name: 'Customers', path: '/customers', icon: 'users' },
        { name: 'Analytics', path: '/analytics', icon: 'chart' }
      ],
      travel: [
        ...baseNavigation,
        { name: 'Services', path: '/services', icon: 'plane' },
        { name: 'Bookings', path: '/bookings', icon: 'calendar' },
        { name: 'Customers', path: '/customers', icon: 'users' },
        { name: 'Destinations', path: '/destinations', icon: 'map' },
        { name: 'Analytics', path: '/analytics', icon: 'chart' }
      ],
      logistics: [
        ...baseNavigation,
        { name: 'Shipments', path: '/shipments', icon: 'truck' },
        { name: 'Orders', path: '/orders', icon: 'package' },
        { name: 'Customers', path: '/customers', icon: 'users' },
        { name: 'Routes', path: '/routes', icon: 'map' },
        { name: 'Analytics', path: '/analytics', icon: 'chart' }
      ],
      other: baseNavigation
    };

    return industryNavigation[industryType] || industryNavigation.other;
  }

  /**
   * Update user's industry type
   */
  static async updateUserIndustryType(userId, industryType) {
    try {
      await db.update(users)
        .set({ industryType, updatedAt: new Date() })
        .where(eq(users.id, userId));
      return true;
    } catch (error) {
      logger.error('Error updating user industry type:', error);
      throw error;
    }
  }
}
