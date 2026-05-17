export enum BUploadListType {
  Text = 'text',
  Picture = 'picture',
  PictureCard = 'picture-card',
  PictureCircle = 'picture-circle',
}

export enum BUploadFileStatus {
  Uploading = 'uploading',
  Done = 'done',
  Error = 'error',
  Removed = 'removed',
}

export interface BUploadFile {
  uid: string;
  name: string;
  status?: BUploadFileStatus;
  percent?: number;
  url?: string;
  thumbUrl?: string;
  response?: unknown;
  error?: unknown;
  originFileObj?: File;
  size?: number;
  type?: string;
}

export interface BUploadChangeInfo {
  file: BUploadFile;
  fileList: BUploadFile[];
  event?: ProgressEvent;
}

export interface BUploadRequestOption {
  action: string;
  file: File;
  filename: string;
  headers?: Record<string, string>;
  data?: Record<string, unknown>;
  withCredentials?: boolean;
  method?: string;
  onProgress?: (event: { percent: number }) => void;
  onSuccess?: (response: unknown) => void;
  onError?: (error: Error) => void;
}

export interface BUploadShowUploadList {
  showPreviewIcon?: boolean;
  showRemoveIcon?: boolean;
  showDownloadIcon?: boolean;
}
