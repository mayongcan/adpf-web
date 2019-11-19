var $table = $('#tableList'), g_tenantsStatusDict = [];

$(function () {
	//获取权限菜单
	appTable.addFuncButton($("#tableToolbar"));
	//获取租户状态字典
	initComboBox();
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
});

/**
 * 添加租户状态搜索框
 */
function initComboBox(){
	g_tenantsStatusDict = top.app.getDictDataByDictTypeValue('SYS_TENANTS_STATUS');
	top.app.addComboBoxOption($("#searchStatus"), g_tenantsStatusDict, true);
}

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
            searchName: $("#searchName").val(),
            searchStatus: $("#searchStatus").val()
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.tenants.getTenantsList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'tenantsId',
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
        $("#searchStatus").val("");
		//刷新数据，否则下拉框显示不出内容
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#tenantsAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.tenantsStatusDict = g_tenantsStatusDict;
		params.operUrl = top.app.conf.url.apigateway + $("#tenantsAdd").data('action-url');
		top.app.layer.editLayer('新增租户', ['710px', '350px'], '/admin/system/tenants/tenants-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#tenantsEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.tenantsStatusDict = g_tenantsStatusDict;
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#tenantsEdit").data('action-url');
		top.app.layer.editLayer('编辑租户', ['710px', '350px'], '/admin/system/tenants/tenants-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#tenantsDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.tenantsId;
    		});
		appTable.delData($table, $("#tenantsDel").data('action-url'), idsList);
    });
	$("#tenantsSetMgr").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一行需要编辑的数据再进行操作!");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#tenantsSetMgr").data('action-url');
		top.app.layer.editLayer('设置租户管理员', ['900px', '550px'], '/admin/system/tenants/tenants-admin.html', params, function(){});
    });
	$("#tenantsSaveFunc").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一行需要编辑的数据再进行操作!");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#tenantsSaveFunc").data('action-url');
		top.app.layer.editLayer('设置租户权限', ['710px', '500px'], '/admin/system/tenants/tenants-func.html', params, function(){});
    });
	$("#tenantsEditExtendData").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#tenantsEditExtendData").data('action-url');
		top.app.layer.editLayer('编辑租户扩展信息', ['710px', '350px'], '/admin/system/tenants/tenants-extend.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
}

/**
 * 格式化租户状态
 * @param value
 * @param row
 */
function tableFormatStatus(value, row) {
	return appTable.tableFormatDictValue(g_tenantsStatusDict, value);
}

/**
 * 格式化租户状态
 * @param value
 * @param row
 */
function tableFormatIsRoot(value, row) {
	if(row.isRoot == 'Y') return "是";
	else return "否";
}