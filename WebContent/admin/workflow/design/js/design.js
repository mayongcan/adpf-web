var $table = $('#tableList'), g_tenantsId = null, g_typeDict = [];

$(function () {
	//获取权限菜单
	initFunc();
	//获取字典
	initComboBox();
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
	//初始化下拉选择列表(租户)
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
		if(operRights[i].funcFlag.indexOf("workflowDeploy") == -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag  + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						 "</button>";
		}
	}
	//添加表格的权限
	//htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

/**
 * 添加搜索框
 */
function initComboBox(){
	g_typeDict = top.app.getDictDataByDictTypeValue('SYS_WORKFLOW_TYPE');
	top.app.addComboBoxOption($("#searchType"), g_typeDict, true);
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
            searchType: $("#searchType").val(),
            tenantId: g_tenantsId
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.workflow.design.getList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
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
        $("#searchType").val("");
		//刷新数据，否则下拉框显示不出内容
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
	$("#toolbarExport").css("display", "none");
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#workflowDesignAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.typeDict = g_typeDict;
		params.operUrl = top.app.conf.url.apigateway + $("#workflowDesignAdd").data('action-url');
		top.app.layer.editLayer('新增流程', ['710px', '350px'], '/admin/workflow/design/design-edit.html', params, function(retParams){
			$table.bootstrapTable('refresh');
		});
    });
	$("#workflowDesignEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.typeDict = g_typeDict;
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#workflowDesignEdit").data('action-url');
		top.app.layer.editLayer('编辑流程', ['710px', '350px'], '/admin/workflow/design/design-edit.html', params, function(retParams){
			$table.bootstrapTable('refresh');
		});
    });
	$("#workflowDesignDel").click(function () {
		operHandle($("#workflowDesignDel").data('action-url'), "确定要删除当前选中的流程？", "流程删除成功！");
    });
	$("#workflowDesignEnter").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "/admin/workflow/modeler.html?_pid=" + pid + "&modelId=" + rows[0].id;
		window.location.href = encodeURI(url);
    });
	$("#workflowDesignImport").click(function () {
		//设置参数
		var params = {};
		params.typeDict = g_typeDict;
		params.operUrl = top.app.conf.url.apigateway + $("#workflowDesignImport").data('action-url');
		top.app.layer.editLayer('导入流程', ['710px', '400px'], '/admin/workflow/design/design-import.html', params, function(retParams){
			$table.bootstrapTable('refresh');
		});
    });
	$("#workflowDesignExport").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#workflowDesignExport").data('action-url');
		operUrl = operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + "&id=" + rows[0].id;
		window.open(operUrl);
    });
	$("#workflowDesignDeploy").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条需要部署的流程!");
			return;
		}
		var idsList = "", hasDeploy = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.id;
			if(rowData.deploymentId != null && rowData.deploymentId != undefined && rowData.deploymentId != '')
				hasDeploy = true;
		});
//		if(hasDeploy){
//			top.app.message.alert("该流程已部署，需要重新部署请删除已部署的流程!");
//			return;
//		}
		var operUrl = top.app.conf.url.apigateway + $("#workflowDesignDeploy").data('action-url');
		top.app.message.confirm("确定要部署当前选中的流程？", function(){
			top.app.message.loading();
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'GET',
				data: {idsList: idsList},
				success: function(data){
		   			top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			//重新加载列表
						$table.bootstrapTable('refresh');
			   			top.app.message.alert("流程部署成功！");
			   			appTable.selections = null;
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        },error:function(xhr, textStatus, errorThrown){
		   			top.app.message.loadingClose();
					$table.bootstrapTable('refresh');
					top.app.message.close();
	    	   	}
			});
		});
    });
	$("#workflowDesignDeployList").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		if(rows[0].deploymentId == null || rows[0].deploymentId == undefined || rows[0].deploymentId == ''){
			top.app.message.alert("该流程暂未部署!");
			return;
		}
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "deploy.html?_pid=" + pid + "&modelId=" + rows[0].id + "&tenantId=" + rows[0].tenantId + "&deployId=" + rows[0].deploymentId;
		window.location.href = encodeURI(url);
    });
}

function operHandle(url, msg, successMsg){
	var rows = appTable.getSelectionRows($table);
	if(rows.length == 0 || rows.length > 1){
		top.app.message.alert("请选择一条数据再进行操作!");
		return;
	}
	var idsList = "";
	$.each(rows, function(i, rowData) {
		if(idsList != "") idsList = idsList + ",";
		idsList = idsList + rowData.id;
	});
	var operUrl = top.app.conf.url.apigateway + url;
	top.app.message.confirm(msg, function(){
		top.app.message.loading();
		$.ajax({
			url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
		    method: 'POST',
			data: idsList,
			contentType: "application/json",
			success: function(data){
				top.app.message.loadingClose();
				if(top.app.message.code.success == data.RetCode){
		   			//重新加载列表
					$table.bootstrapTable('refresh');
		   			top.app.message.notice(successMsg);
		   			appTable.selections = null;
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        }
		});
	});
}

/**
 * 初始化下拉选择列表(租户)
 */
function initComboBoxList() {
	//根租户的管理员才能管理多个租户下的组织
	if(top.app.info.userInfo.isAdmin == 'Y') {
		//设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '150px'
		});
		if(top.app.info.tenantsInfo.isRoot == 'Y') {
			$('#divTenantsBox').css('display', 'block');
			//获取数据
			top.app.getTenantsListBox($('#tenantsBox'), function() {
				$('.selectpicker').selectpicker('refresh');
				g_tenantsId = $('#tenantsBox').val();
			});
			//绑定租户下拉框变更事件
			$('#tenantsBox').on('changed.bs.select', function(e) {
				//设置全局的租户ID
				g_tenantsId = $('#tenantsBox').val();
			});
		} else {
			g_tenantsId = top.app.info.tenantsInfo.tenantsId;
		}
	}
}

function tableFormatType(value, row) {
	var i = g_typeDict.length;
	while (i--) {
		if(g_typeDict[i].ID == value){
			return g_typeDict[i].NAME;
		}
	}
	return "";
}

function tableFormatDeploy(value, row) {
	if(row.deploymentId == null || row.deploymentId == undefined || row.deploymentId == '') return "未部署";
	else return "<font color='red'>已部署</font>";
}