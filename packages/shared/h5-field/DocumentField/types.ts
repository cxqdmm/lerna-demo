import type { Ref } from 'vue';

// 使用 any 类型以兼容 vant 的校验规则
export type VantRule = any;

// 证件类型枚举
export enum DocumentType {
  ID_CARD = 'idcard',
  PASSPORT = 'passport',
  HK_MACAO_TAIWAN = 'hkmacaotaiwan'
}

// 证件类型选项
export interface DocumentTypeOption {
  text: string;
  value: DocumentType;
  placeholder: string;
  maxlength?: number;
  pattern?: RegExp;
}

// 证件值对象
export interface DocumentValue {
  type: DocumentType;
  value: string;
}

// 证件信息类型
export interface DocumentInfo {
  isValid: boolean;
  type: DocumentType;
  value: string;
  parsedInfo?: {
    region?: string;
    birthDate?: string;
    age?: number;
    gender?: string;
  };
}

// Props 类型定义
export interface DocumentFieldProps {
  modelValue?: DocumentValue;
  label?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  name?: string;
  rules?: VantRule[];
  enableBuiltInValidation?: boolean;
  trigger?: 'onChange' | 'onBlur';
  supportedTypes?: DocumentType[];
}

// Emits 类型定义
export interface DocumentFieldEmits {
  'update:modelValue': [value: DocumentValue];
  input: [value: DocumentValue];
  blur: [event: Event];
  focus: [event: Event];
  'document-parsed': [info: DocumentInfo];
  'type-change': [type: DocumentType];
}

// Expose 类型定义
export interface DocumentFieldExpose {
  value: Ref<DocumentValue>;
  isValid: Ref<boolean>;
  documentInfo: Ref<DocumentInfo>;
  getDocumentInfo: () => DocumentInfo;
}

// 证件类型选择器 Props
export interface DocumentTypeSelectorProps {
  modelValue: DocumentType;
  disabled?: boolean;
  readonly?: boolean;
  supportedTypes?: DocumentType[];
}

// 证件类型选择器 Emits
export interface DocumentTypeSelectorEmits {
  'update:modelValue': [value: DocumentType];
}

// 证件输入框 Props
export interface DocumentInputProps {
  modelValue: string;
  type: DocumentType;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  clearable?: boolean;
  rules?: VantRule[];
  enableBuiltInValidation?: boolean;
  trigger?: 'onChange' | 'onBlur';
}

// 证件输入框 Emits
export interface DocumentInputEmits {
  'update:modelValue': [value: string];
  input: [value: string];
  blur: [event: Event];
  focus: [event: Event];
  'document-parsed': [info: DocumentInfo];
}