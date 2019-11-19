var g_params = {}, $tableRestful = $('#tableRestfulList'), g_restfulSelectRow = null, 
	$tableCustom = $('#tableCustomList'), g_customSelectRow = null,
	g_procParams = [], g_restfulParams = [], g_customParams = [];

$(function () {
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "job.html?_pid=" + pid;
    });
	$("#layerOk").click(function () {
		$("form").submit();
    });
	g_params = top.app.info.iframe.params;
	//初始化列表信息
	initRestfulTable();
	initCustomTable();
	initView();
});

/**
 * 初始化界面
 */
function initView(){
	//判断是新增还是修改
	if(g_params.type == "edit"){
		//不能修改任务名称
		$('#jobName').attr("readonly",true);
		$('#titleDiv').html('编辑定时任务');
		$('#jobName').val(g_params.rows.jobName);
		$('#jobDescription').val(g_params.rows.jobDescription);
		
		//存储过程参数
		var jsonData = eval("(" + g_params.rows.jobData.jobDetail + ")");
		var jobType = g_params.rows.jobData.jobType.toLowerCase();
		$('#jobType').val(jobType);
		if(jobType == "proc"){
			$('#dbType').val(jsonData.dbType);
			$('#dbName').val(jsonData.dbName);
			$('#dbUrl').val(jsonData.dbUrl);
			$('#dbUser').val(jsonData.dbUser);
			$('#dbPwd').val(jsonData.dbPwd);
			$('#procName').val(jsonData.procName);
			if(jsonData.procParams != null && jsonData.procParams != undefined && jsonData.procParams.length > 0){
				$('#vProcParams').val("参数列表");
				g_procParams = jsonData.procParams;
			}
			else $("#vProcParams").val("无参数");
		}else if(jobType=="restful"){
			$("#restType").val(jsonData.restType);
			$("#restUrl").val(jsonData.restUrl);
			for(var i = 0; i < jsonData.restParams.length; i++){
				$tableRestful.bootstrapTable('insertRow', {
					index: i, 
					row: jsonData.restParams[i]
				});
			}
		}else{
			$("#jobClassName").val(g_params.rows.jobClassName);
			for(var i = 0; i < jsonData.params.length; i++){
				$tableCustom.bootstrapTable('insertRow', {
					index: i, 
					row: jsonData.params[i]
				});
			}
		}
	}else{
		$('#titleDiv').html('新建定时任务');
		$("#dbUrl").val("jdbc:mysql://IP:3306/数据库名");
	}
	
	//绑定下拉框变更事件
	$('#jobType').on('changed.bs.select', function (e) {
		setJobTypeShow();
	});
	setJobTypeShow();
	
	//绑定下拉框变更事件
	$('#dbType').on('changed.bs.select', function (e) {
		if($('#dbType').val() == 'MySql'){
			$("#dbUrl").val("jdbc:mysql://IP:3306/数据库名称");
		}else if($('#dbType').val() == 'Oracle'){
			$("#dbUrl").val("jdbc:oracle:thin:@IP:1521:实例名称");
		}else if($('#dbType').val() == 'SqlServer'){
			$("#dbUrl").val("jdbc:sqlserver://IP:1433;DatabaseName=数据库名称");
		}else if($('#dbType').val() == 'Mycat'){
			$("#dbUrl").val("jdbc:mysql://IP:8066/数据库名称");
		}
	});
	
	$("#vProcParams").click(function () {
		if($('#dbName').val() == '' || $('#dbUrl').val() == '' || $('#dbUser').val() == '' || $('#dbPwd').val() == '' || $('#procName').val() == ''){
   			top.app.message.alert("数据库相关内容不能为空");
			return;
		}
		//设置参数
		var params = {};
		params.dbType = $('#dbType').val();
		params.dbName = $('#dbName').val();
		params.dbUrl = $('#dbUrl').val();
		params.dbUser = $('#dbUser').val();
		params.dbPwd = $('#dbPwd').val();
		params.procName = $('#procName').val();
		params.procParams = g_procParams;
		top.app.layer.editLayer('添加存储过程参数', ['710px', '500px'], '/admin/system/scheduler/proc-params.html', params, function(retParams){
			if(retParams != null && retParams != undefined && retParams.length > 0){
				if(retParams[0] == '参数列表'){
					g_procParams = retParams[1];
				}
				$("#vProcParams").val(retParams[0]);
			} 
		});
    });
	
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

function setJobTypeShow(){
	if($('#jobType').val() == 'proc'){
		$("#procDiv").show();
		$("#restfulDiv").hide();
		$("#customDiv").hide();
	}else if($('#jobType').val() == 'restful'){
		$("#procDiv").hide();
		$("#restfulDiv").show();
		$("#customDiv").hide();
	}else {
		$("#procDiv").hide();
		$("#restfulDiv").hide();
		$("#customDiv").show();
	}
}

function initRestfulTable(){
	//初始化列表
	$tableRestful.bootstrapTable({
        uniqueId: 'paramName',
        onClickRow: function(row, $el){
	        	g_restfulSelectRow = row;
	        	$tableRestful.find('.success').removeClass('success');
	        	$el.addClass('success');
        }
    });

	$("#toolbarRestfulAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		top.app.layer.editLayer('添加参数', ['710px', '300px'], '/admin/system/scheduler/job-params-edit.html', params, function(retParams){
			g_restfulSelectRow = null;
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取参数失败！");
				return;
			}
			var dataRows = $tableRestful.bootstrapTable('getData');
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].paramName == retParams[0].paramName){
					top.app.message.alert("参数名称不能重复！");
					return;
				}
			}
			var index = 0;
			if(dataRows != null && dataRows != undefined && dataRows.length > 0) index = dataRows.length;
			$tableRestful.bootstrapTable('insertRow', {
				index: index, 
				row: retParams[0]
			});
		});
    });

	$("#toolbarRestfulEdit").click(function () {
		if(g_restfulSelectRow == null){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = g_restfulSelectRow;
		top.app.layer.editLayer('编辑参数', ['710px', '300px'], '/admin/system/scheduler/job-params-edit.html', params, function(retParams){			
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取参数失败！");
				return;
			}
			var dataRows = $tableRestful.bootstrapTable('getData');
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].paramName == g_restfulSelectRow.paramName){
					index = i;
					break;
				}
			}
			$tableRestful.bootstrapTable('updateRow', {
				index: index, 
				row: retParams[0]
			});
			g_restfulSelectRow = null;
		});
    });

	$("#toolbarRestfulDel").click(function () {
		if(g_restfulSelectRow == null){
			top.app.message.alert("请选择一条数据进行删除！");
			return;
		}
		$tableRestful.bootstrapTable('removeByUniqueId', g_restfulSelectRow.paramName);
		g_restfulSelectRow = null;
    });
}

function initCustomTable(){
	//初始化列表
	$tableCustom.bootstrapTable({
        uniqueId: 'paramName',
        onClickRow: function(row, $el){
	        	g_customSelectRow = row;
	        	$tableCustom.find('.success').removeClass('success');
	        	$el.addClass('success');
        }
    });

	$("#toolbarCustomAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		top.app.layer.editLayer('添加参数', ['710px', '300px'], '/admin/system/scheduler/job-params-edit.html', params, function(retParams){
			g_customSelectRow = null;
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取参数失败！");
				return;
			}
			var dataRows = $tableCustom.bootstrapTable('getData');
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].paramName == retParams[0].paramName){
					top.app.message.alert("参数名称不能重复！");
					return;
				}
			}
			var index = 0;
			if(dataRows != null && dataRows != undefined && dataRows.length > 0) index = dataRows.length;
			$tableCustom.bootstrapTable('insertRow', {
				index: index, 
				row: retParams[0]
			});
		});
    });

	$("#toolbarCustomEdit").click(function () {
		if(g_customSelectRow == null){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = g_customSelectRow;
		top.app.layer.editLayer('编辑参数', ['710px', '300px'], '/admin/system/scheduler/job-params-edit.html', params, function(retParams){
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取参数失败！");
				return;
			}
			var dataRows = $tableCustom.bootstrapTable('getData');
			var index = 0;
			for(var i = 0; i < dataRows.length; i++){
				if(dataRows[i].paramName == g_customSelectRow.paramName){
					index = i;
					break;
				}
			}
			$tableCustom.bootstrapTable('updateRow', {
				index: index, 
				row: retParams[0]
			});
			g_customSelectRow = null;
		});
    });

	$("#toolbarCustomDel").click(function () {
		if(g_customSelectRow == null){
			top.app.message.alert("请选择一条数据进行删除！");
			return;
		}
		$tableCustom.bootstrapTable('removeByUniqueId', g_customSelectRow.paramName);
		g_customSelectRow = null;
    });
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
        		jobName: {required: true},
        },
        messages: {
        		jobName: {required: "请输入任务名称"},
        },
        //重写showErrors
        showErrors: function (errorMap, errorList) {
            $.each(errorList, function (i, v) {
                //在此处用了layer的方法
                layer.tips(v.message, v.element, { tips: [1, '#3595CC'], time: 2000 });
                return false;
            });  
        },
        //失去焦点时不验证
        onfocusout: false,
        submitHandler: function () {
	        	if($("#jobType").val() == 'proc'){
	            	submitProcAction();
	        	}else if($("#jobType").val() == 'restful'){
	            	submitRestfulAction();
	        	}else{
	            	submitCustomAction();
	        	}
        }
    });
}

/**
 * 提交数据(存储过程)
 */
function submitProcAction(){
	if($('#dbName').val() == '' || $('#dbUrl').val() == '' || $('#dbUser').val() == '' || $('#dbPwd').val() == '' || $('#procName').val() == ''){
		top.app.message.alert("数据库相关内容不能为空");
		return;
	}
	if($('#vProcParams').val() == ''){
		top.app.message.alert("请选择存储过程参数");
		return;
	}
	//定义提交数据
	var submitData = {};
	submitData["dbType"] = $("#dbType").val();
	submitData["dbUrl"] = $("#dbUrl").val();
	submitData["dbUser"] = $("#dbUser").val();
	submitData["dbPwd"] = $("#dbPwd").val();
	submitData["dbName"] = $("#dbName").val();
	submitData["procName"] = $("#procName").val();
	submitData["procParams"] = g_procParams;
	
	var url = top.app.conf.url.api.system.scheduler.addProcJob + "?access_token=" + top.app.cookies.getCookiesToken();
	if(g_params.type == "edit") url = top.app.conf.url.api.system.scheduler.editProcJob + "?access_token=" + top.app.cookies.getCookiesToken() + 
		"&oldName=" + g_params.rows.jobName + "&oldGroup=" + g_params.rows.jobGroup;
	ajaxSubmit(url, submitData);
}

function submitRestfulAction(){
	if($('#restUrl').val() == ''){
		top.app.message.alert("接口地址不能为空");
		return;
	}
	var rows = $tableRestful.bootstrapTable('getData');
	var restParams = [];
	if(rows.length > 0){
		$(rows).each(function(i,row){
			restParams.push({
				"paramName":row.paramName,
				"paramType":row.paramType,
				"paramValue":row.paramValue
			});
		});
	}
	
	//定义提交数据
	var submitData = {};
	submitData["restType"] = $("#restType").val();
	submitData["restUrl"] = $("#restUrl").val();
	submitData["restParams"] = restParams;
	
	var url = top.app.conf.url.api.system.scheduler.addRestfulJob + "?access_token=" + top.app.cookies.getCookiesToken();
	if(g_params.type == "edit") url = top.app.conf.url.api.system.scheduler.editRestfulJob + "?access_token=" + top.app.cookies.getCookiesToken() + 
		"&oldName=" + g_params.rows.jobName + "&oldGroup=" + g_params.rows.jobGroup;
	ajaxSubmit(url, submitData);
}

function submitCustomAction(){
	if($('#jobClassName').val() == ''){
		top.app.message.alert("任务实体类不能为空");
		return;
	}
	var rows = $tableCustom.bootstrapTable('getData');
	var params = [];
	if(rows.length > 0){
		$(rows).each(function(i,row){
			params.push({
				"paramName":row.paramName,
				"paramType":row.paramType,
				"paramValue":row.paramValue
			});
		});
	}
	//定义提交数据
	var submitData = {};
	submitData["jobClassName"] = $("#jobClassName").val();
	submitData["params"] = params;
	
	var url = top.app.conf.url.api.system.scheduler.addCustomJob + "?access_token=" + top.app.cookies.getCookiesToken();
	if(g_params.type == "edit") url = top.app.conf.url.api.system.scheduler.editCustomJob + "?access_token=" + top.app.cookies.getCookiesToken() + 
		"&oldName=" + g_params.rows.jobName + "&oldGroup=" + g_params.rows.jobGroup;
	ajaxSubmit(url, submitData);
}


function ajaxSubmit(url, submitData){
	if(g_params.rows != null && g_params.rows != undefined){
		submitData['jobGroup'] = g_params.rows.jobGroup;
	}
	submitData["jobName"] = $.trim($("#jobName").val());
	submitData["jobType"] = $("#jobType").val();
	submitData["jobDescription"] = $.trim($("#jobDescription").val());
	//异步处理
	$.ajax({
		url: url,
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
	   			top.app.message.notice("数据保存成功！");
	   			var pid = $.utils.getUrlParam(window.location.search,"_pid");
	   			window.location.href= "job.html?_pid=" + pid;
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}