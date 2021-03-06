/**
 * Created by zhlj on 2018/6/6.
 */
import axios from '../api/axios.js'
import session from '../api/session.js'
function AppUtil() {
    this.toastRemind = (verifyQueue, errors) => {
        //处理表单验证结果
        var errors = errors;
        //console.log(errors);
        var errMsg = "";
        $.each(verifyQueue, function (i) {
            var queue = verifyQueue[i];
            for (var i = 0; i < queue.length; i++) {
                var node = queue[i];
                var e = eval("errors." + node);
                if (e.length > 0) {
                    //Vue.prototype.$toast(e[0]);
                    errMsg = e[0];
                    break;
                }
            }
            return;
        });
        return errMsg;
    }
    //计步


    this.dateFormat=(time,format)=>{
        return new Date(parseInt(time)).format(format);
    }


};
var appUtil = new AppUtil();
export default {
    listener:{},
    loadFinish(context,pageCount,$state){
        if($state){
            $state.loaded();
        }else{
            if(context.$refs.infiniteLoading){
                context.$refs.infiniteLoading.$emit('$InfiniteLoading:loaded');
            }
        }
        if (context.page<pageCount) {
            context.page++;
            //context.$refs.vueLoad.onBottomLoaded(true);
        }else{
            if($state){
                $state.complete();
            }else{
                if(context.$refs.infiniteLoading){
                    context.$refs.infiniteLoading.$emit('$InfiniteLoading:complete');
                }
            }
        }
        if(pageCount<2){
            //setTimeout(function(){
            //    context.bottomStatus = "";
            //},200);
        }
    },
    toastRemind: function (verifyQueue, errors) {
        return appUtil.toastRemind(verifyQueue, errors);
    },
    dateFormat: function (time,format) {
        return appUtil.dateFormat(time,format);
    },
    actionSheet:function(callback,destinationType){
        var _this = this;
        api.actionSheet({
            title: '图片来源',
            cancelTitle: '取消选择',
            buttons: ['相机','相册', '图片库']
        }, function(ret, err){
            var index = ret.buttonIndex;
            if(index  == 1){
                _this.picture(callback,'camera',destinationType);
            }else if( index == 2){
                _this.picture(callback,'album',destinationType);
            }else if( index == 3){
                _this.picture(callback,'library',destinationType);
            }
        });

    },
    picture:function(callback,sourceType,destinationType){
        api.getPicture({
            sourceType: sourceType,
            encodingType: 'jpg',
            mediaValue: 'pic',
            destinationType: destinationType,
            quality:70,
            allowEdit: false,
            targetWidth:1000,
            saveToPhotoAlbum: false
        }, function(ret, err){
            if(ret){
                callback(ret);
            }
        });
    },
    apiCloudEvent(name,ret,err){
        var listener =  eval("this.listener."+name);
        if(listener){
            listener(ret,err);
        }
    },
    addApiCloudEventListener(name,listener){
        eval("this.listener."+name+"=listener");
    },
    getCacheImg(url,callback){
        if(url.indexOf("http")==-1){
            callback(url);
            return;
        }
        api.imageCache({
            url: url,
            thumbnail:false
        }, function(ret, err) {
            if(ret.status){
                var trans = api.require('trans');
                trans.decodeImgToBase64({
                    imgPath: ret.url
                }, function(ret, err) {
                    if (ret.status) {
                        if(callback){
                            callback("data:image/png;base64,"+ret.base64Str);
                        }
                        //alert(JSON.stringify(ret));
                    } else {
                        alert(JSON.stringify(err));
                    }
                });
            }
        });
    },
    //getHeaderHeight:function(){
    //    if(session.isAPPRuntime()){
    //        var header = $api.dom('header')
    //        return $api.fixStatusBar(header);
    //    }else{
    //        return $("header").outerHeight();
    //    }
    //},
    dentityCodeValid: function (code) {
        var city = {
            11: "北京",
            12: "天津",
            13: "河北",
            14: "山西",
            15: "内蒙古",
            21: "辽宁",
            22: "吉林",
            23: "黑龙江 ",
            31: "上海",
            32: "江苏",
            33: "浙江",
            34: "安徽",
            35: "福建",
            36: "江西",
            37: "山东",
            41: "河南",
            42: "湖北 ",
            43: "湖南",
            44: "广东",
            45: "广西",
            46: "海南",
            50: "重庆",
            51: "四川",
            52: "贵州",
            53: "云南",
            54: "西藏 ",
            61: "陕西",
            62: "甘肃",
            63: "青海",
            64: "宁夏",
            65: "新疆",
            71: "台湾",
            81: "香港",
            82: "澳门",
            91: "国外 "
        };
        var tip = "";
        var pass = true;

        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
            pass = false;
        }

        else if (!city[code.substr(0, 2)]) {
            tip = "地址编码错误";
            pass = false;
        }
        else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17]) {
                    tip = "校验位错误";
                    pass = false;
                }
            }
        }
        //if(!pass) alert(tip);
        return pass;
    }
}

Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}
