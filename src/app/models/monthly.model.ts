export interface Monthly {
  year: string;
  month: string;
  datestart?: Date;
  dateend?: Date;
}

export interface TreeSelectOption {
  label: string;
  parent?: any;
  year: string;
  month: string;
}
