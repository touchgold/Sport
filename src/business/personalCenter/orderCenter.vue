<template>
    <div class="order-center">
        <l-tabs :list="statusList" :current="status" @change="changeRoute"/>
        <div class="loadMore">
            <div class="order-list-item" v-for="order in list">
                <div class="order-goods-info" >
                    <div class="order-goods-details" v-for="good in order.goods"  @click="showDetails(order.id)">
                        <div class="goods-img">
                            <img :src="good.imgPath" alt="">
                        </div>
                        <div class="goods-info">
                            <div class="goods-title">{{ good.name }}</div>
                            <div class="goods-price">￥{{ good.unitPrice }}</div>
                            <div class="goods-extend" v-if="good.extendData">
                                还需要支付<span>{{ good.extendData+'糖果' }}</span>
                            </div>
                            <div class="class-amount">{{ '数量：'+good.amount }}</div>
                        </div>
                    </div>
                    <div class="goods-details"  @click="showDetails(order.id)">
                        <div class="goods-num">{{ '共'+order.amount+'件商品' }}</div>
                        <div class="goods-total">{{ '合计：'+order.totalPrice }}<span v-if="order.extendData">+{{ order.extendData+'糖果' }}</span>
                        </div>
                    </div>
                    <div class="operation-btn">
                        <div class="status">{{ order.status_des }}</div>
                        <div class="btn-area">
                            <div class="btn" @click.stop="showLogistics(order.id)" v-if="order.status==3||order.status==5">查看物流</div>
                            <div class="btn btn-confirm" v-if="order.status==3" @click="confirmOrder(order.id)">确认收货</div>
                            <div class="btn btn-confirm" v-if="order.status==1"  @click="pay(order.id)">立即支付</div>
                        </div>
                    </div>
                </div>
            </div>
            <infinite-loading @infinite="infiniteHandler" ref="infiniteLoading">
                 <span slot="no-more">
                      暂无更多数据
                 </span>
            </infinite-loading>
        </div>
    </div>
</template>

<script>
    import goods from '../../api/goods.js'
    import InfiniteLoading from 'vue-infinite-loading';
    export default {
        name: 'order-center',
        components: {
            InfiniteLoading,
        },
        data() {
            return {
                status: '0',
                page:1,
                statusList: [
                    {
                        id: '0',
                        name: '全部'
                    },
                    {
                        id: '1',
                        name: '待付款'
                    },
                    {
                        id: '2',
                        name: '待发货'
                    },
                    {
                        id: '3',
                        name: '待收货'
                    }
                ],
                list: [
//                    {
//                        id: 1,
//                        imgPath: '/static/img/goods/1.jpg',
//                        name: '夏季鸳鸯4音速驭帅运动鞋',
//                        unitPrice: '100',
//                        extendData: 50,
//                        amount: 1,
//                        totalPrice: '100',
//                        status: '待收货'
//                    },
//                    {
//                        id: 2,
//                        imgPath: '/static/img/goods/1.jpg',
//                        name: '夏季鸳鸯4音速驭帅运动鞋',
//                        unitPrice: '100',
//                        extendData: 50,
//                        amount: 2,
//                        totalPrice: '100',
//                        status: '待收货'
//                    }
                ]
            }
        },
        methods: {
            changeRoute(res) {
                if(this.status!=res){
                    this.status = res
                    this.page=1;
                    this.list=[];
                    this.$nextTick(function() {
                        this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                    });
                }
            },
            showDetails(id) {
                this.$router.push({name: 'orderDetails', params: {id: id}})
            },
            showLogistics(id) {
                this.$router.push({name: 'logistics', params: {id: id}})
            },
            pay(id){
                this.$router.push({name: 'orderPay', query: {id: id}})
            },
            infiniteHandler ($state) {
                var _this = this;
                goods.loadOrderList(_this,_this.status,$state);
            },
            confirmOrder(id){
                var _this = this;
                App.confirm({"title":'警告',"content":"确定收货吗?"}).then(function(){
                    goods.orderStatusAction(_this,id,"confirm",function(){
                        _this.list=[];
                        _this.page=1;
                        setTimeout(function(){
                            _this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
                        },300);

                    });
                });
            }
        },
        activated () {},
        mounted() {
            this.$nextTick(function () {
                var headerHeight = $("header").outerHeight(true);
                 $('.loadMore').height($(window).height()-headerHeight-$(".l-tabs").height());
            })
//            goods.loadOrderList(this,this.status);
        }
    }
</script>

<style lang="scss">
    .view-container .order-center {
        padding-bottom: 0 !important;
        background-color: #f5f5f5;
    }
    
    .order-center {
        .loadMore{overflow-y:scroll;-webkit-overflow-scrolling:touch;}
        .order-list-item:first-child{margin-top: 0px;}
        .order-list-item {
            width: 100%;
            margin-top: 20px;
            background-color: #ffffff;
            .order-goods-info {
                color: #333333;
                .order-goods-details {
                    display: flex;
                    justify-content: space-between;
                    padding: 25px 25px 25px;
                    margin-bottom: 2px;
                    .goods-img {
                        width: 210px;
                        height: 210px;
                        img {
                            width: 210px;
                            height: 210px;
                        }
                    }
                    .goods-info {
                        width: calc(100% - 230px);
                        margin-left: 20px;
                        .goods-title {
                            font-size: 32px;
                            line-height: 32px;
                            margin-bottom: 20px;
                        }
                        .goods-price {
                            color: #E93A0E;
                            font-size: 34px;
                            line-height: 34px;
                            margin-bottom: 30px;
                        }
                        .goods-extend {
                            color: #666666;
                            font-size: 24px;
                            line-height: 24px;
                            margin-bottom: 20px;
                            > span {
                                color: #F8C513;
                            }
                        }
                        .class-amount {
                            font-size: 24px;
                            line-height: 24px;
                        }
                    }
                }
            }
            .goods-details {
                font-size: 28px;
                line-height: 28px;
                padding: 30px 25px 30px;
                display: flex;
                justify-content: space-between;
                margin-bottom: 2px;
            }
            .operation-btn {
                display: flex;
                justify-content: space-between;
                padding: 15px 25px 15px;
                font-size: 28px;
                line-height: 40px;
                .status {
                    color: #F8C513;
                    line-height: 60px;
                }
                .btn-area {
                    display: flex;
                    justify-content: space-around;
                    .btn {
                        padding: 10px 25px;
                        border: 1px solid #999999;
                        background-color: #ffffff;
                        color: #999999;
                        -webkit-border-radius: 28px;
                        -moz-border-radius: 28px;
                        border-radius: 28px;
                        margin-left: 20px;
                        &.btn-confirm {
                            color: #25252b;
                            border-color: #F8C513;
                            background-color: #F8C513;
                        }
                    }
                }
            }
        }
    }
</style>
