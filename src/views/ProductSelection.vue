<template>
  <div class="product-selection">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <van-search v-model="searchQuery" placeholder="搜索商品" @clear="resetSearch" />
    </div>

    <!-- 分类导航和商品列表 -->
    <div class="content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <van-sidebar v-model="activeCategory">
          <van-sidebar-item v-for="(category, index) in filteredCategories" :key="index" :title="category" />
        </van-sidebar>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-list">
        <div class="products">
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
            @add-to-cart="handleAddToCart" @increase-quantity="increaseQuantity"
            @decrease-quantity="decreaseQuantity" />
        </div>
      </div>
    </div>

    <!-- 底部购物车结算按钮 -->
    <div class="cart-bar">
      <div class="cart-info" @click="showCart = true">
        <van-icon name="shopping-cart" />
        <span>¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="danger" @click="showOrderSummary = true">
        去结算({{ cart.length }})
      </van-button>
    </div>

    <!-- 购物车弹出层 -->
    <van-popup v-model:show="showCart" position="bottom" class="cart-popup">
      <div class="cart-popup-header">
        <h3>购物车</h3>
        <van-icon name="close" @click="showCart = false" />
      </div>
      <div class="cart-popup-content">
        <div v-if="cart.length === 0" class="empty-cart">
          <p>购物车为空</p>
        </div>
        <div v-else>
          <div v-for="item in cart" :key="item.id" class="cart-item">
            <img :src="item.image" alt="商品图片" class="cart-item-image" />
            <div class="cart-item-info">
              <p class="cart-item-name">{{ item.name }}</p>
              <p class="cart-item-price">¥{{ item.price }} × {{ item.quantity }}</p>
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 订单弹出层 -->
    <van-dialog v-model:show="showOrderSummary" title="订单详情" show-cancel-button @cancel="showOrderSummary = false">
      <div class="order-summary">
        <div v-for="item in cart" :key="item.id" class="order-item">
          <div class="order-item-header">
            <img :src="item.image" alt="商品图片" class="order-item-image" />
            <div class="order-item-info">
              <p class="order-item-name">{{ item.name }}</p>
              <p class="order-item-price">¥{{ item.price }}</p>
            </div>
          </div>
          <div class="order-item-footer">
            <p>数量: {{ item.quantity }}</p>
            <p>小计: ¥{{ (item.price * item.quantity).toFixed(2) }}</p>
          </div>
        </div>
        <div class="order-total">
          <p>总价: <span>¥{{ totalPrice.toFixed(2) }}</span></p>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { getCategories, getProducts, getCart, addToCart, clearCart } from '@/services/api';
import ProductCard from '@/components/ProductCard.vue';

export default {
  name: 'ProductSelectionPage',
  components: { ProductCard },
  setup() {
    const searchQuery = ref('');
    const activeCategory = ref(0); // 当前选中的分类索引
    const categories = ref([]);
    const products = ref([]);
    const cart = ref([]);
    const showCart = ref(false); // 控制购物车弹出层的显示
    const showOrderSummary = ref(false); // 控制订单弹出层的显示

    // 筛选分类列表
    const filteredCategories = computed(() => {
      if (!searchQuery.value) {
        return categories.value; // 显示所有分类
      }
      // 筛选出包含搜索内容的分类
      const matchingCategories = new Set(
        products.value
          .filter((product) => product.name.includes(searchQuery.value))
          .map((product) => product.category)
      );
      return categories.value.filter((category) => matchingCategories.has(category));
    });

    // 筛选商品列表
    const filteredProducts = computed(() => {
      const currentCategory = filteredCategories.value[activeCategory.value];
      return products.value.filter((product) => {
        const matchesCategory = product.category === currentCategory;
        const matchesSearchQuery = !searchQuery.value || product.name.includes(searchQuery.value);
        return matchesCategory && matchesSearchQuery;
      });
    });

    // 重置搜索框
    const resetSearch = () => {
      searchQuery.value = '';
      activeCategory.value = 0; // 重置为第一个分类
    };

    // 监听分类变化，确保选中第一个分类时更新商品
    watch(filteredCategories, (newCategories) => {
      if (newCategories.length > 0) {
        activeCategory.value = 0; // 默认选中第一个分类
      }
    });

    // 获取分类数据
    const fetchCategories = async () => {
      categories.value = await getCategories();
    };

    // 获取商品数据
    const fetchProducts = async () => {
      products.value = await getProducts();
    };

    // 获取购物车数据
    const fetchCart = async () => {
      const cartData = await getCart();
      cart.value = cartData.cart;
    };

    const handleAddToCart = (product) => {
      product.quantity = 1; // 设置初始数量为 1
      cart.value.push(product);
    };

    const increaseQuantity = (product) => {
      product.quantity += 1;
    };

    const decreaseQuantity = (product) => {
      if (product.quantity > 0) {
        product.quantity -= 1;
        if (product.quantity === 0) {
          // 从购物车中移除商品
          cart.value = cart.value.filter((item) => item.id !== product.id);
        }
      }
    };

    // 结算购物车
    const handleCheckout = async () => {
      console.log('结算商品:', cart.value);
      await clearCart();
      cart.value = [];
    };

    // 页面加载时获取数据
    onMounted(() => {
      fetchCategories();
      fetchProducts();
      fetchCart();
    });

    // 计算购物车总价
    const totalPrice = computed(() =>
      cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
    );

    return {
      searchQuery,
      activeCategory,
      categories,
      products,
      cart,
      filteredCategories,
      filteredProducts,
      totalPrice,
      handleAddToCart,
      increaseQuantity,
      decreaseQuantity,
      handleCheckout,
      resetSearch,
      showCart,
      showOrderSummary
    };
  },
};
</script>

<style>
.product-selection {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  padding: 8px;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.category-nav {
  width: 25%;
  background-color: #fff;
  border-right: 1px solid #eaeaea;
  overflow-y: auto;
}

.product-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.products {
  display: flex;
  flex-direction: column;
}

.cart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
  color: black;
  z-index: 10;
  /* 确保 cart-bar 在弹出层之上 */
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.cart-info van-icon {
  font-size: 20px;
  color: #f56c6c;
}

.cart-popup {
  padding: 16px;
  margin-bottom: 56px;
  color: black;
  /* 留出 cart-bar 的高度 */
}

.cart-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cart-popup-content {
  max-height: calc(50vh - 56px);
  /* 减去 cart-bar 的高度 */
  overflow-y: auto;
}

.cart-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.cart-item-image {
  width: 50px;
  height: 50px;
  margin-right: 16px;
  border-radius: 4px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 14px;
  font-weight: bold;
}

.cart-item-price {
  font-size: 12px;
  color: #888;
}

.empty-cart {
  text-align: center;
  color: #888;
}

.van-sidebar {
  width: 100%;
}
</style>
<style>
.order-summary {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.order-item {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.order-item-image {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  border-radius: 4px;
  object-fit: cover;
}

.order-item-info {
  flex: 1;
}

.order-item-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.order-item-price {
  font-size: 12px;
  color: #888;
  margin: 4px 0 0;
}

.order-item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.order-total {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eaeaea;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.order-total span {
  color: #f56c6c;
}
</style>