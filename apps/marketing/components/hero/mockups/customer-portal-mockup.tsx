'use client';

import * as React from 'react';
import { CreditCardIcon, CalendarIcon, CheckCircle2Icon, ClockIcon } from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupBadge,
  MockupProgress,
  MockupTable,
  MockupTableHeader,
  MockupTableBody,
  MockupTableRow,
  MockupTableHead,
  MockupTableCell
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';
import { mockCustomerPortal } from '../data/mock-data';

function PaymentStatusBadge({ status }: { status: string }): React.JSX.Element {
  const variants: Record<string, 'success' | 'warning' | 'secondary'> = {
    Paid: 'success',
    Upcoming: 'warning',
    Scheduled: 'secondary'
  };

  return <MockupBadge variant={variants[status] || 'secondary'}>{status}</MockupBadge>;
}

export function CustomerPortalMockup(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <MockupCard className="overflow-hidden">
          <MockupCardHeader className="border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                <MockupCardTitle>Payment Plan</MockupCardTitle>
                <MockupBadge variant="info">Order {mockCustomerPortal.orderNumber}</MockupBadge>
              </div>
              <FeatureTooltip
                title={tooltipContent.customerPortal.orderDetails.title}
                description={tooltipContent.customerPortal.orderDetails.description}
                showIndicator={false}
              >
                <MockupButton variant="outline" size="sm">
                  View Order
                </MockupButton>
              </FeatureTooltip>
            </div>
          </MockupCardHeader>
          <MockupCardContent className="p-4">
            <FeatureTooltip
              title={tooltipContent.customerPortal.paymentProgress.title}
              description={tooltipContent.customerPortal.paymentProgress.description}
              indicatorPosition="top-right"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Payment Progress</span>
                  <span className="font-medium">{mockCustomerPortal.progress}% Complete</span>
                </div>
                <MockupProgress value={mockCustomerPortal.progress} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Paid: {mockCustomerPortal.depositPaid}</span>
                  <span>Remaining: {mockCustomerPortal.remainingBalance}</span>
                </div>
              </div>
            </FeatureTooltip>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <FeatureTooltip
                title={tooltipContent.customerPortal.upcomingPayment.title}
                description={tooltipContent.customerPortal.upcomingPayment.description}
                indicatorPosition="top-right"
              >
                <div className="rounded-lg border p-3 bg-primary/5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <CalendarIcon className="h-3 w-3" />
                    Next Payment
                  </div>
                  <p className="text-lg font-semibold">{mockCustomerPortal.nextPayment.amount}</p>
                  <p className="text-xs text-muted-foreground">
                    Due {mockCustomerPortal.nextPayment.date}
                  </p>
                </div>
              </FeatureTooltip>

              <FeatureTooltip
                title={tooltipContent.customerPortal.payNow.title}
                description={tooltipContent.customerPortal.payNow.description}
                indicatorPosition="top-left"
              >
                <div className="flex items-center justify-center rounded-lg border p-3">
                  <MockupButton className="w-full">Pay Now</MockupButton>
                </div>
              </FeatureTooltip>
            </div>
          </MockupCardContent>
        </MockupCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <FeatureTooltip
          title={tooltipContent.customerPortal.paymentHistory.title}
          description={tooltipContent.customerPortal.paymentHistory.description}
          indicatorPosition="top-right"
        >
          <MockupCard>
            <MockupCardHeader className="pb-3">
              <MockupCardTitle className="text-sm">Payment Schedule</MockupCardTitle>
            </MockupCardHeader>
            <MockupCardContent className="pt-0">
              <MockupTable>
                <MockupTableHeader>
                  <MockupTableRow>
                    <MockupTableHead>Date</MockupTableHead>
                    <MockupTableHead>Type</MockupTableHead>
                    <MockupTableHead>Amount</MockupTableHead>
                    <MockupTableHead className="text-right">Status</MockupTableHead>
                  </MockupTableRow>
                </MockupTableHeader>
                <MockupTableBody>
                  {mockCustomerPortal.payments.map((payment, index) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                      className="border-b last:border-0"
                    >
                      <MockupTableCell>
                        <div className="flex items-center gap-2">
                          {payment.status === 'Paid' ? (
                            <CheckCircle2Icon className="h-3 w-3 text-green-500" />
                          ) : (
                            <ClockIcon className="h-3 w-3 text-muted-foreground" />
                          )}
                          {payment.date}
                        </div>
                      </MockupTableCell>
                      <MockupTableCell>{payment.type}</MockupTableCell>
                      <MockupTableCell className="font-medium">{payment.amount}</MockupTableCell>
                      <MockupTableCell className="text-right">
                        <PaymentStatusBadge status={payment.status} />
                      </MockupTableCell>
                    </motion.tr>
                  ))}
                </MockupTableBody>
              </MockupTable>
            </MockupCardContent>
          </MockupCard>
        </FeatureTooltip>
      </motion.div>
    </div>
  );
}
