interface FormatCurrencyOptions {
  currency?: string;
  style?: Intl.NumberFormatOptions['style'];
  locale?: string;
}

export const formatCurrency = (value: number, options: FormatCurrencyOptions = {}) => {
  const { currency = 'JPY', style = 'currency', locale = 'ja-JP' } = options;
  return value.toLocaleString(locale, { style, currency });
};
