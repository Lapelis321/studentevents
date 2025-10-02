import Stripe from 'stripe';
import { Event } from '../models/Event';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
});

export interface CreatePaymentIntentData {
  amount: number;
  currency?: string;
  eventId: number;
  userId: number;
  userEmail: string;
  eventTitle: string;
}

export class StripeService {
  static async createPaymentIntent(data: CreatePaymentIntentData): Promise<Stripe.PaymentIntent> {
    try {
      const { amount, currency = 'usd', eventId, userId, userEmail, eventTitle } = data;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          eventId: eventId.toString(),
          userId: userId.toString(),
          userEmail,
          eventTitle
        },
        receipt_email: userEmail,
        description: `Ticket for ${eventTitle}`
      });

      return paymentIntent;
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('❌ Error retrieving payment intent:', error);
      throw new Error('Failed to retrieve payment intent');
    }
  }

  static async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('❌ Error confirming payment intent:', error);
      throw new Error('Failed to confirm payment intent');
    }
  }

  static async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      console.error('❌ Error canceling payment intent:', error);
      throw new Error('Failed to cancel payment intent');
    }
  }

  static async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      return await stripe.refunds.create(refundData);
    } catch (error) {
      console.error('❌ Error creating refund:', error);
      throw new Error('Failed to create refund');
    }
  }

  static async constructWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error) {
      console.error('❌ Error constructing webhook event:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  static async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      console.error('❌ Error retrieving customer:', error);
      throw new Error('Failed to retrieve customer');
    }
  }

  static async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      return await stripe.customers.create({
        email,
        name
      });
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  static async getPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      return paymentMethods.data;
    } catch (error) {
      console.error('❌ Error retrieving payment methods:', error);
      throw new Error('Failed to retrieve payment methods');
    }
  }

  static async createCheckoutSession(data: {
    eventId: number;
    userId: number;
    userEmail: string;
    eventTitle: string;
    amount: number;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    try {
      const { eventId, userId, userEmail, eventTitle, amount, successUrl, cancelUrl } = data;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Ticket for ${eventTitle}`,
                description: `Event ticket for ${eventTitle}`
              },
              unit_amount: Math.round(amount * 100) // Convert to cents
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: userEmail,
        metadata: {
          eventId: eventId.toString(),
          userId: userId.toString(),
          eventTitle
        }
      });

      return session;
    } catch (error) {
      console.error('❌ Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  static async getTransactions(limit: number = 100): Promise<Stripe.PaymentIntent[]> {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        limit,
        expand: ['data.charges']
      });
      return paymentIntents.data;
    } catch (error) {
      console.error('❌ Error retrieving transactions:', error);
      throw new Error('Failed to retrieve transactions');
    }
  }
}
