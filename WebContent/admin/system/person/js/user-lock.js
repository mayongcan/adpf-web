var $table = $('#tableList'), g_searchPannelHeight = 0, g_tenantsStatusDict = [];

$(function () {
	//搜索面板高度
	g_searchPannelHeight = $('#searchPannel').outerHeight(true);
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
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.user.getLockAccount,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'userId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//加载数据成功后执行事件
	$table.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($table, g_searchPannelHeight);
    });
	//重置表格高度
	appTable.resetTableHeight($table, g_searchPannelHeight);

	//权限--导出功能
	$("#toolbarExport").click(function () {
		appTable.exportTable($table);
    });
	//权限--单选多选切换功能
	$("#toolbarMultiCheck").click(function () {
		appTable.multiCheck($table, $("#toolbarMultiCheck i"));
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#systemUserUnlockAccount").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要解锁的账号！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.userId;
    		});
		appTable.postData($table, $("#systemUserUnlockAccount").data('action-url'), idsList, 
				"确定要解锁当前选中的账号？", "账号解锁成功！");
    });
}