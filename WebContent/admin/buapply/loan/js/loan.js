var $table = $('#tableList'), g_formHeight = "450";

$(function () {
	// 获取权限菜单
	initFunc();
	// 初始化列表信息
	initTable();
	// 初始化权限功能按钮点击事件
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
        };
        return param;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.workflow.buapply.loan.getList,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        onClickRow: function(row, $el){
        	appTable.setRowClickStatus($table, row, $el);
        }
    });
	// 初始化Table相关信息
	appTable.initTable($table);
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	$("#buapplyLoanApply").click(function () {
		top.app.getWorkflowStartFrom(top.app.info.workflow.key.loan, function(data){
			if(data.RetData == null || data.RetData == undefined || data.RetData.length == 0 || data.RetData == ''){
				// 表单数据为空
				top.app.message.alert("获取流程表单数据为空！");
			}else{
				if(data.formType == '1') g_formHeight = data.RetData.length * 60 + 110;
				else g_formHeight = data.formCnt * 60 + 110;
				var params = {};
				params.type = 'add';
				params.formType = data.formType;
				params.data = data.RetData;
				params.idList = data.idList;
				params.operUrl = top.app.conf.url.apigateway + $("#buapplyLoanApply").data('action-url');
				top.app.layer.editLayer('流程申请', ['710px', g_formHeight + 'px'], '/admin/buapply/loan/loan-edit.html', params, function(retParams){
					$table.bootstrapTable('refresh');
				});
			}
		});
    });
	$("#buapplyLoanEditApply").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		if(rows[0].processId != null && rows[0].processId != undefined && rows[0].processId != ''){
			top.app.message.alert("已提交的流程不能再编辑！");
			return;
		}
		top.app.getWorkflowStartFrom(top.app.info.workflow.key.loan, function(data){
			if(data.RetData == null || data.RetData == undefined || data.RetData.length == 0 || data.RetData == ''){
				// 表单数据为空
				top.app.message.alert("获取流程表单数据为空！");
			}else{
				if(data.formType == '1')
					g_formHeight = data.RetData.length * 60 + 110;
				else
					g_formHeight = data.formCnt * 60 + 110;
				var params = {};
				params.type = 'edit';
				params.formType = data.formType;
				params.data = data.RetData;
				params.rows = rows[0];
				params.operUrl = top.app.conf.url.apigateway + $("#buapplyLoanEditApply").data('action-url');
				top.app.layer.editLayer('修改流程申请', ['710px', g_formHeight + 'px'], '/admin/buapply/loan/loan-edit.html', params, function(retParams){
					$table.bootstrapTable('refresh');
				});
			}
		});
    });
	$("#buapplyLoanDelApply").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		if(rows[0].processId != null && rows[0].processId != undefined && rows[0].processId != ''){
			top.app.message.alert("已经提交的流程不能删除！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.id;
    		});
		appTable.delData($table, $("#buapplyLoanDelApply").data('action-url'), idsList);
    });
	$("#buapplyLoanSubmitApply").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		if(rows[0].processId != null && rows[0].processId != undefined && rows[0].processId != ''){
			top.app.message.alert("当前选中的流程已经提交！");
			return;
		}
		var submitData = {};
		submitData["id"] = rows[0].id;
		submitData["modelKey"] = top.app.info.workflow.key.loan;
		var operUrl = top.app.conf.url.apigateway + $("#buapplyLoanSubmitApply").data('action-url');
		top.app.message.confirm("确定要提交当前的申请？", function(){
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					if(top.app.message.code.success == data.RetCode){
			   			// 重新加载列表
						$table.bootstrapTable('refresh');
			   			top.app.message.alert("提交申请成功！");
			   			appTable.selections = null;
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
	$("#buapplyLoanProgress").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		if(rows[0].processId == null || rows[0].processId == undefined || rows[0].processId == ''){
			top.app.message.alert("当前选中的流程还没有提交！");
			return;
		}
		top.app.layer.openWindows('查看申请进度', ['710px', '500px'], "/admin/workflow/diagram-viewer/index.html?processDefinitionId=" + rows[0].processDefId + "&processInstanceId=" + rows[0].processId);
    });
}

function tableFormatStatus(value, row) {
	if(row.processId == null || row.processId == undefined || row.processId == '') 
		return "<font color='red'>未提交</font>";
	else return "已提交";
}