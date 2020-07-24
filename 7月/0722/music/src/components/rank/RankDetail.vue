<template>
    <div class="rankWrapper">
        <div v-for="(item,index) in rankList" :key="index">
            <p>{{item.title}}</p>
            <ul class="songSheet">
                <li class="songSheetDetail" v-for="(item1,index1) in item.list" :key="index1">
                    <div class="left">
                        <span class="leftTitle">{{item1.label}}</span>
                        <ul class="songSheetDetailLists">
                            <li class="songSheetDetailList" v-for="(item2,index2) in item1.song" :key="index2">
                                {{index2+1}}.<span class="title">{{item2.title}}</span> - <span class="singername">{{item2.singerName}}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="right"><img :src="item1.picUrl"></div>
                </li>
            </ul>
        </div>
    </div>
</template>
<style scoped>
.rankWrapper p{
    font-size: 1.428571rem;
    margin: .714286rem;
}
.rankWrapper .songSheet .songSheetDetail{
    display: flex;
    height: 7.142857rem;
    justify-content: space-between;
    margin: .5rem 1rem;
    background: #fafafa;
    border: 1px solid #fafafa;
    border-radius: .714286rem;
    box-shadow: 0px 0px 10px #ccc;
    
}
.rankWrapper .songSheet .songSheetDetail .left{
    width: 66%;
    margin:.357143rem;
    font-size: .857143rem;
    display: flex;
    flex-direction: column;
}
.rankWrapper .songSheet .songSheetDetail .left .leftTitle{
    font-size: 1rem;
    font-weight: 600;
}
.rankWrapper .songSheet .songSheetDetail .left ul{
    width: 100%;
    margin-left: 1.428571rem;
}
.rankWrapper .songSheet .songSheetDetail .left ul li{
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
    margin-top:.5rem;
}
.rankWrapper .songSheet .songSheetDetail .left ul li .singername{
    color: #c0c0c0;
}
.rankWrapper .songSheet .songSheetDetail .right{
    width: 30%;
    text-align: right;
}
.rankWrapper .songSheet .songSheetDetail .right img{
    width: 100%;
    height: 100%;
    border-radius: 10px;
}
</style>
<script>
export default {
    props:{
        rankList:{
            type:Array,
            required:true
        }
    }
}
</script>