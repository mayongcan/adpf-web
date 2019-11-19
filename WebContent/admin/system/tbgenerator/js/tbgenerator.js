var $table = $('#tableList'), g_tenantsStatusDict = [];

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
//	htmlTable += "<button type='button' class='btn btn-outline btn-default' id='toolbarGenAllManager'>" + 
//					"<i class='glyphicon glyphicon-cog' aria-hidden='true'></i> 一键生成医疗机构管理员" +
//				 "</button>"
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
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
            searchName: $("#searchName").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.tbgenerator.getList,   		//请求后台的URL（*）
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
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#tbgeneratorFix").click(function () {
		var operUrl = top.app.conf.url.apigateway + $("#tbgeneratorFix").data('action-url');
		appTable.postData($table, $("#tbgeneratorFix").data('action-url'), "", "确定要修复自增ID？", "自增ID修复成功！");
    });

	$("#toolbarGenAllManager").click(function () {
		appTable.postData($table, "/api/hssm/hospital/hospitalManagerAddAll", "0", "确定要一键生成？", "生成成功！");
    });
}