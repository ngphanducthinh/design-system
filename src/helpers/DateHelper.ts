import moment from 'moment-mini';

export const checkIfISOFormat = (str?: string | Date) =>
  moment(str, moment.ISO_8601, true).isValid();
export const padStartZero = (val: number, maxLength: number) => {
  let num = val.toString();
  while (num.length < maxLength) {
    num = '0' + num;
  }
  return num;
};
