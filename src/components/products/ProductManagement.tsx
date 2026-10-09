import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Star,
  Edit2,
  Trash2,
  AlertTriangle,
  Tag,
  DollarSign,
  Barcode,
  Layers,
  CheckCircle,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { useDb } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types';

export const ProductManagement: React.FC = () => {
  const { products, saveProduct, deleteProduct, toggleFavoriteProduct, playSound } = useDb();
  const { currentUser, currentBusiness, can } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Groceries',
    unit: 'KG',
    purchasePrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    specialPrice: 0,
    stockQuantity: 0,
    minStock: 10,
    taxRate: 0,
    description: '',
    isFavorite: false,
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  const canViewCost = can('view_purchase_cost');

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `8964${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Groceries',
      unit: 'KG',
      purchasePrice: 100,
      retailPrice: 130,
      wholesalePrice: 120,
      specialPrice: 115,
      stockQuantity: 50,
      minStock: 15,
      taxRate: 0,
      description: '',
      isFavorite: false,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      category: p.category,
      unit: p.unit,
      purchasePrice: p.purchasePrice,
      retailPrice: p.retailPrice,
      wholesalePrice: p.wholesalePrice,
      specialPrice: p.specialPrice,
      stockQuantity: p.stockQuantity,
      minStock: p.minStock,
      taxRate: p.taxRate,
      description: p.description || '',
      isFavorite: !!p.isFavorite,
    });
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    playSound('success');
    saveProduct(formData, editingProduct?.id);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xs">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Product & Multi-Tier Price Catalog</h1>
            <p className="text-xs text-gray-500">
              Retail, wholesale & special pricing • Low stock alerts • Quick POS favorites
            </p>
          </div>
        </div>

        {can('manage_products') && (
          <button
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            + Add New Product
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-3xl border border-gray-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="p-3 w-10 text-center">Fav</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">SKU / Barcode</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Retail Price</th>
                <th className="p-3 text-right">Wholesale</th>
                <th className="p-3 text-right">Special</th>
                {canViewCost && <th className="p-3 text-right">Cost Price</th>}
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStock;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleFavoriteProduct(p.id)}
                          className={`p-1 rounded-lg transition ${
                            p.isFavorite
                              ? 'text-amber-500 bg-amber-50'
                              : 'text-gray-300 hover:text-amber-500'
                          }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{p.name}</div>
                        <div className="text-[11px] text-gray-400">Unit: {p.unit}</div>
                      </td>
                      <td className="p-3 font-mono text-gray-500 text-[11px]">
                        <div>{p.sku}</div>
                        <div className="text-gray-400">{p.barcode}</div>
                      </td>
                      <td className="p-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-gray-900">
                        {currentBusiness.currencySymbol}{p.retailPrice}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-blue-700">
                        {currentBusiness.currencySymbol}{p.wholesalePrice}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-purple-700">
                        {currentBusiness.currencySymbol}{p.specialPrice}
                      </td>
                      {canViewCost && (
                        <td className="p-3 text-right font-mono font-medium text-gray-500">
                          {currentBusiness.currencySymbol}{p.purchasePrice}
                        </td>
                      )}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isLow
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          {p.stockQuantity} {p.unit}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {can('manage_products') && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete product ${p.name}?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-gray-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">
                {editingProduct ? 'Edit Product Catalog' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Super Basmati Rice (Karnal)"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900"
                  >
                    <option value="KG">KG (Kilogram)</option>
                    <option value="PACK">PACK (Packet)</option>
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="L">L (Litre)</option>
                    <option value="BOX">BOX</option>
                    <option value="GM">GM (Gram)</option>
                    <option value="BTL">BTL (Bottle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono text-gray-900"
                  />
                </div>
              </div>

              {/* Multi-tier pricing fields */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                  Pricing Tiers ({currentBusiness.currencySymbol})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Retail Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.retailPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-mono font-bold text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-blue-700 mb-1">
                      Wholesale Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.wholesalePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-mono font-bold text-blue-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-purple-700 mb-1">
                      Special Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.specialPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, specialPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 text-xs font-mono font-bold text-purple-900"
                    />
                  </div>

                  {canViewCost && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        Purchase Cost
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.purchasePrice}
                        onChange={(e) =>
                          setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-mono font-bold text-gray-700"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Stock management */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({ ...formData, stockQuantity: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Min Stock (Low Stock Alert)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fav"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="fav" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Mark as Quick Tap Favorite on Smart Calculator & POS
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
