<template>
  <!--Logo start-->
  <div class="logo-main">
    <img
      :class="`${color ? 'text-primary' : ''}`"
      src="@/assets/images/Kingdom-bank-logo.png"
      alt="logo"
      width="200"
      height="50"
    />
  </div>
  <!--Logo End-->
</template>

<script>
export default {
  props: {
    color: { type: Boolean, default: false }
  }
}
</script>
