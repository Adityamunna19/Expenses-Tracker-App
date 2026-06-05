const STORAGE_PREFIX = 'money-cockpit:category-settings';

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Groceries',
  'Cafe',
  'Coffee',
  'Bills',
  'Shopping',
  'Entertainment',
  'Savings',
  'Goals',
  'Credit Card Payment',
  'Beauty',
  'Travel',
  'Medicines',
  'Family Maintenance',
  'Fancy',
  'Repairs',
  'Subscription',
  'Other',
];

export const DEEPU_EXPENSE_CATEGORIES = ['Smoking', 'Drinking'];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Refund',
  'Intrest',
  'Gift',
  'Other',
  'Maintenance',
  'Self',
  'Savings',
];

export const DEFAULT_BUDGET_EXCLUSIONS = new Set(['Savings', 'Goals', 'Credit Card Payment']);

export const MERCHANT_ALIAS_RULES = [
  {
    canonical: 'Rayudu Tiffins',
    aliases: ['kukkala ramesh', 'rayudu tiffins', 'rayudu tiffins restaurant'],
  },
];

const normalizeKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const titleCase = (value) => {
  const cleaned = String(value || '').trim().replace(/\s+/g, ' ');
  if (!cleaned) return '';

  return cleaned
    .split(' ')
    .map((word) => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

const uniqueCategories = (values) => {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const label = titleCase(value);
    const key = normalizeKey(label);
    if (!label || seen.has(key)) return;
    seen.add(key);
    result.push(label);
  });

  return result;
};

export const getUserDisplayName = (user) => {
  const firstName = user?.user_metadata?.first_name?.trim() || '';
  const fallbackName = user?.email?.split('@')[0]?.trim() || '';
  return firstName || fallbackName || '';
};

export const isDeepuUser = (user) => normalizeKey(getUserDisplayName(user)) === 'deepu';

export const getCategoryStorageKey = (user) =>
  `${STORAGE_PREFIX}:${user?.id || 'guest'}`;

export const loadCategoryPreferences = (user) => {
  if (typeof window === 'undefined') {
    return { expenseCustom: [], incomeCustom: [] };
  }

  const raw = window.localStorage.getItem(getCategoryStorageKey(user));
  if (!raw) {
    return { expenseCustom: [], incomeCustom: [] };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      expenseCustom: Array.isArray(parsed.expenseCustom)
        ? uniqueCategories(parsed.expenseCustom)
        : [],
      incomeCustom: Array.isArray(parsed.incomeCustom)
        ? uniqueCategories(parsed.incomeCustom)
        : [],
    };
  } catch {
    return { expenseCustom: [], incomeCustom: [] };
  }
};

export const saveCategoryPreferences = (user, preferences) => {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(
    getCategoryStorageKey(user),
    JSON.stringify({
      expenseCustom: uniqueCategories(preferences?.expenseCustom || []),
      incomeCustom: uniqueCategories(preferences?.incomeCustom || []),
    })
  );
};

export const getExpenseCategories = (user, preferences = { expenseCustom: [], incomeCustom: [] }) =>
  uniqueCategories([
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...(isDeepuUser(user) ? DEEPU_EXPENSE_CATEGORIES : []),
    ...(preferences.expenseCustom || []),
  ]);

export const getIncomeCategories = (user, preferences = { expenseCustom: [], incomeCustom: [] }) =>
  uniqueCategories([...DEFAULT_INCOME_CATEGORIES, ...(preferences.incomeCustom || [])]);

export const getBudgetCategories = (user, preferences = { expenseCustom: [], incomeCustom: [] }) =>
  getExpenseCategories(user, preferences).filter((category) => !DEFAULT_BUDGET_EXCLUSIONS.has(category));

export const addCustomCategory = (preferences, scope, category, user) => {
  const targetScope = scope === 'income' ? 'incomeCustom' : 'expenseCustom';
  const cleanedCategory = titleCase(category);

  if (!cleanedCategory) return preferences;

  const builtInCategories =
    scope === 'income'
      ? getIncomeCategories(user, { expenseCustom: [], incomeCustom: [] })
      : getExpenseCategories(user, { expenseCustom: [], incomeCustom: [] });

  if (builtInCategories.some((item) => normalizeKey(item) === normalizeKey(cleanedCategory))) {
    return preferences;
  }

  const currentList = uniqueCategories(preferences?.[targetScope] || []);
  if (currentList.some((item) => normalizeKey(item) === normalizeKey(cleanedCategory))) {
    return preferences;
  }

  return {
    ...preferences,
    [targetScope]: uniqueCategories([...currentList, cleanedCategory]),
  };
};

export const removeCustomCategory = (preferences, scope, category) => {
  const targetScope = scope === 'income' ? 'incomeCustom' : 'expenseCustom';
  const normalizedCategory = normalizeKey(category);

  return {
    ...preferences,
    [targetScope]: uniqueCategories(
      (preferences?.[targetScope] || []).filter((item) => normalizeKey(item) !== normalizedCategory)
    ),
  };
};

export const resolveMerchantName = (value) => {
  const text = String(value || '').trim();
  if (!text) return '';

  const lowerText = normalizeKey(text);
  for (const rule of MERCHANT_ALIAS_RULES) {
    if (rule.aliases.some((alias) => lowerText.includes(normalizeKey(alias)))) {
      return rule.canonical;
    }
  }

  return titleCase(text);
};

export const getLoanBucketName = (transaction = {}) => {
  const rawBucket =
    transaction.loan_account_name ||
    transaction.loan_bucket ||
    transaction.debt_account_name ||
    transaction.loan_name ||
    transaction.title ||
    '';

  const cleaned = resolveMerchantName(rawBucket);
  return cleaned || 'Unassigned Debt';
};

export const isGrowwAccount = (account = {}) => normalizeKey(account.name || '').includes('groww');

