var g_params = {}, g_iframeIndex = null, $table = $('#tableList'), g_selectRow = null;
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	// 取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
	// 设置select的宽度为200px
	$('.selectpicker').selectpicker({
		width: '120px'
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
            tenantsId: g_params.rows.tenantsId,
            userCode: $("#searchUserCode").val()
        };
        return retParam;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.user.getTenantsUser,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        uniqueId: 'userId',
        height: 320,
        onClickRow: function(row, $el){
	        	appTable.setRowClickStatus($table, row, $el);
	        	g_selectRow = row;
        }
    });
	// 搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
		g_selectRow = null;
    });
	$("#btnReset").click(function () {
		$("#searchUserCode").val("");
		// 刷新数据，否则下拉框显示不出内容
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
		g_selectRow = null;
    });
}


/**
 * 提交数据
 */
function submitAction(){
	if(g_selectRow == null || g_selectRow == undefined){
		top.app.message.notice("请选择一条数据进行操作！");
		return;
	}
	// 定义提交数据
	var submitData = {};
	submitData["taskId"] = g_params.rows.taskId;
	submitData["assignee"] = g_selectRow.userCode;
	// 异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
				// 关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("任务委派成功！");
	   			parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}