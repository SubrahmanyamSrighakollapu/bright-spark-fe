import { APP_CONFIG } from '@/config';
import { ApiResponse } from '@/types/common';

export type CategoryPricingMode = 'BOTH' | 'PRESET_ONLY' | 'MANUAL_ONLY';

export interface ServiceProductItem {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  badge?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceCategoryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  iconName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  pricingMode?: CategoryPricingMode;
  products: ServiceProductItem[];
}

const STORAGE_KEY = 'qin_star_pay_service_categories_v2';

export const INITIAL_SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  {
    id: 'cat_grocery',
    code: 'GROCERY',
    name: 'Grocery Application',
    description: 'Grocery stores, supermarkets, daily provisions and wholesale store packages',
    iconName: 'ShoppingBag',
    status: 'ACTIVE',
    pricingMode: 'BOTH',
    products: [
      {
        id: 'prod_groc_1',
        code: 'GROC_200',
        name: 'Grocery Quick Voucher',
        description: 'Quick voucher for daily essentials and counter items',
        price: 200,
        badge: 'Quick Pay',
        status: 'ACTIVE',
      },
      {
        id: 'prod_groc_2',
        code: 'GROC_500',
        name: 'Provisions Basket Pack',
        description: 'Basic food staples, cooking oils and kitchen provisions',
        price: 500,
        badge: 'Essential',
        status: 'ACTIVE',
      },
      {
        id: 'prod_groc_3',
        code: 'GROC_2000',
        name: 'Family Monthly Provisions',
        description: 'Full monthly household grocery and provisions package',
        price: 2000,
        badge: 'Popular',
        status: 'ACTIVE',
      },
      {
        id: 'prod_groc_4',
        code: 'GROC_5000',
        name: 'Supermarket Mega Voucher',
        description: 'Hypermarket and store-wide shopping voucher',
        price: 5000,
        badge: 'Best Value',
        status: 'ACTIVE',
      },
      {
        id: 'prod_groc_5',
        code: 'GROC_10000',
        name: 'Wholesale Store Bundle',
        description: 'Bulk store provision and wholesale merchant package',
        price: 10000,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'cat_tourism',
    code: 'TOURISM',
    name: 'Tourism & Travel',
    description: 'Travel vouchers, tour packages, hotel stays and flight passes',
    iconName: 'Plane',
    status: 'ACTIVE',
    pricingMode: 'PRESET_ONLY',
    products: [
      {
        id: 'prod_tour_1',
        code: 'TOUR_1000',
        name: 'City Sightseeing Pass',
        description: 'Single-day local attraction and tour voucher',
        price: 1000,
        status: 'ACTIVE',
      },
      {
        id: 'prod_tour_2',
        code: 'TOUR_2500',
        name: 'Weekend Getaway Voucher',
        description: '2-day weekend stay & dining travel package',
        price: 2500,
        badge: 'Popular',
        status: 'ACTIVE',
      },
      {
        id: 'prod_tour_3',
        code: 'TOUR_5000',
        name: 'Domestic Flight Voucher',
        description: 'Airlines and rail domestic travel voucher',
        price: 5000,
        status: 'ACTIVE',
      },
      {
        id: 'prod_tour_4',
        code: 'TOUR_10000',
        name: 'Resort Vacation Package',
        description: 'Resort accommodation, spa & dining package',
        price: 10000,
        badge: 'Best Value',
        status: 'ACTIVE',
      },
      {
        id: 'prod_tour_5',
        code: 'TOUR_25000',
        name: 'International Tour Pass',
        description: 'All-inclusive international holiday voucher',
        price: 25000,
        badge: 'Premium',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'cat_fashion',
    code: 'FASHION',
    name: 'Fashion & Apparel',
    description: 'Clothing brands, footwear, accessories and boutique shopping passes',
    iconName: 'Shirt',
    status: 'ACTIVE',
    pricingMode: 'MANUAL_ONLY',
    products: [
      {
        id: 'prod_fash_1',
        code: 'FASH_500',
        name: 'Apparel Discount Coupon',
        description: 'Brand store accessories & apparel coupon',
        price: 500,
        status: 'ACTIVE',
      },
      {
        id: 'prod_fash_2',
        code: 'FASH_1500',
        name: 'Wardrobe Essentials Pack',
        description: 'Clothing & footwear retail shopping pass',
        price: 1500,
        badge: 'Popular',
        status: 'ACTIVE',
      },
      {
        id: 'prod_fash_3',
        code: 'FASH_3000',
        name: 'Designer Fashion Voucher',
        description: 'Boutique & designer wear shopping voucher',
        price: 3000,
        status: 'ACTIVE',
      },
      {
        id: 'prod_fash_4',
        code: 'FASH_7500',
        name: 'Luxury Brand Voucher',
        description: 'Exclusive luxury store fashion package',
        price: 7500,
        badge: 'Best Value',
        status: 'ACTIVE',
      },
      {
        id: 'prod_fash_5',
        code: 'FASH_12000',
        name: 'Festive Season Shopping Pass',
        description: 'Festive season family apparel shopping voucher',
        price: 12000,
        badge: 'Festive Special',
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'cat_upi_payin',
    code: 'UPI_COLLECTION',
    name: 'UPI Pay-In Collection',
    description: 'Collect digital payments via customer UPI apps, QR codes and store terminals',
    iconName: 'QrCode',
    status: 'ACTIVE',
    products: [
      {
        id: 'prod_upi_1',
        code: 'UPI_100',
        name: 'Counter Micro Payment',
        description: 'Instant QR micro-payment collection',
        price: 100,
        status: 'ACTIVE',
      },
      {
        id: 'prod_upi_2',
        code: 'UPI_500',
        name: 'Standard Store Collection',
        description: 'Walk-in customer payment collection',
        price: 500,
        badge: 'Popular',
        status: 'ACTIVE',
      },
      {
        id: 'prod_upi_3',
        code: 'UPI_1000',
        name: 'Retail Counter Pay-In',
        description: 'Over-the-counter store payment collection',
        price: 1000,
        badge: 'Standard',
        status: 'ACTIVE',
      },
      {
        id: 'prod_upi_4',
        code: 'UPI_2500',
        name: 'Bulk Store Pay-In',
        description: 'Multi-item retail checkout collection',
        price: 2500,
        badge: 'Best Value',
        status: 'ACTIVE',
      },
      {
        id: 'prod_upi_5',
        code: 'UPI_5000',
        name: 'Commercial Pay-In Pack',
        description: 'Wholesale merchant payment settlement',
        price: 5000,
        status: 'ACTIVE',
      },
    ],
  },
  {
    id: 'cat_bill_payment',
    code: 'BILL_PAYMENT',
    name: 'Bill Payments & Utilities',
    description: 'Utility bills, mobile recharges, electricity tokens, and municipal taxes',
    iconName: 'Receipt',
    status: 'ACTIVE',
    products: [
      {
        id: 'prod_bill_1',
        code: 'BILL_299',
        name: 'Mobile Prepaid Unlimited Pack',
        description: 'Monthly cellular talk & high-speed data recharge token',
        price: 299,
        badge: 'Popular',
        status: 'ACTIVE',
      },
      {
        id: 'prod_bill_2',
        code: 'BILL_599',
        name: 'DTH Entertainment Subscription',
        description: '3-Month DTH television subscription voucher',
        price: 599,
        status: 'ACTIVE',
      },
      {
        id: 'prod_bill_3',
        code: 'BILL_1200',
        name: 'Water Utility Token',
        description: 'Municipal water utility bill payment token',
        price: 1200,
        status: 'ACTIVE',
      },
      {
        id: 'prod_bill_4',
        code: 'BILL_2000',
        name: 'Electricity Grid Bill Token',
        description: 'State electricity power grid bill payment voucher',
        price: 2000,
        badge: 'Best Value',
        status: 'ACTIVE',
      },
      {
        id: 'prod_bill_5',
        code: 'BILL_4500',
        name: 'Municipal Property Tax Pass',
        description: 'City municipal civic property tax collection token',
        price: 4500,
        status: 'ACTIVE',
      },
    ],
  },
];

function loadFromStorage(): ServiceCategoryItem[] {
  if (typeof window === 'undefined') return INITIAL_SERVICE_CATEGORIES;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICE_CATEGORIES));
      return INITIAL_SERVICE_CATEGORIES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Failed to parse service categories from storage:', err);
    return INITIAL_SERVICE_CATEGORIES;
  }
}

function saveToStorage(categories: ServiceCategoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new Event('qin_service_categories_updated'));
  } catch (err) {
    console.error('Failed to save service categories to storage:', err);
  }
}

export const serviceCategoryService = {
  async getCategories(): Promise<ApiResponse<ServiceCategoryItem[]>> {
    await new Promise((res) => setTimeout(res, 50));
    const categories = loadFromStorage();
    return {
      success: true,
      data: categories,
      timestamp: new Date().toISOString(),
    };
  },

  async getActiveCategories(): Promise<ApiResponse<ServiceCategoryItem[]>> {
    await new Promise((res) => setTimeout(res, 50));
    const categories = loadFromStorage();
    const active = categories
      .filter((c) => c.status === 'ACTIVE')
      .map((c) => ({
        ...c,
        products: c.products.filter((p) => p.status === 'ACTIVE'),
      }));

    return {
      success: true,
      data: active,
      timestamp: new Date().toISOString(),
    };
  },

  async createCategory(
    data: Omit<ServiceCategoryItem, 'id' | 'products'> & { products?: Omit<ServiceProductItem, 'id'>[] }
  ): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const categories = loadFromStorage();
    const newId = `cat_${data.code.toLowerCase()}_${Date.now().toString().slice(-4)}`;

    const newCategory: ServiceCategoryItem = {
      id: newId,
      code: data.code.toUpperCase(),
      name: data.name,
      description: data.description,
      iconName: data.iconName || 'ShoppingBag',
      status: data.status || 'ACTIVE',
      pricingMode: data.pricingMode || 'BOTH',
      products: (data.products || []).map((p, idx) => ({
        id: `prod_${newId}_${idx + 1}`,
        code: p.code || `${data.code.toUpperCase()}_${p.price}`,
        name: p.name,
        description: p.description,
        price: p.price,
        badge: p.badge,
        status: p.status || 'ACTIVE',
      })),
    };

    categories.push(newCategory);
    saveToStorage(categories);

    return {
      success: true,
      data: newCategory,
      timestamp: new Date().toISOString(),
    };
  },

  async updateCategory(id: string, updates: Partial<Omit<ServiceCategoryItem, 'id' | 'products'>>): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const categories = loadFromStorage();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, data: null as any, message: 'Category not found', timestamp: new Date().toISOString() };
    }

    categories[index] = {
      ...categories[index],
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : categories[index].code,
    };
    saveToStorage(categories);

    return { success: true, data: categories[index], timestamp: new Date().toISOString() };
  },

  async toggleCategoryStatus(id: string): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 100));
    const categories = loadFromStorage();
    const category = categories.find((c) => c.id === id);
    if (!category) {
      return { success: false, data: null as any, message: 'Category not found', timestamp: new Date().toISOString() };
    }

    category.status = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    saveToStorage(categories);

    return { success: true, data: { ...category }, timestamp: new Date().toISOString() };
  },

  async addProduct(
    categoryId: string,
    productData: Omit<ServiceProductItem, 'id'>
  ): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const categories = loadFromStorage();
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return { success: false, data: null as any, message: 'Category not found', timestamp: new Date().toISOString() };
    }

    const newProdId = `prod_${categoryId.replace('cat_', '')}_${Date.now().toString().slice(-4)}`;
    const newProduct: ServiceProductItem = {
      id: newProdId,
      code: productData.code ? productData.code.toUpperCase() : `PROD_${productData.price}`,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      badge: productData.badge,
      status: productData.status || 'ACTIVE',
    };

    category.products.push(newProduct);
    saveToStorage(categories);

    return { success: true, data: { ...category }, timestamp: new Date().toISOString() };
  },

  async updateProduct(
    categoryId: string,
    productId: string,
    updates: Partial<Omit<ServiceProductItem, 'id'>>
  ): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const categories = loadFromStorage();
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return { success: false, data: null as any, message: 'Category not found', timestamp: new Date().toISOString() };
    }

    const pIdx = category.products.findIndex((p) => p.id === productId);
    if (pIdx === -1) {
      return { success: false, data: null as any, message: 'Product not found', timestamp: new Date().toISOString() };
    }

    category.products[pIdx] = {
      ...category.products[pIdx],
      ...updates,
      code: updates.code ? updates.code.toUpperCase() : category.products[pIdx].code,
    };
    saveToStorage(categories);

    return { success: true, data: { ...category }, timestamp: new Date().toISOString() };
  },

  async deleteProduct(categoryId: string, productId: string): Promise<ApiResponse<ServiceCategoryItem>> {
    await new Promise((res) => setTimeout(res, 150));
    const categories = loadFromStorage();
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      return { success: false, data: null as any, message: 'Category not found', timestamp: new Date().toISOString() };
    }

    category.products = category.products.filter((p) => p.id !== productId);
    saveToStorage(categories);

    return { success: true, data: { ...category }, timestamp: new Date().toISOString() };
  },

  async deleteCategory(categoryId: string): Promise<ApiResponse<ServiceCategoryItem[]>> {
    await new Promise((res) => setTimeout(res, 150));
    let categories = loadFromStorage();
    categories = categories.filter((c) => c.id !== categoryId);
    saveToStorage(categories);
    return { success: true, data: categories, timestamp: new Date().toISOString() };
  },

  async resetToDefaults(): Promise<ApiResponse<ServiceCategoryItem[]>> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICE_CATEGORIES));
      window.dispatchEvent(new Event('qin_service_categories_updated'));
    }
    return { success: true, data: INITIAL_SERVICE_CATEGORIES, timestamp: new Date().toISOString() };
  },
};
