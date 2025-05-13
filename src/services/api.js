import data from "@/data/data.json";

export const getCategories = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.categories);
    }, 200);
  });
};

export const getProducts = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.products);
    }, 200);
  });
};

export const getCart = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        cart: data.cart,
        totalPrice: data.cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
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
