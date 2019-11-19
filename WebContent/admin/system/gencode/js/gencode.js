var $table = $('#tableList'), g_dictShareTypeDict = [];

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
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbar").empty();
	var htmlTable = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag  + "' data-action-url='" + operRights[i].funcLink + "'>" + 
						"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
					 "</button>";
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
            moduleName: $("#moduleName").val(),
            tableName: $("#tableName").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.gencode.getList,   		//请求后台的URL（*）
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
		$("#moduleName").val("");
		$("#tableName").val("");
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#genCodeAdd").click(function () {
		//设置传送对象
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'add';
		top.app.info.iframe.params.operUrl = top.app.conf.url.apigateway + $("#genCodeAdd").data('action-url');
		
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "gencode-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#genCodeEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		//设置传送对象
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'edit';
		top.app.info.iframe.params.rows = rows[0];
		top.app.info.iframe.params.operUrl = top.app.conf.url.apigateway + $("#genCodeEdit").data('action-url');
		
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "gencode-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#genCodeDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.codeId;
		});
		appTable.delData($table, $("#genCodeDel").data('action-url'), idsList);
    });
	$("#genCodeTable").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#genCodeTable").data('action-url');
		operUrl = operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + "&codeId=" + rows[0].codeId;
		window.open(operUrl);
    });
	$("#genCodeFun").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#genCodeFun").data('action-url');
		operUrl = operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + "&codeId=" + rows[0].codeId;
		window.open(operUrl);
    });
	$("#genCodeFile").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#genCodeFile").data('action-url');
		//先用ajax生成文件，生成成功后下载文件
		$.ajax({
		    url: operUrl,
		    method: 'GET',
		    data: {
			    	access_token: top.app.cookies.getCookiesToken(),
			    	codeId:rows[0].codeId
		    },
		    success : function(data) { 
		    		if(top.app.message.code.success == data.RetCode){
					//下载生成的文件
					var url = top.app.conf.url.apigateway + "/api/system/gencode/downloadFile?access_token=" + top.app.cookies.getCookiesToken() + "&zipFileName=" + data.RetData;
					window.open(url);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        },  
	        error : function(responseStr) { 
	   			top.app.message.error("生成文件出错，请稍后重试！");
	        } 
		});
    });
}

/**
 * 格式化字典类型
 * @param value
 * @param row
 */
function tableFormatType(value, row) {
	if(value == '1') return '列表';
	else if(value == '2') return '树';
	else return "未知";
}