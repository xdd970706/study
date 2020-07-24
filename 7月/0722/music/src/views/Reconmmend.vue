<template>
    <div class="reconmmend">
        <Scroll :top="76">
            <div class="scroll-wrapper">
                <Myslider
                    :slider-listp = 'sliderListp'
                ></Myslider>
                <HotSong
                    :hotsong-list = 'hotsongList'
                ></HotSong>
            </div>
        </Scroll>
    </div>
</template>
<script>
import Myslider from '../components/reconmmend/Myslider'
import HotSong from '../components/reconmmend/HotSong'
import Scroll from '../components/main/Scroll'
export default {
    data(){
        return {
            // 从服务器上获取的图片路径
            sliderList:[],
            // 去除图片路径后面的参数信息
            sliderListp:[],
            hotsongList:[]
        }
    },
    methods:{
        async getSliderList(){
            const res = await this.$http.get('/recommend/banner')
            this.sliderList = res.data.data.map(item=>{
                return item.picUrl
            })
            this.sliderList = this.sliderList.forEach(item=>{
                this.sliderListp.push(item.split('?')[0])
            })
        },
        async getHotSongList(){
            const res = await this.$http.get('/recommend/playlist/u')
            this.hotsongList = res.data.data.list.map(item=>({
                id:item.content_id,
                img:item.cover.split('?')[0],
                name:item.username,
                title:item.title
            }))
        }
    },
    created(){
        this.getSliderList();
        this.getHotSongList()
    },
    components:{
        Myslider,
        HotSong,
        Scroll
    },
}
</script>