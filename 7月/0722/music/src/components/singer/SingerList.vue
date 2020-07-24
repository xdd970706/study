<template>
<div class="singer">
    <ul>
        <li 
            v-for="item in sexList" :key="item.id"
            :class="{'actived': activeSex===item.id}"
            @click="slecteId1(item.id)"
        >
        {{item.name}}
        </li>
    </ul>
    <ul>
        <li 
            v-for="item in areaList" :key="item.id"
            :class="{'actived': activeArea===item.id}"
            @click="slecteId2(item.id)"
        >
        {{item.name}}
        </li>
    </ul>
    <ul>
        <li 
            v-for="item in genreList" :key="item.id"
            :class="{'actived': activeGenre===item.id}"
            @click="slecteId3(item.id)"
        >
        {{item.name}}
        </li>
    </ul>
    <Singersdetail
        :activeSex = activeSex
        :activeArea = activeArea
        :activeGenre = activeGenre
        ref="Singersde"
    ></Singersdetail>
</div>    
</template>
<style scoped>
.singer ul{
    display: flex;
    flex-wrap :wrap;
    padding-left:.3rem;
    padding-right: .5rem;
    height: 2.142857rem;
    align-items: center;
}
.singer ul:nth-child(3){
    height: 4.285714rem;
}
.singer ul li{
    font-size: .857143rem;
    margin: 0 .6rem;
    padding:0 .2rem;
    color: #c0c0c0;
    height: 1.2rem;
}
.singer ul .actived{
    background: #1a73e8;
    border-radius: .5rem;
    color: #fff;
    font-weight: 600;
}
</style>
<script>
import Singersdetail from '../singer/Singersdetail'
export default {
    data(){
        return {
            activeSex:-100,
            activeArea:-100,
            activeGenre:-100,
        }
    },
    props:{
        areaList:{
            type:Array,
            required:true
        },
        genreList:{
            type:Array,
            required:true
        },
        indexList:{
            type:Array,
            required:true
        },
        sexList:{
            type:Array,
            required:true
        }
    },
    methods:{
        slecteId1(id){
            this.activeSex = id
            this.updateSingersList()
        },
        slecteId2(id){
            this.activeArea = id
            this.updateSingersList()
        },
        slecteId3(id){
            this.activeGenre = id
            this.updateSingersList()
        },
        updateSingersList(){
            this.$refs.Singersde.getSingersList()
        }
    },
    components:{
        Singersdetail,
    }
}
</script>