var g_params = {}, g_iframeIndex = null, $table = $('#tableList'), g_parentOrganizerId = null;
var g_selectRowsId = [];
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
	//设置select的宽度为200px
	$('.selectpicker').selectpicker({
		width: '120px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * @param value
 */
function receiveParams(value){
	g_params = value;
	//getParentId();
	getSubordinateList();
	//初始化界面
	initView();
}

function getSubordinateList(){
	$.ajax({
		url: top.app.conf.url.api.system.user.getSubordinate,
	    method: 'GET',
	    async: false,
	   	timeout:5000,
	   	data:{
		    	access_token: top.app.cookies.getCookiesToken(),
		    	userId: g_params.rows.userId,
	   	},
	   	success: function(data){
	   		if(top.app.message.code.success == data.RetCode){
   				for(var i = 0;i < data.RetData.length; i++){
   					var rowObj = []; 
   					rowObj.userId = data.RetData[i];
   					g_selectRowsId.push(rowObj);
   				}
	   		}
	   	}
	});
}

function getParentId(){
	$.ajax({
		url: top.app.conf.url.api.system.organizer.getParentId,
	    method: 'GET',
	    async: false,
	   	timeout:5000,
	   	data:{
		    	access_token: top.app.cookies.getCookiesToken(),
		    	organizerId: g_params.rows.organizerId,
	   	},
	   	success: function(data){
	   		if(top.app.message.code.success == data.RetCode){
	   			g_parentOrganizerId = data.RetData;
	   		}
	   	}
	});
}

/**
 * 初始化界面
 */
function initView(){
	//搜索参数
	var searchParams = function (p) {
        var retParam = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: p.limit,   						//页面大小
            page: p.offset / p.limit,  		//当前页
            tenantsId: g_params.rows.tenantsId,
            userName: $("#searchName").val(),
            tenantsId: g_params.tenantsId,
            organizerId: g_parentOrganizerId,		
            findChildUsers: 1,
        };
        return retParam;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.api.system.user.getUserList,   		//请求后台的URL（*）
        queryParams: searchParams,										//传递参数（*）
        uniqueId: 'userId',
        height: 380,
        onClickRow: function(row, $el){
        		appTable.setRowClickStatus($table, row, $el);
        }
    });
	//搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		$("#searchName").val("");
		$table.bootstrapTable('refresh');
    });
	
	//checkbox监听事件
	$table.on('check.bs.table', function (row, rowData) {
		if($.utils.isNull(g_selectRowsId)) {
			g_selectRowsId = [];
			g_selectRowsId.push(rowData);
		}
		else g_selectRowsId.push(rowData);
    });
	$table.on('check-all.bs.table', function (rows, rowsData) {
		if($.utils.isNull(g_selectRowsId)) g_selectRowsId = rowsData;
		else{
			var length = g_selectRowsId.length;
			var tmpLength = rowsData.length;
			var isExist = false;
			for(var i = 0; i < tmpLength; i++){
				isExist = false;
				for(var j = 0; j < length; j++){
					if(g_selectRowsId[i].userId == rowsData.userId) {
						isExist = true;
						break;
					} 
				}
				if(!isExist){
					g_selectRowsId.push(rowsData[i]);
				}
			}
		}
    });
	$table.on('uncheck.bs.table', function (row, rowData) {
		if($.utils.isNull(g_selectRowsId)) return;
		else{
			for(var i = 0; i < g_selectRowsId.length; i++){
				if(g_selectRowsId[i].userId == rowData.userId) {
					g_selectRowsId.splice(i, 1);
					break;
				} 
			}
		}
    });
	$table.on('uncheck-all.bs.table', function (rows, rowsData) {
		if($.utils.isNull(g_selectRowsId)) return;
		else{
			var tmpLength = rowsData.length;
			for(var i = 0; i < tmpLength; i++){
				for(var j = 0; j < g_selectRowsId.length; j++){
					if(g_selectRowsId[i].userId == rowsData.userId) {
						g_selectRowsId.splice(j, 1);
						break;
					} 
				}
			}
		}
    });
	//刷新table后，重置选中行
	$table.on('refresh.bs.table', function () {
		g_selectRowsId = [];
    });
}

/**
 * 提交数据
 */
function submitAction(){
	var rows = g_selectRowsId;//$table.bootstrapTable('getSelections');
	if(rows == null || rows == undefined || rows.length == 0){
		top.app.message.alert("请选择最少一条数据进行操作！");
		return;
	}
	var idsList = "", hasMyself = false;
	$.each(rows, function(i, rowData) {
		if(idsList != "") idsList = idsList + ",";
		idsList = idsList + rowData.userId;
		if(rowData.userId == g_params.rows.userId) hasMyself = true;
	});
	if(hasMyself){
		top.app.message.alert("不能选择自己作为直属下级！");
		return;
	}
	//定义提交数据
	var submitData = {};
	submitData["userId"] = g_params.rows.userId;
	submitData["userIdList"] = idsList;
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.notice("设置直属下级成功！");
	   			$table.bootstrapTable('refresh');
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

/**
 * 格式化
 * @param value
 * @param row
 */
function tableFormatCheckbox(value, row) {
//	if(row.superiorUserCode == g_params.rows.userCode) {
//		g_selectRowsId.push(row);		
//		return true;
//	}
//	else return false;
	var hasVal = false;
	for(var i = 0; i < g_selectRowsId.length; i++){
		if(g_selectRowsId[i].userId == row.userId) {
			hasVal = true;
			break;
		} 
	}
	return hasVal;
}