import { LicenseActivityType, prisma } from '@workspace/database/client';
import { createLicenseActivities } from './create-license-activity';

/**
 * Syncs license(s) linked to a subscription based on subscription state
 * - Links unlinked licenses to the subscription (for new subscriptions)
 * - Updates expiresAt to match subscription periodEndsAt
 * - Updates active status based on subscription status
 * - Soft deletes licenses when subscription is canceled
 * - Restores licenses when subscription is reactivated
 * - Handles paused, canceled, and active states
 * - Logs AUTO_DEACTIVATE activities when licenses are deactivated due to subscription changes
 */
export async function syncLicenseFromSubscription(
  subscriptionId: string
): Promise<void> {
  // Fetch subscription with current state
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: {
      id: true,
      organizationId: true,
      status: true,
      active: true,
      periodEndsAt: true
    }
  });

  if (!subscription) {
    console.warn(
      `[syncLicenseFromSubscription] Subscription ${subscriptionId} not found`
    );
    return;
  }

  // Determine if license should be active based on subscription status
  // Active if: subscription is active AND status is 'active' (not paused, not canceled immediately)
  const shouldBeActive =
    subscription.active && subscription.status === 'active';

  // Determine if license should be soft deleted (canceled subscription)
  const shouldBeDeleted =
    !subscription.active && subscription.status === 'canceled';

  // Check if subscription is paused
  const isPaused = subscription.status === 'paused';

  // Determine the reason for deactivation (for activity logging)
  const deactivationReason = shouldBeDeleted
    ? 'subscription_canceled'
    : isPaused
      ? 'subscription_paused'
      : null;

  // Get licenses that will be affected (for activity logging)
  const affectedLicenses =
    deactivationReason
      ? await prisma.license.findMany({
          where: {
            OR: [
              { subscriptionId },
              {
                organizationId: subscription.organizationId,
                subscriptionId: null,
                deletedAt: null
              }
            ],
            activatedDomain: { not: null }
          },
          select: { id: true, activatedDomain: true }
        })
      : [];

  // First, link any unlinked licenses for this organization to this subscription
  // This handles the case where the license was created before the subscription record
  const unlinkResult = await prisma.license.updateMany({
    where: {
      organizationId: subscription.organizationId,
      subscriptionId: null,
      deletedAt: null // Only link non-deleted licenses
    },
    data: {
      subscriptionId: subscription.id,
      expiresAt: subscription.periodEndsAt,
      active: shouldBeActive,
      deletedAt: shouldBeDeleted ? new Date() : null,
      // Clear activation if paused or deleted
      ...(isPaused || shouldBeDeleted
        ? { activatedDomain: null, activatedAt: null }
        : {})
    }
  });

  if (unlinkResult.count > 0) {
    console.log(
      `[syncLicenseFromSubscription] Linked ${unlinkResult.count} unlinked license(s) to subscription ${subscriptionId}`
    );
  }

  // Then update all licenses already linked to this subscription
  const updateResult = await prisma.license.updateMany({
    where: { subscriptionId },
    data: {
      expiresAt: subscription.periodEndsAt,
      active: shouldBeActive,
      deletedAt: shouldBeDeleted ? new Date() : null, // Soft delete or restore
      // Clear activation if paused or deleted
      ...(isPaused || shouldBeDeleted
        ? { activatedDomain: null, activatedAt: null }
        : {})
    }
  });

  // Log AUTO_DEACTIVATE activities for affected licenses
  if (deactivationReason && affectedLicenses.length > 0) {
    await createLicenseActivities(
      affectedLicenses.map((license) => ({
        licenseId: license.id,
        actionType: LicenseActivityType.AUTO_DEACTIVATE,
        domain: license.activatedDomain,
        metadata: {
          reason: deactivationReason,
          subscriptionId
        }
      }))
    );
    console.log(
      `[syncLicenseFromSubscription] Created AUTO_DEACTIVATE activities for ${affectedLicenses.length} license(s)`
    );
  }

  if (shouldBeDeleted) {
    console.log(
      `[syncLicenseFromSubscription] Soft deleted ${updateResult.count} license(s) for canceled subscription ${subscriptionId}`
    );
  } else if (isPaused) {
    console.log(
      `[syncLicenseFromSubscription] Paused ${updateResult.count} license(s) for subscription ${subscriptionId}`
    );
  } else {
    console.log(
      `[syncLicenseFromSubscription] Updated ${updateResult.count} license(s) for subscription ${subscriptionId}: active=${shouldBeActive}, expiresAt=${subscription.periodEndsAt.toISOString()}`
    );
  }
}
