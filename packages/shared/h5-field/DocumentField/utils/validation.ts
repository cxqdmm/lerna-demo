import { DocumentType } from '../types';
import { getDocumentTypeOption } from '../constants';

/**
 * 验证证件号码
 * @param type 证件类型
 * @param value 证件号码
 * @returns 是否有效
 */
export function validateDocument(type: DocumentType, value: string): boolean {
  if (!value || !value.trim()) return false;

  const typeOption = getDocumentTypeOption(type);
  if (!typeOption?.pattern) return true;

  return typeOption.pattern.test(value.trim());
}

/**
 * 解析证件信息
 * @param type 证件类型
 * @param value 证件号码
 * @returns 解析后的信息
 */
export function parseDocumentInfo(type: DocumentType, value: string): any {
  if (!value || !value.trim()) return null;

  switch (type) {
    case DocumentType.ID_CARD:
      return parseIdCardInfo(value.trim());
    case DocumentType.PASSPORT:
      return parsePassportInfo(value.trim());
    case DocumentType.HK_MACAO_TAIWAN:
      return parseHkMacaoTaiwanInfo(value.trim());
    default:
      return null;
  }
}

/**
 * 解析身份证信息
 * @param idCard 身份证号码
 * @returns 身份证信息
 */
function parseIdCardInfo(idCard: string) {
  if (!validateIdCard(idCard)) return null;

  try {
    // 地区码（前6位）
    const regionCode = idCard.substring(0, 6);
    
    // 出生日期
    const year = idCard.substring(6, 10);
    const month = idCard.substring(10, 12);
    const day = idCard.substring(12, 14);
    const birthDate = `${year}-${month}-${day}`;
    
    // 计算年龄
    const birthYear = parseInt(year);
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    // 性别（倒数第二位，奇数为男，偶数为女）
    const genderCode = parseInt(idCard.charAt(idCard.length - 2));
    const gender = genderCode % 2 === 1 ? '男' : '女';
    
    return {
      region: getRegionName(regionCode),
      birthDate,
      age,
      gender
    };
  } catch (error) {
    return null;
  }
}

/**
 * 解析护照信息
 * @param passport 护照号码
 * @returns 护照信息
 */
function parsePassportInfo(passport: string) {
  // 护照号码通常不包含可解析的个人信息
  return {
    type: '护照',
    number: passport
  };
}

/**
 * 解析港澳台通行证信息
 * @param permit 通行证号码
 * @returns 通行证信息
 */
function parseHkMacaoTaiwanInfo(permit: string) {
  // 港澳台通行证号码通常不包含可解析的个人信息
  return {
    type: '港澳台通行证',
    number: permit
  };
}

/**
 * 验证身份证号码
 * @param idCard 身份证号码
 * @returns 是否有效
 */
function validateIdCard(idCard: string): boolean {
  // 基本格式验证
  if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard)) {
    return false;
  }

  // 校验码验证（18位身份证）
  if (idCard.length === 18) {
    return validateIdCardChecksum(idCard);
  }

  return true;
}

/**
 * 验证身份证校验码
 * @param idCard 18位身份证号码
 * @returns 校验码是否正确
 */
function validateIdCardChecksum(idCard: string): boolean {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checksums = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard.charAt(i)) * weights[i];
  }
  
  const expectedChecksum = checksums[sum % 11];
  const actualChecksum = idCard.charAt(17).toUpperCase();
  
  return expectedChecksum === actualChecksum;
}

/**
 * 根据地区码获取地区名称（简化版本）
 * @param regionCode 地区码
 * @returns 地区名称
 */
function getRegionName(regionCode: string): string {
  // 这里可以根据需要扩展完整的地区码映射表
  const regionMap: Record<string, string> = {
    '110000': '北京市',
    '120000': '天津市',
    '130000': '河北省',
    '140000': '山西省',
    '150000': '内蒙古自治区',
    '210000': '辽宁省',
    '220000': '吉林省',
    '230000': '黑龙江省',
    '310000': '上海市',
    '320000': '江苏省',
    '330000': '浙江省',
    '340000': '安徽省',
    '350000': '福建省',
    '360000': '江西省',
    '370000': '山东省',
    '410000': '河南省',
    '420000': '湖北省',
    '430000': '湖南省',
    '440000': '广东省',
    '450000': '广西壮族自治区',
    '460000': '海南省',
    '500000': '重庆市',
    '510000': '四川省',
    '520000': '贵州省',
    '530000': '云南省',
    '540000': '西藏自治区',
    '610000': '陕西省',
    '620000': '甘肃省',
    '630000': '青海省',
    '640000': '宁夏回族自治区',
    '650000': '新疆维吾尔自治区'
  };

  // 先尝试完整匹配，再尝试省级匹配
  const provinceCode = regionCode.substring(0, 2) + '0000';
  return regionMap[regionCode] || regionMap[provinceCode] || '未知地区';
}