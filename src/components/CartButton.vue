<template>
  <div class="cart-button">
    <van-button
      type="danger"
      icon="shopping-cart"
      @click="$emit('checkout')"
    >
      去结算 ({{ itemCount }}) ¥{{ totalPrice.toFixed(2) }}
    </van-button>
  </div>
</template>

<script>
export default {
  name: 'CartButton',
  props: {
    totalPrice: {
      type: Number,
      required: true,
    },
    itemCount: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style>
.cart-button {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 1000;
}
</style>