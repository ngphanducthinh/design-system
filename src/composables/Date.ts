import { padStartZero } from '@/helpers/DateHelper';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useDate() {
  /**
   * Data
   */
  const { t, locale } = useI18n();
  const dayNames = computed<Record<number, string>>(() => ({
    0: t('ds.components.base.date_picker.days.sunday'),
    1: t('ds.components.base.date_picker.days.monday'),
    2: t('ds.components.base.date_picker.days.tuesday'),
    3: t('ds.components.base.date_picker.days.wednesday'),
    4: t('ds.components.base.date_picker.days.thursday'),
    5: t('ds.components.base.date_picker.days.friday'),
    6: t('ds.components.base.date_picker.days.saturday'),
  }));
  const monthNames = computed<Record<number, string>>(() => ({
    0: t('ds.components.base.date_picker.months.january'),
    1: t('ds.components.base.date_picker.months.february'),
    2: t('ds.components.base.date_picker.months.march'),
    3: t('ds.components.base.date_picker.months.april'),
    4: t('ds.components.base.date_picker.months.may'),
    5: t('ds.components.base.date_picker.months.june'),
    6: t('ds.components.base.date_picker.months.july'),
    7: t('ds.components.base.date_picker.months.august'),
    8: t('ds.components.base.date_picker.months.september'),
    9: t('ds.components.base.date_picker.months.october'),
    10: t('ds.components.base.date_picker.months.november'),
    11: t('ds.components.base.date_picker.months.december'),
  }));
  const monthShortNames = computed<Record<number, string>>(() => ({
    0: t('ds.components.base.date_picker.months_short.january'),
    1: t('ds.components.base.date_picker.months_short.february'),
    2: t('ds.components.base.date_picker.months_short.march'),
    3: t('ds.components.base.date_picker.months_short.april'),
    4: t('ds.components.base.date_picker.months_short.may'),
    5: t('ds.components.base.date_picker.months_short.june'),
    6: t('ds.components.base.date_picker.months_short.july'),
    7: t('ds.components.base.date_picker.months_short.august'),
    8: t('ds.components.base.date_picker.months_short.september'),
    9: t('ds.components.base.date_picker.months_short.october'),
    10: t('ds.components.base.date_picker.months_short.november'),
    11: t('ds.components.base.date_picker.months_short.december'),
  }));
  const dayShortNames = computed<Record<number, string>>(() => ({
    0: t('ds.components.base.date_picker.days_short.sunday'),
    1: t('ds.components.base.date_picker.days_short.monday'),
    2: t('ds.components.base.date_picker.days_short.tuesday'),
    3: t('ds.components.base.date_picker.days_short.wednesday'),
    4: t('ds.components.base.date_picker.days_short.thursday'),
    5: t('ds.components.base.date_picker.days_short.friday'),
    6: t('ds.components.base.date_picker.days_short.saturday'),
  }));

  /**
   * Methods
   */
  const formatDateHuge = (date: Date) => {
    if (!validateDate(date)) {
      return date;
    }

    const dayName = dayNames.value[date.getDay()];
    const monthName = monthNames.value[date.getMonth()];
    const enUSResult = `${dayName}, ${monthName} ${date.getDate()}, ${date.getFullYear()}`;
    const viVNResult = `${dayName}, ${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()}`;

    const result: Record<string, string> = {
      'en-US': enUSResult,
      'vi-VN': viVNResult,
    };

    return result[locale.value] || enUSResult;
  };
  const formatDate = (date: Date) => {
    if (!validateDate(date)) {
      return date;
    }

    const result: Record<string, string> = {
      'vi-VN': `${padStartZero(date.getDate(), 2)}/${padStartZero(
        date.getMonth() + 1,
        2,
      )}/${padStartZero(date.getFullYear(), 4)}`,
      'en-US': `${monthNames.value[date.getMonth()]} ${padStartZero(
        date.getDate(),
        2,
      )}, ${date.getFullYear()}`,
    };

    return result[locale.value];
  };
  const formatTime = (date: Date) => {
    if (!validateDate(date)) {
      return date;
    }

    const d = new Date(date);
    const h = d.getHours();
    const m = d.getMinutes();
    const formattedStr = `${padStartZero(h, 2)}:${padStartZero(m, 2)}`;

    const result: Record<string, string> = {
      'vi-VN': formattedStr,
      'en-US': formattedStr,
    };

    return result[locale.value];
  };
  const formatMonthYear = (
    date: Date,
    type: 'full' | 'short' | 'number' = 'full',
  ) => {
    if (!validateDate(date)) {
      return date;
    }

    const months = {
      full: monthNames.value,
      short: monthShortNames.value,
      number: [
        '01',
        '02',
        '03',
        '04',
        '05',
        '06',
        '07',
        '08',
        '09',
        '10',
        '11',
        '12',
      ],
    };

    const monthName = months[type][date.getMonth()];
    const year = date.getFullYear();
    return `${type === 'number' ? `${monthName}/` : `${monthName} `}${year}`;
  };
  const validateDate = (date: Date) =>
    date ? date.toString() !== 'Invalid Date' : false;

  return {
    formatTime,
    formatDate,
    formatDateHuge,
    formatMonthYear,
    dayShortNames,
    monthNames,
  };
}
