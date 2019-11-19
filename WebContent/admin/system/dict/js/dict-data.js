var $table = $('#tableList'), g_g_operRights = "", g_dictTypeId = null, g_shareType = null;
$(function () {
	g_dictTypeId = $.utils.getUrlParam(window.location.search,"dictTypeId");
	var name = decodeURI($.utils.getUrlParam(window.location.search,"name"));
	var value = decodeURI($.utils.getUrlParam(window.location.search,"value"));
	g_shareType = $.utils.getUrlParam(window.location.search,"shareType");
	$("#showInfoMsg").empty();
	$("#showInfoMsg").append("<span style='margin-right:20px;margin-left:10px;'>-- 字典类型编号:<span style='color:#1ab394;margin-left:5px;'>" + g_dictTypeId + "</span></span>" +
				"<span style='margin-right:20px'>字典类型名称:<span style='color:#1ab394;margin-left:5px;'>" + name + "</span></span>" +
				"<span>字典类型值:<span style='color:#1ab394;margin-left:5px;'>" + value + "</span></span>");
	// 初始化权限
	initFunc();
	// 初始化列表信息
	initTable();
	// 初始化权限功能按钮点击事件
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
		if(g_operRights[i].dispPosition == '1' && g_operRights[i].funcFlag.indexOf("dictData") != -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag  + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
							"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
						 "</button>";
		}
	}
	htmlTable += "<button type='button' class='btn btn-outline btn-default' id='toolbarSortSave'>" + 
					"<i class='glyphicon glyphicon-sort' aria-hidden='true'></i> 保存排序结果" +
				 "</button>"
	htmlTable += "<button type='button' class='btn btn-outline btn-default' id='toolbarBack'>" + 
					"<i class='glyphicon glyphicon-arrow-left' aria-hidden='true'></i> 返回" +
				 "</button>"
	// 添加表格的权限
	htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

/**
 * 初始化列表信息
 */
function initTable(){
	// 搜索参数
	var searchParams = function (params) {
        var param = {
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						// 页面大小
            page: params.offset / params.limit,  		// 当前页
            dictTypeId: g_dictTypeId
        };
        return param;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.dict.getDictDataList,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        uniqueId: 'dictDataId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	// 搜索面板高度
	appTable.searchPannelHeight = $('#titleInfo').outerHeight(true) - 10;
	// 初始化Table相关信息
	appTable.initTable($table);
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	// 绑定工具条事件
	$("#dictDataAdd").click(function () {
		// 设置参数
		var params = {};
		params.type = 'add';
		params.dictTypeId = g_dictTypeId;
		params.shareType = g_shareType;
		params.operUrl = top.app.conf.url.apigateway + $("#dictDataAdd").data('action-url');
		top.app.layer.editLayer('新增字典数据', ['710px', '300px'], '/admin/system/dict/dict-data-edit.html', params, function(){
   			// 重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	// 排序
	$("#toolbarSortSave").click(function () {
		//获取所有项,并根据当前排序设置排序ID
		var dataRows = $table.bootstrapTable('getData');
		if(dataRows.length <= 1){
   			top.app.message.notice("少于或等于一条数据的时候不用排序！");
   			return;
		}
		var list = [];
		for(var i = 0; i < dataRows.length; i++){
			obj = new Object();
			obj.id = dataRows[i].dictDataId;
			obj.disOrder = i;
			list.push(obj);
		}
		appTable.postData($table, '/api/system/dict/updateDictDataSort', JSON.stringify(list),
				"确定要保存当前的排序结果？", "数据保存成功！");
    });
	// 返回数据类型页面
	$("#toolbarBack").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "dict.html?_pid=" + pid;
    });
}

function formatOperate(value, row, index){
	//根据权限是否显示操作菜单
	var length = g_operRights.length;
	var operateBtn = "";
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].dispPosition == '2' && g_operRights[i].funcFlag.indexOf("dictData") != -1){
			operateBtn += '<button type="button" class="btn btn-outline btn-default btn-table-opreate" onclick="' + g_operRights[i].funcFlag  + '(' + row.dictDataId + ', \'' + g_operRights[i].funcLink + '\')">' + 
								'<i class="' + g_operRights[i].funcIcon + '" aria-hidden="true"></i> ' + g_operRights[i].funcName + 
						  '</button>';
		}
	}
	return operateBtn;
}

function dictDataEdit(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
	// 设置参数
	var params = {};
	params.type = 'edit';
	params.dictTypeId = g_dictTypeId;
	params.shareType = g_shareType;
	params.rows = row;
	params.operUrl = top.app.conf.url.apigateway + url;
	top.app.layer.editLayer('编辑字典数据', ['710px', '300px'], '/admin/system/dict/dict-data-edit.html', params, function(){
			// 重新加载列表
		$table.bootstrapTable('refresh');
	});
}

function dictDataDel(id, url){
	appTable.delData($table, url, id + "");
}

function formatDataShare(value, row) {
	if(row.tenantsId==-1){
		return '<font color=red>租户共享</font>';
	}else{
		if(row.organizerId==-1){
			return '<font color=blue>组织共享</font>';
		}else{
			return '不共享';
		}
	}
}