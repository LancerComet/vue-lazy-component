import Vue from 'vue'
import Block from './block'
import Lazy from '../src/vue-lazy-component'

Vue.use(Lazy)

const App = new Vue({
  el: 'body',
  components: { 
    Block
  }
})