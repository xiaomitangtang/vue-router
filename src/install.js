import View from './components/view'
import Link from './components/link'
// esModule  动态传递引用  所以外部可以使用Vue
export let _Vue

export function install(Vue) {
  // 只能安装一次
  if (install.installed && _Vue === Vue) return
  install.installed = true

  _Vue = Vue
  // 用到了Vue中差不多的函数
  const isDef = v => v !== undefined

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal)
    }
  }
  // 源码库都是使用混入beforeCreate  
  // 因为只有根组件传入的router  所以根组件才会执行
  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {
        // router就是外面的router index.js实例
        this._routerRoot = this
        this._router = this.$options.router
        this._router.init(this)
        // 在vue实例上定义了一个响应式的——route
        Vue.util.defineReactive(this, '_route', this._router.history.current)
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
      }
      registerInstance(this, this)
    },
    destroyed() {
      registerInstance(this)
    }
  })
  // 这就是 _router  _route挂载到￥router ￥route上面
  Object.defineProperty(Vue.prototype, '$router', {
    get() { return this._routerRoot._router }
  })

  Object.defineProperty(Vue.prototype, '$route', {
    get() { return this._routerRoot._route }
  })
  // 注册两个全剧组件
  Vue.component('RouterView', View)
  Vue.component('RouterLink', Link)

  const strats = Vue.config.optionMergeStrategies
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created
}
