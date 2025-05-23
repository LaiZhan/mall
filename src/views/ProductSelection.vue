<template>
  <div class="product-selection">
    <!-- 顶部搜索栏 -->
    <div class="search-bar">
      <van-search v-model="searchQuery" placeholder="搜索商品" shape="round" @clear="resetSearch" />
    </div>

    <!-- 分类导航和商品列表 -->
    <div class="content">
      <!-- 左侧分类导航 -->
      <div class="category-nav">
        <div v-for="(category, index) in filteredCategories" :key="index"
          :class="['category-item', activeCategory === index ? 'active' : '']" @click="activeCategory = index">
          <span class="category-badge" v-if="category === '休闲零食'">{{ category }}</span>
          <span v-else>{{ category }}</span>
        </div>
      </div>

      <!-- 右侧商品列表 -->
      <div class="product-list" ref="productListRef">
        <!-- 排序选项栏 -->
        <!-- <div class="sort-bar">
          <div class="sort-item active">综合</div>
          <div class="sort-item">价格
            <van-icon name="arrow-down" />
          </div>
          <div class="sort-item">销量</div>
        </div> -->

        <!-- 商品列表部分 -->
        <div class="products">
          <div v-if="isLoading" class="loading-container">
            <van-loading type="spinner" color="#00b578" />
            <p class="loading-text">正在加载商品...</p>
          </div>
          <template v-else-if="filteredProducts.length > 0">
            <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product"
              @add-to-cart="handleAddToCart" @increase-quantity="increaseQuantity"
              @decrease-quantity="decreaseQuantity" />
          </template>
          <div v-else class="empty-product">
            <p>暂无商品</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部购物车结算按钮 -->
    <div class="cart-bar">
      <div class="cart-info" @click="showCart = true">
        <van-icon name="shopping-cart" size="24" />
        <span>¥{{ totalPrice.toFixed(2) }}</span>
      </div>
      <van-button type="success" size="normal" class="checkout-button" @click="showOrderSummary = true">
        去结算({{ cart.length }})
      </van-button>
    </div>

    <!-- 购物车弹出层 -->
    <van-popup v-model:show="showCart" position="bottom" class="cart-popup">
      <div class="cart-popup-header">
        <h3>购物车</h3>
        <div class="cart-popup-actions">
          <van-button v-if="cart.length > 0" type="danger" size="small" plain class="clear-cart-btn"
            @click="handleClearCart">
            清空购物车
          </van-button>
          <van-icon name="close" size="20" @click="showCart = false" />
        </div>
      </div>
      <div class="cart-popup-content">
        <div v-if="cart.length === 0" class="empty-cart">
          <p>购物车为空</p>
        </div>
        <div v-else>
          <ProductCard v-for="product in cart" :key="product.id" :product="product" @add-to-cart="handleAddToCart"
            @increase-quantity="increaseQuantity" @decrease-quantity="decreaseQuantity" />
        </div>
      </div>
    </van-popup>

    <!-- 订单弹出层 -->
    <van-dialog v-model:show="showOrderSummary" title="订单详情" @confirm="copyOrderInfo" confirm-button-text="确认订单"
      show-cancel-button @cancel="showOrderSummary = false">
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

    <!-- 订单信息文本弹窗，无关闭按钮，5秒自动关闭 -->
    <van-dialog v-model:show="showOrderText" title="订单信息" :show-cancel-button="true" :show-confirm-button="false"
      close-on-click-overlay :close-on-popstate="true" class="order-text-dialog">
      <div class="order-text-tip">
        请手动复制一下订单信息，并粘贴到微信
      </div>
      <pre class="order-text-pre">{{ copiedOrderText }}</pre>
    </van-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { showSuccessToast } from 'vant';
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
    const showCart = ref(false);
    const showOrderSummary = ref(false);
    const isLoading = ref(true); // 添加加载状态
    const showOrderText = ref(false);
    const copiedOrderText = ref('');
    const productListRef = ref(null);

    // 筛选分类列表
    const filteredCategories = computed(() => {
      if (!searchQuery.value) {
        return categories.value;
      }
      const matchingCategories = new Set(
        products.value
          .filter((product) => product.name.includes(searchQuery.value))
          .map((product) => product.category)
      );
      return categories.value.filter((category) => matchingCategories.has(category));
    });

    // 筛选商品列表
    const filteredProducts = computed(() => {
      if (filteredCategories.value.length === 0) return [];

      const currentCategory = filteredCategories.value[activeCategory.value];
      return products.value.filter((product) => {
        const matchesCategory = product.category === currentCategory;
        const matchesSearchQuery = !searchQuery.value || product.name.includes(searchQuery.value);
        return matchesCategory && matchesSearchQuery;
      });
    });

    // 滚动产品列表到顶部
    const scrollProductListToTop = () => {
      if (productListRef.value) {
        productListRef.value.scrollTop = 0;
      }
    };

    // 监听 activeCategory 变化，滚动产品列表到顶部
    watch(activeCategory, () => {
      scrollProductListToTop();
    });

    // 重置搜索框
    const resetSearch = () => {
      searchQuery.value = '';
      activeCategory.value = 0;
    };

    // 监听分类变化
    watch(filteredCategories, (newCategories) => {
      if (newCategories.length > 0) {
        activeCategory.value = 0;
      }
    });

    // 获取分类数据
    const fetchCategories = async () => {
      try {
        categories.value = await getCategories();
      } catch (error) {
        console.error('获取分类失败:', error);
        categories.value = [];
      }
    };

    // 获取商品数据
    const fetchProducts = async () => {
      isLoading.value = true;
      try {
        products.value = await getProducts();
      } catch (error) {
        console.error('获取商品失败:', error);
        products.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    // 清空购物车
    const handleClearCart = async () => {
      try {
        await clearCart(); // 调用 API 清空购物车

        // 重置所有产品的数量为0
        products.value.forEach(product => {
          if (product.quantity !== undefined) {
            product.quantity = 0;
          }
        });

        await fetchCart();

        // 可以添加一个提示信息告知用户购物车已清空
        console.log('购物车已清空');
      } catch (error) {
        console.error('清空购物车失败:', error);
      }
    };

    // 获取购物车数据
    const fetchCart = async () => {
      try {
        const cartData = await getCart();
        cart.value = cartData.cart;
      } catch (error) {
        console.error('获取购物车失败:', error);
        cart.value = [];
      }
    };

    // 添加到购物车
    const handleAddToCart = async (product) => {
      try {
        console.log('添加商品到购物车:', product);
        product.quantity += 1;
        // await addToCart(product);
        cart.value.push(product);
        // 重新获取最新购物车数据
        fetchCart();
      } catch (error) {
        console.error('添加到购物车失败:', error);
      }
    };

    const increaseQuantity = (product) => {
      product.quantity += 1;
    };

    const decreaseQuantity = (product) => {
      if (product.quantity > 0) {
        product.quantity -= 1;
        if (product.quantity === 0) {
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
    onMounted(async () => {
      await fetchCategories();
      await fetchProducts();
      await fetchCart();
    });

    // 计算购物车总价
    const totalPrice = computed(() =>
      cart.value.reduce((sum, item) => sum + item.price * (item.quantity || 0), 0)
    );

    const copyOrderInfo = () => {
      // 生成格式化的订单信息
      const orderInfo = formatOrderInfo();

      // 复制到剪贴板
      navigator.clipboard.writeText(orderInfo)
        .then(() => {
          // 成功时只显示 Toast 提示
          showSuccessToast({
            message: '订单信息已复制，请粘贴到微信',
            type: 'success',
            duration: 5000
          });
          showOrderText.value = false;
        })
        .catch(err => {
          // 复制失败时显示订单信息弹窗，便于手动复制
          copiedOrderText.value = orderInfo;
          showOrderSummary.value = false;
          showOrderText.value = true;

          console.error('复制失败:', err);
          // Toast({
          //   message: '复制失败，请手动复制',
          //   type: 'fail'
          // });
        });
    };

    // 格式化订单信息
    const formatOrderInfo = () => {
      let result = '==== 订单信息 ====\n\n';

      // 添加每个商品信息
      cart.value.forEach(item => {
        result += `商品ID: ${item.id}\n`;
        result += `商品名称: ${item.name}\n`;
        result += `数量: ${item.quantity}\n`;
        result += `单价: ¥${item.price}\n`;
        result += `小计: ¥${(item.price * item.quantity).toFixed(2)}\n\n`;
      });

      // 添加总价
      result += `==== 总计: ¥${totalPrice.value.toFixed(2)} ====`;

      return result;
    };

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
      showOrderSummary,
      isLoading, // 返回加载状态
      copyOrderInfo,
      handleClearCart,
      showOrderText,
      copiedOrderText,
      productListRef
    };
  },
};
</script>

<style>
.product-selection {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #f5f5f5;
  font-size: 14px;
}

.search-bar {
  background-color: #fff;
  padding: 3px;
  border-bottom: 1px solid #eaeaea;
  position: sticky;
  top: 0;
  z-index: 10;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
  margin-bottom: 50px;
}

.category-nav {
  width: 85px;
  background-color: #f7f7f7;
  overflow-y: auto;
  border-right: 1px solid #eee;
}

.category-item {
  padding: 15px 10px;
  text-align: center;
  font-size: 13px;
  position: relative;
  color: #333;
  border-left: 3px solid transparent;
}

.category-item.active {
  background-color: #fff;
  color: #00b578;
  border-left: 3px solid #00b578;
}

.category-badge {
  display: inline-block;
  padding: 5px 8px;
  color: white;
  background-color: #00b578;
  border-radius: 15px;
  font-size: 12px;
}

.product-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: #fff;
}

.sort-bar {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

.sort-item {
  flex: 1;
  text-align: center;
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-item.active {
  color: #00b578;
  font-weight: bold;
}

.products {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 60px;
  /* 为底部购物车栏留出空间 */
}

.cart-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border-top: 1px solid #eaeaea;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.cart-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #333;
}

.cart-info .van-icon {
  color: #00b578;
}

.checkout-button {
  background-color: #00b578 !important;
  border-color: #00b578 !important;
  border-radius: 20px !important;
}

.cart-popup {
  height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px 16px 0 0;
}

.cart-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eaeaea;
}

.cart-popup-header h3 {
  font-size: 16px;
  margin: 0;
}

.cart-popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.empty-cart {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.order-summary {
  padding: 16px;
  overflow-y: auto;
  max-height: 70vh;
}

.order-item {
  margin-bottom: 15px;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.order-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.order-item-image {
  width: 60px;
  height: 60px;
  margin-right: 12px;
  border-radius: 4px;
  object-fit: cover;
}

.order-item-name {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
  color: #333;
}

.order-item-price {
  font-size: 14px;
  color: #e4393c;
  margin: 4px 0;
}

.order-item-footer {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: gray;
}

.order-total {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.order-total span {
  color: #e4393c;
}

/* 响应式布局 - 在更大屏幕上显示网格布局 */
@media (min-width: 768px) {
  .products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
}

/* 在 style 部分添加加载状态和空状态的样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
}

.loading-text {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}

.empty-product {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}

.van-dialog {
  max-width: 90%;
  max-height: 90%;
  width: 90%;
  margin: auto;
  top: 50%
}
</style>

<style>
.cart-popup-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-cart-btn {
  font-size: 12px;
}

.clear-cart-btn.van-button--danger {
  color: #ee0a24;
  border-color: #ee0a24;
}
</style>

<style>
.order-text-dialog .van-dialog__content {
  padding: 0;
}

.order-text-dialog-header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  color: #00b578;
  padding: 18px 16px 8px 16px;
  border-radius: 16px 16px 0 0;
  background: #f7f8fa;
}

.order-text-pre {
  background: #f7f8fa;
  color: #222;
  font-size: 12px;
  border-radius: 10px;
  padding: 16px 12px;
  margin: 0 16px 18px 16px;
  max-height: 220px;
  overflow: auto;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  font-family: "Menlo", "Consolas", "monospace";
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.7;
}

.order-text-dialog .van-dialog {
  border-radius: 16px;
  max-width: 95vw;
}

.order-text-tip {
  /* text-align: center; */
  color: #faad14;
  font-size: 12px;
  margin: 12px 16px 0 16px;
  padding-bottom: 4px;
  letter-spacing: 0.5px;
  font-style: italic;
}
</style>