import { logger } from '../utils/logger.js';

export class PaymentService {
  static getIndustryPaymentOptions(industryType) {
    // Base options shared across industries (Razorpay default)
    const baseOptions = [
      { id: 'card', name: 'Credit/Debit Card', provider: 'razorpay' },
      { id: 'upi', name: 'UPI', provider: 'razorpay' },
      { id: 'netbanking', name: 'NetBanking', provider: 'razorpay' },
    ];

    const industryExtras = {
      tour: [
        { id: 'wallet', name: 'Wallet', provider: 'razorpay' },
      ],
      travel: [
        { id: 'paypal', name: 'PayPal', provider: 'paypal' },
      ],
      logistics: [
        { id: 'ach', name: 'Bank Transfer (ACH)', provider: 'stripe' },
        { id: 'invoice', name: 'Invoice', provider: 'internal' },
      ],
      other: [],
    };

    const extras = industryExtras[industryType] || industryExtras.other;
    return [...baseOptions, ...extras];
  }

  static async createPaymentIntent({ amount, currency = 'INR', methodId }) {
    // Placeholder: mimic Razorpay order creation shape
    logger.info('Create payment intent', { amount, currency, methodId, provider: 'razorpay' });
    return {
      provider: 'razorpay',
      orderId: 'order_placeholder_123',
      amount,
      currency,
      methodId,
    };
  }
}


