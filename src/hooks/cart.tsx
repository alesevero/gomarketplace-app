import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productList = await AsyncStorage.getItem('@GoMarketplace:products');
      if (productList) {
        setProducts([...JSON.parse(productList)]);
      }
    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(
    async product => {
      const itemIndex = products.findIndex(item => item.id === product.id);
      if (itemIndex >= 0) {
        products[itemIndex].quantity += 1;
        setProducts([...products]);
      } else {
        setProducts([
          ...products,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image_url: product.image_url,
            quantity: 1,
          },
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const itemIndex = products.findIndex(item => item.id === id);
      if (itemIndex >= 0) {
        products[itemIndex].quantity += 1;
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const itemIndex = products.findIndex(item => item.id === id);
      if (itemIndex >= 0) {
        products[itemIndex].quantity -= 1;
        if (products[itemIndex].quantity === 0) {
          products.splice(itemIndex);
        }
        setProducts([...products]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
