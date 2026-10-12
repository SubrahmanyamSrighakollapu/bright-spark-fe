'use client';

import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  serviceCategoryService,
  ServiceCategoryItem,
  ServiceProductItem,
  CategoryPricingMode,
} from '@/services/serviceCategoryService';
import { formatCurrency } from '@/utils/formatters';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Package,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useConfirmation } from '@/context/ConfirmationContext';

export default function ServiceCategoriesAdminPage() {
  const { toastSuccess, toastError } = useToast();
  const confirmAction = useConfirmation();
  const [categories, setCategories] = useState<ServiceCategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategoryItem | null>(null);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catPricingMode, setCatPricingMode] = useState<CategoryPricingMode>('BOTH');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [targetCategoryForProduct, setTargetCategoryForProduct] = useState<ServiceCategoryItem | null>(null);
  const [editingProduct, setEditingProduct] = useState<ServiceProductItem | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    const res = await serviceCategoryService.getCategories();
    if (res.success && res.data) {
      setCategories(res.data);
      if (!expandedCategoryId && res.data.length > 0) {
        setExpandedCategoryId(res.data[0].id);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void fetchCategories(), 0);
    return () => window.clearTimeout(timeoutId);
    // Initial catalogue load only; mutations refresh explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchCat =
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    const matchProd = c.products.some(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
    return matchCat || matchProd;
  });

  // Calculate Metrics
  const totalCategoriesCount = categories.length;
  const activeCategoriesCount = categories.filter((c) => c.status === 'ACTIVE').length;
  const totalProductsCount = categories.reduce((acc, c) => acc + c.products.length, 0);
  const activeProductsCount = categories.reduce(
    (acc, c) => acc + c.products.filter((p) => p.status === 'ACTIVE').length,
    0
  );

  // Category Modal Handlers
  const handleOpenCategoryModal = (cat?: ServiceCategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatCode(cat.code);
      setCatDesc(cat.description);
      setCatPricingMode(cat.pricingMode || 'BOTH');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatCode('');
      setCatDesc('');
      setCatPricingMode('BOTH');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim() || !catCode.trim()) {
      toastError('Please fill in category name and code.');
      return;
    }

    if (editingCategory) {
      const res = await serviceCategoryService.updateCategory(editingCategory.id, {
        name: catName.trim(),
        code: catCode.trim(),
        description: catDesc.trim(),
        pricingMode: catPricingMode,
        status: editingCategory.status,
      });
      if (res.success) {
        toastSuccess('Category updated successfully');
        fetchCategories();
        setIsCategoryModalOpen(false);
      } else {
        toastError(res.message || 'Failed to update category');
      }
    } else {
      const res = await serviceCategoryService.createCategory({
        name: catName.trim(),
        code: catCode.trim(),
        description: catDesc.trim(),
        status: 'ACTIVE',
        pricingMode: catPricingMode,
      });
      if (res.success) {
        toastSuccess('New Service Category created successfully');
        fetchCategories();
        setIsCategoryModalOpen(false);
      } else {
        toastError(res.message || 'Failed to create category');
      }
    }
  };

  const handleToggleCategoryStatus = async (id: string, currentStatus: string) => {
    const res = await serviceCategoryService.setCategoryStatus(
      id,
      currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    );
    if (res.success) {
      toastSuccess(`Category marked as ${currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
      fetchCategories();
    } else {
      toastError('Failed to toggle status');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!(await confirmAction({ title: 'Delete service category?', message: `Delete “${name}” and every configured product inside it? This cannot be undone.`, confirmText: 'Yes, delete category', variant: 'danger' }))) return;
    const res = await serviceCategoryService.deleteCategory(id);
    if (res.success) {
      toastSuccess(`Category "${name}" removed`);
      fetchCategories();
    } else {
      toastError('Failed to delete category');
    }
  };

  // Product Modal Handlers
  const handleOpenProductModal = (category: ServiceCategoryItem, prod?: ServiceProductItem) => {
    setTargetCategoryForProduct(category);
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdCode(prod.code);
      setProdDesc(prod.description);
      setProdPrice(prod.price.toString());
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdCode('');
      setProdDesc('');
      setProdPrice('');
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCategoryForProduct || !prodName.trim() || !prodPrice.trim()) {
      toastError('Please enter product name and a valid price.');
      return;
    }

    const priceNum = parseFloat(prodPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toastError('Please enter a valid price greater than ₹0.');
      return;
    }

    if (editingProduct) {
      const res = await serviceCategoryService.updateProduct(
        targetCategoryForProduct.id,
        editingProduct.id,
        {
          name: prodName.trim(),
          code: prodCode.trim() || `${targetCategoryForProduct.code}_${priceNum}`,
          description: prodDesc.trim(),
          price: priceNum,
          status: editingProduct.status,
        }
      );
      if (res.success) {
        toastSuccess('Product details updated successfully');
        fetchCategories();
        setIsProductModalOpen(false);
      } else {
        toastError(res.message || 'Failed to update product');
      }
    } else {
      const res = await serviceCategoryService.addProduct(targetCategoryForProduct.id, {
        name: prodName.trim(),
        code: prodCode.trim() || `${targetCategoryForProduct.code}_${priceNum}`,
        description: prodDesc.trim(),
        price: priceNum,
        status: 'ACTIVE',
      });
      if (res.success) {
        toastSuccess('New product added to category');
        fetchCategories();
        setIsProductModalOpen(false);
      } else {
        toastError(res.message || 'Failed to add product');
      }
    }
  };

  const handleToggleProductStatus = async (catId: string, prod: ServiceProductItem) => {
    const newStatus = prod.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const res = await serviceCategoryService.setProductStatus(catId, prod.id, newStatus);
    if (res.success) {
      toastSuccess(`Product "${prod.name}" status set to ${newStatus}`);
      fetchCategories();
    } else {
      toastError('Failed to update product status');
    }
  };

  const handleDeleteProduct = async (catId: string, prodId: string) => {
    if (!(await confirmAction({ title: 'Delete product?', message: 'Delete this configured product? This cannot be undone.', confirmText: 'Yes, delete product', variant: 'danger' }))) return;
    const res = await serviceCategoryService.deleteProduct(catId, prodId);
    if (res.success) {
      toastSuccess('Product removed');
      fetchCategories();
    } else {
      toastError('Failed to remove product');
    }
  };

  return (
    <PageContainer
      title="Service Categories & Products Master"
      description="Configure Qin Star Pay application categories (Grocery, Tourism, Fashion, etc.), product details, and preset collection prices for retailer Pay-In."
    >
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Metric Summary Bar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Categories', value: totalCategoriesCount, detail: 'All configured categories', icon: Layers, tone: 'teal' },
            { label: 'Active Categories', value: activeCategoriesCount, detail: 'Available for Retailer Pay-In', icon: CheckCircle2, tone: 'emerald' },
            { label: 'Total Products', value: totalProductsCount, detail: 'All configured products', icon: Package, tone: 'blue' },
            { label: 'Active Products', value: activeProductsCount, detail: 'Selectable preset products', icon: ShoppingBag, tone: 'violet' },
          ].map((metric) => {
            const MetricIcon = metric.icon;
            const tones: Record<string, string> = {
              teal: 'border-teal-100 bg-teal-50 text-teal-700',
              emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
              blue: 'border-blue-100 bg-blue-50 text-[#155EEF]',
              violet: 'border-violet-100 bg-violet-50 text-violet-700',
            };

            return (
              <Card
                key={metric.label}
                className="relative min-h-40 overflow-hidden border border-slate-200/90 bg-white p-5 shadow-xs"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#155EEF] via-[#0F4C81] to-teal-500" />
                <div className="flex h-full items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col">
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      {metric.label}
                    </span>
                    <span className="mt-5 font-mono text-3xl font-extrabold leading-none text-slate-950">
                      {metric.value.toLocaleString('en-IN')}
                    </span>
                    <span className="mt-3 text-xs font-medium leading-5 text-slate-500">
                      {metric.detail}
                    </span>
                  </div>
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${tones[metric.tone]}`}>
                    <MetricIcon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Action Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category or product by name/code..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81] focus:ring-2 focus:ring-indigo-100 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenCategoryModal()}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-[#0F4C81] text-white font-bold text-xs"
            >
              Add Service Category
            </Button>
          </div>
        </div>

        {/* Categories Accordion / Cards List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Loading Service Categories & Product Master...
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No Matching Service Categories' : 'No Service Categories Found'}
            description={
              searchQuery
                ? 'No category or product matches your search. Clear the search and try again.'
                : 'No service categories have been configured yet. Add a category to make it available for Retailer Pay-In.'
            }
            action={
              searchQuery ? (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenCategoryModal()}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Add Service Category
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategoryId === category.id;
              const activeProdsCount = category.products.filter((p) => p.status === 'ACTIVE').length;

              return (
                <div
                  key={category.id}
                  className={`bg-white border rounded-2xl transition-all shadow-xs overflow-hidden ${
                    category.status === 'ACTIVE'
                      ? 'border-slate-200/90'
                      : 'border-slate-200/60 bg-slate-50/40 opacity-80'
                  }`}
                >
                  {/* Category Header Card */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#0F4C81] border border-indigo-200">
                            {category.code}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">{category.name}</h3>
                          <StatusBadge status={category.status} size="sm" />
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              (category.pricingMode || 'BOTH') === 'PRESET_ONLY'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : (category.pricingMode || 'BOTH') === 'MANUAL_ONLY'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}
                          >
                            {(category.pricingMode || 'BOTH') === 'PRESET_ONLY'
                              ? 'Mode: Preset Prices Only'
                              : (category.pricingMode || 'BOTH') === 'MANUAL_ONLY'
                              ? 'Mode: Manual Input Only'
                              : 'Mode: Presets + Manual'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{category.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 mr-1">
                        {activeProdsCount}/{category.products.length} Products
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleCategoryStatus(category.id, category.status)}
                        className={`text-xs px-2.5 py-1 ${
                          category.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {category.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCategoryModal(category)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        className="text-xs px-2.5 py-1"
                      >
                        Edit
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleOpenProductModal(category)}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                        className="bg-[#0F4C81] text-white text-xs font-bold px-3"
                      >
                        Add Product
                      </Button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedCategoryId(isExpanded ? null : category.id)
                        }
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                        title={isExpanded ? 'Collapse products' : 'Expand products'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Products Grid */}
                  {isExpanded && (
                    <div className="p-5 bg-slate-50/50 space-y-3 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-[#0F4C81]" /> Configured Products & Preset Prices for {category.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          These prices will appear in the Retailer Pay-In page under this category.
                        </span>
                      </div>

                      {category.products.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                          No products configured yet for {category.name}. Click &quot;Add Product&quot; above to create product details and prices.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {category.products.map((product) => (
                            <div
                              key={product.id}
                              className={`p-4 rounded-xl border transition-all space-y-2 bg-white ${
                                product.status === 'ACTIVE'
                                  ? 'border-slate-200 hover:border-[#0F4C81]/40 shadow-2xs'
                                  : 'border-slate-200/60 opacity-60 bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-[10px] font-mono font-bold text-slate-400 block">
                                    {product.code}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                                    {product.name}
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-extrabold font-mono text-[#0F4C81] block">
                                    {formatCurrency(product.price)}
                                  </span>
                                </div>
                              </div>

                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>

                              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                <StatusBadge status={product.status} size="sm" />

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleProductStatus(category.id, product)}
                                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                                    title={product.status === 'ACTIVE' ? 'Deactivate Product' : 'Activate Product'}
                                  >
                                    {product.status === 'ACTIVE' ? (
                                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                    ) : (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenProductModal(category, product)}
                                    className="p-1 text-slate-400 hover:text-[#0F4C81] rounded transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(category.id, product.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CREATE / EDIT CATEGORY MODAL */}
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Layers className="w-5 h-5 text-[#0F4C81]" />
              <span>{editingCategory ? 'Edit Service Category' : 'Add New Service Category'}</span>
            </div>
          }
          size="lg"
          footer={
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCategoryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="category-form"
                variant="primary"
                size="sm"
                className="bg-[#0F4C81] text-white font-bold"
              >
                {editingCategory ? 'Save Category Changes' : 'Create Category'}
              </Button>
            </>
          }
        >
          <form id="category-form" onSubmit={handleSaveCategory} className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Category Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  placeholder="e.g. GROCERY, TOURISM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:border-[#0F4C81]"
                  required
                />
              </div>

            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Category Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="e.g. Grocery Application, Tourism & Travel"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">
                Retailer Price Entry Mode <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCatPricingMode('BOTH')}
                  className={`p-2.5 rounded-xl border text-left transition-all space-y-0.5 cursor-pointer ${
                    catPricingMode === 'BOTH'
                      ? 'border-[#0F4C81] bg-indigo-50/70 ring-2 ring-indigo-100 font-bold text-[#0F4C81]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Both Allowed</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Presets & manual custom amount
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCatPricingMode('PRESET_ONLY')}
                  className={`p-2.5 rounded-xl border text-left transition-all space-y-0.5 cursor-pointer ${
                    catPricingMode === 'PRESET_ONLY'
                      ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-100 font-bold text-amber-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Preset Prices Only</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Must pick configured product
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCatPricingMode('MANUAL_ONLY')}
                  className={`p-2.5 rounded-xl border text-left transition-all space-y-0.5 cursor-pointer ${
                    catPricingMode === 'MANUAL_ONLY'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-100 font-bold text-blue-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>Manual Input Only</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Type custom amount only
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Description</label>
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Describe the application services and product categories..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
              />
            </div>
          </form>
        </Modal>

        {/* CREATE / EDIT PRODUCT MODAL */}
        {targetCategoryForProduct && (
          <Modal
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            title={
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Package className="w-5 h-5 text-[#0F4C81]" />
                <span>{editingProduct ? 'Edit Product Details' : `Add Product under ${targetCategoryForProduct.name}`}</span>
              </div>
            }
            size="lg"
            footer={
              <>
                <Button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="product-form"
                  variant="primary"
                  size="sm"
                  className="bg-[#0F4C81] text-white font-bold"
                >
                  {editingProduct ? 'Save Product Details' : 'Add Product'}
                </Button>
              </>
            }
          >
            <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Product Code <span className="text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="e.g. GROC_500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:border-[#0F4C81]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Configured Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:outline-hidden focus:border-[#0F4C81]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Provisions Basket Pack, Domestic Flight Voucher"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Product Details & Description
                </label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Provide details about what this product voucher includes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-hidden focus:border-[#0F4C81]"
                />
              </div>

            </form>
          </Modal>
        )}
      </div>
    </PageContainer>
  );
}
