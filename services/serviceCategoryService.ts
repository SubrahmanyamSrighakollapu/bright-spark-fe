import { apiClient } from './apiClient';
import type { ApiResponse } from '@/types/common';

export type CategoryPricingMode = 'BOTH' | 'PRESET_ONLY' | 'MANUAL_ONLY';
export type CatalogueStatus = 'ACTIVE' | 'INACTIVE';

export interface ServiceProductItem {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  status: CatalogueStatus;
}

export interface ServiceCategoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  status: CatalogueStatus;
  pricingMode?: CategoryPricingMode;
  products: ServiceProductItem[];
}

type CategoryInput = Omit<ServiceCategoryItem, 'id' | 'products'>;
type ProductInput = Omit<ServiceProductItem, 'id'>;

const safeRequest = async <T>(request: Promise<ApiResponse<T>>): Promise<ApiResponse<T>> => {
  try {
    return await request;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Service catalogue request failed.',
      timestamp: new Date().toISOString(),
    };
  }
};

const normaliseCode = (value: string) =>
  value.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_').replace(/^_+|_+$/g, '');

export const serviceCategoryService = {
  getCategories: () =>
    safeRequest(apiClient.get<ApiResponse<ServiceCategoryItem[]>>('/service-categories')),

  getActiveCategories: () =>
    safeRequest(apiClient.get<ApiResponse<ServiceCategoryItem[]>>('/service-categories', {
      params: { activeOnly: true },
    })),

  createCategory: (data: CategoryInput) =>
    safeRequest(apiClient.post<ApiResponse<ServiceCategoryItem>>('/service-categories', {
      ...data,
      code: normaliseCode(data.code),
    })),

  updateCategory: (id: string, data: CategoryInput) =>
    safeRequest(apiClient.put<ApiResponse<ServiceCategoryItem>>(`/service-categories/${id}`, {
      ...data,
      code: normaliseCode(data.code),
    })),

  setCategoryStatus: (id: string, status: CatalogueStatus) =>
    safeRequest(apiClient.patch<ApiResponse<ServiceCategoryItem>>(`/service-categories/${id}/status`, { status })),

  deleteCategory: (id: string) =>
    safeRequest(apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/service-categories/${id}`)),

  addProduct: (categoryId: string, data: ProductInput) =>
    safeRequest(apiClient.post<ApiResponse<ServiceCategoryItem>>(`/service-categories/${categoryId}/products`, {
      ...data,
      code: normaliseCode(data.code),
    })),

  updateProduct: (categoryId: string, productId: string, data: ProductInput) =>
    safeRequest(apiClient.put<ApiResponse<ServiceCategoryItem>>(
      `/service-categories/${categoryId}/products/${productId}`,
      { ...data, code: normaliseCode(data.code) }
    )),

  setProductStatus: (categoryId: string, productId: string, status: CatalogueStatus) =>
    safeRequest(apiClient.patch<ApiResponse<ServiceCategoryItem>>(
      `/service-categories/${categoryId}/products/${productId}/status`,
      { status }
    )),

  deleteProduct: (categoryId: string, productId: string) =>
    safeRequest(apiClient.delete<ApiResponse<ServiceCategoryItem>>(
      `/service-categories/${categoryId}/products/${productId}`
    )),
};
