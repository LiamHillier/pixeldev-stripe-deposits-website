export const mockPlans = [
  {
    id: '1',
    name: 'Standard 50% Deposit',
    priority: 1,
    deposit: '50%',
    schedule: '3 monthly payments',
    activeOrders: 24,
    conditions: ['All Products']
  },
  {
    id: '2',
    name: 'High-Value Items',
    priority: 2,
    deposit: '30%',
    schedule: '6 monthly payments',
    activeOrders: 12,
    conditions: ['Cart Total > $500']
  },
  {
    id: '3',
    name: 'Custom Furniture',
    priority: 3,
    deposit: '$200 Fixed',
    schedule: 'ACF Date Field',
    activeOrders: 8,
    conditions: ['Category: Furniture', 'Product Tag: Custom']
  }
];

export const mockPlanEditor = {
  name: 'Standard 50% Deposit',
  depositEnabled: true,
  depositType: 'Percentage',
  depositAmount: 50,
  scheduleType: 'Fixed Intervals',
  paymentCount: 3,
  interval: 'Monthly'
};

export const mockConditions = [
  {
    id: '1',
    type: 'Cart Total',
    operator: 'Greater than',
    value: '$100'
  },
  {
    id: '2',
    type: 'Product Category',
    operator: 'Is any of',
    value: 'Furniture, Electronics'
  },
  {
    id: '3',
    type: 'Customer Role',
    operator: 'Equals',
    value: 'Wholesale'
  }
];

export const mockCustomerPortal = {
  orderNumber: '#1234',
  orderDate: 'Jan 15, 2025',
  orderTotal: '$1,200.00',
  depositPaid: '$600.00',
  remainingBalance: '$600.00',
  progress: 50,
  nextPayment: {
    amount: '$200.00',
    date: 'Feb 15, 2025'
  },
  payments: [
    {
      id: '1',
      date: 'Jan 15, 2025',
      amount: '$600.00',
      type: 'Deposit',
      status: 'Paid'
    },
    {
      id: '2',
      date: 'Feb 15, 2025',
      amount: '$200.00',
      type: 'Installment 1',
      status: 'Upcoming'
    },
    {
      id: '3',
      date: 'Mar 15, 2025',
      amount: '$200.00',
      type: 'Installment 2',
      status: 'Scheduled'
    },
    {
      id: '4',
      date: 'Apr 15, 2025',
      amount: '$200.00',
      type: 'Installment 3',
      status: 'Scheduled'
    }
  ]
};

export const mockDashboardStats = {
  activePlans: 156,
  completedPlans: 423,
  pastDue: 12,
  revenue: '$45,230'
};

export const mockDashboardOrders = [
  {
    id: '#1234',
    customer: 'John Smith',
    total: '$1,200.00',
    paid: '$600.00',
    remaining: '$600.00',
    status: 'Active',
    nextPayment: 'Feb 15'
  },
  {
    id: '#1235',
    customer: 'Sarah Johnson',
    total: '$850.00',
    paid: '$850.00',
    remaining: '$0.00',
    status: 'Completed',
    nextPayment: '-'
  },
  {
    id: '#1236',
    customer: 'Mike Wilson',
    total: '$2,400.00',
    paid: '$800.00',
    remaining: '$1,600.00',
    status: 'Past Due',
    nextPayment: 'Jan 20'
  }
];
