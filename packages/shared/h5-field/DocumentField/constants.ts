import { DocumentType, type DocumentTypeOption } from './types';

// 证件类型配置
export const DOCUMENT_TYPE_OPTIONS: DocumentTypeOption[] = [
  {
    text: '身份证',
    value: DocumentType.ID_CARD,
    placeholder: '请输入身份证号码',
    maxlength: 18,
    pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  },
  {
    text: '护照',
    value: DocumentType.PASSPORT,
    placeholder: '请输入护照号码',
    maxlength: 20,
    pattern: /^[A-Za-z0-9]{6,20}$/
  },
  {
    text: '港澳台通行证',
    value: DocumentType.HK_MACAO_TAIWAN,
    placeholder: '请输入港澳台通行证号码',
    maxlength: 20,
    pattern: /^[A-Za-z0-9]{8,20}$/
  }
];

// 根据证件类型获取配置
export function getDocumentTypeOption(type: DocumentType): DocumentTypeOption | undefined {
  return DOCUMENT_TYPE_OPTIONS.find(option => option.value === type);
}

// 获取证件类型显示文本
export function getDocumentTypeText(type: DocumentType): string {
  const option = getDocumentTypeOption(type);
  return option?.text || type;
}

// 默认证件类型
export const DEFAULT_DOCUMENT_TYPE = DocumentType.ID_CARD;

// 默认支持的证件类型
export const DEFAULT_SUPPORTED_TYPES = [
  DocumentType.ID_CARD,
  DocumentType.PASSPORT,
  DocumentType.HK_MACAO_TAIWAN
];