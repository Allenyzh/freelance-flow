export interface FinanceAccount {
  id: number;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  initialBalance: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type AccountType = "checking" | "savings" | "credit" | "cash" | "investment";

export interface FinanceTransaction {
  id: number;
  accountId: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  reference?: string;
  invoiceId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = "income" | "expense" | "transfer" | "adjustment";

export interface FinanceSettings {
  defaultAccountId?: number;
  autoCategorize: boolean;
  autoReconcile: boolean;
  userId: number;
}

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  cashFlow: number;
  byAccount: Array<{
    accountId: number;
    accountName: string;
    balance: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    income: number;
    expense: number;
    netCashFlow: number;
  }>;
}

export interface FinanceFilter {
  startDate?: string;
  endDate?: string;
  accountId?: number;
  type?: TransactionType;
  category?: string;
}
