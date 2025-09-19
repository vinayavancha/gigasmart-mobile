import client from "@/api/client";
import { request } from "@/api/request";
import {
  Contractor,
  ContractorDashboard,
  Device,
  DeviceStatusResponse,
  PagedResultResponse,
  UpdateDeviceStatusRequest,
  UpdateDeviceStatusResponse,
} from "@/dtos/contractor";

import { ApiError } from "@/types/http";
import { Result } from "@/types/result";

class ContractorDeviceService {
  getDevices(params?: {
    page?: number;
    pageSize: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Result<PagedResultResponse<Device>, ApiError>> {
    return request(() => client.get("/Contractors/me/devices", { params }));
  }

  getDeviceBySerial(
    serialNumber: string
  ): Promise<Result<DeviceStatusResponse, ApiError>> {
    return request(() => client.get(`/Contractors/me/devices/${serialNumber}`));
  }

  updateDeviceStatus(
    payload: UpdateDeviceStatusRequest
  ): Promise<Result<UpdateDeviceStatusResponse, ApiError>> {
    return request(() => client.put("/Contractors/me/devices/status", payload));
  }

  getCurrentContractor = (): Promise<Result<Contractor, ApiError>> =>
    request(() => client.get("/contractors/me"));

  getContractorDashboard = (
    contractorId: string
  ): Promise<Result<ContractorDashboard, ApiError>> =>
    request(() => client.get(`/reports/dashboard/${contractorId}`));
}

export const contractorDeviceService = new ContractorDeviceService();
