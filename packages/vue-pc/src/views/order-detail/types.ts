export interface OrderDetail {
  id: string;
  companyName: string; // 企业名称
  totalPremium: string; // 总计保费
  groupOrderStatus: string; // 团订单状态
  groupOrderNumber: string; // 团订单号
  productName: string; // 商品名称
  salesPlanCode: string; // 销售方案编码
  salesPlanStatus: string; // 销售方案状态
  insuranceDate: string; // 投保日期
  paymentMethod: string; // 缴费方式
  insurancePeriod: {
    effectiveDate: string; // 生效时间
    expiryDate: string; // 到期时间
    totalDays: number; // 总天数
  };
  creationDate: string; // 创建日期
  creditCode: string;
  industry: string;
  address: string;
  registeredArea: string;
  contactPerson: {
    name: string;
    idCard: string;
    email: string;
    phone: string;
  };
  insuranceMode: string;
  openPeriod: {
    startDate: string;
    paymentDate: string;
    effectiveDate: string;
  };
  salesPerson: {
    name: string;
    employeeId: string;
  };
  businessLicense?: {
    url: string;
    name: string;
  };
}

export interface PersonnelItem {
  id: string;
  name: string;
  idCard: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  insuranceAmount: number;
  status: 'active' | 'inactive';
}

export interface OrderDetailResponse {
  orderDetail: OrderDetail;
  personnelList?: PersonnelItem[];
}
