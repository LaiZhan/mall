<template>
  <van-card
    :title="product.name"
    :thumb="product.image"
    :price="product.price"
    currency="¥"
    class="product-card"
  >
    <template #footer>
      <van-button type="primary" size="small" @click="$emit('add-to-cart', product)">
        加入购物车
      </van-button>
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
  /* margin-bottom: 16px; */
}
</style>