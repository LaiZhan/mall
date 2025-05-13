<template>
  <van-card centered :title="product.name" :thumb="product.image" :price="product.price" currency="¥"
    class="product-card">
    <template #footer>
      <div class="footer-controls">
        <div v-if="product.quantity > 0" class="quantity-controls">
          <!-- 减号按钮 -->
          <van-button icon="minus" type="success" size="mini" round @click="$emit('decrease-quantity', product)" />
          <!-- 显示数量 -->
          <span class="quantity">{{ product.quantity }}</span>
          <!-- 加号按钮 -->
          <van-button icon="plus" type="success" size="mini" round @click="$emit('increase-quantity', product)" />
        </div>
        <div v-else>
          <!-- 加入购物车按钮 -->
          <van-button type="success" size="small" @click="$emit('add-to-cart', product)">
            加入购物车
          </van-button>
        </div>
      </div>
    </template>
  </van-card>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
.product-card {
  width: 100%;
}

.footer-controls {
  display: flex;
  justify-content: flex-end;
  /* 将内容对齐到右下角 */
  align-items: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity {
  font-size: 16px;
  font-weight: bold;
}

.van-button {
  margin: 0;
}
</style>