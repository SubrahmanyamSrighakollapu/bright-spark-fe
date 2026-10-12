import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/common';

export type ConfigurationResource = 'gateways' | 'methods' | 'options' | 'mappings' | 'plans' | 'plan-configurations' | 'commissions';
type ConfigurationResponse<T> = Omit<ApiResponse<T>, 'data'> & { data: T };
const requireData = <T>(response: ApiResponse<T>): ConfigurationResponse<T> => {
  if (response.data == null) throw new Error(response.message || 'Configuration API returned no data.');
  return response as ConfigurationResponse<T>;
};
export const configurationService = {
  paymentRoutingOptions: async <T>() => requireData(await apiClient.get<ApiResponse<T>>('/configuration/payment-routing-options')),
  list: async <T>(resource: ConfigurationResource) => requireData(await apiClient.get<ApiResponse<T[]>>(`/configuration/${resource}`)),
  create: async <T>(resource: ConfigurationResource, input: unknown) => requireData(await apiClient.post<ApiResponse<T>>(`/configuration/${resource}`, input)),
  update: async <T>(resource: ConfigurationResource, id: string, input: unknown) => requireData(await apiClient.put<ApiResponse<T>>(`/configuration/${resource}/${id}`, input)),
  remove: (resource: ConfigurationResource, id: string) => apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/configuration/${resource}/${id}`),
};
