<template>
    <div class="mainHeader">
        <div class="title">
            {{title}}
        </div>
        <div class="nav">
            <ul>
                <li v-for="item in navList" :key="item.name" 
                :class="{'nav-actived':isActive(item.path)}"
                @click="navClick(item.path)"
                >
                    {{item.name}}
                </li>
            </ul>
        </div>
    </div>
</template>
<style scoped>
    .mainHeader{
        background: #fafafa;
    }
    .title{
        font-size: 1.5rem;
        text-align: center;
        height: 2.5rem;
        line-height: 2.5rem;
        color: #1a73e8;
    }
    .nav ul{
        margin: 0;
        padding: 1.2rem 0;
        display: flex;
        justify-content: space-around;
    }
    .nav ul li{
        list-style: none;
        flex: 1;
        text-align: center;
        font-size: 1.2rem;
    }
    .nav ul .nav-actived{
        color: #1a73e8;
        font-weight: 700;
    }   
</style>
<script>
export default {
    props:{
        title:{
            type:String,
            default:"XDD MUSIC"
        }
    },
    data(){
        return {
            navList:[
                {path:'/reconmmend',name:'推荐'},
                {path:'/singer',name:'歌手'},
                {path:'/rank',name:'排行'},
                {path:'/search',name:'搜索'}
            ]
        }
    },
    methods:{
        navClick(path){
            this.$emit('nav-click',path);
        },
        isActive(path){
            if(path===this.$route.path){
                return true
            }
            if(path==='/reconmmend'&&this.$route.path==='/'){
                return true
            }
            return false
        },
    }
}
</script>