import { prisma } from '@workspace/database/client';

import { deleteCustomer } from './data/delete-customer';
import { deleteSubscription } from './data/delete-subscription';
import { syncLicenseFromSubscription } from './data/sync-license-from-subscription';
import { updateOrderStatus } from './data/update-order-status';
import { upsertCustomer } from './data/upsert-customer';
import { upsertOrder } from './data/upsert-order';
import { upsertSubscription } from './data/upsert-subscription';
import { BillingProvider } from './provider';

export async function POST(req: Request): Promise<Response> {
  try {
    const event = await BillingProvider.verifyWebhookSignature(req);
    await BillingProvider.handleWebhookEvent(event, {
      onCheckoutSessionCompleted: async (payload) => {
        if ('orderId' in payload) {
          await upsertOrder(payload);
        } else {
          await upsertSubscription(payload);
          // Sync license with new subscription
          await syncLicenseFromSubscription(payload.subscriptionId);
        }
      },
      onSubscriptionUpdated: async (subscription) => {
        await upsertSubscription(subscription);
        // Sync license when subscription updates (renewal, status change, etc.)
        await syncLicenseFromSubscription(subscription.subscriptionId);
      },
      onSubscriptionDeleted: async (subscriptionId) => {
        await deleteSubscription(subscriptionId);
        // Sync license to deactivate it
        await syncLicenseFromSubscription(subscriptionId);
      },
      onSubscriptionPaused: async (subscriptionId) => {
        // Update subscription status to paused
        await prisma.subscription.update({
          where: { id: subscriptionId },
          data: { status: 'paused', active: false }
        });
        // Sync license to deactivate it
        await syncLicenseFromSubscription(subscriptionId);
        console.log('[WEBHOOK] Subscription paused:', subscriptionId);
      },
      onSubscriptionResumed: async (subscription) => {
        await upsertSubscription(subscription);
        // Sync license to reactivate it
        await syncLicenseFromSubscription(subscription.subscriptionId);
        console.log('[WEBHOOK] Subscription resumed:', subscription.subscriptionId);
      },
      onInvoicePaid: async (invoice) => {
        if (invoice.subscriptionId) {
          // Update license expiration to match new period end
          await prisma.license.updateMany({
            where: { subscriptionId: invoice.subscriptionId },
            data: { expiresAt: new Date(invoice.periodEnd) }
          });
          console.log(
            `[WEBHOOK] Invoice paid - extended license expiration for subscription ${invoice.subscriptionId} to ${invoice.periodEnd}`
          );
        }
      },
      onInvoicePaymentFailed: async (invoice) => {
        console.warn(
          `[WEBHOOK] Invoice payment failed: ${invoice.invoiceId} for subscription ${invoice.subscriptionId}`
        );
      },
      onPaymentSucceeded: async (sessionId) => {
        await updateOrderStatus(sessionId, 'succeeded');
      },
      onPaymentFailed: async (sessionId) => {
        await updateOrderStatus(sessionId, 'failed');
      },
      onCustomerCreated: async (customer) => {
        await upsertCustomer(customer);
      },
      onCustomerUpdated: async (customer) => {
        await upsertCustomer(customer);
      },
      onCustomerDeleted: async (customerId) => {
        await deleteCustomer(customerId);
      }
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: 'Webhook error: "Webhook handler failed."' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }

  return Response.json(
    {
      received: true,
      message: 'Webhook received.',
      headers: { 'Cache-Control': 'no-store' }
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' }
    }
  );
}
