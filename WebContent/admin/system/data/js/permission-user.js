var g_params = {}, g_iframeIndex = null, $table = $('#tableList');
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	// 取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
});

/**
 * 获取从父窗口传送过来的值
 * 
 * @param value
 */
function receiveParams(value){
	g_params = value;
	// 初始化界面
	initView();
}

/**
 * 初始化界面
 */
function initView(){
	// 搜索参数
	var searchParams = function (p) {
        var retParam = {   // 这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: p.limit,   						// 页面大小
            page: p.offset / p.limit,  		// 当前页
            tenantsId: g_params.tenantsId,
            organizerId: g_params.organizerId,
            permissionId: g_params.permissionId,
            dataType: "notIn",
            userName: $("#searchUserName").val(),
        };
        return retParam;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.data.getUserListByDataPermission,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        uniqueId: 'userId',
        height: 380,
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	appTable.multiCheckStatus = 2;
	// 初始化Table相关信息
	appTable.initTable($table, "reset");
	// 搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		$("#searchUserName").val("");
		$table.bootstrapTable('refresh');
    });
}


/**
 * 提交数据
 */
function submitAction(){
	var rows = appTable.getSelectionRows($table);
	if(rows == null || rows == undefined || rows.length == 0){
		top.app.message.notice("请选择最少一条数据进行操作！");
		return;
	}
	top.app.message.loading();
	var idsList = "";
	$.each(rows, function(i, rowData) {
		if(idsList != "") idsList = idsList + ",";
		idsList = idsList + rowData.userId;
	});
	// 定义提交数据
	var submitData = {};
	submitData["permissionId"] = g_params.permissionId;
	submitData["userIds"] = idsList;
	// 异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
				// 关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}