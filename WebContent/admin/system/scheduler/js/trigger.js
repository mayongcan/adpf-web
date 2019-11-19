var $table = $('#tableList'), g_jobName = null, g_jobGroup = null;
$(function () {
	g_jobName = decodeURI($.utils.getUrlParam(window.location.search,"jobName"));
	g_jobGroup = decodeURI($.utils.getUrlParam(window.location.search,"jobGroup"));
	$("#showInfoMsg").empty();
	$("#showInfoMsg").append("<span style='margin-right:20px;margin-left:10px;'>-- 任务名称:<span style='color:#1ab394;margin-left:5px;'>" + g_jobName + "</span></span>");
	//初始化权限
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
		if(operRights[i].funcFlag.indexOf("schedulerTrigger") != -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag  + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						 "</button>";
		}
	}
	htmlTable += "<button type='button' class='btn btn-outline btn-default' id='toolbarBack'>" + 
					"<i class='glyphicon glyphicon-arrow-left' aria-hidden='true'></i> 返回" +
				 "</button>"
	//添加表格的权限
	htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

/**
 * 初始化列表信息
 */
function initTable(){
	//搜索参数
	var searchParams = function (params) {
        var param = {
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
            jobName: g_jobName,
            jobGroup: g_jobGroup
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.scheduler.triggerList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//搜索面板高度
	appTable.searchPannelHeight = $('#titleInfo').outerHeight(true) - 10;
	//初始化Table相关信息
	appTable.initTable($table);
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#schedulerTriggerAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.jobName = g_jobName;
		params.jobGroup = g_jobGroup;
		params.operUrl = top.app.conf.url.apigateway + $("#schedulerTriggerAdd").data('action-url');
		top.app.layer.editLayer('新增触发器', ['710px', '500px'], '/admin/system/scheduler/trigger-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#schedulerTriggerEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.jobName = g_jobName;
		params.jobGroup = g_jobGroup;
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#schedulerTriggerEdit").data('action-url');
		top.app.layer.editLayer('编辑触发器', ['710px', '500px'], '/admin/system/scheduler/trigger-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#schedulerTriggerDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行删除！");
			return;
		}
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			var submitData = {};
			submitData["triggerName"] = rows[0].triggerName;
			submitData["triggerGroup"] = rows[0].triggerGroup;
			//异步处理
			$.ajax({
				url: top.app.conf.url.apigateway + $("#schedulerTriggerDel").data('action-url') + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data:JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					if(top.app.message.code.success == data.RetCode){
						//关闭页面前设置结果
			   			top.app.message.alert("数据删除成功！");
						$table.bootstrapTable('refresh');
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
	//返回数据类型页面
	$("#toolbarBack").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "job.html?_pid=" + pid;
    });
}

/**
 * 格式数据共享字段
 * @param value
 * @param row
 */
function formatDataType(value, row) {
	if(value == "simple"){
		return "简单"
	}else if(value == "cron"){
		return "Cron表达式";
	}
}