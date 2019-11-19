var $tableRole = $('#tableListRole'), $tableUser = $('#tableListUser'), $treeView = $('#treeView'), $comboxTenants = $('#tenantsBox');
var g_searchPannelHeight = 0, g_selectRoleRow = null, g_selectUserRow = null, g_isFirstLoad = true;
var g_tenantsId = top.app.info.tenantsInfo.tenantsId, g_organizerId = null, g_roleId = null;
var g_comboBoxTree = null;
$(function () {
	//初始化权限
	initFunc();
	//初始化列表信息
	initTableRole();
	initTableUser();
	//初始化树列表
	initTree();
	//初始化权限功能按钮点击事件
	initRoleBtnEvent();
	initFuncBtnEvent();
	initUserBtnEvent();
	//初始化下拉选择列表(租户和组织)
	initComboBoxList();
});

/**
 * 初始化权限
 */
function initFunc(){
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbarRole").empty();
	$("#tableToolbarUser").empty();
	$("#treeToolbar").empty();
	var htmlRole = "", htmlUser = "", htmlFunc = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		if(operRights[i].funcFlag.indexOf("roleUser") != -1){
			htmlUser += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}else if(operRights[i].funcFlag.indexOf("roleFunc") != -1){
			htmlFunc += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}else{
			htmlRole += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
							"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
						"</button>";
		}
	}
	//添加树列表的权限
	$("#tableToolbarRole").append(htmlRole);
	$("#tableToolbarUser").append(htmlUser);
	$("#treeToolbar").append(htmlFunc);
}

/**
 * 初始化列表信息
 */
function initTableRole(){
	//搜索参数
	var searchParamsRole = function (params) {
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
            tenantsId: g_tenantsId,
            //organizerId: g_organizerId
	    		organizerId: g_organizerId == null ? top.app.info.rootOrganizerId : g_organizerId,
        };
        return param;
    };
    //初始化列表
	$tableRole.bootstrapTable({
		url: top.app.conf.url.api.system.role.getRoleList,
        queryParams: searchParamsRole,										//传递参数（*）
        uniqueId: 'roleId',
        onClickRow: function(row, $el){
	        	g_selectRoleRow = row;
	        	g_roleId = row.roleId;
	        	appTable.setRowClickStatus($tableRole, row, $el);
	        	loadFuncTree();
	    	    //加载用户列表
	    	    $tableUser.bootstrapTable('refresh', {"url": top.app.conf.url.api.system.role.getRoleUserList});
        }
    });
	//加载数据成功后执行事件
	$tableRole.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($tableRole, g_searchPannelHeight + 40);
		setTimeout(function () {
			appTable.resetTableHeightOnLoad($tableUser, g_searchPannelHeight + 40);
	    }, 300);
    });
	//重置表格高度
	appTable.resetTableHeight($tableRole, g_searchPannelHeight + 40);
	
	//权限--单选多选切换功能
	$("#toolbarMultiCheck").click(function () {
		appTable.multiCheck($tableRole, $("#toolbarMultiCheck i"));
    });
}


/**
 * 初始化列表信息
 */
function initTableUser(){
	//搜索参数
	var searchParamsUser = function (params) {
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
            tenantsId: g_tenantsId,
            organizerId: g_organizerId,
            roleId: g_roleId,
            dataType: "in" 
        };
        return param;
    };
    //初始化列表
	$tableUser.bootstrapTable({
        queryParams: searchParamsUser,										//传递参数（*）
        uniqueId: 'userId',
        onClickRow: function(row, $el){
	        	g_selectUserRow = row;
	        	appTable.setRowClickStatus($tableUser, row, $el);
        }
    });
	//加载数据成功后执行事件
	$tableUser.on('load-success.bs.table', function (data) {
		appTable.resetTableHeightOnLoad($tableUser, g_searchPannelHeight + 40);
    });
	//重置表格高度
	appTable.resetTableHeight($tableUser, g_searchPannelHeight + 40);

	//权限--单选多选切换功能
	$("#toolbarMultiCheck").click(function () {
		appTable.multiCheck($tableUser, $("#toolbarMultiCheck i"));
    });
}

/**
 * 初始化树列表
 */
function initTree(){
	$treeView.jstree({
		'core': {
			"check_callback": true
		},
		"plugins": ["types", "checkbox"],
		"types": {
			"default": {
				"icon": "fa fa-folder"
			}
		},
		"checkbox": {
			"keep_selected_style": false,
		}
    });
	//展开根节点
	$treeView.bind("refresh.jstree", function (e, data) {
		if(e.target.firstChild.firstChild == null) return;
		//展开根节点
		var inst = data.instance;  
	    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
	    $treeView.jstree('open_node', rootNode);
	});
	
	$treeView.css("height", appTable.getTableHeight(g_searchPannelHeight + 149));
    $(window).resize(function () {
    		$treeView.css("height", appTable.getTableHeight(g_searchPannelHeight + 149));
    });
}

/**
 * 初始化角色功能按钮
 */
function initRoleBtnEvent(){
	$("#roleAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.tenantsId = g_tenantsId;
		params.organizerId = g_organizerId;
		params.operUrl = top.app.conf.url.apigateway + $("#roleAdd").data('action-url');
		top.app.layer.editLayer('新增角色', ['710px', '300px'], '/admin/system/role/role-edit.html', params, function(){
   			//重新加载
			$tableRole.bootstrapTable('refresh');
		});
    });
	$("#roleEdit").click(function () {
		if(g_selectRoleRow == null ){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = g_selectRoleRow;
		params.operUrl = top.app.conf.url.apigateway + $("#roleEdit").data('action-url');
		top.app.layer.editLayer('编辑角色', ['710px', '300px'], '/admin/system/role/role-edit.html', params, function(){
   			//重新加载列表
			$tableRole.bootstrapTable('refresh');
		});
    });
	$("#roleDel").click(function () {
		if(g_selectRoleRow == null ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		if(g_selectRoleRow.isFix == 'Y'){
			top.app.message.alert("不能删除固定的角色！");
			return;
		}
		var submitData = {};
		submitData["idsList"] = g_selectRoleRow.roleId;
		var operUrl = top.app.conf.url.apigateway + $("#roleDel").data('action-url');
		top.app.message.confirm("确定要删除当前选中的数据？数据删除后将不可恢复！", function(){
			top.app.message.loading();
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			//重新加载列表
						$tableRole.bootstrapTable('refresh');
			   			top.app.message.notice("数据删除成功！");
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
function initFuncBtnEvent(){
	$("#roleFuncSave").click(function () {
		if(g_selectRoleRow == null ){
			top.app.message.alert("请选择一个角色再保存权限！");
			return;
		}
		top.app.message.confirm("确定要保存当前的权限状态？", function(){
			top.app.message.loading();
			var operUrl = top.app.conf.url.apigateway + $("#roleFuncSave").data('action-url');
			var funcIds = getAllCheckFuncId();
			var submitData = {};
			submitData["roleId"] = g_selectRoleRow.roleId;
			submitData["funcIds"] = funcIds;
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			top.app.message.notice("保存权限数据成功！");
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
	$("#roleFuncOpen").click(function () {
		$treeView.jstree(true).open_all();
    });
	$("#roleFuncClose").click(function () {
		$treeView.jstree(true).close_all();
    });
}

/**
 * 初始化用户权限功能按钮
 */
function initUserBtnEvent(){
	$("#roleUserAdd").click(function () {
		if(g_selectRoleRow == null ){
			top.app.message.alert("请选择一个角色进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.tenantsId = g_tenantsId;
		params.organizerId = g_organizerId;
		params.roleId = g_roleId;
		params.operUrl = top.app.conf.url.apigateway + $("#roleUserAdd").data('action-url');
		top.app.layer.editLayer('添加角色用户', ['850px', '550px'], '/admin/system/role/role-user.html', params, function(){
   			//重新加载
			$tableUser.bootstrapTable('refresh');
		});
    });
	$("#roleUserDel").click(function () {
		var selectRows = $tableUser.bootstrapTable('getSelections');
		if(selectRows == null || selectRows == undefined || selectRows.length == 0){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var hasAdmin = false;
		var idsList = "";
		$.each(selectRows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.userId;
			if(rowData.isAdmin == 'Y'){
				hasAdmin = true;
			}
		});
		if(g_selectRoleRow.isFix == 'Y' && hasAdmin){
			top.app.message.alert("不能移除固定的角色下的管理员！");
			return;
		}
		var operUrl = top.app.conf.url.apigateway + $("#roleUserDel").data('action-url');
		top.app.message.confirm("确定要删除角色所属的用户？", function(){
			top.app.message.loading();
			var submitData = {};
			submitData["roleId"] = g_selectRoleRow.roleId;
			submitData["userIds"] = idsList;
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				data: JSON.stringify(submitData),
				contentType: "application/json",
				success: function(data){
					top.app.message.loadingClose();
					if(top.app.message.code.success == data.RetCode){
			   			top.app.message.notice("删除角色用户数据成功！");
			   			//重新加载
						$tableUser.bootstrapTable('refresh');
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
}

/**
 * 初始化下拉选择列表(租户和组织)
 */
function initComboBoxList(){
	//根租户的管理员才能管理多个租户下的组织
	if(top.app.info.tenantsInfo.isRoot == 'Y' && top.app.info.userInfo.isAdmin == 'Y'){
		//设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '200px'
		});
		$('#divTenantsBox').css('display', 'block');
		$('#divRoleBox').css('top', '63px');
		$('#divUserBox').css('top', '63px');
		g_searchPannelHeight += 63;
		//重置高度
		$treeView.css("height", appTable.getTableHeight(g_searchPannelHeight + 149));
		appTable.resetTableHeight($tableRole, g_searchPannelHeight + 40);
		appTable.resetTableHeight($tableUser, g_searchPannelHeight + 40);
		
		//如果只是租户管理员，则不能管理所有租户
		if(top.app.info.tenantsInfo.isRoot == 'Y'){
			//获取租户数据
			top.app.getTenantsListBox($comboxTenants, function(){
				$('.selectpicker').selectpicker('refresh');
				g_tenantsId = $comboxTenants.val();
			});
			//绑定租户下拉框变更事件
			$comboxTenants.on('changed.bs.select', function (e) {
				g_tenantsId = $comboxTenants.val();
				//刷新树菜单
				g_comboBoxTree.refreshTree(true, function(){
					//触发重新加载事件
					$("#btnReload").click();
				});
			});
		}else{
			$('#tenantsListDiv').css('display', 'none');
			$('#organizerListTitle').css('display', 'none');
			$('#tenantsListTitle').empty();
			$('#tenantsListTitle').append('<h5>当前正在编辑的组织：</h5>');
			g_tenantsId = top.app.info.tenantsInfo.tenantsId;
		}
		
		//获取组织数据
		g_comboBoxTree = AppCombotree.createNew();
		g_comboBoxTree.init($('#organizerBox') , function (objNode, cb) {
			$.ajax({
			    url: top.app.conf.url.api.system.organizer.getOrganizerTree,
			    method: 'GET',
			    data: {
			    	access_token: top.app.cookies.getCookiesToken(),
			    	tenantsId: g_tenantsId,
			    	organizerId: (objNode == null) ? null : objNode.id,
			    	filterPost: true					//过滤岗位
			    },success: function(data){
			    	if(top.app.message.code.success == data.RetCode){
						cb.call(this, data.RetData);
						//第一次加载时需要设置组织列表的默认值
						if(g_isFirstLoad){
							setTimeout(function () {
								g_comboBoxTree.setValueById(top.app.info.organizerInfo.organizerId);
								g_organizerId = g_comboBoxTree.getNodeId();
						    }, 300);
							g_isFirstLoad = false;
						}
			    	}else{
			    		top.app.message.error(data.RetMsg);
			    	}
				}
			});
		}, '200px');
		//设置点击回调
		g_comboBoxTree.setClickTreeEvent(function(node){
			$("#btnReload").click();
		});
		
		//绑定重新加载事件
		$("#btnReload").click(function () {
			g_organizerId = g_comboBoxTree.getNodeId();
			//刷新角色列表
			$tableRole.bootstrapTable('refresh');
			//清空权限树
			$treeView.jstree(true).settings.core.data = [];
    		$treeView.jstree(true).refresh();
    		//重置变量
    		g_selectRoleRow = null;
    		g_selectUserRow = null;
    		g_roleId = null;
    		//清空用户表内容
			$tableUser.bootstrapTable('removeAll');
	    });
	}else{
		g_organizerId = top.app.info.rootOrganizerId; 
	}
}

/**
 * 获取当前选中节点的父节点信息
 * @returns
 */
function getSelNodeParent(){
	if(selectNode == null){
		return null;
	}else{
		var nodeId = $treeView.jstree('get_parent', selectNode);
		if(nodeId == '#') return null;
		else return $treeView.jstree('get_node', nodeId);
	}
}

/**
 * 加载权限树
 */
function loadFuncTree(){
	$.ajax({
		url: top.app.conf.url.api.system.tenants.getTenFuncTree,
	    method: 'GET',
	   	data:{
		    	access_token: top.app.cookies.getCookiesToken(),
		    	tenantsId: g_tenantsId
	   	},
      	success: function(data){
      		if(top.app.message.code.success == data.RetCode){
		    		$treeView.jstree(true).settings.core.data = data.RetData;
		    		$treeView.jstree(true).refresh();
		    		//加载权限树选中状态
		    		setTimeout(function () {
			    		loadFuncTreeByRoleId();
		    	    }, 300);
		    	}else{
		    		top.app.message.error(data.RetMsg);
		    	}
	   	}
    });
}

/**
 * 加载权限树选中状态
 */
function loadFuncTreeByRoleId(){
	$.ajax({
		url: top.app.conf.url.api.system.role.getFuncTreeByRoleId,
	    method: 'GET',
	   	data:{
		    	access_token: top.app.cookies.getCookiesToken(),
		    	roleId: g_roleId
	   	},
      	success: function(data){
      		//取消所有节点选中
      		$treeView.jstree(true).uncheck_all();
      		if(top.app.message.code.success == data.RetCode){
      			for(var i = 0;i < data.RetData.length; i++){
		        		var node = $treeView.jstree(true).get_node(data.RetData[i]);
		        		if(node != null && node != undefined && $treeView.jstree(true).is_leaf(node)){
		        			$treeView.jstree(true).check_node(node);
		        		}
		        	}
		    	}else{
		    		top.app.message.error(data.RetMsg);
		    	}
	   	}
    });
}

/**
 * 获取所有勾选的权限ID
 */
function getAllCheckFuncId(){
	var nodeArray = $treeView.jstree(true).get_checked(true);
	var parentNodeId, node, nodeMap = {}, nodeIdList = "";
	for(var i = 0;i < nodeArray.length; i++){
		node = nodeArray[i];
		nodeMap[node.id] = node.id;
		while(parentNodeId = $treeView.jstree('get_parent', node)){
   		  node = parentNodeId; 
   		  nodeMap[node] = node;
	   }   
	}
	for(var key in nodeMap){
		if(nodeMap[key] != null && nodeMap[key] != undefined)
			nodeIdList = nodeIdList + nodeMap[key] + ",";
	}
	nodeIdList = nodeIdList.substring(0, nodeIdList.length - 1);
	return nodeIdList;  
}
