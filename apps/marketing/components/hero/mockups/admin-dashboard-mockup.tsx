'use client';

import * as React from 'react';
import {
  LayoutDashboardIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DollarSignIcon,
  SearchIcon,
  FilterIcon
} from 'lucide-react';
import { motion } from 'motion/react';

import {
  MockupCard,
  MockupCardHeader,
  MockupCardTitle,
  MockupCardContent,
  MockupButton,
  MockupBadge,
  MockupInput,
  MockupTable,
  MockupTableHeader,
  MockupTableBody,
  MockupTableRow,
  MockupTableHead,
  MockupTableCell
} from '../primitives';
import { FeatureTooltip } from '../tooltip/feature-tooltip';
import { tooltipContent } from '../tooltip/tooltip-content';
import { mockDashboardStats, mockDashboardOrders } from '../data/mock-data';

function StatCard({
  title,
  value,
  icon: Icon,
  tooltipKey,
  variant = 'default',
  delay = 0,
  showIndicator = false
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tooltipKey: keyof typeof tooltipContent.adminDashboard;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  delay?: number;
  showIndicator?: boolean;
}): React.JSX.Element {
  const iconColors = {
    default: 'text-primary',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-red-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <FeatureTooltip
        title={tooltipContent.adminDashboard[tooltipKey].title}
        description={tooltipContent.adminDashboard[tooltipKey].description}
        showIndicator={showIndicator}
        indicatorPosition="top-right"
      >
        <MockupCard className="p-4">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-muted p-2 ${iconColors[variant]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{title}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        </MockupCard>
      </FeatureTooltip>
    </motion.div>
  );
}

function OrderStatusBadge({ status }: { status: string }): React.JSX.Element {
  const variants: Record<string, 'success' | 'warning' | 'secondary' | 'destructive'> = {
    Active: 'info' as 'secondary',
    Completed: 'success',
    'Past Due': 'destructive'
  };

  return <MockupBadge variant={variants[status] || 'secondary'}>{status}</MockupBadge>;
}

export function AdminDashboardMockup(): React.JSX.Element {
  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <StatCard
          title="Active Plans"
          value={mockDashboardStats.activePlans}
          icon={TrendingUpIcon}
          tooltipKey="statsActive"
          variant="default"
          delay={0}
          showIndicator
        />
        <StatCard
          title="Completed"
          value={mockDashboardStats.completedPlans}
          icon={CheckCircleIcon}
          tooltipKey="statsCompleted"
          variant="success"
          delay={0.05}
        />
        <StatCard
          title="Past Due"
          value={mockDashboardStats.pastDue}
          icon={AlertCircleIcon}
          tooltipKey="statsPastDue"
          variant="destructive"
          delay={0.1}
          showIndicator
        />
        <StatCard
          title="Revenue"
          value={mockDashboardStats.revenue}
          icon={DollarSignIcon}
          tooltipKey="statsRevenue"
          variant="success"
          delay={0.15}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <FeatureTooltip
          title={tooltipContent.adminDashboard.orderTable.title}
          description={tooltipContent.adminDashboard.orderTable.description}
          indicatorPosition="top-right"
        >
          <MockupCard className="overflow-hidden">
            <MockupCardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
                  <MockupCardTitle>Payment Plans</MockupCardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                    <MockupInput placeholder="Search orders..." className="pl-7 w-[160px]" />
                  </div>
                  <MockupButton variant="outline" size="sm">
                    <FilterIcon className="h-3 w-3" />
                    Filter
                  </MockupButton>
                </div>
              </div>
            </MockupCardHeader>
            <MockupCardContent className="p-0">
              <MockupTable>
                <MockupTableHeader>
                  <MockupTableRow className="bg-muted/30">
                    <MockupTableHead>Order</MockupTableHead>
                    <MockupTableHead>Customer</MockupTableHead>
                    <MockupTableHead>Total</MockupTableHead>
                    <MockupTableHead>Paid</MockupTableHead>
                    <MockupTableHead>Remaining</MockupTableHead>
                    <MockupTableHead>Next Payment</MockupTableHead>
                    <MockupTableHead className="text-right">Status</MockupTableHead>
                  </MockupTableRow>
                </MockupTableHeader>
                <MockupTableBody>
                  {mockDashboardOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.05, duration: 0.2 }}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <MockupTableCell className="font-medium">{order.id}</MockupTableCell>
                      <MockupTableCell>{order.customer}</MockupTableCell>
                      <MockupTableCell>{order.total}</MockupTableCell>
                      <MockupTableCell>{order.paid}</MockupTableCell>
                      <MockupTableCell>{order.remaining}</MockupTableCell>
                      <MockupTableCell>{order.nextPayment}</MockupTableCell>
                      <MockupTableCell className="text-right">
                        <FeatureTooltip
                          title={tooltipContent.adminDashboard.orderStatus.title}
                          description={tooltipContent.adminDashboard.orderStatus.description}
                          side="left"
                          showIndicator={index === 0}
                          indicatorPosition="left-center"
                        >
                          <span>
                            <OrderStatusBadge status={order.status} />
                          </span>
                        </FeatureTooltip>
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
