var $table = $('#tableList'), g_modelId = null, g_tenantsId = null, g_deployId = null, g_typeDict = [];

$(function () {
	g_modelId = $.utils.getUrlParam(window.location.search,"modelId");
	g_tenantsId = $.utils.getUrlParam(window.location.search,"tenantId");
	g_deployId = $.utils.getUrlParam(window.location.search,"deployId");
	//获取权限菜单
	initFunc();
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
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
		if(operRights[i].funcFlag.indexOf("workflowDeploy") != -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag  + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						 "</button>";
		}
	}
	htmlTable += "<button type='button' class='btn btn-outline btn-default' id='toolbarBack'>" + 
					"<i class='glyphicon glyphicon-arrow-left' aria-hidden='true'></i> 返回" +
				 "</button>"
	//添加表格的权限
	//htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
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
            modelId: g_modelId,
            tenantId: g_tenantsId,
            deployId: g_deployId,
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.workflow.deploy.getList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//搜索面板高度
	appTable.searchPannelHeight = $('#titleInfo').outerHeight(true);
	//初始化Table相关信息
	appTable.initTable($table);
	$("#toolbarExport").css("display", "none");
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#workflowDeployCheck").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		top.app.layer.openWindows('查看流程图', ['710px', '500px'], "/admin/workflow/diagram-viewer/index.html?processDefinitionId=" + rows[0].processDefinitionId);
    });
	$("#workflowDeployDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据再进行操作!");
			return;
		}
		var idsList = "", hasBind = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.deploymentId;
			if(rowData.deploymentId == g_deployId){
				hasBind = true;
			}
		});
//		if(hasBind){
//			top.app.message.alert("流程和业务已关联，无法删除!");
//			return;
//		}
		appTable.postData($table, $("#workflowDeployDel").data('action-url'), idsList,
				"确定要删除当前选中的已部署流程？", "删除已部署的流程成功！");
    });
	$("#workflowDeployHangup").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据再进行操作!");
			return;
		}
		var idsList = "", hasHangup = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.processDefinitionId;
			if(rowData.suspended == "1"){
				hasHangup = true;
			}
		});
		if(hasHangup){
			top.app.message.alert("当前流程已处于挂起状态!");
			return;
		}
		appTable.postData($table, $("#workflowDeployHangup").data('action-url'), idsList,
				"确定挂起当前选中的流程？", "流程挂起成功！");
    });
	$("#workflowDeployRestore").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据再进行操作!");
			return;
		}
		var idsList = "", hasRestore = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.processDefinitionId;
			if(rowData.suspended == "0"){
				hasRestore = true;
			}
		});
		if(hasRestore){
			top.app.message.alert("当前流程已处于激活状态!");
			return;
		}
		appTable.postData($table, $("#workflowDeployRestore").data('action-url'), idsList,
				"确定恢复当前选中的流程？", "流程恢复成功！");
    });
	//返回数据类型页面
	$("#toolbarBack").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "design.html?_pid=" + pid;
    });
}

function tableFormatSuspended(value, row) {
	if(row.suspended == '0') return "已激活";
	else return "<font color='red'>已挂起</font>";
}