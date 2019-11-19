var $table = $('#tableList'), g_tenantsId = null;

$(function () {
	// 获取权限菜单
	initFunc();
	// 初始化列表信息
	initTable();
	// 初始化权限功能按钮点击事件
	initFuncBtnEvent();
	// 初始化下拉选择列表(租户)
	initComboBoxList();
});

/**
 * 初始化权限
 */
function initFunc(){
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbar").empty();
	var htmlTable = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag  + "' data-action-url='" + operRights[i].funcLink + "'>" + 
						"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
					 "</button>";
	}
	// 添加表格的权限
	// htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

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
            searchName: $("#searchName").val(),
            searchProcessId: $("#searchProcessId").val(),
            tenantId: g_tenantsId
        };
        return param;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.workflow.historytask.getList,   		// 请求后台的URL（*）
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
		$("#searchProcessId").val("");
		// 刷新数据，否则下拉框显示不出内容
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	$("#workflowHistoryTaskCheck").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "/admin/workflow/history/history-view.html?_pid=" + pid + "&processInstanceId=" + rows[0].processInstanceId + 
			"&processDefinitionId=" + rows[0].processDefinitionId + "&starter=" + rows[0].starter + "&starterUserName=" + rows[0].starterUserName +  
			"&backUrl=/admin/workflow/historytask/task.html";
		window.location.href = encodeURI(url);
    });
}


/**
 * 初始化下拉选择列表(租户)
 */
function initComboBoxList() {
	// 根租户的管理员才能管理多个租户下的组织
	if(top.app.info.userInfo.isAdmin == 'Y') {
		// 设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '150px'
		});
		if(top.app.info.tenantsInfo.isRoot == 'Y') {
			$('#divTenantsBox').css('display', 'block');
			// 获取数据
			top.app.getTenantsListBox($('#tenantsBox'), function() {
				$('.selectpicker').selectpicker('refresh');
				g_tenantsId = $('#tenantsBox').val();
			});
			// 绑定租户下拉框变更事件
			$('#tenantsBox').on('changed.bs.select', function(e) {
				// 设置全局的租户ID
				g_tenantsId = $('#tenantsBox').val();
			});
		} else {
			g_tenantsId = top.app.info.tenantsInfo.tenantsId;
		}
	}
}

/**
 * 计算耗时
 */
function tableFormatDuration(value, row) {
	if(value == undefined || value == null || value == '') return "";
	else return value + "秒";
}