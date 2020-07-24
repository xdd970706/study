<template>
    <div class="main">
        <MainHeader
            title="XDD MUSIC"
            @nav-click = "toPath"
        ></MainHeader>
        <router-view></router-view>
    </div>
</template>
<script>
    import MainHeader from '../components/main/MainHeader'
export default {
    methods:{
        toPath(path){
            this.$router.push(path)
        }
    },  
    components:{
        MainHeader,
    }
}
</script>