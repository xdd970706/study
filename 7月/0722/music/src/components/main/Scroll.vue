<template>
    <div class="wrapper" ref="wrapper">
        <slot></slot>
    </div>
</template>
<style scoped>
.wrapper{
    position: absolute;
    overflow: hidden;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}
</style>
<script>
import BScroll from 'better-scroll';
export default {
    props:{
        top:{
            type:Number,
            default:0
        }
    },
    methods:{
        initSrcoll(){
            this.$refs.wrapper.style.top = this.top + 'px'
            this.scroll = new BScroll(this.$refs.wrapper)
        }
    },
    mounted(){
        this.initSrcoll()
    }
}
</script>