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
//	$("#tableToolbar").empty();
//	var htmlTree = "";
//	var length = g_operRights.length;
//	for (var i = 0; i < length; i++) {
//		if(g_operRights[i].dispPosition == '1'){
//			htmlTree += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
//							"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
//						"</button>";
//		}
//	}
//	//添加树列表的权限
//	$("#tableToolbar").append(htmlTree);
}

/**
 * 初始化列表信息
 */
function initTable(){	
	//搜索参数
	var searchParams = function (params) {
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: 5000,   						//页面大小
            page: 0,  							//当前页
            groupName: $("#searchGroupName").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.func.getFuncList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'funcId',
        idField: 'funcId',
        treeShowField: 'funcName',
        parentIdField: 'parentFuncId',
        onClickRow: function(row, $el){
        	appTable.setRowClickStatus($table, row, $el);
        },
        onLoadSuccess: function(data) {
        	$table.treegrid({
        		initialState: 'collapsed',
        		treeColumn: 1,
        		expanderExpandedClass: 'glyphicon glyphicon-minus',
        		expanderCollapsedClass: 'glyphicon glyphicon-plus',
        		onChange: function() {
        			$table.bootstrapTable('resetWidth');
        		}
		    });
        },
        onColumnSwitch: function(){
        	$table.treegrid({
        		initialState: 'collapsed',
        		treeColumn: 0,
        		expanderExpandedClass: 'glyphicon glyphicon-minus',
        		expanderCollapsedClass: 'glyphicon glyphicon-plus',
        		onChange: function() {
        			$table.bootstrapTable('resetWidth');
        		}
		    });
        }
    });
	appTable.searchPannelHeight = $('#searchPannel').outerHeight(true) + 50;
	//初始化Table相关信息
	appTable.initTable($table);
	//搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		$("#searchGroupName").val("");
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	$("#funcAdd").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows == null ){
			top.app.message.alert("请选择要新增节点的父节点！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'add';
		params.node = rows;
//		params.parentNode = getSelNodeParent();
//		params.allTreeData = g_allTreeData;
		params.operUrl = top.app.conf.url.apigateway + $("#funcAdd").data('action-url');
		top.app.layer.editLayer('新增权限', ['710px', '510px'], '/admin/system/func/func-edit.html', params, function(){
   			//重新加载
			$treeView.jstree(true).refresh();
		});
    });
	$("#funcEdit").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择需要编辑的节点！");
			return;
		}
		if(getSelNodeParent() == null){
			top.app.message.alert("无法编辑权限根节点！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.node = g_selectNode;
		params.parentNode = getSelNodeParent();
		params.allTreeData = g_allTreeData;
		params.operUrl = top.app.conf.url.apigateway + $("#funcEdit").data('action-url');
		top.app.layer.editLayer('编辑权限', ['710px', '510px'], '/admin/system/func/func-edit.html', params, function(){
   			//重新加载列表
			$treeView.jstree(true).refresh();
		});
    });
	$("#funcDel").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择要删除的节点！");
			return;
		}
		if(getSelNodeParent() == null){
			top.app.message.alert("无法删除权限根节点！");
			return;
		}
		if(g_selectNode.data.isBase == 'Y'){
			top.app.message.alert("不能删除基础权限模块！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#funcDel").data('action-url');
		var idsList = g_selectNode.id;
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: idsList,
				contentType: "application/json",
				success: function(data){
					if(top.app.message.code.success == data.RetCode){
			   			//重新加载列表
						$treeView.jstree(true).refresh();
			   			top.app.message.alert("数据删除成功！");
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
	$("#funcExport").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择需要导出的节点！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#funcExport").data('action-url');
		operUrl = operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + "&funcId=" + g_selectNode.id;
		window.open(operUrl);
    });
	$("#funcImport").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择需要导入位置的节点！");
			return;
		}
		//设置参数
		var params = {};
		params.node = g_selectNode;
		params.parentNode = getSelNodeParent();
		params.allTreeData = g_allTreeData;
		params.operUrl = top.app.conf.url.apigateway + $("#funcImport").data('action-url');
		top.app.layer.editLayer('导入权限菜单', ['710px', '470px'], '/admin/system/func/func-import.html', params, function(){
   			//重新加载列表
			$treeView.jstree(true).refresh();
		});
    });
}

function formatOperate(value, row, index){
	//根据权限是否显示操作菜单
	var length = g_operRights.length;
	var operateBtn = "";
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].dispPosition == '2'){
			operateBtn += '<i class="' + g_operRights[i].funcIcon + '" aria-hidden="true" onclick="' + g_operRights[i].funcFlag  + '(' + row.funcId + ', \'' + g_operRights[i].funcLink + '\')" style="margin-right:10px;cursor:pointer"></i> ';
		}
	}
	return operateBtn;
}

function funcAdd(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
}

function funcEdit(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
}

function funcDel(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
	if(row.funcFlag == 'Root'){
		top.app.message.notice("无法删除权限根节点！");
		return;
	}
	if(row.isBase == 'Y'){
		top.app.message.notice("不能删除基础权限模块！");
		return;
	}
	appTable.delData($table, url, id + "");
}

function funcExport(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
}

function funcImport(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
}

function tableFormatName(value, row) {
	if(row.funcType == '100200') {
		if(row.funcFlag == 'Root')
			return '<i class="fa fa-sitemap"></i> ' + value;
		else
			return '<i class="fa fa-folder"></i> ' + value;
	}
	else if(row.funcType == '100300') return '<i class="fa fa-list"></i> ' + value;
	else return '<i class="fa fa-key"></i> ' + value;
}

function tableFormatType(value, row) {
	if(value == '100200') return "<span>文件夹</span>";
	else if(value == '100300') return "<span style='color:#65a9e8'>菜单</span>";
	else return "<span style='color:#25a589'>权限</span>";
}

function tableFormatIcon(value, row) {
	return '<i class="' + value + '"></i>';
}

function tableFormatDispPosition(value, row) {
	if(row.funcType == '100400'){
		if(value == '1') return "列表上方";
		else return "列表右侧";
	}
}

function tableFormatIsBase(value, row) {
	if(value == 'Y') return "是";
	else return "否";
}

function tableFormatIsShow(value, row) {
	if(value == 'Y') return "是";
	else return "否";
}

function tableFormatIsBlank(value, row) {
	if(value == 'Y') return "是";
	else return "否";
}