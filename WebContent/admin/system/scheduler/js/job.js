var $table = $('#tableList'), g_operRights = null;

$(function () {
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
	g_operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbar").empty();
	var htmlTable = "";
	var length = g_operRights.length;
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].funcFlag.indexOf("schedulerJob") != -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag  + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
							"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
						 "</button>";
		}
	}
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
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.scheduler.jobList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//初始化Table相关信息
	appTable.initTable($table);
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#schedulerJobAdd").click(function () {
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'add';
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "job-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#schedulerJobEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'edit';
		top.app.info.iframe.params.rows = rows[0];
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "job-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#schedulerJobDel").click(function () {
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			operJob($("#schedulerJobDel").data('action-url'));
		});
    });
	$("#schedulerJobFire").click(function () {
		operJob($("#schedulerJobFire").data('action-url'));
    });
	$("#schedulerJobPause").click(function () {
		operJob($("#schedulerJobPause").data('action-url'));
    });
	$("#schedulerJobResume").click(function () {
		operJob($("#schedulerJobResume").data('action-url'));
    });
	$("#schedulerJobTrigger").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		confJobTrigger(rows[0]);
    });
	$("#schedulerJobHistory").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		confJobHistory(rows[0]);
    });
}

function confJobTrigger(rows){
	var pid = $.utils.getUrlParam(window.location.search,"_pid");
	var url = "trigger.html?_pid=" + pid + "&jobName=" + rows.jobName + "&jobGroup=" + rows.jobGroup;
	window.location.href = encodeURI(url);
}

function confJobHistory(rows){
	var pid = $.utils.getUrlParam(window.location.search,"_pid");
	var url = "job-history.html?_pid=" + pid + "&jobName=" + rows.jobName + "&jobGroup=" + rows.jobGroup;
	window.location.href = encodeURI(url);
}

function operJob(url){
	var rows = appTable.getSelectionRows($table);
	if(rows.length == 0 || rows.length > 1){
		top.app.message.alert("请选择一条数据进行操作！");
		return;
	}
	var submitData = {};
	submitData["jobName"] = rows[0].jobName;
	submitData["jobGroup"] = rows[0].jobGroup;
	//异步处理
	$.ajax({
		url: top.app.conf.url.apigateway + url + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
	   			top.app.message.alert("操作成功！");
				$table.bootstrapTable('refresh');
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

/**
 * 格式化字典类型
 * @param value
 * @param row
 */
function tableFormatStatus(value, row) {
	if(value === "暂停") return '<font color="red">已暂停</font>';
	else if(value === "正常") return '<font color="blue">已启动</font>';
	else return value;
}

function tableFormatType(value, row){
	var jobType = row.jobData.jobType.toLowerCase();
	if(jobType == "proc"){
		return '存储过程';
	}else if(jobType=="restful"){
		return 'Restful接口';
	}else{
		return '自定义';
	}
}