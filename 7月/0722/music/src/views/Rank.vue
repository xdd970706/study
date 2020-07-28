<template>
    <div class="rank">
        <Scroll :top="100">
            <RanlDetail 
            :rankList = rankList
            ></RanlDetail>
        </Scroll>    
    </div>
</template>
<script>
import RanlDetail from '../components/rank/RankDetail';
import Scroll from '../components/main/Scroll'
export default {
    data(){
        return {
            // 排行榜标题列表
            rankList:[],
            // 
        }
    },
    methods:{
        async getRankList(){
            const res = await this.$http.get('/top/category?showDetail=1',{   
            })
            this.rankList = res.data.data;
        }
    },
    created(){
        this.getRankList()
    },
    components:{
        RanlDetail,
        Scroll
    }
}
</script>