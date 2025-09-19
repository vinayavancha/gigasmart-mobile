export interface Contractor {
  contractorId: number;
  contractorName: string;
  contactPhone: string;
  createdDate: string;
  createdBy: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface UpdateDeviceStatusRequest {
  serialNumber: string;
  newStatus: string;
}

export interface GetDevicesRequest {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface Device {
  serialNumber: string;
  status: string;
  assignedDate?: string; // nullable DateTime
  isReturned: boolean;
}

export interface PagedResultResponse<T> {
  totalCount: number;
  items: T[];
}

export interface UpdateDeviceStatusResponse {
  Message: string;
}
export interface DeviceStatusResponse {
  serialNumber: string;
  status: string;
}
export type ContractorTrend = {
  month: string;
  assignedCount: number;
  installedCount: number;
  activatedCount: number;
};

export type ContractorDashboard = {
  total: number;
  pendingInstall: number;
  installed: number;
  activated: number;
  monthlyTrends: ContractorTrend[];
};
