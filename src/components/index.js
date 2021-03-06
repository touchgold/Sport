import footerMenu from './footerMenu'
import icon from './icon'
import banner from './banner'
import banner2 from './banner2'
import header from './header'
import searchInput from './searchInput'
import selecter from './selecter'
import headMenu from './headMenu'
import shortMenu from './shortMenu'
import tabs from './tabs'
import selectOption from './selectOption'
import imageUpload from './imageUpload'
import alert from './alert'
import loadmore_bottom from './loadmore_bottom'
export default {
    install: function (Vue) {
        Vue.component('l-footerMenu', footerMenu)
        Vue.component('l-banner', banner)
        Vue.component('l-banner2', banner2)
        Vue.component('l-icon', icon)
        Vue.component('l-header', header)
        Vue.component('l-search', searchInput)
        Vue.component('l-select', selecter)
        Vue.component('l-head', headMenu)
        Vue.component('l-shortMenu', shortMenu)
        Vue.component('l-tabs', tabs)
        Vue.component('l-selectOption', selectOption)
        Vue.component('l-imageUpload', imageUpload)
        Vue.component('l-alert', alert)
        Vue.component('l-loadmore_bottom', loadmore_bottom)
    }
}
