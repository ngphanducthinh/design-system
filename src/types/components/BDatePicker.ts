export interface BDatePickerDateItem {
  year?: number;
  month?: number;
  date?: number;
  secondary?: boolean;
  disabled?: boolean;
}

export interface BDatePickerViewData {
  handleClickPreview: () => void;
  handleClickNext: () => void;
  handleClickHeading: () => void;
}
