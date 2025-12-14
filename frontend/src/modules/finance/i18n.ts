import type { ModuleMessages } from "@/modules/types";

export const financeMessages: ModuleMessages = {
  "en-US": {
    nav: {
      finance: "Finance",
    },
    finance: {
      title: "Finance",
      subtitle: "Manage your accounts and track cash flow",
      nav: {
        overview: "Overview",
        accounts: "Accounts",
        transactions: "Transactions",
        import: "Import",
        categories: "Categories",
        reports: "Reports",
      },
      overview: {
        title: "Financial Overview",
        subtitle: "Your financial health at a glance",
        quickActions: "Quick Actions",
        viewAllAccounts: "View All Accounts",
        manageYourAccounts: "Manage your bank accounts and credit cards",
        viewAllTransactions: "View All Transactions",
        browseRecentTransactions: "Browse and manage your recent transactions",
        importStatement: "Import Bank Statement",
        importBankStatement: "Import transactions from bank CSV or OFX files",
        viewReports: "View Reports",
        analyzeYourFinance: "Analyze your income, expenses and trends",
      },
      summary: {
        totalBalance: "Total Balance",
        totalIncome: "Total Income",
        totalExpense: "Total Expenses",
        netCashFlow: "Net Cash Flow",
      },
      actions: {
        addTransaction: "Add Transaction",
        addAccount: "Add Account",
      },
      accounts: {
        title: "Accounts",
        addAccount: "Add Account",
        table: {
          name: "Account Name",
          type: "Type",
          currency: "Currency",
          balance: "Balance",
        },
        types: {
          checking: "Checking",
          savings: "Savings",
          credit: "Credit Card",
          investment: "Investment",
        },
        errors: {
          loadFailed: "Failed to load accounts",
        },
      },
      transactions: {
        title: "Transactions",
        addTransaction: "Add Transaction",
      },
      import: {
        title: "Import Bank Statement",
      },
      categories: {
        title: "Categories",
      },
      reports: {
        title: "Financial Reports",
      },
      filters: {
        dateRange: "Select date range",
        allAccounts: "All Accounts",
        allTypes: "All Types",
        income: "Income",
        expense: "Expense",
        transfer: "Transfer",
        adjustment: "Adjustment",
      },
    },
    settings: {
      finance: {
        title: "Finance",
        description: "Finance accounts and transaction settings",
        fields: {
          defaultAccount: "Default Account",
          autoCategorize: "Auto Categorize Transactions",
          autoReconcile: "Auto Reconcile Accounts",
        },
        placeholders: {
          defaultAccount: "Select default account",
        },
        hints: {
          autoCategorize: "Automatically categorize transactions based on rules",
          autoReconcile: "Automatically reconcile accounts with bank statements",
        },
        messages: {
          loadError: "Failed to load finance settings",
          saved: "Finance settings saved",
          saveError: "Failed to save settings",
        },
      },
    },
  },
  "zh-CN": {
    nav: {
      finance: "财务",
    },
    finance: {
      title: "财务",
      subtitle: "管理账户与现金流",
      nav: {
        overview: "概览",
        accounts: "账户",
        transactions: "交易",
        import: "导入",
        categories: "分类",
        reports: "报表",
      },
      overview: {
        title: "财务概览",
        subtitle: "一眼了解你的财务状况",
        quickActions: "快捷操作",
        viewAllAccounts: "查看所有账户",
        manageYourAccounts: "管理你的银行卡与信用卡账户",
        viewAllTransactions: "查看所有交易",
        browseRecentTransactions: "浏览并管理最近交易",
        importStatement: "导入银行对账单",
        importBankStatement: "从银行 CSV 或 OFX 文件导入交易",
        viewReports: "查看报表",
        analyzeYourFinance: "分析收入、支出与趋势",
      },
      summary: {
        totalBalance: "总余额",
        totalIncome: "总收入",
        totalExpense: "总支出",
        netCashFlow: "净现金流",
      },
      actions: {
        addTransaction: "添加交易",
        addAccount: "添加账户",
      },
      accounts: {
        title: "账户",
        addAccount: "添加账户",
        table: {
          name: "账户名称",
          type: "类型",
          currency: "币种",
          balance: "余额",
        },
        types: {
          checking: "支票账户",
          savings: "储蓄账户",
          credit: "信用卡",
          investment: "投资账户",
        },
        errors: {
          loadFailed: "加载账户失败",
        },
      },
      transactions: {
        title: "交易",
        addTransaction: "添加交易",
      },
      import: {
        title: "导入银行对账单",
      },
      categories: {
        title: "分类",
      },
      reports: {
        title: "财务报表",
      },
      filters: {
        dateRange: "选择日期范围",
        allAccounts: "所有账户",
        allTypes: "所有类型",
        income: "收入",
        expense: "支出",
        transfer: "转账",
        adjustment: "调整",
      },
    },
    settings: {
      finance: {
        title: "财务",
        description: "财务账户与交易相关设置",
        fields: {
          defaultAccount: "默认账户",
          autoCategorize: "自动分类交易",
          autoReconcile: "自动对账",
        },
        placeholders: {
          defaultAccount: "选择默认账户",
        },
        hints: {
          autoCategorize: "根据规则自动为交易分类",
          autoReconcile: "根据银行对账单自动对账",
        },
        messages: {
          loadError: "加载财务设置失败",
          saved: "财务设置已保存",
          saveError: "保存设置失败",
        },
      },
    },
  },
};

