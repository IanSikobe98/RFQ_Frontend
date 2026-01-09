<template>
  <swiper
    :slides-per-view="3"
    :space-between="20"
    :loop="true"
    :breakpoints="breakpoints"
    :speed="3000"
     :autoplay="{ delay: 0, disableOnInteraction: false }"
    class="rate-swiper"
  >
    <swiper-slide v-for="(rate, index) in rates" :key="index">
      <div class="rate-card">
        <div class="title">
          {{ rate.pair }} <span>{{ rate.label }}</span>
        </div>

        <div class="row buy">
          <span>Bank Buy</span>
          <strong>{{ rate.buy }}</strong>
        </div>

        <div class="row sell">
          <span>Bank Sell</span>
          <strong>{{ rate.sell }}</strong>
        </div>
      </div>
    </swiper-slide>
  </swiper>
</template>

<script>
import { Swiper, SwiperSlide } from 'swiper/vue'
import SwiperCore, { Navigation, Pagination, Autoplay } from 'swiper'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Register Swiper modules
SwiperCore.use([Navigation, Pagination, Autoplay])

export default {
  name: 'RateCarousel',
  components: {
    Swiper,
    SwiperSlide
  },
  props: {
    rates: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      breakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    }
  }
}
</script>


<style scoped>
.rate-card {
  background: #000;
  color: #fff;
  padding: 20px;
  border-radius: 16px;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  font-weight: 600;
}

.buy {
  color: #00ff84;
}

.sell {
  color: #ff4d4d;
}

.row {
  display: flex;
  justify-content: space-between;
}
</style>
