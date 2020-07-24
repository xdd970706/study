<template>
    <div v-swiper:mySwiper="swiperOption">
        <div class="swiper-wrapper">
            <div class="swiper-slide" :key="banner" v-for="banner in sliderListp">
                <img :src="banner">
            </div>
            <div class="swiper-pagination"></div>
        </div>
        
    </div>
</template>
<style scoped>
   .swiper-wrapper .swiper-slide img{
       width: 100%;
       height: 100%;
   }
</style>
<script>
import { Swiper, SwiperSlide ,directive } from 'vue-awesome-swiper'
import 'swiper/swiper-bundle.css'
export default {
    data(){
        return {
            swiperOption: {
            pagination: {
            el: '.swiper-pagination'
          },
          loop:true,
          autoplay:true
        }
        }
    },
    props:{
        sliderListp:{
            type:Array,
            required:true
        }
    },
    components: {
        Swiper,
        SwiperSlide
    },
    directives: {
    swiper: directive
  },
    mounted() {
      this.mySwiper.slideTo(0, 1000, false)
    }
}
</script>