import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Product } from '../types/product';
import { DEFAULT_PRODUCTS } from '../constants/storeConfig';

export type InfoModalType = 'terms' | 'privacy' | null;

interface OrderModalState {
  isOpen: boolean;
  product: Product | null;
  initialPackageIndex: number;
}

interface StoreContextValue {
  products: Product[];
  refreshProducts: () => Promise<void>;
  orderModal: OrderModalState;
  openOrderModal: (product: Product, packageIndex?: number) => void;
  closeOrderModal: () => void;
  infoModalType: InfoModalType;
  openInfoModal: (type: Exclude<InfoModalType, null>) => void;
  closeInfoModal: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [orderModal, setOrderModal] = useState<OrderModalState>({
    isOpen: false,
    product: null,
    initialPackageIndex: 0,
  });
  const [infoModalType, setInfoModalType] = useState<InfoModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const data = (await res.json()) as { success?: boolean; products?: Product[] };
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch {
      // Fallback smoothly to DEFAULT_PRODUCTS
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  const openOrderModal = useCallback((product: Product, packageIndex = 0) => {
    setOrderModal({
      isOpen: true,
      product,
      initialPackageIndex: packageIndex,
    });
  }, []);

  const closeOrderModal = useCallback(() => {
    setOrderModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openInfoModal = useCallback((type: Exclude<InfoModalType, null>) => {
    setInfoModalType(type);
  }, []);

  const closeInfoModal = useCallback(() => {
    setInfoModalType(null);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        products,
        refreshProducts,
        orderModal,
        openOrderModal,
        closeOrderModal,
        infoModalType,
        openInfoModal,
        closeInfoModal,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
