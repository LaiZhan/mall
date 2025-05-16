<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.name">
    </div>
    <div class="product-content">
      <div class="product-tag" v-if="false">自营</div>
      <div class="product-name">{{ product.name }}</div>
      <div class="product-desc" v-if="false">外酥里嫩 | 肉质鲜美</div>
      <div class="product-promotion" v-if="false">
        <span class="promotion-tag">满2减1</span>
      </div>
      <div class="product-price-row">
        <div class="product-price">
          <span class="price-symbol">¥</span>
          <span class="price-value">{{ product.price }}</span>
        </div>
        <div class="product-actions">
          <template v-if="product.quantity > 0">
            <button class="quantity-btn decrease" @click="$emit('decrease-quantity', product)">-</button>
            <span class="quantity">{{ product.quantity }}</span>
            <button class="quantity-btn increase" @click="$emit('increase-quantity', product)">+</button>
          </template>
          <button v-else class="add-btn" @click="$emit('add-to-cart', product)">
            <van-icon name="plus" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  mounted() {
    // 确保商品对象有quantity属性
    if (this.product && this.product.quantity === undefined) {
      this.product.quantity = 0;
    }
  }
};
</script>

<style scoped>
.product-card {
  display: flex;
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.product-image {
  width: 100px;
  height: 100px;
  margin-right: 10px;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.product-content {
  flex: 1;
  position: relative;
}

.product-tag {
  display: inline-block;
  padding: 1px 4px;
  background-color: #e4393c;
  color: #fff;
  font-size: 10px;
  border-radius: 2px;
  margin-right: 4px;
}

.product-name {
  font-size: 14px;
  font-weight: bold;
  margin: 4px 0;
  color: #333;
}

.product-desc {
  font-size: 12px;
  color: #999;
  margin: 3px 0;
}

.product-promotion {
  margin: 5px 0;
}

.promotion-tag {
  display: inline-block;
  padding: 1px 4px;
  border: 1px solid #e4393c;
  color: #e4393c;
  font-size: 10px;
  border-radius: 2px;
  margin-right: 4px;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.product-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  color: #e4393c;
  font-size: 12px;
}

.price-value {
  color: #e4393c;
  font-size: 16px;
  font-weight: bold;
}

.product-actions {
  display: flex;
  align-items: center;
}

.quantity-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ddd;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.quantity-btn.decrease {
  color: #999;
}

.quantity-btn.increase {
  color: #00b578;
  border-color: #00b578;
}

.quantity {
  margin: 0 8px;
  font-size: 14px;
  min-width: 20px;
  text-align: center;
}

.add-btn {
  width: 24px;
  height: 24px;
  background-color: #00b578;
  color: white;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>