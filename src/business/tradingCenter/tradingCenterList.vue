<template>
    <div class="trading-center-list">
        <div class="charts-range-list">
            <div class="charts-range-item" v-for="item in rangeList" :class="{'active':item.id === chartsActive}" @click="chartUpdate(item.id)">
                {{ item.name }}
            </div>
        </div>
        <div class="trading-charts">
            <div class="charts" id="trading-charts2"></div>
        </div>
        <div class="trading-data-board">
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">最低</div>
                <div class="right-value pull-left"> $ {{ low }}</div>
            </div>
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">最高</div>
                <div class="right-value pull-left"> $ {{ high }}</div>
            </div>
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">当前</div>
                <div class="right-value pull-left"> $ {{ current }} </div>
            </div>
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">成交</div>
                <div class="right-value pull-left">{{ volume }}</div>
            </div>
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">当前买单</div>
                <div class="right-value pull-left">{{ need }}</div>
            </div>
            <div class="trading-data-item pull-left">
                <div class="left-label pull-left">涨跌幅度</div>
                <div class="right-value pull-left">{{ percent }}</div>
            </div>
        </div>
        <l-shortMenu :currentRoute="type" :list="tabsList" @change="changeTabs"/>
        <div class="search-area">
            <div class="filter-way">
                <l-select v-model="currentFilter" :list="filterList" @change="changeFilterWay"/>
            </div>
            <div class="filter filter-id" v-if="currentFilter.id === 1">
                <input type="text" placeholder="搜索" @keyup.enter="search" v-model="filterName">
                <div @click="search">
                <l-icon name="sousuo" />
                </div>
            </div>
            <div class="filter filter-price" v-if="currentFilter.id === 2">
                <input type="text" placeholder="最低价" v-model="priceLow"  @keyup.enter="search" >
                <div>~</div>
                <input type="text" placeholder="最高价" @keyup.enter="search" v-model="priceHigh">
                <div @click="search">
                    <l-icon name="sousuo" />
                </div>
            </div>
        </div>
        <div class="trading-center-list-business">
                <div class="trading-business-item" v-for="item in businessList">
                    <div class="left-img pull-left">
                        <img :src="item.imgPath" alt="">
                    </div>
                    <div class="item-base-info pull-left">
                        <div class="base-info-name">{{ item.name }}</div>
                        <div class="base-info-price-info">
                            <div class="unit-price pull-left">{{ '单价:'+item.unitPrice }}</div>
                            <div class="less-count pull-left">{{ '数量:' +item.lessCount}}</div>
                        </div>
                        <div class="trading-info">{{ '最近30日成交:'+item.tradingNum }}</div>
                    </div>
                    <div class="right-business-btn pull-left text-center" @click="market(item)" v-if="item.lessCount>0&&!item.clear">
                        {{marketBtn}}
                    </div>
                    <div class="right-business-btn pull-left text-center clear" v-if="item.clear" @click="clear(item.id)">取消</div>
                </div>
                <infinite-loading @infinite="infiniteHandler" ref="infiniteLoading">
                 <span slot="no-more">
                      暂无更多数据
                 </span>
                </infinite-loading>
        </div>
        <div class="bottomBtn">
            <div class="pull-left" @click="myAction()">{{sealBtn}}</div>
        </div>
        <l-footerMenu :currentRoute.sync="route"/>
        <div class="bottomBtnBuy" v-show="isShow">
            <div class="buyBox">
                <div class="buying">正在{{marketBtn}}</div>
                <div class="buyleft">糖果余额：{{myCoin}}</div>
                <div class="buyText"><label>单价</label><span>{{unitprice1}}</span></div>
                <div class="buyText"><label>数量</label><span>{{cointotal}}</span></div>
                <div class="buyText"><label>交易密码</label><input type="password" v-model="password" placeholder="输入交易密码">
                </div>
                 <div class="pull-left" v-for="item in tabsListBuy" @click="userBuy(item.id)">{{item.name}}</div>
            </div>
        </div>
        <div class="bottomBtnBuy" v-show="isShowSell">
            <div class="buyBox">
                <div class="buying">{{marketAction}}</div>
                <div class="buyleft">当前价格：${{current}}</div>
                <div class="buyText"><label><div> 单价</div> <div> $ ({{priceInterval}}) </div></label><input type="text" v-model="unitprice" :placeholder="placeholder" @change="change"></div>
                <div class="buyText"><label>数量</label><input type="text" v-model="cointotal2" placeholder="请输入交易数量" @keyup="change"></div>
                <div class="buyText"><label>总额 $</label><span>{{marketTotal}}</span></div>
                <div class="buyText" v-if="sealType==2"><label>验证码</label>
                    <input class="formcode" type="text" v-model="smscode" placeholder="请输入验证码">
                    <div class="get_code" @click="getCode">{{codeSend}}</div></div>
                <div class="buyText"><label>交易密码</label><input type="password" v-model="password2" placeholder="输入交易密码"></div>

            <div class="pull-left" v-for="item in tabsListBuy" @click="marketSell(item.id)">{{item.name}}</div>
            </div>
        </div>
    </div>
</template>

<script>
    import coin from '../../api/coin.js'
    import users from '../../api/users.js'
    import InfiniteLoading from 'vue-infinite-loading';
    export default {
        name: 'trading-center-list',
        components: {
            InfiniteLoading
        },
        data() {
            return {
                chartsEl:null,
                route: 'tradingCenter',
                filterName: null,
                isShow: false,
                isShowSell: false,
                marketBtn: '出售',
                marketAction: '发布买单',
                marketItem: null,
                smscode:'',
                page: 1,
                myCoin: 0,
                scrollHeight: 10,
                high: 0,
                low: 0,
                current: 0,
                priceInterval:'',
                marketTotal:'',
                volume: 0,
                need: 0, // 需求数
                percent: 0,
                coinmysaleid: '',
                cointotal: '',
                cointotal2: '',
                unitprice1:0,
                unitprice: '',
                password: '',
                password2:'',
                sealType: 1,
                sealBtn:'发布买单',
                tradecharge: 0,//手续费率
                placeholder:'请勿超过平台2倍溢价',
                codeSend:'获取验证码',
                filterList: [  // 搜索方式区分
                    {
                        id: 1,
                        name: '手机号'
                    },
                    {
                        id: 2,
                        name: '价格区间'
                    }
                ],
                currentFilter: { // 当前选择项
                    id: 1,
                    name: '玩家ID和手机号'
                },
                chartsActive: 7,
                priceLow: '',
                priceHigh: '',
                rangeList: [
                    {
                        id: 7,
                        name: '一周'
                    },
                    {
                        id: 15,
                        name: '半月'
                    },
                    {
                        id: 31,
                        name: '一月'
                    }
                ],
                businessList: [
//                    {
//                        imgPath: 'static/img/personal/default.jpg',
//                        name: 'Louis',
//                        unitPrice: (Math.random() * 500).toFixed(0),
//                        lessCount: (Math.random() * 1000).toFixed(0),
//                        tradingNum: (Math.random() * 5000).toFixed(0)
//                    },
                ],
                type: 1,
                tabsList: [
                    {
                        id: 1,
                        name: '买单列表'
                    },
                    {
                        id: 2,
                        name: '卖单列表'
                    }
                ],
                tabsListBuy: [
                    {
                        id: 'cancel',
                        name: '取消'
                    },
                    {
                        id: 'ok',
                        name: '确定'
                    }
                ]
            }
        },
        methods: {
            search() {
                if(this.currentFilter.id==1){
                    this.priceLow=''
                    this.priceHigh='';
                }else{
                    this.filterName='';
                }
                this.page = 1;
                this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
//                coin.loadSales(this,this.filterName,this.priceLow,this.priceHigh);
            },
            changeTabs(res) {
                this.type = res
                this.page = 1
                this.sealType = res;
                if (res == 2) {
                    this.marketBtn = '购买'
                    this.sealBtn = "发布卖单"
                } else {
                    this.marketBtn = '出售'
                    this.sealBtn = "发布买单"
                }
                if ( this.sealType == 2) {
                    this.marketAction = '发布卖单'
                    this.placeholder='贡献值越高，手续费越低哟';

                }else {
                    this.marketAction = '发布买单'
                    this.placeholder='请勿超过平台2倍溢价';
                }
                this.businessList = [];
                var _this = this;
                setTimeout(function(){
                      _this.$refs.infiniteLoading.$emit('$InfiniteLoading:reset');
//                    coin.loadSales(_this,_this.filterName,_this.priceLow,_this.priceHigh)
                },100);

            },
            changeFilterWay(res) {
//                console.log(res)
            },
            infiniteHandler($state) {
                coin.loadSales(this,this.filterName,this.priceLow,this.priceHigh,$state);
            },
            setChartsData() {
                var _this = this;
                coin.loadKline(this, 7, function (data) {
                    var xAxis = eval('(' + data[0] + ')')
                    var xAxisData = [];
                    $(xAxis).each(function(index,item){
                        var arr = item.split("-")
                        xAxisData.push(arr[1]+"."+arr[2]+"");
                    });
                    var x = eval('(' + data[ 1 ] + ')')
                    var y = eval('(' + data[ 2 ] + ')')
                    let option = {
                        title: {
                            show: false
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter(item) {
                                if(item.length>1){
                                    return item[ 0 ].marker + item[ 0 ].seriesName + ': $' + item[ 0 ].value + '<br/>' +
                                            item[ 1 ].marker + item[ 1 ].seriesName + ' :' + item[ 1 ].value
                                }else {
                                    return item[ 0 ].marker + item[ 0 ].seriesName + ': $' + item[ 0 ].value
                                }
                            }
                        },
                        legend: {
                            data: [ '价格', '交易量' ],
                            y: 'top',
                            x: 'left',
                            top: 10,
                            left: 10,
                            selected:{'价格':true,'交易量':false},
                            textStyle: {
                                color: '#999999'
                            }
                        },
                        grid: {
                            top: 40,
                            left: 40,
                            right: 20,
                            bottom: 40
                        },
                        toolbox: {
                            show: false,
                        },
                        color: [ '#ff0066', '#fec800' ],
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: xAxisData,
                            axisLabel: {
                                show: true,
                                color: '#ffffff'
                            }
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: {
                                show: true,
                                color: '#ffffff'
                            }
                        },
                        series: [
                            {
                                name: '价格',
                                type: 'line',
                                data: x,
                            },
                            {
                                name: '交易量',
                                type: 'line',
                                data: y,
                            }
                        ]
                    }
                    _this.chartsEl.setOption(option)
                })
                
            },
            market(item) {
                this.isShow = true
                this.marketItem = item;
                this.unitprice1 = item.unitPrice
                this.cointotal = item.lessCount
            },
            myAction() {
                this.isShowSell = true
            },
            getCode(){
                var _this=this;
                if(_this.codeSend!="获取验证码"){
                    return;
                }
                const TIME_COUNT = 60;
                var count = TIME_COUNT;
                var user  = this.session.getLoginUser()
                this.axios.post(this.session.sendsmscode, {'memberid':user.id},function(data){
//                        console.log(data);
                    _this.$Message.info(data.msg);
                },function(data){
//                        console.log(data);
                    _this.$Message.error(data.msg);
                });
                this.timer = setInterval(function(){
                    if (count > 0 && count <= TIME_COUNT) {
                        count--;
                        _this.codeSend = count+"s";
//                        console.log(_this.codeSend);
                    } else {
                        _this.codeSend = "获取验证码";
                        clearInterval(_this.timer);
                        _this.timer = null;
                    }
                }, 1000);
            },
            userBuy(id) {
                if (id == 'ok') {
                    if (this.marketItem == null) {
                        return
                    }
                    var cointotal = this.cointotal
                    if (cointotal == '' || cointotal <= 0) {
                        this.$Message.error('交易数量必须填写')
                        return
                    }

                    if (cointotal > this.marketItem.lessCount) {
                        this.$Message.error('交易数量必须小于' + this.marketItem.lessCount)
                        return
                    }
                    if (this.password == '') {
                        this.$Message.error('交易密码必须填写')
                        return
                    }
                    var unitprice = this.marketItem.unitPrice
                    var handlingfee = 0
                    if (this.marketItem.type == 1) {
                        handlingfee = (cointotal * unitprice * this.tradecharge)
                    }
                    coin.saleCoinAction(this, this.marketItem.id, cointotal, unitprice, this.password,
                        this.marketItem.type, handlingfee)
                }
                else {
                    this.isShow = false;
                    this.password = '';
                }
            },
            marketSell(id) {
                if (id == 'ok') {
                    var cointotal = parseInt(this.cointotal2);
                    if (isNaN(cointotal)||cointotal == '' || cointotal <= 0) {
                        this.$Message.error('交易数量必须填写')
                        return
                    }

                    if (cointotal > this.myCoin&&this.sealType == 2) {
                        this.$Message.error('糖果数量不足' + cointotal+",无法提交卖单")
                        return
                    }

                    var currentprice = this.current
                    var unitprice = this.unitprice
                    if (isNaN(unitprice)||unitprice <= 0) {
                        this.$Message.error('交易单价必须大于0')
                        return
                    }
                    if (unitprice > currentprice * 2) {
                        this.$Message.error('请勿超过平台2倍溢价')
                        return
                    }
                    if (unitprice < currentprice / 2) {
                        this.$Message.error('请勿低于平台1/2价格')
                        return
                    }
                    var handlingfee = 0
                    if (this.sealType == 2) {
                        var smscode = this.smscode
                        if (smscode=='') {
                            this.$Message.error('请输入验证码')
                            return
                        }
                        handlingfee = (cointotal  * this.tradecharge);
                        if ((cointotal+handlingfee) > this.myCoin) {
                            this.$Message.error('糖果数量不足,需要手续费:' + handlingfee+",无法提交卖单")
                            return
                        }
                    }
                    if (this.password2 == '') {
                        this.$Message.error('交易密码必须填写')
                        return
                    }
                    coin.saleAddAction(this, cointotal, unitprice, this.sealType, handlingfee,smscode,this.password2)
                }else {
                    this.initForm();
                }
            }, init() {
                var _this = this
                this.page = 1
                coin.loadBaseInfo(this)
//                coin.loadSales(this)
                users.getCacheMyInfo(this, function (user) {
                    _this.myCoin = user.cointotal;
                    _this.tradecharge = user.tradecharge
                }, true)
            },
            initForm(){
                this.unitprice = "";
                this.cointotal2 = "";
                this.password2 = "";
                this.smscode ='';
                this.marketTotal = '';
                this.isShowSell = false
            },
            chartUpdate(id){
                this.chartsActive = id;
                var _this = this;
                coin.loadKline(this, id, function (data) {
                    var xAxis = eval('(' + data[0] + ')')
                    var xAxisData = [];
                    $(xAxis).each(function(index,item){
                        var arr = item.split("-")
                        xAxisData.push(arr[1]+"."+arr[2]+"");
                    });
                    var x = eval('(' + data[1] + ')')
                    var y = eval('(' + data[2] + ')')
                    let option = {
                        xAxis:{data: xAxisData},
                        series: [
                            {
                                data: x,
                            },
                            {
                                data: y,
                            }
                        ]
                    }
                    _this.chartsEl.setOption(option)
                })
            },
            clear(id){
                coin.mySaleCancelAction(this,id);
            },
            change(){
                var currentprice = this.current
                var unitprice = this.unitprice
                if (isNaN(unitprice)||unitprice <= 0) {
                    this.$Message.error('交易单价必须大于0')
                    return
                }
                if (unitprice > currentprice * 2) {
                    this.$Message.error('请勿超过平台2倍溢价')
                    return
                }
                if (unitprice < currentprice / 2) {
                    this.$Message.error('价格请勿低于'+ currentprice / 2)
                    return
                }
                if(isNaN(parseInt(this.cointotal2))){
                    return;
                }
                this.cointotal2 = parseInt(this.cointotal2);
                if (this.cointotal2 > this.myCoin&&this.sealType == 2) {
                    this.$Message.error('账户剩余糖果:' + this.myCoin+",不能发布此数量卖单")
                    return
                }
                this.marketTotal = parseFloat(this.cointotal2)*100*parseFloat(this.unitprice)/100;
                if (this.sealType == 2) {
                    var handlingfee = (this.cointotal2  * this.tradecharge)
                    this.marketTotal+=" (手续费:"+handlingfee+" 糖果)";
                    if ((this.cointotal2+handlingfee) > this.myCoin) {
                        this.$Message.error('糖果数量不足,需要手续费:' + handlingfee)
                        return
                    }
                }
            }
        },
        activated() {
            this.chartsEl = this.$echarts.init(document.getElementById('trading-charts2'))
            this.setChartsData()
            this.init()
        }
    }
</script>

<style lang="scss">
    .trading-center-list {
        padding-bottom: 120px;
        .charts-range-list {
            padding: 20px 30px;
            display: flex;
            justify-content: flex-end;
            .charts-range-item {
                font-size: 24px;
                line-height: 24px;
                padding: 15px 20px;
                border: 2px solid #d7dce6;
                margin: 0 0 0 20px;
                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;
                &.active {
                    color: #f8c513;
                    border-color: #f8c513;
                }
            }
        }
        .head-title {
            height: 80px;
            line-height: 80px;
            font-size: 34px;
            background: #404049;
            position: relative;
            .icons {
                position: absolute;
                width: 30px;
                height: 30px;
                z-index: 2;
                margin: 25px 0;
            }
        }
        .trading-charts {
            width: calc(100% - 60px);
            margin: 0 auto 20px;
            height: 520px;
            background-color: #333339;
            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
            border-radius: 10px;
            .charts {
                width: 100%;
                height: 520px;
                color: #ffffff;
            }
        }
        .trading-data-board {
            width: calc(100% - 60px);
            background-color: #333339;
            margin: 0 auto 20px;
            -webkit-border-radius: 10px;
            -moz-border-radius: 10px;
            border-radius: 10px;
            padding: 30px 30px 20px 30px;
            overflow: hidden;
            .trading-data-item {
                width: 50%;
                font-size: 30px;
                line-height: 30px;
                display: inline-block;
                margin-bottom: 20px;
                .left-label {
                    color: #999999;
                    width: 120px;
                }
                .right-value {
                    margin-left: 10px;
                    width: calc(100% - 130px);
                }
            }
        }
        .search-area {
            margin: 20px auto;
            display: flex;
            justify-content: space-between;
            width: calc(100% - 60px);
            .filter-way {
                width: 300px;
                input {
                    -webkit-border-radius: 8px 0 0 8px;
                    -moz-border-radius: 8px 0 0 8px;
                    border-radius: 8px 0 0 8px;
                }
            }
            .filter {
                width: calc(100% - 300px);
                position: relative;
                input {
                    width: 100%;
                    background-color: #33333a;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 30px;
                    padding: 30px 25px 30px 30px;
                    -webkit-border-radius: 0 8px 8px 0;
                    -moz-border-radius: 0 8px 8px 0;
                    border-radius: 0 8px 8px 0;
                }
                .icons {
                    position: absolute;
                    right: 20px;
                    top: 35px;
                    width: 30px;
                    height: 30px;
                }
                &.filter-price {
                    display: flex;
                    justify-content: flex-start;
                    input {
                        width: calc(50% - 13px);
                        border-radius: 0;
                        &:nth-last-child(1) {
                            -webkit-border-radius: 0 8px 8px 0;
                            -moz-border-radius: 0 8px 8px 0;
                            border-radius: 0 8px 8px 0;
                        }
                    }
                    > div {
                        background-color: #33333a;
                        color: #ffffff;
                        font-size: 30px;
                        line-height: 40px;
                        padding: 30px 5px 30px 5px;
                        float: left;
                    }
                }
            }
        }
        .trading-center-list-business {
            margin: 0 auto;
            width: calc(100% - 60px);
            padding-bottom: 100px;
            .trading-business-item {
                width: 100%;
                height: 180px;
                padding: 30px 30px 30px;
                background-color: #333339;
                -webkit-border-radius: 10px;
                -moz-border-radius: 10px;
                border-radius: 10px;
                margin-top: 20px;
                .left-img {
                    width: 120px;
                    height: 120px;
                    img {
                        width: 120px;
                        height: 120px;
                        -webkit-border-radius: 100%;
                        -moz-border-radius: 100%;
                        border-radius: 100%;
                    }
                }
                .item-base-info {
                    width: calc(100% - 280px);
                    margin-left: 30px;
                    .base-info-name {
                        font-size: 30px;
                        line-height: 30px;
                        margin-bottom: 25px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .base-info-price-info {
                        font-size: 24px;
                        line-height: 24px;
                        margin-bottom: 17px;
                        overflow: hidden;
                        .unit-price {
                            width: 45%;
                        }
                        .less-count {
                            width: 45%;
                            margin-left: 10%;
                        }
                    }
                    .trading-info {
                        color: #999999;
                        font-size: 24px;
                        line-height: 24px;

                    }
                }
                .right-business-btn {
                    width: 116px;
                    height: 116px;
                    border: 2px solid #F8C513;
                    color: #F8C513;
                    font-size: 30px;
                    line-height: 116px;
                    -webkit-border-radius: 10px;
                    -moz-border-radius: 10px;
                    border-radius: 10px;
                }
                 .clear{border-color:#f82715; color: #f82715;}
            }
        }
        .bottomBtn {
            position: fixed;
            bottom: 100px;
            left: 0;
            overflow: hidden;
            width: 100%;
            text-align: center;
            z-index:9;
            div {
                font-size: 34px;
                line-height: 34px;
                padding: 33px 0;
                background-color: #F8C513;
                color: #000;
                width: 100%;
            }
            .pull-left {
                background-color: #F8C513;
            }
        }
        .bottomBtnBuy {
            height: 100%;
            background-color: rgba(0,0,0,0.6);
            position: fixed;
            bottom: 0;
            left: 0;
            z-index: 999;
            overflow: hidden;
            width: 100%;
            text-align: center;
            div.pull-left {
                font-size: 34px;
                line-height: 34px;
                padding: 33px 0;
                
                color: #fff;
            }

            .pull-left {
                width: 50%;
                background-color: #404148;
            }
            .pull-left:last-child {
                width: 50%;
                background-color: #F8C513;
                color: #000;
            }
        }
        .buyBox {
            position: absolute;
            bottom: 0px;
            left:0px;
            background: #25252B;
            width: 100%;
            padding-top: 80px;
            .buying {
                font-size: 34px;
                color: #fff
            }
            .buyleft {
                font-size: 24px;
                color: #999;
                padding: 30px 0;
            }

            .buyText {
                margin-bottom: 40px;
                float: left;
                width: 100%;
                line-height:80px;
                label {
                    width: 30%;
                    height: 80px;
                    overflow: hidden;
                    float: left;
                    text-align: right;
                    line-height:80px;
                    div{height: 40px;  line-height:40px;}
                }
                input {
                    margin-left: 2%;
                    background: #333339;
                    height: 80px;
                    border-radius: 10px;
                    width: 60%;
                    padding: 0 10px;
                    float: left;
                    color: #ffffff;
                }
                span{ width: 60%;display: inline-block;text-align: left;}
                .formcode{width: 30%}
                .get_code{width: 30%;display: inline-block;line-height: 80px;}
                &:nth-last-child(1) {
                    padding: 15px 0 0 0;
                }
            }
        }
    }
</style>
