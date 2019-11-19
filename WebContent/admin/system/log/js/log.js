var $table = $('#tableList'), $comboxTenants = $('#tenantsBox'), g_isFirstLoad = true;
var g_tenantsId = top.app.info.tenantsInfo.tenantsId, g_organizerId = null;
var g_comboBoxTree = null;
var g_searchPannelHeight = 0;

$(function () {
	//实现日期联动
	$.date.initSearchDate('divBeginTime', 'divEndTime');
    g_searchPannelHeight = $('#searchPannel').outerHeight(true);
	//获取权限菜单
	initFunc();
	//初始化列表信息
	initTable();
	//初始化下拉选择列表(租户和组织)
	initComboBoxList();
});

function initFunc(){
	var operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$('#tableToolbar').empty();
	var html = "";
	var length = operRights.length;
	for (var i = 0; i < length; i++) {
		html += "<button type='button' class='btn btn-outline btn-default' id='" + operRights[i].funcFlag + "' data-action-url='" + operRights[i].funcLink + "'>" + 
					"<i class=\""+ operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + operRights[i].funcName + 
				"</button>";
	}
	html += "<button type='button' class='btn btn-outline btn-default' id='toolbarException'>" + 
				"<i class='glyphicon glyphicon-modal-window' aria-hidden='true'></i> 查看异常信息" +
			"</button>";
	html += appTable.addDefaultFuncButton();
	$('#tableToolbar').append(html);
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
            tenantsId: g_tenantsId,
            organizerId: g_organizerId,
            searchTitle: $("#searchTitle").val(),
            searchBeginTime: $("#searchBeginTime").val(),
            searchEndTime: $("#searchEndTime").val()
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.log.getLogList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'logId',
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
		$("#searchTitle").val("");
		$("#searchBeginTime").val("");
		$("#searchEndTime").val("");
		$table.bootstrapTable('refresh');
    });

	//权限--查看异常信息
	$("#toolbarException").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条日志进行查看！");
			return;
		}
		if(rows[0].exception == null || rows[0].exception == undefined || rows[0].exception == ''){
			top.app.message.alert("当前选中日志没有异常信息！");
			return;
		}
		//设置参数
		var params = {};
		params.rows = rows[0];
		top.app.layer.editLayer('查看异常信息', ['710px', '500px'], '/admin/system/log/log-exception.html', params, function(){});
    });
}

/**
 * 初始化下拉选择列表(租户和组织)
 */
function initComboBoxList(){
	//根租户的管理员才能管理多个租户下的组织
	if(top.app.info.userInfo.isAdmin == 'Y'){
		//设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '200px'
		});
		$('#divTenantsBox').css('display', 'block');
		g_searchPannelHeight += 55;
		appTable.searchPannelHeight = g_searchPannelHeight;
		appTable.resetTableHeight($table, g_searchPannelHeight);
		
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
				    	organizerId: (objNode == null) ? null : objNode.id
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
			//刷新列表
    	    		$table.bootstrapTable('refresh');
	    });
	}
	else{
	    $table.bootstrapTable('refresh');
	}
}

/**
 * 格式化
 * @param value
 * @param row
 */
function tableFormatException(value, row) {
	if(row.exception != null && row.exception != undefined && row.exception != '') 
		return "<font color=red>是</font>";
	else return "否";
}
