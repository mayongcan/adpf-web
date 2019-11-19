var $table = $('#tableList'), $treeView = $('#treeView'), g_allTreeData = null;
var g_searchPannelHeight = 0, g_organizerTypeDict = [], g_organizerLevelDict = [], g_organizerFuncDict = [], g_sexDict = [];
var g_selectNode = null, g_tenantsId = null;
$(function () {
	//搜索面板高度
	g_searchPannelHeight = $('#searchPannel').outerHeight(true) + 45;
	g_organizerTypeDict = top.app.getDictDataByDictTypeValue('SYS_ORGANIZER_TYPE');
	g_organizerLevelDict = top.app.getDictDataByDictTypeValue('SYS_ORGANIZER_LEVEL');
	g_organizerFuncDict = top.app.getDictDataByDictTypeValue('SYS_ORG_FUNCTION');
	g_sexDict = top.app.getDictDataByDictTypeValue('SYS_SEX_TYPE');
	//初始化权限
	initFunc();
	//初始化列表信息
	initTable();
	//初始化树列表
	initTree();
	//初始化权限功能按钮点击事件
	initOrganizerFuncBtnEvent();
	initUserFuncBtnEvent();
	//初始化下拉选择列表(租户)
	initComboBoxList();
});

/**
 * 初始化权限
 */
function initFunc(){
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#treeToolbar").empty();
	$("#tableToolbar").empty();
	var htmlTree = "", htmlTable = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		if(operRights[i].funcFlag.indexOf("organizer") != -1){
			htmlTree += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}else{
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}
	}
	//添加树列表的权限
	$("#treeToolbar").append(htmlTree);
	//添加表格的权限
	htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

/**
 * 初始化树列表
 */
function initTree(){
	$treeView.jstree({
		'core': {
			"check_callback": true,
			'data': function (objNode, cb) {
				$.ajax({
				    url: top.app.conf.url.api.system.organizer.getOrganizerTree,
				    method: 'GET',
				    data: {
					    	access_token: top.app.cookies.getCookiesToken(),
					    	tenantsId: (g_tenantsId == null) ? top.app.info.userInfo.tenantsId : g_tenantsId,
					    	organizerId: (objNode == null) ? null : objNode.id
				    },success: function(data){
					    	if(top.app.message.code.success == data.RetCode){
					    		g_allTreeData = data.RetData;
								cb.call(this, data.RetData);
					    	}else{
					    		top.app.message.error(data.RetMsg);
					    	}
					}
				});
			}
		},
		"plugins": ["types"],
		"types": {
			"default": {
				"icon": "fa fa-folder"
			}
		}
    });
	
	$treeView.bind("activate_node.jstree", function (obj, e) {
	    // 获取当前节点
		g_selectNode = e.node;
	    //加载用户列表
	    $table.bootstrapTable('refresh', {"url": top.app.conf.url.api.system.user.getUserList});
	});
	$treeView.bind("refresh.jstree", function (e, data) {
	    // 更新选中节点
		if(g_selectNode != null){
			g_selectNode = $treeView.jstree('get_node', g_selectNode);
		}
		if(e.target.firstChild.firstChild == null) return;
		//展开根节点
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	    $treeView.jstree('open_node', rootNode);
	});
	//展开根节点
	$treeView.bind("loaded.jstree", function (e, data) {
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	    $treeView.jstree('open_node', rootNode);
	});
	
	$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 34));
    $(window).resize(function () {
    		$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 34));
    });
}

/**
 * 初始化列表信息
 */
function initTable(){
	//搜索参数
	var searchParams = function (params) {
		var findChildUsers = -1;
		if($('#checkFindSubNode').prop('checked')) findChildUsers = 1;
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
            userName: $("#searchName").val(),
            tenantsId: g_tenantsId,
            organizerId: (g_selectNode == null ? "" : g_selectNode.id),		
            findChildUsers: findChildUsers
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        //url: app.conf.url.api.system.user.getUserList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'userId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//初始化Table相关信息
	appTable.initTable($table, "reset");

	//加载数据成功后执行事件
	$table.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($table, g_searchPannelHeight);
    });
	//重置表格高度
	appTable.resetTableHeight($table, g_searchPannelHeight);
	
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
 * 初始化组织权限功能按钮
 */
function initOrganizerFuncBtnEvent(){
	$("#organizerAdd").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择一个父节点进行操作！");
			return;
		}
		if(g_selectNode.data.organizerType == '3'){
			top.app.message.alert("无法在岗位节点下添加任何新节点!");
			return;
		}
		
		//设置参数
		var params = {};
		params.type = 'add';
		params.tenantsId = g_tenantsId;
		params.organizerTypeDict = g_organizerTypeDict;
		params.organizerLevelDict = g_organizerLevelDict;
		params.organizerFuncDict = g_organizerFuncDict;
		params.node = g_selectNode;
		params.allTreeData = g_allTreeData;
		params.parentNode = getSelNodeParent();
		params.operUrl = top.app.conf.url.apigateway + $("#organizerAdd").data('action-url');
		top.app.layer.editLayer('新增组织', ['790px', '510px'], '/admin/system/organizer/organizer-edit.html', params, function(){
   			//重新加载
			$treeView.jstree(true).refresh();
		});
    });
	$("#organizerEdit").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.tenantsId = g_tenantsId;
		params.organizerTypeDict = g_organizerTypeDict;
		params.organizerLevelDict = g_organizerLevelDict;
		params.organizerFuncDict = g_organizerFuncDict;
		params.node = g_selectNode;
		params.allTreeData = g_allTreeData;
		params.parentNode = getSelNodeParent();
		params.operUrl = top.app.conf.url.apigateway + $("#organizerEdit").data('action-url');
		top.app.layer.editLayer('编辑组织', ['790px', '510px'], '/admin/system/organizer/organizer-edit.html', params, function(){
   			//重新加载列表
			$treeView.jstree(true).refresh();
		});
    });
	$("#organizerDel").click(function () {
		if(g_selectNode == null ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		if(getSelNodeParent() == null){
			top.app.message.alert("无法删除组织根节点！");
			return;
		}
		if(!$treeView.jstree('is_leaf', g_selectNode)){
			top.app.message.alert("该组织下存在子节点，不能删除！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#organizerDel").data('action-url');
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
	$("#organizerRefresh").click(function () {
		var operUrl = top.app.conf.url.apigateway + $("#organizerRefresh").data('action-url');
		top.app.message.confirm("确定要刷新组织架构?", function(){
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: idsList,
				contentType: "application/json",
				success: function(data){
					if(top.app.message.code.success == data.RetCode){
			   			top.app.message.alert("刷新组织架构成功！");
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
}

/**
 * 初始化用户权限功能按钮
 */
function initUserFuncBtnEvent(){
	$("#userAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.tenantsId = g_tenantsId;
		params.node = g_selectNode;
		params.sexDict = g_sexDict;
		params.allTreeData = g_allTreeData;
		params.operUrl = top.app.conf.url.apigateway + $("#userAdd").data('action-url');
		top.app.layer.editLayer('新增用户', ['710px', '450px'], '/admin/system/organizer/user-edit.html', params, function(){
   			//重新加载
			$table.bootstrapTable('refresh');
		});
    });
	$("#userEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//获取当前节点所属于的组织节点
		var node = $treeView.jstree('get_node', rows[0].organizerId);
		//设置参数
		var params = {};
		params.type = 'edit';
		params.tenantsId = g_tenantsId;
		params.node = node;
		params.sexDict = g_sexDict;
		params.allTreeData = g_allTreeData;
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#userEdit").data('action-url');
		top.app.layer.editLayer('编辑用户', ['710px', '450px'], '/admin/system/organizer/user-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#userDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var hasAdmin = false;
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.userId;
			if(rowData.isAdmin == 'Y'){
				hasAdmin = true;
			}
		});
		if(hasAdmin){
			top.app.message.alert("要删除的数据中存在租户管理员，禁止删除！");
			return;
		}
		appTable.delData($table, $("#userDel").data('action-url'), idsList);
    });
	$("#userSetSubordinate").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行操作！");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		params.tenantsId = g_tenantsId;
		params.operUrl = top.app.conf.url.apigateway + $("#userSetSubordinate").data('action-url');
		top.app.layer.editLayer('设置直属下级', ['850px', '550px'], '/admin/system/organizer/user-leader.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
}

/**
 * 初始化下拉选择列表(租户)
 */
function initComboBoxList(){
	//根租户的管理员才能管理多个租户下的组织
	if(top.app.info.userInfo.isAdmin == 'Y' && top.app.info.tenantsInfo.isRoot == 'Y'){
		//设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '200px'
		});
		$('#divTenantsBox').css('display', 'block');
		g_searchPannelHeight += 62;
		//重置高度
		$treeView.css("min-height", appTable.getTableHeight(g_searchPannelHeight, 34));
		appTable.resetTableHeight($table, g_searchPannelHeight);
		//获取数据
		top.app.getTenantsListBox($('#tenantsBox'), function(){
			$('.selectpicker').selectpicker('refresh');
		});
		//绑定租户下拉框变更事件
		$('#tenantsBox').on('changed.bs.select', function (e) {
			//触发重新加载事件
			$("#btnReload").click();
		});

		//绑定重新加载事件
		$("#btnReload").click(function () {
			//设置全局的租户ID
			g_tenantsId = $('#tenantsBox').val();
			//清空权限树
			$treeView.jstree(true).refresh();
    		//重置变量
    		g_selectNode = null;
    		//清空用户表内容
    		$table.bootstrapTable('removeAll');
    		appTable.resetTableHeightOnLoad($table, g_searchPannelHeight);
	    });
	}
}

/**
 * 获取当前选中节点的父节点信息
 * @returns
 */
function getSelNodeParent(){
	if(g_selectNode == null){
		return null;
	}else{
		var nodeId = $treeView.jstree('get_parent', g_selectNode);
		if(nodeId == '#') return null;
		else return $treeView.jstree('get_node', nodeId);
	}
}

/**
 * 格式化租户状态
 * @param value
 * @param row
 */
function tableFormatIsAdmin(value, row) {
	if(row.isAdmin == 'Y') return "<font color=red>是</font>";
	else return "否";
}