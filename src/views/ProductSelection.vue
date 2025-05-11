<template>
  <div class="product-selection">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <van-search v-model="searchQuery" placeholder="搜索商品" />
    </div>

    <!-- 分类导航和商品列表 -->
    <div class="content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <van-sidebar v-model="activeCategory">
          <van-sidebar-item
            v-for="(category, index) in categories"
            :key="index"
            :title="category"
          />
        </van-sidebar>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-list">
        <div class="products">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>
    </div>

    <!-- 底部购物车结算按钮 -->
    <div class="cart-bar">
      <div class="cart-info">
        <van-icon name="shopping-cart" />
        <span>¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="danger" @click="handleCheckout">
        去结算({{ cart.length }})
      </van-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { getCategories, getProducts, getCart, addToCart, clearCart } from '@/services/api';
import ProductCard from '@/components/ProductCard.vue';

export default {
  name: 'ProductSelectionPage',
  components: { ProductCard },
  setup() {
    const searchQuery = ref('');
    const activeCategory = ref(0);
    const categories = ref([]);
    const products = ref([]);
    const cart = ref([]);

    // 筛选商品列表
    const filteredProducts = computed(() =>
      products.value.filter((product) =>
        product.name.includes(searchQuery.value)
      )
    );

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

    // 添加商品到购物车
    const handleAddToCart = async (product) => {
      await addToCart(product);
      await fetchCart();
    };

    // 结算购物车
    const handleCheckout = async () => {
      console.log('结算商品:', cart.value);
      await clearCart();
      await fetchCart();
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
      filteredProducts,
      totalPrice,
      handleAddToCart,
      handleCheckout,
    };
  },
};
</script>

<style>
.product-selection {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 设置页面高度为视口高度 */
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
  overflow-y: auto; /* 左侧分类导航支持垂直滚动 */
}

.product-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto; /* 右侧商品列表支持垂直滚动 */
}

.products {
  display: flex;
  flex-direction: column;
  /* gap: 16px; */
}

.cart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: bold;
}

.cart-info van-icon {
  font-size: 20px;
  color: #f56c6c;
}

.van-sidebar {
  width: 100%;
}
</style>