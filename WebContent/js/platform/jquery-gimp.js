/*!
 * 作者：zzd
 * 时间：2017-04-19
 * 描述：对jquery的扩展
 */
//兼容IE上的ajax请求跨域
jQuery.support.cors = true; 

(function($) {
	$.date = {};		//日期函数
	$.validate = {};	//验证函数
	$.cookies = {};		//cookies管理
	$.utils = {};		//通用函数
	
	//+---------------------------------------------------   
	//| 扩展日期函数
	//+---------------------------------------------------  
	$.extend(jQuery.date,{
		//两个日期的时间差
		dateDiff:function(strInterval,dtStart,dtEnd){ 
		    if (typeof dtStart == 'string' ){    
		    	dtStart = StringToDate(dtStart);   
		    } 
			return dtStart.DateDiff(strInterval,dtEnd);
		},
		dateAdd:function(strInterval,Number,dt){
			if (typeof dt == 'string' ){    
				dt = StringToDate(dt);   
		    }
			return dt.DateAdd(strInterval, Number);
		},
		//日期格式化 
		dateFormat:function(dt,formatStr){
			if(dt == null || dt == undefined || dt == '') return "";
			if (typeof dt == 'string' ){
		    	dt = StringToDate(dt);   
		    }else if(typeof dt == 'number'){
		    	var str = formatStr;
		    	var ss = (dt%60);
		    	ss = ss>9?ss:'0' + ss;
		    	var mm = parseInt(dt/60);
		    	var hh = parseInt(mm/60);
		    	mm = mm%60;
		    	mm = mm>9?mm:'0'+mm;
		    	hh = hh>9?hh:'0'+hh;
		    	
		    	str = str.replace(/hh|HH/,hh);
		    	str = str.replace(/mm/,mm);
		    	str = str.replace(/ss/,ss);
		    	return str;
		    }
			return dt.Format(formatStr);
		},
		//取得当前日期所在周是一年中的第几周   
		weekNumOfYear:function(dt){
			if (typeof dt == 'string' ){    
		    	dt = StringToDate(dt);   
		    }
			return dt.WeekNumOfYear();
		},
		stringToDate:function(DateStr){
			return StringToDate(DateStr);
		},
		timestampToStr:function(time){
			var datetime = new Date();
			datetime.setTime(time);
			var year = datetime.getFullYear();
			var month = datetime.getMonth() + 1;
			var date = datetime.getDate();
			var hour = datetime.getHours();
			var minute = datetime.getMinutes();
			var second = datetime.getSeconds();
			var mseconds = datetime.getMilliseconds();
			//return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second + "." + mseconds;
			return year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
		},
		timestampToStrDate:function(time){
			var datetime = new Date();
			datetime.setTime(time);
			var year = datetime.getFullYear();
			var month = datetime.getMonth() + 1;
			var date = datetime.getDate();
			return year + "-" + month + "-" + date;
		},
		initSearchDate: function(begin, end, formatter){
			if(formatter == null || formatter == undefined || formatter == '') formatter =  'YYYY-MM-DD';
			$(begin).datetimepicker({locale: 'zh-CN', format: formatter, allowInputToggle: true, useCurrent: false});
			$(end).datetimepicker({locale: 'zh-CN', format: formatter, allowInputToggle: true, useCurrent: false});
			$(begin).on("dp.change", function (e) {
		        $(end).data("DateTimePicker").minDate(e.date);
		    });
		    $("#divEndDate").on("dp.change", function (e) {
		        $(begin).data("DateTimePicker").maxDate(e.date);
		    });
		},getNowYear:function(){
			var datetime = new Date();
			return datetime.getFullYear();
		},
		//获取两个日期之间的所有月份
		getAllMonthBetween: function(start, end, suffix){
			if(suffix == null || suffix == undefined) suffix = "";
            var result = [];  
            var s = start.split("-");  
            var e = end.split("-");  
            var min = new Date();  
            var max = new Date();  
            min.setFullYear(s[0],s[1]);  
            max.setFullYear(e[0],e[1]);  
            var curr = min;  
            while(curr <= max){  
                var month = curr.getMonth();  
                //result.push(curr.getFullYear()+"-"+(month<10?("0"+month):month));
                if(month == 0) result.push("12" + suffix);
                else result.push(month + suffix);
                curr.setMonth(month + 1);  
            }  
            return result;  
         }  ,
 		//获取两个日期之间的所有年
 		getAllYearBetween: function(start, end, suffix){
 			if(suffix == null || suffix == undefined) suffix = "";
             var result = [];  
             var s = start.split("-");  
             var e = end.split("-");
             var intStart = parseInt(s[0]);
             var intEnd = parseInt(e[0]);
             while(intStart <= intEnd){  
                 result.push(intStart + suffix);
                 intStart ++;
             }  
             return result;  
          } 
	});
	
	//+---------------------------------------------------   
	//| 扩展验证函数
	//+---------------------------------------------------  
	$.extend(jQuery.validate, {
		 isEmail: function(email) {
		     return /^.+@.+\..{2,3}$/g.test(email);
		 },
		 isInt: function(str) {
		     return /^\d+$/img.test(str);
		 },
		 isPositiveInt: function(str) {
//			 /^\d+$/　　//非负整数（正整数 + 0） 
//			 /^[0-9]*[1-9][0-9]*$/　　//正整数 
//			 /^((-\d+)|(0+))$/　　//非正整数（负整数 + 0） 
//			 /^-[0-9]*[1-9][0-9]*$/　　//负整数 
//			 /^-?\d+$/　　　　//整数 
//			 /^\d+(\.\d+)?$/　　//非负浮点数（正浮点数 + 0） 
//			 /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/　　//正浮点数 
//			 /^((-\d+(\.\d+)?)|(0+(\.0+)?))$/　　//非正浮点数（负浮点数 + 0） 
//			 /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/　　//负浮点数 
//			 /^(-?\d+)(\.\d+)?$/　　//浮点数 
			 return /^[0-9]*[1-9][0-9]*$/img.test(str); //正整数
		 },
	    //是否为日期
	    isDate: function(strDate) {
	        var ls_regex = "^((((((0[48])|([13579][26])|([2468][048]))00)|([0-9][0-9]((0[48])|([13579][26])|([2468][048]))))-02-29)|(((000[1-9])|(00[1-9][0-9])|(0[1-9][0-9][0-9])|([1-9][0-9][0-9][0-9]))-((((0[13578])|(1[02]))-31)|(((0[1,3-9])|(1[0-2]))-(29|30))|(((0[1-9])|(1[0-2]))-((0[1-9])|(1[0-9])|(2[0-8]))))))$";
	        var exp = new RegExp(ls_regex, "i");
	        return exp.test(strDate);
	    },
	    //是否为时间
	    isTime: function(strTime) {
	        var a = strTime.match(/^(\d{2,2})(:)?(\d{2,2})\2(\d{2,2})$/);
	        if (!a || a[1] > 23 || a[3] > 59 || a[4] > 59) return false;
	        return true;
	    },
	    //是否为手机号码
	    isMobilePhone:function(phone){
	    		return /^1[3|4|5|8][0-9]\d{8}$/.test(phone);
	    }
	});

	//+---------------------------------------------------   
	//| 扩展cookies管理
	//+---------------------------------------------------  
	$.extend(jQuery.cookies,{
		get:function(name){
			return cookies(name);
		},
		set:function(name,value,options){
			return cookies(name,value,options);
		},
		del:function(name){
			return cookies(name,null);
		}
	});

	//+---------------------------------------------------   
	//| 增加通用函数
	//+---------------------------------------------------  
	$.extend(jQuery.utils, {
		getStrInStrList:function(strListPara, nIdx, strDelimit){
			return getStrInStrList(strListPara, nIdx, strDelimit);
		},
		secondToTime:function(s){
			if(s===undefined) return "";
			var mathSecond=Math.round(s);
			var hours=Math.floor(mathSecond/3600);
			var minutes=Math.floor((mathSecond % 3600)/60);
			var seconds=((mathSecond % 3600)%60)%60;
			return (hours>9?hours:"0"+hours)+":" 
				+ (minutes>9?minutes:"0"+minutes) +":" 
				+ (seconds>9?seconds:"0"+seconds);
		},
		getUrlParam:function(searchStr,key){
			if($.trim(searchStr) == "") return;
			searchStr = searchStr.substr(1);
			var searchs = searchStr.split("&");
			for(var i=0;i<searchs.length;i++){
				var param = searchs[i].split("=");
				if(param[0].toLowerCase() == key.toLowerCase()){
					return param[1];
				}
			}
		},
		startWith:function(oginStr,str){     
			var reg=new RegExp("^"+str);     
			return reg.test(oginStr);
		},
		endWith:function(oginStr,str){
			var reg=new RegExp(str+"$");
			return reg.test(oginStr);
		},
		isInteger:function(str){
			var r = /^\+?[1-9][0-9]*$/; 
      		return r.test(str);
		},
		//获取根地址，如：http://127.0.0.1:8082/gimweb/
		getRootPath:function(hasPrjName){
			var strFullPath = window.document.location.href;  
		    var strPath = window.document.location.pathname;  
		    var pos = strFullPath.indexOf(strPath); 
		    var prePath = strFullPath.substring(0,pos);  
		    var postPath = strPath.substring(0,strPath.substr(1).indexOf('/') + 1);  
		    if(hasPrjName) return(prePath + postPath);
		    else return(prePath);
		},
		getPrjName:function(){
			var pathName = location.pathname;
			return pathName.substring(0,pathName.substr(1).indexOf('/')+1);
		},
		isNull:function(value){
			return value === undefined || value === null;
		},
		isEmpty:function(value){
			return value === undefined || value === null || value.length === 0 || $.trim(value) === '';
		},
		getNotNullVal:function(val){
			if(val == null || val == undefined || val == 'undefined') return "";
			else return val + "";
		},
		objectEqual:function(a, b, aStack, bStack){
			return eq(a, b, aStack, bStack);
		},
		toChineseNumeral:function(digit){
			return toChineseNumeral(digit);
		},
		removeLastIndex:function(str, index){
			if(str != null && str != undefined && str != '' && str.length > index) {
				str = str.substring(0, str.length - index);
			}
			return str;
		},
		calcPageHeight:function(doc){
			//计算页面的实际高度，iframe自适应会用到
		    var cHeight = Math.max(doc.body.clientHeight, doc.documentElement.clientHeight);
		    var sHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
		    var height  = Math.max(cHeight, sHeight);
		    return height;
		},
		stopBrowserGoBack: function(){
//			//禁用浏览器前进后退功能
//			if (window.history && window.history.pushState) {
//				$(window).on('popstate', function () {
//					// 当点击浏览器的 后退和前进按钮 时才会被触发， 
//					window.history.pushState('forward', null, ''); 
//					window.history.forward(1);
//				});
//			}
//			//在IE中必须得有这两行
//		    window.history.pushState('forward', null, '');  
//		    window.history.forward(1);
		},
		// 指定排序的比较函数
		objArrayCompare: function(property){
	         return function(obj1,obj2){
	             var value1 = obj1[property];
	             var value2 = obj2[property];
	             return value1 - value2;     // 升序
	         }
	    },
	});
	
	$.fn.serializeFormJSON = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
	
	//+---------------------------------------------------   
	//| 判断闰年   
	//+---------------------------------------------------   
	Date.prototype.isLeapYear = function(){    
	    return (0==this.getYear()%4&&((this.getYear()%100!=0)||(this.getYear()%400==0)));    
	};    
	   
	//+---------------------------------------------------   
	//| 日期格式化   
	//| 格式 YYYY/yyyy/YY/yy 表示年份   
	//| MM/M 月份   
	//| W/w 星期   
	//| dd/DD/d/D 日期   
	//| hh/HH/h/H 时间   
	//| mm/m 分钟   
	//| ss/SS/s/S 秒   
	//+---------------------------------------------------   
	Date.prototype.Format = function(formatStr){    
	    var str = formatStr;    
	    var Week = ['日','一','二','三','四','五','六'];   
	    str=str.replace(/yyyy|YYYY/,this.getFullYear());    
	    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));    
	    str=str.replace(/MM/,this.getMonth()+1>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));
	    str=str.replace(/M/g,this.getMonth());    
	    str=str.replace(/w|W/g,Week[this.getDay()]);    
	    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());    
	    str=str.replace(/d|D/g,this.getDate());
	    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());    
	    str=str.replace(/h|H/g,this.getHours());    
	    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());    
	    str=str.replace(/m/g,this.getMinutes());    
	    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());    
	    str=str.replace(/s|S/g,this.getSeconds());    
	    return str;    
	};

	//+---------------------------------------------------   
	//| 日期计算   
	//+---------------------------------------------------   
	Date.prototype.DateAdd = function(strInterval, Number) {    
		var dtTmp = this.Format("MM/dd/yyyy hh:mm:ss");
		var dtObj =  StringToDate(this.Format("MM/dd/yyyy hh:mm:ss"));
	    switch (strInterval) {    
	        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));   
	        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));   
	        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));   
	        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));   
	        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));   
	        case 'q' :return new Date(dtObj.getFullYear(), (dtObj.getMonth()) + Number*3, dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());   
	        case 'm' :
	        	var resultDate = new Date(dtObj.getFullYear(), (dtObj.getMonth()) + Number, dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());
	        	if (dtObj.getMonth() == resultDate.getMonth()) resultDate.setDate(0);
	        	return resultDate;   
	        case 'y' :return new Date((dtObj.getFullYear() + Number), dtObj.getMonth(), dtObj.getDate(), dtObj.getHours(), dtObj.getMinutes(), dtObj.getSeconds());   
	    }   
	};   
	   
	//+---------------------------------------------------   
	//| 比较日期差 dtEnd 格式为日期型或者 有效日期格式字符串   
	//+---------------------------------------------------   
	Date.prototype.DateDiff = function(strInterval, dtEnd) {    
	    var dtStart = this;   
	    //如果是字符串转换为日期型   
	    if (typeof dtEnd == 'string' ){    
	        dtEnd = StringToDate(dtEnd);   
	    }
	    switch (strInterval) {    
	        case 's' :return parseInt((dtEnd - dtStart) / 1000);   
	        case 'n' :return parseInt((dtEnd - dtStart) / 60000);   
	        case 'h' :return parseInt((dtEnd - dtStart) / 3600000);   
	        case 'd' :return parseInt((dtEnd - dtStart) / 86400000);   
	        case 'w' :return parseInt((dtEnd - dtStart) / (86400000 * 7));   
	        case 'm' :return (dtEnd.getMonth()+1)+((dtEnd.getFullYear()-dtStart.getFullYear())*12) - (dtStart.getMonth()+1);   
	        case 'y' :return dtEnd.getFullYear() - dtStart.getFullYear();   
	    }   
	};
	   
	//+---------------------------------------------------   
	//| 日期输出字符串，重载了系统的toString方法   
	//+---------------------------------------------------   
	Date.prototype.toString = function(showWeek){    
	    var myDate= this;   
	    var str = myDate.toLocaleDateString();   
	    if (showWeek){    
	        var Week = ['日','一','二','三','四','五','六'];   
	        str += ' 星期' + Week[myDate.getDay()];   
	    }   
	    return str;   
	};
	   
	//+---------------------------------------------------   
	//| 日期合法性验证   
	//| 格式为：YYYY-MM-DD或YYYY/MM/DD   
	//+---------------------------------------------------   
	function IsValidDate(DateStr){    
	    var sDate=DateStr.replace(/(^\s+|\s+$)/g,''); //去两边空格;    
	    if(sDate=='') return true;    
	    //如果格式满足YYYY-(/)MM-(/)DD或YYYY-(/)M-(/)DD或YYYY-(/)M-(/)D或YYYY-(/)MM-(/)D就替换为''    
	    //数据库中，合法日期可以是:YYYY-MM/DD(2003-3/21),数据库会自动转换为YYYY-MM-DD格式    
	    //var s = sDate.replace(/[\d]{ 4,4 }[\-/]{ 1 }[\d]{ 1,2 }[\-/]{ 1 }[\d]{ 1,2 }/g,'');    
	    if (s==''){ //说明格式满足YYYY-MM-DD或YYYY-M-DD或YYYY-M-D或YYYY-MM-D  
	        var t=new Date(sDate.replace(/\-/g,'/'));    
	        //var ar = sDate.split(/[-/:]/);    
	        if(ar[0] != t.getYear() || ar[1] != t.getMonth()+1 || ar[2] != t.getDate()){    
	            //alert('错误的日期格式！格式为：YYYY-MM-DD或YYYY/MM/DD。注意闰年。');    
	            return false;    
	        }    
	    } else{    
	        //alert('错误的日期格式！格式为：YYYY-MM-DD或YYYY/MM/DD。注意闰年。');    
	        return false;    
	    }    
	    return true;    
	}    
	   
	//+---------------------------------------------------   
	//| 日期时间检查   
	//| 格式为：YYYY-MM-DD HH:MM:SS   
	//+---------------------------------------------------   
	function CheckDateTime(str){    
	    var reg = /^(\d+)-(\d{ 1,2 })-(\d{ 1,2 }) (\d{ 1,2 }):(\d{ 1,2 }):(\d{ 1,2 })$/;    
	    var r = str.match(reg);    
	    if(r==null)return false;    
	    r[2]=r[2]-1;    
	    var d= new Date(r[1],r[2],r[3],r[4],r[5],r[6]);    
	    if(d.getFullYear()!=r[1])return false;    
	    if(d.getMonth()!=r[2])return false;    
	    if(d.getDate()!=r[3])return false;    
	    if(d.getHours()!=r[4])return false;    
	    if(d.getMinutes()!=r[5])return false;    
	    if(d.getSeconds()!=r[6])return false;    
	    return true;    
	}    
	   
	//+---------------------------------------------------   
	//| 把日期分割成数组   
	//+---------------------------------------------------   
	Date.prototype.toArray = function(){    
	    var myDate = this;   
	    var myArray = Array();   
	    myArray[0] = myDate.getFullYear();   
	    myArray[1] = myDate.getMonth();   
	    myArray[2] = myDate.getDate();   
	    myArray[3] = myDate.getHours();   
	    myArray[4] = myDate.getMinutes();   
	    myArray[5] = myDate.getSeconds();   
	    return myArray;   
	};
	   
	//+---------------------------------------------------   
	//| 取得日期数据信息   
	//| 参数 interval 表示数据类型   
	//| y 年 m月 d日 w星期 ww周 h时 n分 s秒   
	//+---------------------------------------------------   
	Date.prototype.DatePart = function(interval){
	    var myDate = this;   
	    var partStr='';   
	    var Week = ['日','一','二','三','四','五','六'];   
	    switch (interval){
	        case 'y' :partStr = myDate.getFullYear();break;   
	        case 'm' :partStr = myDate.getMonth()+1;break;   
	        case 'd' :partStr = myDate.getDate();break;   
	        case 'w' :partStr = Week[myDate.getDay()];break;   
	        case 'ww' :partStr = myDate.WeekNumOfYear();break;   
	        case 'h' :partStr = myDate.getHours();break;   
	        case 'n' :partStr = myDate.getMinutes();break;   
	        case 's' :partStr = myDate.getSeconds();break;   
	    }   
	    return partStr;   
	};
	   
	//+---------------------------------------------------   
	//| 取得当前日期所在月的最大天数   
	//+---------------------------------------------------   
	Date.prototype.MaxDayOfDate = function(){    
	    var myDate = this;   
	    var ary = myDate.toArray();   
	    var date1 = (new Date(ary[0],ary[1]+1,1));   
	    var date2 = date1.dateAdd(1,'m',1);   
	    var result = dateDiff(date1.Format('yyyy-MM-dd'),date2.Format('yyyy-MM-dd'));   
	    return result;   
	};
	   
	//+---------------------------------------------------   
	//| 取得当前日期所在周是一年中的第几周   
	//+---------------------------------------------------   
	Date.prototype.WeekNumOfYear = function(){    
	    var myDate = this;   
	    var ary = myDate.toArray();   
	    var year = ary[0];   
	    var month = ary[1]+1;   
	    var day = ary[2];   
	    document.write('< script language=VBScript\> \n');   
	    document.write('myDate = DateValue('+month+'-'+day+'-'+year+') \n');   
	    document.write('result = DatePart("ww", '+myDate+') \n');   
	    document.write(' \n');   
	    return result;   
	};
	   
	//+---------------------------------------------------   
	//| 字符串转成日期类型    
	//| 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd   
	//+---------------------------------------------------   
	function StringToDate(DateStr){
		var d = new Date(Date.parse(DateStr.replace(/-/g,"/")));
	    return d;   
	}
	
	function getStrInStrList(strListPara, nIdx, strDelimit) {
	    var nPos, nTag, i, strResult;
	    var strList = strListPara;
	    strResult = strList;
	    strList += strDelimit;
	    nPos = 0;
	    for (i = 0; i <= nIdx; i++) {
	        nTag = strList.toString().indexOf(strDelimit, nPos);
	        if (nTag == 0) {
	            strResult = "";
	            break;
	        }
	        strResult = strList.toString().substr(nPos, nTag - nPos);
	        nPos = nTag + strDelimit.toString().length;
	    }
	    return strResult;
	}
	
	//处理cookies(有效时期单位为秒)
	function cookies(name, value, options){
		if (typeof value != 'undefined') {
			options = options || {};
			options.path = '/';
			if (value === null) {
				value = '';
				options = $.extend({}, options);
				options.expires = -1 * 24 * 60 * 60;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					//date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
					date.setTime(date.getTime() + (options.expires * 1000));
					//date = $.date.dateAdd("s", options.expires, new Date().Format("MM/dd/yyyy hh:mm:ss"))
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [ name, '=', encodeURIComponent(value), expires,path, domain, secure ].join('');
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for ( var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	}
	   
	//+---------------------------------------------------   
	//| 增强ajax的处理方法，在处理成功后统一增加权限判断
	//+---------------------------------------------------  
    var _ajax = $.ajax;
    $.ajax = function(opt){ 
    	//全局启动遮罩层
    	//top.app.message.loading();
    	//opt.data = {"_ajax":"1"};
        //备份opt中error和success方法  
    	//添加全局的设置(xhrFields和crossDomain用于跨域访问时携带cookies，否则每次请求会产生不一样的session)
    	opt.xhrFields = { withCredentials: true };
		opt.crossDomain = true;
		opt.dataType = 'json';
		opt.timeout = 120000;		//设置超时时间120秒
        var fn = {  
            error:function(XMLHttpRequest, textStatus, errorThrown){},  
            success:function(data, textStatus){}  
        }  
        if(opt.error){  
            fn.error = opt.error;  
        }  
        if(opt.success){  
            fn.success = opt.success;  
        }  
        //扩展增强处理  
        var _opt = $.extend(opt,{  
            error:function(XMLHttpRequest, textStatus, errorThrown){
            	//关闭遮罩层
            	top.app.message.loadingClose();
                //错误方法增强处理  
                fn.error(XMLHttpRequest, textStatus, errorThrown);  
            },  
            success:function(data, textStatus){ 
            	//关闭遮罩层
            	//top.app.message.loadingClose();
            	//正确方法增强处理  
                fn.success(data, textStatus);  
            }
        });  
        // 旧代码
//        _ajax(_opt);        
        // 新代码 兼容不支持异步回调的版本
        var def = _ajax.call($, _opt);
        if ('done' in def) {
            var done = def.done;
            def.done = function(func) {
                done.call(def, func);
                return def;
            };
        }
        return def;
    };  

	   
	//+---------------------------------------------------   
	//| 判断对象是否相等
	//+---------------------------------------------------  
    var toString = Object.prototype.toString;
    function isFunction(obj) {
        return toString.call(obj) === '[object Function]'
    }
    function eq(a, b, aStack, bStack) {
        // === 结果为 true 的区别出 +0 和 -0
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // typeof null 的结果为 object ，这里做判断，是为了让有 null 的情况尽早退出函数
        if (a == null || b == null) return false;
        // 判断 NaN
        if (a !== a) return b !== b;
        // 判断参数 a 类型，如果是基本类型，在这里可以直接返回 false
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        // 更复杂的对象使用 deepEq 函数进行深度比较
        return deepEq(a, b, aStack, bStack);
    };

    function deepEq(a, b, aStack, bStack) {
        // a 和 b 的内部属性 [[class]] 相同时 返回 true
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                if (+a !== +a) return +b !== +b;
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                return +a === +b;
        }
        var areArrays = className === '[object Array]';
        // 不是数组
        if (!areArrays) {
            // 过滤掉两个函数的情况
            if (typeof a != 'object' || typeof b != 'object') return false;

            var aCtor = a.constructor,
                bCtor = b.constructor;
            // aCtor 和 bCtor 必须都存在并且都不是 Object 构造函数的情况下，aCtor 不等于 bCtor， 那这两个对象就真的不相等啦
            if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor && isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }

        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;

        // 检查是否有循环引用的部分
        while (length--) {
            if (aStack[length] === a) {
                return bStack[length] === b;
            }
        }

        aStack.push(a);
        bStack.push(b);

        // 数组判断
        if (areArrays) {
            length = a.length;
            if (length !== b.length) return false;
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        }
        // 对象判断
        else {
            var keys = Object.keys(a),
                key;
            length = keys.length;
            if (Object.keys(b).length !== length) return false;
            while (length--) {
                key = keys[length];
                if(key == 'tableMulti') continue;
                if (!(b.hasOwnProperty(key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        aStack.pop();
        bStack.pop();
        return true;
    }

    /**
     * 阿拉伯数字转中文数字
     * @param digit
     * @returns {string}
     */
    function toChineseNumeral(digit){
    	digit = typeof digit === 'number' ? String(digit) : digit;
        var zh = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        var unit = ['千', '百', '十', ''];
        var quot = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载', '极', '恒河沙', '阿僧祗', '那由他', '不可思议', '无量', '大数'];

        var breakLen = Math.ceil(digit.length / 4);
        var notBreakSegment = digit.length % 4 || 4;
        var segment;
        var zeroFlag = [], allZeroFlag = [];
        var result = '';

        while (breakLen > 0) {
            if (!result) { // 第一次执行
                segment = digit.slice(0, notBreakSegment);
                var segmentLen = segment.length;
                for (var i = 0; i < segmentLen; i++) {
                    if (segment[i] !== 0) {
                        if (zeroFlag.length > 0) {
                            result += '零' + zh[segment[i]] + unit[4 - segmentLen + i];
                            // 判断是否需要加上 quot 单位
                            if (i === segmentLen - 1 && breakLen > 1) {
                                result += quot[breakLen - 2];
                            }
                            zeroFlag.length = 0;
                        } else {
                            result += zh[segment[i]] + unit[4 - segmentLen + i];
                            if (i === segmentLen - 1 && breakLen > 1) {
                                result += quot[breakLen - 2];
                            }
                        }
                    } else {
                        // 处理为 0 的情形
                        if (segmentLen === 1) {
                            result += zh[segment[i]];
                            break;
                        }
                        zeroFlag.push(segment[i]);
                        continue;
                    }
                }
            } else {
                segment = digit.slice(notBreakSegment, notBreakSegment + 4);
                notBreakSegment += 4;

                for (var j = 0; j < segment.length; j++) {
                    if (segment[j] !== 0) {
                        if (zeroFlag.length > 0) {
                            // 第一次执行zeroFlag长度不为0，说明上一个分区最后有0待处理
                            if (j === 0) {
                                result += quot[breakLen - 1] + zh[segment[j]] + unit[j];
                            } else {
                                result += '零' + zh[segment[j]] + unit[j];
                            }
                            zeroFlag.length = 0;
                        } else {
                            result += zh[segment[j]] + unit[j];
                        }
                        // 判断是否需要加上 quot 单位
                        if (j === segment.length - 1 && breakLen > 1) {
                            result += quot[breakLen - 2];
                        }
                    } else {
                        // 第一次执行如果zeroFlag长度不为0, 且上一划分不全为0
                        if (j === 0 && zeroFlag.length > 0 && allZeroFlag.length === 0) {
                            result += quot[breakLen - 1];
                            zeroFlag.length = 0;
                            zeroFlag.push(segment[j]);
                        } else if (allZeroFlag.length > 0) {
                            // 执行到最后
                            if (breakLen === 1) {
                                result += '';
                            } else {
                                zeroFlag.length = 0;
                            }
                        } else {
                            zeroFlag.push(segment[j]);
                        }

                        if (j === segment.length - 1 && zeroFlag.length === 4 && breakLen !== 1) {
                            // 如果执行到末尾
                            if (breakLen === 1) {
                                allZeroFlag.length = 0;
                                zeroFlag.length = 0;
                                result += quot[breakLen - 1];
                            } else {
                                allZeroFlag.push(segment[j]);
                            }
                        }
                        continue;
                    }
                }
                --breakLen;
            }
            return result;
        }
    }
    
    //bootstrap 折叠事件，替换图标
    $('.collapse-content').on('show.bs.collapse', function (e) {
    	document.getElementById(e.target.id + 'Icon').className = 'glyphicon glyphicon-chevron-up';
    })
	$('.collapse-content').on('hide.bs.collapse', function (e) {
		document.getElementById(e.target.id + 'Icon').className = 'glyphicon glyphicon-chevron-down';
    })
    
})(jQuery);