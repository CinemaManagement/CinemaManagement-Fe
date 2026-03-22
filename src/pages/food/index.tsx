import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Info, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import type { Food } from "@/types/document";
import { foodApi } from "@/services/api/foodApi";
import { cartApi } from "@/services/api/cartApi";

interface PopulatedCartItem {
  foodId: Food;
  quantity: number;
}

interface PopulatedCart {
  _id: string;
  userId: string;
  items: PopulatedCartItem[];
}

const FoodMenu = () => {
  const navigate = useNavigate();
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<PopulatedCart | null>(null);

  const [activeTab, setActiveTab] = useState<"menu" | "cart">("menu");

  const fetchCart = async () => {
    try {
      const response = await cartApi.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    }
  };

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setIsLoading(true);
        const response = await foodApi.getFoods();
        const data = response.data?.data ?? response.data;
        const nextFoods = Array.isArray(data) ? data : [];
        setFoods(nextFoods);
        if (nextFoods.length > 0) {
          setSelectedId(nextFoods[0]._id);
        }
      } catch {
        toast.error("Failed to fetch food menu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoods();
    fetchCart();
  }, []);

  const selectedFood = useMemo(
    () => foods.find((item) => item._id === selectedId) ?? null,
    [foods, selectedId],
  );

  useEffect(() => {
    if (selectedId) {
      setQuantity(1);
    }
  }, [selectedId]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const handleAddToCart = async () => {
    if (!selectedFood) return;
    try {
      await cartApi.addToCart({ foodId: selectedFood._id, quantity });
      toast.success("Added to cart.");
      fetchCart();
    } catch {
      toast.error("Failed to add to cart.");
    }
  };

  const handleUpdateQuantity = async (foodId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await cartApi.removeFromCart(foodId);
      } else {
        await cartApi.updateCart({ foodId, quantity: newQuantity });
      }
      fetchCart();
    } catch {
      toast.error("Failed to update cart.");
    }
  };

  const handleRemoveFromCart = async (foodId: string) => {
    try {
      await cartApi.removeFromCart(foodId);
      toast.success("Item removed.");
      fetchCart();
    } catch {
      toast.error("Failed to remove item.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-20 bg-background">
        <div className="h-10 w-10 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const cartTotal = cart?.items.reduce((acc, item) => acc + (item.foodId?.price || 0) * item.quantity, 0) || 0;

  return (
    <div className="min-h-screen pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-4 glass-card rounded-2xl text-white/40 hover:text-primary transition-all shadow-inner-glossy hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Food & Drinks</h1>
            <p className="text-sm text-primary font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
              Freshly Prepared <span className="w-1.5 h-1.5 bg-primary/40 rounded-full" /> CineLux Menu
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/10 shadow-inner-glossy">
          <button
            type="button"
            onClick={() => setActiveTab("menu")}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${
              activeTab === "menu"
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Menu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cart")}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all relative ${
              activeTab === "cart"
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "text-white/40 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest">Your Cart</span>
              {cart && cart.items.length > 0 && (
                <span className={`flex items-center justify-center min-w-[1.25rem] h-5 rounded-full text-[10px] font-black px-1 ${
                  activeTab === "cart" ? "bg-white text-primary" : "bg-primary text-white"
                }`}>
                  {cart.items.length}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-16">
          {activeTab === "menu" ? (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {foods.map((item) => {
                  const isActive = item._id === selectedId;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setSelectedId(item._id)}
                      className={`glass-card rounded-[2.5rem] p-8 flex gap-6 items-center group transition-all shadow-inner-glossy border ${
                        isActive ? "border-primary/50" : "border-white/5 hover:border-primary/30"
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-inner-glossy shrink-0 bg-white/5 flex items-center justify-center text-white/70 text-xs font-black uppercase tracking-widest">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span>{item.name.slice(0, 2)}</span>
                        )}
                      </div>
                      <div className="text-left space-y-3 flex-1">
                        <div className="space-y-1">
                          <h3 className="text-lg font-black text-white uppercase tracking-tight">{item.name}</h3>
                          <p className="text-xs text-white/40 font-medium line-clamp-2">{item.description || "No description available."}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-primary">{formatPrice(item.price)}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.type}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {foods.length === 0 && (
                <div className="p-10 glass-card rounded-[2.5rem] border border-dashed border-white/10 text-center text-white/60">
                  No food items available at the moment.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  Your Cart
                </h2>
                {cart && cart.items.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-white/40 uppercase tracking-widest">Subtotal</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(cartTotal)}</span>
                  </div>
                )}
              </div>

              {(!cart || cart.items.length === 0) && (
                <div className="p-20 glass-card rounded-[3rem] border border-dashed border-white/10 text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    <ShoppingBag className="w-8 h-8 text-white/20" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Your cart is empty</h3>
                  <button 
                    onClick={() => setActiveTab("menu")}
                    className="text-xs font-black text-primary uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
                  >
                    Go back to Menu
                  </button>
                </div>
              )}

              {cart && cart.items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {cart.items.map((item) => (
                    <div key={item.foodId?._id} className="p-6 glass-card rounded-[2.5rem] border border-white/10 flex flex-col gap-5 group hover:border-primary/40 transition-all shadow-inner-glossy">
                      <div className="flex items-start gap-5">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0 shadow-2xl">
                          {item.foodId?.imageUrl && (
                            <img src={item.foodId.imageUrl} alt={item.foodId.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h4 className="text-base font-black text-white uppercase tracking-tight line-clamp-2 leading-tight">{item.foodId?.name}</h4>
                          <p className="text-sm text-primary font-black mt-2 tracking-wide">{formatPrice(item.foodId?.price || 0)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.foodId._id)}
                          className="p-2.5 text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0 -mt-1 -mr-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-5 border-t border-white/10">
                        <span className="text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">Quantity</span>
                        <div className="flex items-center gap-4 bg-background/50 rounded-2xl p-1.5 border border-white/5 shadow-inner-glossy">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.foodId._id, item.quantity - 1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-base font-black text-white w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item.foodId._id, item.quantity + 1)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-all font-black"
                          >
                            <Plus className="w-4 h-4" />
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

        <div className="lg:col-span-1">
          <div className="glass-card rounded-[3rem] p-10 sticky top-24 shadow-2xl shadow-inner-glossy flex flex-col gap-8">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Food Detail</h2>

            {!selectedFood && (
              <div className="text-sm text-white/60 text-center py-20 border border-dashed border-white/10 rounded-[2rem]">
                Select a menu item to view details.
              </div>
            )}

            {selectedFood && (
              <>
                <div className="w-full h-48 rounded-[2rem] overflow-hidden border border-white/10 shadow-inner-glossy bg-white/5 flex items-center justify-center text-white/70 text-sm font-black uppercase tracking-widest">
                  {selectedFood.imageUrl ? (
                    <img
                      src={selectedFood.imageUrl}
                      alt={selectedFood.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedFood.name}</span>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedFood.name}</h3>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-2">
                        {selectedFood.type}
                      </p>
                    </div>
                    <span className="text-xl font-black text-primary">{formatPrice(selectedFood.price)}</span>
                  </div>
                  <p className="text-sm text-white/50 font-medium leading-relaxed">
                    {selectedFood.description || "No description available for this item."}
                  </p>
                </div>

                {selectedFood.items && selectedFood.items.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Combo Items</p>
                    <div className="space-y-3">
                      {selectedFood.items.map((comboItem, index) => (
                        <div key={`${comboItem.name}-${index}`} className="flex items-center justify-between text-sm text-white/70 font-semibold">
                          <span>{comboItem.name}</span>
                          <span>x{comboItem.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 bg-background/50 rounded-2xl p-1 border border-white/5 shadow-inner-glossy">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-black text-white w-8 text-center">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => prev + 1)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 transition-all font-black"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 py-5 bg-primary text-primary-foreground font-black rounded-3xl hover:scale-105 transition-all btn-glossy shadow-[0_20px_40px_-10px_rgba(var(--primary),0.4)] uppercase tracking-[0.2em] text-sm"
                  >
                    Add To Cart
                  </button>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-3 items-start">
                  <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-white/40 font-medium leading-relaxed">
                    Items are saved to your personal cart. You can connect this cart to booking later.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodMenu;
