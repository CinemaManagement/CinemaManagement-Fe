import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Edit, Trash2, Package, Coffee, Search } from "lucide-react";
import { foodApi } from "@/services/api/foodApi";
import type { Food } from "@/types/document";
import { FoodType } from "@/types/document";
import toast from "react-hot-toast";

const FoodManagement = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [allSingleItems, setAllSingleItems] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<FoodType | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  const fetchFoods = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await foodApi.getFoods(filterType === "ALL" ? undefined : filterType);
      setFoods(response.data?.data || response.data || []);
    } catch {
      toast.error("Failed to fetch food menu.");
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  useEffect(() => {
    const fetchAllSingles = async () => {
      try {
        const res = await foodApi.getFoods(FoodType.SINGLE);
        setAllSingleItems(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch single items for combos:", err);
      }
    };
    fetchAllSingles();
  }, []);

  const filteredFoods = useMemo(() => {
    return foods.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [foods, searchQuery]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await foodApi.deleteFood(id, true);
      toast.success("Item deleted successfully.");
      fetchFoods();
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  const handleEdit = (food: Food) => {
    setEditingFood(food);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingFood(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-background relative min-h-screen p-8 pt-24 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Food & Drinks</h1>
            <p className="mt-1 font-medium text-white/40">
              Manage cinema snacks, drinks and combos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="text-white/20 absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search snacks..."
                className="bg-white/5 border-white/10 w-64 rounded-2xl border py-3.5 pr-4 pl-11 text-xs font-medium outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="shadow-inner-glossy flex items-center rounded-2xl border border-white/10 bg-white/5 p-1">
              {(["ALL", FoodType.SINGLE, FoodType.COMBO] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded-xl px-4 py-2 text-xs font-black uppercase transition-all ${
                    filterType === t
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={handleAddNew}
              className="bg-primary text-primary-foreground hover:shadow-primary/20 flex items-center gap-2 rounded-2xl px-6 py-3.5 font-black uppercase transition-all hover:-translate-y-1"
            >
              <Plus className="h-5 w-5" /> Add New
            </button>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {filteredFoods.length > 0 ? (
              filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="glass-card shadow-inner-glossy group flex flex-col overflow-hidden rounded-[2.5rem] border border-white/5 transition-all hover:border-white/10 hover:shadow-2xl"
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-white/5">
                    {food.imageUrl ? (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center opacity-20">
                        {food.type === FoodType.COMBO ? (
                          <Package className="h-16 w-16" />
                        ) : (
                          <Coffee className="h-16 w-16" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex translate-y-2 gap-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      <button
                        onClick={() => handleEdit(food)}
                        className="bg-secondary/80 hover:bg-secondary flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xl backdrop-blur-md transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(food._id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/80 text-white shadow-xl backdrop-blur-md transition-all hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-primary/20 text-primary border-primary/30 rounded-lg border px-3 py-1 text-[9px] font-black tracking-widest uppercase backdrop-blur-md">
                        {food.type}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 text-xl font-black tracking-tight uppercase">
                        {food.name}
                      </h3>
                      <span className="text-primary shrink-0 text-xl font-black">
                        {food.price.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-relaxed font-medium text-white/40">
                      {food.description}
                    </p>
                    {food.items && food.items.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
                        {food.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/50"
                          >
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center font-bold text-white/20 italic">
                No items found. Add some delicious snacks!
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <FoodFormModal
          food={editingFood}
          singleItems={allSingleItems}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchFoods();
          }}
        />
      )}
    </div>
  );
};

interface FoodFormModalProps {
  food: Food | null;
  singleItems: Food[];
  onClose: () => void;
  onSuccess: () => void;
}

const FoodFormModal = ({ food, singleItems, onClose, onSuccess }: FoodFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: food?.name || "",
    type: food?.type || FoodType.SINGLE,
    price: food?.price || 0,
    description: food?.description || "",
    imageUrl: food?.imageUrl || "",
    items: food?.items || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const dataToSubmit = {
        ...formData,
        items: formData.type === FoodType.COMBO ? formData.items : [],
      };

      if (food) {
        await foodApi.updateFood(food._id, dataToSubmit);
        toast.success("Updated successfully!");
      } else {
        await foodApi.createFood(dataToSubmit);
        toast.success("Created successfully!");
      }
      onSuccess();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { foodId: "", name: "", quantity: 1 }],
    }));
  };

  const removeItem = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const updateItem = (idx: number, foodId: string) => {
    const selectedFood = singleItems.find((f) => f._id === foodId);
    if (!selectedFood) return;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, foodId, name: selectedFood.name } : it)),
    }));
  };

  const updateQuantity = (idx: number, quantity: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, quantity } : it)),
    }));
  };

  const labelCls = "block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 pl-1";
  const inputCls =
    "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="glass-card shadow-inner-glossy relative h-full max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[3rem] border border-white/10 bg-[#0A0A0A] p-8 md:p-12">
        <h2 className="mb-8 text-3xl font-black tracking-tight uppercase">
          {food ? "Edit Item" : "New Food/Combo"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelCls}>Name</label>
              <input
                type="text"
                className={inputCls}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Popcorn Large"
              />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select
                className={inputCls}
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as FoodType })}
              >
                <option value={FoodType.SINGLE}>Single Item</option>
                <option value={FoodType.COMBO}>Combo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelCls}>Price (VNĐ)</label>
              <input
                type="number"
                className={inputCls}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Image URL</label>
              <input
                type="text"
                className={inputCls}
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea
              className={`${inputCls} min-h-[100px] resize-none`}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="A large bucket of salty popcorn..."
            />
          </div>

          {formData.type === FoodType.COMBO && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="mb-4 flex items-center justify-between">
                <label className={labelCls + " mb-0"}>Items Included</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-primary flex items-center gap-1.5 text-[10px] font-black tracking-wider uppercase hover:opacity-80"
                >
                  <Plus className="h-4 w-4" /> Add Item
                </button>
              </div>
              <div className="space-y-4">
                {formData.items.map((item, idx) => {
                  const selectedFood = singleItems.find((f) => f._id === item.foodId);
                  return (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white/5 shadow-inner-glossy flex items-center justify-center">
                        {selectedFood?.imageUrl ? (
                          <img
                            src={selectedFood.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="opacity-20">
                            <Coffee className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <select
                        className={`${inputCls} flex-1 min-w-0`}
                        value={item.foodId}
                        onChange={(e) => updateItem(idx, e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Select an item
                        </option>
                        {singleItems.map((f) => (
                          <option key={f._id} value={f._id} className="bg-[#0A0A0A]">
                            {f.name} - {f.price.toLocaleString()}đ
                          </option>
                        ))}
                      </select>

                      <div className="w-16 shrink-0">
                        <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-2 py-3.5 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-center"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(idx, Number(e.target.value))}
                          min="1"
                          required
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-red-500 transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-xs font-black tracking-widest text-white/40 uppercase hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground min-w-[160px] rounded-2xl py-4 text-xs font-black tracking-widest uppercase transition-all hover:scale-105 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodManagement;
