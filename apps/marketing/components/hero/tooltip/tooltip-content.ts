export const tooltipContent = {
  // Tab 1: Deposit Rules (All Plans)
  allPlans: {
    addPlan: {
      title: 'Create Payment Plans',
      description:
        'Create payment plans with custom deposits and schedules. Assign plans to products via conditions.'
    },
    priority: {
      title: 'Plan Priority',
      description:
        'Lower numbers match first when multiple plans apply to the same product. Drag to reorder.'
    },
    planCard: {
      title: 'Payment Plan',
      description:
        'Each plan defines deposit amount, payment schedule, and conditions for when it applies.'
    },
    activeOrders: {
      title: 'Active Orders',
      description:
        'Number of orders currently using this payment plan. Track adoption across your store.'
    },
    conditions: {
      title: 'Matching Conditions',
      description:
        'Rules that determine when this plan applies. Plans can match by product, category, cart total, and more.'
    }
  },

  // Tab 2: Payment Schedules (Plan Editor)
  planEditor: {
    depositToggle: {
      title: 'Deposit Collection',
      description:
        'Enable to collect an upfront payment. Disable for equal installments with no initial deposit.'
    },
    depositType: {
      title: 'Deposit Type',
      description:
        'Percentage scales with cart total. Fixed amount stays constant regardless of order value.'
    },
    depositAmount: {
      title: 'Deposit Amount',
      description:
        'The initial payment collected at checkout. Remaining balance is split across scheduled payments.'
    },
    scheduleType: {
      title: 'Schedule Type',
      description:
        'Fixed: set intervals (weekly, monthly). Date Field: use ACF field for due dates. Specific: exact calendar dates.'
    },
    paymentCount: {
      title: 'Number of Payments',
      description:
        'How many installments to split the remaining balance into after the initial deposit.'
    },
    interval: {
      title: 'Payment Interval',
      description:
        'Time between each scheduled payment. Choose days, weeks, or months based on your billing cycle.'
    }
  },

  // Tab 3: Condition Builder
  conditionBuilder: {
    conditionType: {
      title: 'Condition Types',
      description:
        '20+ types available: cart total, product category, customer role, shipping location, date ranges, and more.'
    },
    matchType: {
      title: 'Match Logic',
      description:
        'ALL: every condition must be true. ANY: at least one condition must match for the plan to apply.'
    },
    operator: {
      title: 'Comparison Operator',
      description:
        'How to compare values: equals, not equals, greater than, less than, contains, or is empty.'
    },
    addCondition: {
      title: 'Add Condition',
      description:
        'Add multiple conditions to create precise targeting rules for when this payment plan applies.'
    },
    conditionValue: {
      title: 'Condition Value',
      description:
        'The value to compare against. Options change based on the selected condition type.'
    }
  },

  // Tab 4: Checkout
  checkout: {
    paymentPlanOption: {
      title: 'Payment Plan Option',
      description:
        'Customers choose between paying in full or using a payment plan. The plan details are shown clearly at checkout.'
    },
    schedulePreview: {
      title: 'Schedule Preview',
      description:
        'Full breakdown of the payment schedule shown before purchase. Customers see exactly when each payment is due.'
    },
    depositPayment: {
      title: 'Deposit Payment',
      description:
        'The initial amount charged today. This secures the order and starts the payment plan.'
    },
    placeOrder: {
      title: 'Secure Checkout',
      description:
        'Only the deposit is charged now. Future payments are automatically charged on the scheduled dates via Stripe.'
    }
  },

  // Customer Portal (kept for reference)
  customerPortal: {
    paymentProgress: {
      title: 'Payment Progress',
      description:
        'Customers see their remaining balance and payment schedule. Visual progress bar shows completion status.'
    },
    upcomingPayment: {
      title: 'Upcoming Payment',
      description:
        'Next scheduled payment amount and due date. Customers can view or pay early from their account.'
    },
    paymentHistory: {
      title: 'Payment History',
      description:
        'Complete record of all payments made. Includes dates, amounts, and payment method details.'
    },
    payNow: {
      title: 'Pay Early',
      description:
        'Customers can pay upcoming installments ahead of schedule. Automatically recalculates remaining balance.'
    },
    orderDetails: {
      title: 'Order Details',
      description:
        'View original order information including products, totals, and current payment plan status.'
    }
  },

  // Tab 5: Admin Dashboard
  adminDashboard: {
    statsActive: {
      title: 'Active Plans',
      description:
        'Orders with ongoing payment plans. These have remaining balances and scheduled future payments.'
    },
    statsCompleted: {
      title: 'Completed Plans',
      description:
        'Fully paid orders. All scheduled payments have been collected successfully.'
    },
    statsPastDue: {
      title: 'Past Due',
      description:
        'Orders with missed payment deadlines. Review and take action on overdue installments.'
    },
    statsRevenue: {
      title: 'Collected Revenue',
      description:
        'Total amount collected through payment plans this period. Includes deposits and installments.'
    },
    orderTable: {
      title: 'Order Management',
      description:
        'View and manage all orders with payment plans. Filter by status, search customers, and take bulk actions.'
    },
    orderStatus: {
      title: 'Payment Status',
      description:
        'Current state of the payment plan: Active, Completed, Past Due, or Cancelled.'
    }
  }
} as const;
