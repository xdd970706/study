import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/views/Main'

import Reconmmend from '@/views/Reconmmend.vue'
import Singer from '@/views/Singer.vue'
import Rank from '@/views/Rank.vue'
import Search from '@/views/Search.vue'

import SongSheet from '../components/reconmmend/SongSheet.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Main,
      children:[
        {path:'',component:Reconmmend},
        {path:'/reconmmend',component:Reconmmend,children:[
          {path:'/songsheet',component:SongSheet}
        ]},
        {path:'/singer',component:Singer},
        {path:'/rank',component:Rank},
        {path:'/search',component:Search}
      ]
    }
  ]
})
