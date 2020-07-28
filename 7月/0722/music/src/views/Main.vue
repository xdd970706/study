<template>
    <div class="main">
        <MainHeader
            title="XDD MUSIC"
            @nav-click = "toPath"
        ></MainHeader>
        <router-view></router-view>
        <FootPlayer></FootPlayer>
    </div>
</template>
<script>
    import MainHeader from '../components/main/MainHeader'
    import FootPlayer from '../components/main/FootPlayer'
export default {
    methods:{
        toPath(path){
            this.$router.push(path)
        }
    },  
    components:{
        MainHeader,
        FootPlayer
    }
}
</script>