<template>
    <div class="hotSonglistWarp">
        <!-- <div v-for="item in hotSongList" :key="item.content_id">
            <img src="item.cover">
        </div> -->
        <ul>
            <li v-for="item in hotsongList" :key="item.id">
                <img :src="item.img"
                @click="toSongSheet()"
                >
                <div>
                    <p class="name">{{item.name}}<p>
                    <p class="title">{{item.title}}</p>
                </div>
            </li>
        </ul>
        <router-view 
        ></router-view>
    </div>
</template>
<style scoped>
.hotSonglistWarp ul{
    width: 100vw;
    padding: 0px;
    padding-left: 1rem;
    margin: 0;
}
.hotSonglistWarp ul li{
    list-style: none;
    height: 5.357143rem;
    display: flex;
    align-items: center;
}
.hotSonglistWarp ul li img{
    width: 12%;
    height: 65%;
}
.hotSonglistWarp ul li p{
    padding: 0;
    margin: 0;
    padding-left: 1.428571rem;
    font-size: .857143rem;
}
.hotSonglistWarp ul li .title{
    margin-top: .714286rem;
    color: #c0c0c0;
}
</style>
<script>
export default {
    props:{
        hotsongList:{
            type:Array,
            required:true
        }
    },
    data(){
        return{
            // hotSongList:[]
        }
    },
    methods:{
        //   async getHotSongList(){
        //      const res = await this.$http.get('/recommend/playlist/u')
        //      this.hotSongList = res.data.data.list.map(item=>({
        //          id:item.content_id,
        //          img:item.cover.split('?')[0],
        //          name:item.username,
        //          title:item.title
        //      }))
        //     console.log(res.data.data.list)
        //     console.log(this.hotSongList[0])
        // }
        toSongSheet(){
            console.log(1)
            this.$router.push('/reconmmend/songsheet')
            
        }
    },
    created(){
        // this.getHotSongList()
    },
}
</script>