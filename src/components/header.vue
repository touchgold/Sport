<template>
    <header class="head-title text-center" v-if="meta.title">
        <div class="content">
            <l-icon name="fanhui" @click.native="native" class="left-icons" v-if="meta.back"/>
            {{ meta.title }}
            <div class="create" :class="{'hasIcon':meta.rightIcon}" v-if="meta.rightTitle" @click="myEvent">
                {{ meta.rightTitle }}
            </div>
            <div class="create" v-if="meta.rightIcon" @click="myEvent">
                <l-icon class="right-icons" @click="myEvent" :name="meta.rightIcon"/>
            </div>
        </div>
    </header>
</template>
<script>
    export default {
        props: {
            meta: {
                type: Object
            }
        },
        
        data() {
            return {
                name: ''
            }
        },
        mounted() {
        },
        methods: {
            native: function () {
                var _this = this;
                setTimeout(function(){
                    if (_this.meta.back === 'leftBtnEvent') {
                        _this.$emit('leftBtnEvent')
                    }else if (_this.meta.back === '-1') {
                        _this.$router.go(-1)
                    }else {
                        _this.$router.push(_this.meta.back)
                    }
                },300);//防止键盘出现造成页面异常
            },
            myEvent() {
                this.$emit('rightBtnEvent')//触发父组件事件
            },
            
        }
    }
</script>

