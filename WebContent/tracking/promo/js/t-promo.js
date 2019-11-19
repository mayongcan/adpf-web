var $table = $('#tableList'), g_operRights = [];

$(function () {
	//初始化字典
	initView();
	//初始化权限
	initFunc();
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
});

/**
 * 初始基础视图
 * @returns
 */
function initView(){
	//top.app.addComboBoxOption($("#searchChannelId"), g_channelIdDict, true);
	//top.app.addComboBoxOption($("#searchAnentId"), g_anentIdDict, true);
	//top.app.addComboBoxOption($("#searchAppId"), g_appIdDict, true);
	
	findByTagId(1,"searchChannelId");
	findByTagId(2,"searchAnentId");
	findByTagId(3,"searchAppId");
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
		//显示在列表上方的权限菜单
		if(g_operRights[i].dispPosition == '1' || g_operRights[i].dispPosition == undefined){
			htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag  + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
							"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
						 "</button>";
		}
	}
	//添加默认权限
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
			channelId: $("#searchChannelId").val(),
			anentId: $("#searchAnentId").val(),
			appId: $("#searchAppId").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.apigateway + "/api/adpf/tracking/promo/getList",   		//请求后台的URL（*）
        queryParams: searchParams,											//传递参数（*）
        uniqueId: 'id',
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
		$("#searchChannelId").val("");
		$("#searchAnentId").val("");
		$("#searchAppId").val("");
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#tPromoAdd").click(function () {
		//设置参数
		var params = {};
		params.type = 'add';
		params.operUrl = top.app.conf.url.apigateway + $("#tPromoAdd").data('action-url');
		top.app.layer.editLayer('新增推广活动', ['710px', '340px'], '/tracking/promo/t-promo-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#tPromoEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		//设置参数
		var params = {};
		params.type = 'edit';
		params.rows = rows[0];
		params.operUrl = top.app.conf.url.apigateway + $("#tPromoEdit").data('action-url');
		top.app.layer.editLayer('编辑推广活动', ['710px', '340px'], '/tracking/promo/t-promo-edit.html', params, function(){
   			//重新加载列表
			$table.bootstrapTable('refresh');
		});
    });
	$("#tPromoDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var idsList = "";
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.id;
    	});
		appTable.delData($table, $("#tPromoDel").data('action-url'), idsList);
    });
}

//格式化列表右侧的操作按钮
function formatOperate(value, row, index){
	//根据权限是否显示操作菜单
	var length = g_operRights.length;
	var operateBtn = "";
	for (var i = 0; i < length; i++) {
		if(g_operRights[i].dispPosition == '2'){
			operateBtn += '<button type="button" class="btn btn-outline btn-default btn-table-opreate" onclick="' + g_operRights[i].funcFlag  + '(' + row.id + ', \'' + g_operRights[i].funcLink + '\')">' + 
								'<i class="' + g_operRights[i].funcIcon + '" aria-hidden="true"></i> ' + g_operRights[i].funcName + 
						  '</button>';
		}
	}
	return operateBtn;
}

function tPromoEdit(id, url){
	var row = $table.bootstrapTable("getRowByUniqueId", id);
	//设置参数
	var params = {};
	params.type = 'edit';
	params.rows = row;
	params.operUrl = top.app.conf.url.apigateway + url;
	top.app.layer.editLayer('编辑推广活动', ['710px', '340px'], '/tracking/promo/t-promo-edit.html', params, function(){
			//重新加载列表
		$table.bootstrapTable('refresh');
	});
}

function tPromoDel(id, url){
	appTable.delData($table, url, id + "");
}

function findByTagId(param,id){	
	var dataList = [];
	var url = "";
	if(param == 1) url = top.app.conf.url.apigateway+"/api/adpf/tracking/channelurl/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	else if(param == 2) url = top.app.conf.url.apigateway+"/api/adpf/tracking/agent/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	else if(param == 3) url = top.app.conf.url.apigateway+"/api/adpf/tracking/app/getList"+"?access_token=" + top.app.cookies.getCookiesToken();
	$.ajax({
		url: url,
	    method: 'GET',
		//data:JSON.stringify(submitData),
	    async: false,
		contentType: "application/json",
		success: function(data){			
			if(top.app.message.code.success == data.RetCode){
				dataList = data.rows;				
	   		}
			//channelList = findByChannelId();
			var option = "<option value>全部</option>";
			for(var i = 0;i <= dataList.length-1;i++){				
				option += "<option value = '"+dataList[i].id+"'>"+dataList[i].name+"</option>"
				//$("select").append(option)
				$("#"+id+"").append(option);
				option = "";
			}
        }	
	});	
	//return dataList;
}


