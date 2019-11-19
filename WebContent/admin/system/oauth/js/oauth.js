var $table = $('#tableList'), g_resourceIdDict = [];

$(function () {
	g_resourceIdDict = top.app.getDictDataByDictTypeValue('SYS_AUTH_RES');
	//获取权限菜单
	appTable.addFuncButton($("#tableToolbar"));
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
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
            searchName: $("#searchName").val()
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.oauth.getOauthList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'clientId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//初始化Table相关信息
	appTable.initTable($table);
	
	//搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		$("#searchName").val("");
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#oauthAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.g_resourceIdDict = g_resourceIdDict;
		params.operUrl = top.app.conf.url.apigateway + $("#oauthAdd").data('action-url');
		top.app.layer.editLayer('新增授权客户端', ['710px', '410px'], '/admin/system/oauth/oauth-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#oauthEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.g_resourceIdDict = g_resourceIdDict;
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#oauthEdit").data('action-url');
		top.app.layer.editLayer('编辑授权客户端', ['710px', '410px'], '/admin/system/oauth/oauth-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#oauthDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.clientId;
		});
		appTable.delData($table, $("#oauthDel").data('action-url'), idsList);
    });
}

/**
 * 返回加密字符串
 */
function tableFormatBasicAuth(value, row){
	return btoa(row.clientId + ":" + row.clientSecret);
}