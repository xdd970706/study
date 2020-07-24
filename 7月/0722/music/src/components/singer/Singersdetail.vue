<template>
<Scroll :top='210'>
    <div class="singersdetail">
            <ul>
                <li 
                    v-for="item in singerList" :key="item.singer_id"
                >
                    <img :src="item.singer_pic">
                    <span>{{item.singer_name}}</span>
                </li>
            </ul>
    </div>
</Scroll>
</template>
<style scoped>
.singersdetail ul li{
    display: flex;
    height: 50px;
    padding-left: .928571rem;
    align-items: center;
}
.singersdetail ul li img{
    height: 80%;
    border-radius: 50%;
}
.singersdetail ul li span{
    font-size: .857143rem;
    color: #c0c0c0;
    padding-left: 1.071429rem;
}
</style>
<script>
import Scroll from '../main/Scroll'
export default {
    data(){
      return {
          singerList:[]
      }  
    },
    props:{
        activeSex:{
            type:Number,
        },
            activeArea:{
            type:Number,
        },
            activeGenre:{
            type:Number,
        }
    },
    methods:{
        async getSingersList(){
            const res = await this.$http.get('/singer/list',{
                params:{
                    area:this.activeArea,
                    genre:this.activeGenre,
                    sex:this.activeSex
                }
            })
            this.singerList = res.data.data.list.map(item=>{
                return item
            })
        }
    },
    created(){
        this.getSingersList()
    },
    components:{
        Scroll
    }
}
</script>