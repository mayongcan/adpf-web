var $table = $('#tableList'), g_operRights = "", g_dictShareTypeDict = [], g_tenantsId = "", g_editHeight = '350px';

$(function () {
	//初始化下拉选择列表(租户)
	initComboBoxList();
	// 初始化权限
	initFunc();
	// 获取字典类型的字典数据
	initComboBox();
	// 初始化列表信息
	initTable();
	// 初始化权限功能按钮点击事件
	initFuncBtnEvent();

	$('#searchType').selectpicker({
		width: '110px'
	});
});

/**
 * 初始化下拉选择列表(租户)
 */
function initComboBoxList(){
	//根租户的管理员才能管理多个租户下的组织
	if(top.app.info.userInfo.isAdmin == 'Y' && top.app.info.tenantsInfo.isRoot == 'Y'){
		//设置select的宽度为200px
		$('.selectpicker').selectpicker({
			width: '170px'
		});
		$('#labelTenantsBox').css('display', 'block');
		$('#divTenantsBox').css('display', 'block');
		//获取数据
		top.app.getTenantsListBox($('#tenantsBox'), function(){
			$('.selectpicker').selectpicker('refresh');
		}, true);
		//绑定租户下拉框变更事件
		$('#tenantsBox').on('changed.bs.select', function (e) {
			g_tenantsId = $('#tenantsBox').val();
		});
	}else{
		g_tenantsId = top.app.info.userInfo.tenantsId;
		g_editHeight = '250px';
	}
}

/**
 * 初始化权限
 */
function initFunc(){
	g_operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbar").empty();
	var htmlTable = "";
	var length = g_operRights.length;
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].dispPosition == '1' && g_operRights[i].funcFlag.indexOf("dictType") != -1){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag  + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
							"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
						 "</button>";
		}
	}
	// 添加表格的权限
	htmlTable += appTable.addDefaultFuncButton();
	$("#tableToolbar").append(htmlTable);
}

/**
 * 添加字典类型搜索框
 */
function initComboBox(){
	g_dictShareTypeDict = top.app.getDictDataByDictTypeValue('SYS_DICT_TYPE');
	top.app.addComboBoxOption($("#searchType"), g_dictShareTypeDict, true);
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
            tenantsId: g_tenantsId,
            name: $("#searchName").val(),
            value: $("#searchValue").val(),
            type: $("#searchType").val()
        };
        return param;
    };
    // 初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.dict.getDictList,   		// 请求后台的URL（*）
        queryParams: searchParams,										// 传递参数（*）
        uniqueId: 'dictTypeId',
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        },
        onDblClickRow: function(row, $el){
        		confDictDataPage(row);
        }
    });
	// 初始化Table相关信息
	appTable.initTable($table);
	
	// 搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		if(top.app.info.userInfo.isAdmin == 'Y' && top.app.info.tenantsInfo.isRoot == 'Y'){
			g_tenantsId = "";
		}else{
			g_tenantsId = top.app.info.userInfo.tenantsId;
		}
        $("#tenantsBox").val("");
		$("#searchName").val("");
        $("#searchValue").val("");
        $("#searchType").val("");
		// 刷新数据，否则下拉框显示不出内容
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	// 绑定工具条事件
	$("#dictTypeAdd").click(function () {
		// 设置参数
		var params = {};
		params.type = 'add';
		params.dictShareTypeDict = g_dictShareTypeDict;
		params.operUrl = top.app.conf.url.apigateway + $("#dictTypeAdd").data('action-url');
		top.app.layer.editLayer('新增字典类型', ['710px', g_editHeight], '/admin/system/dict/dict-edit.html', params, function(){
   			// 重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#dictTypeRefresh").click(function () {
		var operUrl = top.app.conf.url.apigateway + $("#dictTypeRefresh").data('action-url');
		top.app.message.confirm("确定要刷新当前字典数据的缓存？", function(){
			$.ajax({
				url: operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
			    method: 'POST',
				contentType: "application/json",
				success: function(data){
					if(top.app.message.code.success == data.RetCode){
			   			top.app.message.alert("刷新缓存数据成功！");
			   		}else{
			   			top.app.message.error(data.RetMsg);
			   		}
		        }
			});
		});
    });
}

function formatOperate(value, row, index){
	//根据权限是否显示操作菜单
	var length = g_operRights.length;
	var operateBtn = "";
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].dispPosition == '2' && g_operRights[i].funcFlag.indexOf("dictType") != -1){
			operateBtn += '<button type="button" class="btn btn-outline btn-default btn-table-opreate" onclick="' + g_operRights[i].funcFlag  + '(' + row.dictTypeId + ', \'' + g_operRights[i].funcLink + '\')">' + 
								'<i class="' + g_operRights[i].funcIcon + '" aria-hidden="true"></i> ' + g_operRights[i].funcName + 
						  '</button>';
		}
	}
	operateBtn += '<button type="button" class="btn btn-outline btn-default btn-table-opreate" onclick="toolbarConfDictData(' + row.dictTypeId + ')">' + 
					'<i class="glyphicon glyphicon-cog" aria-hidden="true"></i> 配置字典数据' +
				  '</button>';
	return operateBtn;
}

function dictTypeEdit(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
	// 设置参数
	var params = {};
	params.type = 'edit';
	params.dictShareTypeDict = g_dictShareTypeDict;
	params.rows = row;
	params.operUrl = top.app.conf.url.apigateway + url;
	top.app.layer.editLayer('编辑字典类型', ['710px', g_editHeight], '/admin/system/dict/dict-edit.html', params, function(){
			// 重新加载列表
		$table.bootstrapTable('refresh');
	});
}

function dictTypeDel(id, url){
	appTable.delData($table, url, id + "");
}

function toolbarConfDictData(id){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
	confDictDataPage(row);
}

/**
 * 进入配置字典数据页面
 */
function confDictDataPage(rows){
	var pid = $.utils.getUrlParam(window.location.search,"_pid");
	var url = "dict-data.html?_pid=" + pid + "&dictTypeId=" + rows.dictTypeId + "&shareType=" + rows.shareType +
		"&name=" + rows.name + "&value=" + rows.value;
	window.location.href = encodeURI(url);
}

/**
 * 格式化字典类型
 * 
 * @param value
 * @param row
 */
function tableFormatType(value, row) {
	var i = g_dictShareTypeDict.length;
	while (i--) {
		if(g_dictShareTypeDict[i].ID == value){
			return g_dictShareTypeDict[i].NAME;
		}
	}
	return "未知";
}