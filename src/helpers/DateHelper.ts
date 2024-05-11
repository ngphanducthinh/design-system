/**
 * Check if the given string is in valid ISO 8601 format
 * @param date
 */
export const isISO8601 = (date: string): boolean => {
  // YYYY-MM-DDTHH:mm:ss.sssZ
  // YYYY-MM-DDTHH:mm:ss.sss
  // YYYY-MM-DDTHH:mm:ss
  // YYYY-MM-DD
  const iso8601Regex =
    /^(\d{4}|[+-]\d{6})-(\d{2})-(\d{2})(T(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?(Z|([+-])(\d{2}):(\d{2}))?)?$/;
  return iso8601Regex.test(date);
};

export const padStartZero = (val: number, maxLength: number) => {
  let num = val.toString();
  while (num.length < maxLength) {
    num = '0' + num;
  }
  return num;
};
