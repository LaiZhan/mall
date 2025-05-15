import data from "@/data/data.json";

// 确保数据已正确初始化
const ensureDataIntegrity = () => {
  if (!data.cart) {
    data.cart = [];
  }

  // 确保所有商品都有quantity属性
  if (data.products) {
    data.products.forEach(product => {
      if (product.quantity === undefined) {
        product.quantity = 0;
      }
    });
  }
};

// 立即执行一次确保数据完整性
ensureDataIntegrity();

export const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.categories || []);
    }, 200);
  });
};

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 返回前添加quantity属性
      const products = data.products.map(product => ({
        ...product,
        quantity: product.quantity || 0
      }));
      resolve(products);
    }, 200);
  });
};

export const getCart = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cart: data.cart || [],
        totalPrice: (data.cart || []).reduce(
          (sum, item) => sum + item.price * (item.quantity || 0),
          0
        ),
      });
    }, 200);
  });
};

export const addToCart = (product) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingItem = data.cart.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        data.cart.push({ ...product, quantity: 1 });
      }
      resolve();
    }, 200);
  });
};

export const clearCart = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      data.cart = [];
      resolve();
    }, 200);
  });
};