var $table = $('#tableList'), g_searchPannelHeight = 0, g_jobName = null, g_jobGroup = null;
$(function () {
	var g_jobName = decodeURI($.utils.getUrlParam(window.location.search,"jobName"));
	var g_jobGroup = decodeURI($.utils.getUrlParam(window.location.search,"jobGroup"));
	$("#showInfoMsg").empty();
	$("#showInfoMsg").append("<span style='margin-right:20px;margin-left:10px;'>-- 任务名称:<span style='color:#1ab394;margin-left:5px;'>" + g_jobName + "</span></span>");
	//搜索面板高度
	g_searchPannelHeight = $('#titleInfo').outerHeight(true);
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
        url: top.app.conf.url.api.system.scheduler.jobHistoryList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//加载数据成功后执行事件
	$table.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($table, g_searchPannelHeight - 20);
    });
	//重置表格高度
	appTable.resetTableHeight($table, g_searchPannelHeight - 20);

	//权限--导出功能
	$("#toolbarExport").click(function () {
		appTable.exportTable($table);
    });
	//权限--单选多选切换功能
	$("#toolbarMultiCheck").click(function () {
		appTable.multiCheck($table, $("#toolbarMultiCheck i"));
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//返回数据类型页面
	$("#toolbarBack").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "job.html?_pid=" + pid;
    });
}