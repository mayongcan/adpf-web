var $table = $('#tableList');

$(function () {
	// 获取权限菜单
	appTable.addFuncButton($("#tableToolbar"));
	g_clientIsOption = top.app.getDictDataByDictTypeValue('SYS_CLIENT_VERSION_ISOPTION');
	// 初始化列表信息
	initTable();
	// 初始化权限功能按钮点击事件
	initFuncBtnEvent();
});

/**
 * 初始化列表信息
 */
function initTable(){
	// 搜索参数
	var searchParams = function (params) {
        var param = {   // 这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						// 页面大小
            page: params.offset / params.limit,  		// 当前页
            searchName: $("#searchName").val()
        };
        return param;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.version.getList,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	// 初始化Table相关信息
	appTable.initTable($table);

	// 搜索点击事件
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
	// 绑定工具条事件
	$("#clientVersionAdd").click(function () {
		// 设置参数
		var params = {};
		params.type = 'add';
		params.clientIsOption =  g_clientIsOption;
		params.operUrl = top.app.conf.url.apigateway + $("#clientVersionAdd").data('action-url');
		top.app.layer.editLayer('新增客户端版本', ['710px', '400px'], '/admin/system/client/version-edit.html', params, function(){
   			// 重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#clientVersionEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		// 设置参数
		var params = {};
		params.type = 'edit';
		params.rows = rows[0];
		params.clientIsOption =  g_clientIsOption;
		params.operUrl = top.app.conf.url.apigateway + $("#clientVersionEdit").data('action-url');
		top.app.layer.editLayer('编辑客户端版本', ['710px', '400px'], '/admin/system/client/version-edit.html', params, function(){
   			// 重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#clientVersionDel").click(function () {
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
		appTable.delData($table, $("#clientVersionDel").data('action-url'), idsList);
    });
}


/**
 * 格式化
 * 
 * @param value
 * @param row
 */
function tableFormatType(value, row) {
	var i = g_clientIsOption.length;
	while (i--) {
		if(g_clientIsOption[i].ID == value){
			return g_clientIsOption[i].NAME;
		}
	}
	return "未知";
}

function tableFormatSize(value, row) {
	if(value == null || value == undefined || value == '') return '';
	else return value + ' kb';
}