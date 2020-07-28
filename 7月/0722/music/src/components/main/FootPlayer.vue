<template>
    <div class="playerWarp">
        <div class="imgBox">
            <img src="../../../../../0701/轮播图/img/1.jpg">
        </div>
        <div class="songInfo"></div>
        <div class="play">
            <button><i class="iconfont icon-yinlebofang"></i></button>
        </div>
        <div class="menu">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <audio>
        </audio>
    </div>
</template>
<style scoped>
.playerWarp{
    position: fixed;
    height: 3.571429rem;
    width: 100vw;
    border-radius:.357143rem;
    bottom: 0;
    background: #fafafa;
    display: flex;
    align-items: center;
}
.playerWarp div{
    box-sizing: border-box;
}
.playerWarp .imgBox{
    width: 10%;
    margin:0 1rem;
}
.playerWarp .imgBox img{
    width: 100%;
    height:90%;
    border-radius: 50%;
}
.playerWarp .songInfo{
    width: 70%;
}
.playerWarp .play{
    width: 10%;
    border-radius: 50%;
    height: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
}
.playerWarp .play button{
    background: #fafafa;
    border: none;
    outline: none;
}
.playerWarp .play button i{
    font-size: 3rem;
    color: #1a73e8;
}
.playerWarp .menu{
    width: 10%;
    height: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.playerWarp .menu span{
    display: inline-block;
    width: 40%;
    height: .2rem;
    background: #1a73e8;
    margin:.2rem 0;
}
</style>
<script>
export default {
    
}
</script>