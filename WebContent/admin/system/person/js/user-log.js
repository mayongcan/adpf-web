var $table = $('#tableList');

$(function () {
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
            tenantsId: top.app.info.userInfo.tenantsId,
            organizerId: top.app.info.userInfo.organizerId,
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.log.getLogList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        height: 495,
        uniqueId: 'logId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
//	//加载数据成功后执行事件
//	$table.on('load-success.bs.table', function (data) {
//		appTable.resetTableHeightOnLoad($table, 0);
//    });
//	//重置表格高度
//	appTable.resetTableHeight($table, 0);
}

/**
 * 格式化
 * @param value
 * @param row
 */
function tableFormatException(value, row) {
	if(row.exception != null && row.exception != undefined && row.exception != '') 
		return "<font color=red>是</font>";
	else return "否";
}
