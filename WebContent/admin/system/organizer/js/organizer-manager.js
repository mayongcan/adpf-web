var g_params = {}, g_iframeIndex = null, $table = $('#tableList');
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
});

/**
 * 获取从父窗口传送过来的值
 * @param value
 */
function receiveParams(value){
	g_params = value;
	if(!$.utils.isEmpty(g_params.manager)){
		var tmp = g_params.manager.split(String.fromCharCode(0));
		if(!$.utils.isEmpty(tmp[1])){
			var tmpCodeArray = tmp[1].split(',');
			var tmpNameArray = tmp[2].split(',');
			for(var i = 0;i < tmpCodeArray.length; i++){
				var rowObj = []; 
				rowObj.userCode = tmpCodeArray[i];
				rowObj.userName = tmpNameArray[i];
				g_selectRowsId.push(rowObj);
			}
		}
	}
	//初始化界面
	initView();
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
            tenantsId: top.app.info.userInfo.tenantsId,
            userName: $("#searchUserName").val(),
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
		$("#searchUserName").val("");
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
					if(g_selectRowsId[i].userCode == rowsData.userCode) {
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
				if(g_selectRowsId[i].userCode == rowData.userCode) {
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
					if(g_selectRowsId[i].userCode == rowsData.userCode) {
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
	var rows = g_selectRowsId;
	if(rows.length == 0 || rows.length > 1){
		top.app.message.alert("请选择一个用户作为管理员！");
		return;
	}
	var userIdList = "", userCodeList = "", userNameList = "";
	$.each(rows, function(i, rowData) {
		if(userIdList != "") userIdList = userIdList + ",";
		userIdList = userIdList + rowData.userId;
		if(userCodeList != "") userCodeList = userCodeList + ",";
		userCodeList = userCodeList + rowData.userCode;
		if(userNameList != "") userNameList = userNameList + ",";
		userNameList = userNameList + rowData.userName;
	});

	var rowObj = [];
	rowObj.userIdList = userIdList;
	rowObj.userCodeList = userCodeList;
	rowObj.userNameList = userNameList;
	rowObj.manager = userIdList + String.fromCharCode(0) + userCodeList + String.fromCharCode(0) + userNameList;
	parent.app.layer.retParams = [];
	parent.app.layer.retParams.push(rowObj);

	//关闭页面前设置结果
	parent.app.layer.editLayerRet = true;
	parent.layer.close(g_iframeIndex);
}

/**
 * 格式化
 * @param value
 * @param row
 */
function tableFormatCheckbox(value, row) {
	var hasVal = false;
	for(var i = 0; i < g_selectRowsId.length; i++){
		if(g_selectRowsId[i].userCode == row.userCode) {
			hasVal = true;
			break;
		} 
	}
	return hasVal;
}