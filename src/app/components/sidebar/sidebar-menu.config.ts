export interface MenuItem {
  id: string;
  title: string;
  tooltip: string;
  icon: string;
  link: string;
  hasAccess: boolean | string;
  child: MenuItem[];
  Child: MenuItem[];
  section?: string;
  badge?: string;
  badgeClass?: string;
}

export function createMenuItem(item: {
  id: string;
  title: string;
  tooltip: string;
  icon: string;
  link?: string;
  hasAccess?: boolean | string;
  child?: MenuItem[];
  Child?: MenuItem[];
  section?: string;
  badge?: string;
  badgeClass?: string;
}): MenuItem {
  const children = item.child || item.Child || [];
  return {
    id: item.id,
    title: item.title,
    tooltip: item.tooltip,
    icon: item.icon,
    link: item.link || '',
    hasAccess: item.hasAccess !== undefined ? item.hasAccess : true,
    child: children,
    Child: children,
    section: item.section,
    badge: item.badge,
    badgeClass: item.badgeClass
  };
}

export const SIDEBAR_MENU_ITEMS: MenuItem[] = [
  // -------------------------------------------------------------
  // SECTION: Executive & Strategy
  // -------------------------------------------------------------
  createMenuItem({
    id: 'dashboard',
    title: 'Dashboard',
    tooltip: 'Executive HQ Dashboard & Overview',
    icon: `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
    link: '/dashboard',
    hasAccess: true,
    section: 'Executive & Strategy',
    badge: 'HQ',
    badgeClass: 'bg-blue-500/20 text-blue-300',
    child: []
  }),

  createMenuItem({
    id: 'reports',
    title: 'AI Analytics & Reports',
    tooltip: 'Enterprise AI Analytics, KPI Metrics & Executive Reports',
    icon: `<svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    link: '/reports',
    hasAccess: 'EXECUTIVE',
    child: []
  }),

  // -------------------------------------------------------------
  // SECTION: Core HR & Administration
  // -------------------------------------------------------------
  createMenuItem({
    id: 'hr',
    title: 'HR',
    tooltip: 'Human Resources & Employee Administration',
    icon: `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    link: '',
    hasAccess: 'HR',
    section: 'HR & Administration',
    child: [
      createMenuItem({
        id: 'hr-offices',
        title: 'Office',
        tooltip: 'Manage Company Offices & Branches',
        icon: '🏢',
        link: '/offices',
        hasAccess: 'offices',
        child: []
      }),
      createMenuItem({
        id: 'hr-ranks',
        title: 'Rank',
        tooltip: 'Manage Employee Hierarchy & Ranks',
        icon: '🎖️',
        link: '/ranks',
        hasAccess: 'ranks',
        child: []
      }),
      createMenuItem({
        id: 'hr-designations',
        title: 'Designation',
        tooltip: 'Manage Job Designations & Titles',
        icon: '🏷️',
        link: '/designations',
        hasAccess: 'designations',
        child: []
      }),
      createMenuItem({
        id: 'hr-employees',
        title: 'Employees',
        tooltip: 'View & Manage All Organization Employees',
        icon: '👥',
        link: '/employees',
        hasAccess: 'employees',
        child: []
      }),
      createMenuItem({
        id: 'hr-create-employee',
        title: 'Create Employee',
        tooltip: 'Register New Employee Onboarding',
        icon: '➕',
        link: '/employees/create',
        hasAccess: 'create_employee',
        child: []
      }),
      createMenuItem({
        id: 'hr-organogram',
        title: 'Employee Organogram',
        tooltip: 'Interactive Organization Hierarchy Tree',
        icon: '🌳',
        link: '/employees/organogram',
        hasAccess: 'employee_organogram',
        child: []
      })
    ]
  }),

  createMenuItem({
    id: 'attendance',
    title: 'Attendance',
    tooltip: 'Workforce Attendance, Time Slots & Daily Logs',
    icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    link: '',
    hasAccess: 'attendance',
    child: [
      createMenuItem({
        id: 'attendance-report',
        title: 'Attendance Report',
        tooltip: 'Monthly & Daily Attendance Summaries',
        icon: '📊',
        link: '/attendance/report',
        hasAccess: 'attendance_report',
        child: []
      }),
      createMenuItem({
        id: 'attendance-applications',
        title: 'Attendance Application List',
        tooltip: 'Review & Approve Attendance Applications',
        icon: '📋',
        link: '/attendance/applications',
        hasAccess: 'attendance',
        child: []
      }),
      createMenuItem({
        id: 'attendance-time-slots',
        title: 'Attendance Time Slot',
        tooltip: 'Configure Office Shift Time Slots',
        icon: '⏰',
        link: '/attendance/time-slots',
        hasAccess: 'attendance_time_slots',
        child: []
      }),
      createMenuItem({
        id: 'attendance-apply-slot',
        title: 'Apply for New Time Slot',
        tooltip: 'Submit Employee Shift Change Requests',
        icon: '📝',
        link: '/attendance/apply-slot',
        hasAccess: 'attendance_apply_slot',
        child: []
      }),
      createMenuItem({
        id: 'attendance-weekend-setup',
        title: 'Weekend Setup',
        tooltip: 'Configure Corporate & Departmental Weekends',
        icon: '📅',
        link: '/attendance/weekend-setup',
        hasAccess: 'attendance_weekend_setup',
        child: []
      })
    ]
  }),

  createMenuItem({
    id: 'leave',
    title: 'Leave',
    tooltip: 'Leave Management & Vacation Applications',
    icon: `<svg class="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>`,
    link: '',
    hasAccess: 'leaves',
    child: [
      createMenuItem({
        id: 'leave-my-report',
        title: 'My Leave Report',
        tooltip: 'Personal Leave Balance & History',
        icon: '📊',
        link: '/leaves/my-report',
        hasAccess: true,
        child: []
      }),
      createMenuItem({
        id: 'leave-my-applications',
        title: 'My Leave Application',
        tooltip: 'Apply for Personal Leave',
        icon: '📝',
        link: '/leaves/my-applications',
        hasAccess: true,
        child: []
      }),
      createMenuItem({
        id: 'leave-applications',
        title: 'Leave Application',
        tooltip: 'Approve & Manage Team Leave Requests',
        icon: '⚖️',
        link: '/leaves/applications',
        hasAccess: 'leave_applications',
        child: []
      }),
      createMenuItem({
        id: 'leave-employee-report',
        title: 'Employee Leave Report',
        tooltip: 'Company-wide Employee Leave Balances',
        icon: '📈',
        link: '/leaves/employee-report',
        hasAccess: 'leave_employee_report',
        child: []
      }),
      createMenuItem({
        id: 'leave-designation-chain',
        title: 'Designation Chain',
        tooltip: 'Approval Workflow Chains for Leaves',
        icon: '⛓️',
        link: '/leaves/designation-chain',
        hasAccess: 'leave_designation_chain',
        child: []
      }),
      createMenuItem({
        id: 'leave-types',
        title: 'Leave Type',
        tooltip: 'Configure Paid, Sick & Casual Leave Policies',
        icon: '🏷️',
        link: '/leaves/types',
        hasAccess: 'leave_types',
        child: []
      })
    ]
  }),

  // -------------------------------------------------------------
  // SECTION: Engineering & QA
  // -------------------------------------------------------------
  createMenuItem({
    id: 'projects',
    title: 'Projects & Milestones',
    tooltip: 'Track Ongoing Projects, Deadlines & Milestones',
    icon: `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>`,
    link: '/projects',
    hasAccess: 'projects',
    section: 'Engineering & QA',
    child: []
  }),

  createMenuItem({
    id: 'tasks',
    title: 'Tasks & Sprint Board',
    tooltip: 'Kanban Board, Sprint Tasks & Backlog',
    icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    link: '/tasks',
    hasAccess: 'tasks',
    child: []
  }),

  createMenuItem({
    id: 'qa',
    title: 'QA & Bug Tracking',
    tooltip: 'Test Scenarios, Bug Tickets & QA Pipelines',
    icon: `<svg class="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
    link: '/qa',
    hasAccess: 'qa',
    badge: 'QA',
    badgeClass: 'bg-rose-500/20 text-rose-300',
    child: []
  }),

  // -------------------------------------------------------------
  // SECTION: Enterprise Ops
  // -------------------------------------------------------------
  createMenuItem({
    id: 'payroll',
    title: 'Payroll',
    tooltip: 'End-to-End Employee Salary, Allowances, Deductions & Payslips',
    icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`,
    link: '',
    hasAccess: 'payroll',
    section: 'Enterprise Ops',
    badge: '9 MOD',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    child: [
      createMenuItem({
        id: 'payroll-overview',
        title: 'Payroll Overview',
        tooltip: 'Workflow Pipeline & KPI Summary',
        icon: '📊',
        link: '/payroll',
        hasAccess: 'payroll',
        child: []
      }),
      createMenuItem({
        id: 'payroll-structure',
        title: 'Salary Structure',
        tooltip: 'Employee Base Salary & Allowance Breakdown',
        icon: '💼',
        link: '/payroll/salary-structure',
        hasAccess: 'payroll_structure',
        child: []
      }),
      createMenuItem({
        id: 'payroll-attendance',
        title: 'Attendance Integration',
        tooltip: 'Biometric Attendance & Leave Days Sync',
        icon: '⏱️',
        link: '/payroll/attendance-integration',
        hasAccess: 'payroll_attendance',
        child: []
      }),
      createMenuItem({
        id: 'payroll-allowances',
        title: 'Allowances & Bonuses',
        tooltip: 'Configurable Allowances & Festival/Performance Bonuses',
        icon: '🎁',
        link: '/payroll/allowances-bonuses',
        hasAccess: 'payroll_allowances',
        child: []
      }),
      createMenuItem({
        id: 'payroll-deductions',
        title: 'Deduction Rules',
        tooltip: 'Tax, PF, Absent, Late & Loan Deductions',
        icon: '✂️',
        link: '/payroll/deductions',
        hasAccess: 'payroll_deductions',
        child: []
      }),
      createMenuItem({
        id: 'payroll-processing',
        title: 'Monthly Processing',
        tooltip: 'Batch Generation, Preview & Approval Cycle',
        icon: '⚙️',
        link: '/payroll/processing',
        hasAccess: 'payroll_processing',
        child: []
      }),
      createMenuItem({
        id: 'payroll-disbursement',
        title: 'Salary Disbursement',
        tooltip: 'Bank & Mobile Wallet Payouts with Trx IDs',
        icon: '💳',
        link: '/payroll/disbursement',
        hasAccess: 'payroll_disbursement',
        child: []
      }),
      createMenuItem({
        id: 'payroll-payslips',
        title: 'Payslip Management',
        tooltip: 'Itemized Digital & Printable Employee Payslips',
        icon: '📄',
        link: '/payroll/payslips',
        hasAccess: 'payroll_payslips',
        child: []
      }),
      createMenuItem({
        id: 'payroll-reports',
        title: 'Payroll Reports',
        tooltip: 'Department Cost Breakdown & Salary Register Export',
        icon: '📈',
        link: '/payroll/reports',
        hasAccess: 'payroll_reports',
        child: []
      })
    ]
  }),

  createMenuItem({
    id: 'finance',
    title: 'Finance & Expenses',
    tooltip: 'Expense Claims, Petty Cash & Budgets',
    icon: `<svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    link: '/finance',
    hasAccess: 'finance',
    child: []
  }),

  createMenuItem({
    id: 'it-support',
    title: 'IT Support Desk',
    tooltip: 'Internal Hardware, Software & Network Tickets',
    icon: `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    link: '/it-support',
    hasAccess: 'it_support',
    child: []
  }),

  createMenuItem({
    id: 'inventory',
    title: 'Inventory & Assets',
    tooltip: 'Hardware Assets, Licenses & Device Tracking',
    icon: `<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    link: '/inventory',
    hasAccess: 'inventory',
    child: []
  }),

  // -------------------------------------------------------------
  // SECTION: Collaboration & Sales
  // -------------------------------------------------------------
  createMenuItem({
    id: 'meetings',
    title: 'Meetings & AI Summaries',
    tooltip: 'Calendar Schedules & AI Meeting Minutes',
    icon: `<svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`,
    link: '/meetings',
    hasAccess: 'meetings',
    section: 'Collaboration & Sales',
    child: []
  }),

  createMenuItem({
    id: 'documents',
    title: 'Document Repository',
    tooltip: 'Enterprise Policies, Contracts & Shared Files',
    icon: `<svg class="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    link: '/documents',
    hasAccess: 'documents',
    child: []
  }),

  createMenuItem({
    id: 'sales',
    title: 'Sales & CRM Leads',
    tooltip: 'Customer Prospects, Leads & Pipeline Revenue',
    icon: `<svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>`,
    link: '/sales',
    hasAccess: 'sales',
    child: []
  }),

  // -------------------------------------------------------------
  // SECTION: AI Health & Burnout
  // -------------------------------------------------------------
  createMenuItem({
    id: 'burnout',
    title: 'Burnout Radar',
    tooltip: 'AI-Powered Employee Fatigue & Well-being Analytics',
    icon: `<svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`,
    link: '/burnout',
    hasAccess: 'burnout',
    section: 'AI Health & Burnout',
    badge: 'AI',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    child: []
  }),

  // -------------------------------------------------------------
  // SECTION: Governance
  // -------------------------------------------------------------
  createMenuItem({
    id: 'permissions',
    title: 'Permission Control',
    tooltip: 'RBAC Role Permissions & Access Tokens',
    icon: `<svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    link: '/permissions',
    hasAccess: 'permissions',
    section: 'Governance',
    badge: 'ADMIN',
    badgeClass: 'bg-purple-500/20 text-purple-300',
    child: []
  }),

  createMenuItem({
    id: 'audit-logs',
    title: 'Audit & Compliance',
    tooltip: 'System Audit Trails, Security Logs & Compliance',
    icon: `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>`,
    link: '/audit-logs',
    hasAccess: 'audit_logs',
    child: []
  })
];
