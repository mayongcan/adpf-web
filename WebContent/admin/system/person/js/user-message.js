var $table = $('#tableList'), g_msgTypeDict = null;

$(function () {
	g_msgTypeDict = top.app.getDictDataByDictTypeValue('SYS_MSG_TYPE');
	//初始化列表信息
	initTable();
});

/**
 * 初始化列表信息
 */
function initTable(){
	//搜索参数
	var searchParams = function (params) {
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.apigateway + "/api/system/message/getMyMessage",   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        height: 500,
        uniqueId: 'id',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
}

/**
 * 格式化
 * @param value
 * @param row
 */
function formatIsRead(value, row) {
	if(value == '0') 
		return "<font color=red>未阅</font>";
	else return "已阅";
}

function formatMsgType(value,row,index){
	var i = g_msgTypeDict.length;
	while (i--) {
		if(g_msgTypeDict[i].ID == value){
			return g_msgTypeDict[i].NAME;
		}
	}
	return "未知";
}
