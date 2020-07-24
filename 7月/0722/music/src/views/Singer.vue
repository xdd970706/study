<template>
    <div class="singer">
            <SingerList 
                :areaList = 'areaList'
                :genreList = 'genreList'
                :indexList = 'indexList'
                :sexList = 'sexList'
            ></SingerList>
    </div>
</template>
<script>
import SingerList from '../components/singer/SingerList'
export default {
    data(){
        return {
            // 地区分类列表
            areaList:[],
            // 种类分类列表
            genreList:[],
            // 首字母分类列表
            indexList:[],
            // 性别分类列表
            sexList:[]
        }
    },
    methods:{
        async getSingerList(){
            const res = await this.$http.get('/singer/category')
            this.areaList = res.data.data.area
            this.genreList = res.data.data.genre
            this.indexList = res.data.data.index
            this.sexList = res.data.data.sex
        }
    },
    components:{
        SingerList,
    },
    created(){
        this.getSingerList()
    }
}
</script>