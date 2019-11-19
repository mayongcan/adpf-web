var $table = $('#tableList');
var g_msgTypeDict = null;

$(function () {
	//初始化字典
	initDict();
	//初始化搜索面板
	initSearchPanel();
	//初始化权限
	initFunc();
	//初始化列表信息
	initTable();
	//初始化权限功能按钮点击事件
	initFuncBtnEvent();
});

/**
 * 初始化字典
 * @returns
 */
function initDict(){
	g_msgTypeDict = top.app.getDictDataByDictTypeValue('SYS_MSG_TYPE');
}

/**
 * 初始化搜索面板
 * @returns
 */
function initSearchPanel(){
	var msgTypeDict = top.app.getDictDataByDictTypeValue('SYS_MSG_TYPE');
	top.app.addComboBoxOption($("#msgType"), msgTypeDict, true);
}

/**
 * 初始化权限
 */
function initFunc(){
	var g_operRights = top.app.getUserRights($.utils.getUrlParam(window.location.search,"_pid"));
	$("#tableToolbar").empty();
	var htmlTable = "";
	var length = g_operRights.length;
	for (var i = 0; i < length; i++) {
		htmlTable += "<button type='button' class='btn btn-outline btn-default' id='" + g_operRights[i].funcFlag  + "' data-action-url='" + g_operRights[i].funcLink + "'>" + 
						"<i class=\""+ g_operRights[i].funcIcon + "\" aria-hidden=\"true\"></i> " + g_operRights[i].funcName + 
					 "</button>";
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
            tenantsId: top.app.info.userInfo.tenantsId,
			msgTitle: $("#msgTitle").val(),
			msgType: $("#msgType").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.apigateway + "/api/system/message/getList",   		//请求后台的URL（*）
        queryParams: searchParams,											//传递参数（*）
        uniqueId: 'msgId',
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
		$("#msgTitle").val("");
		$("#msgType").val("");
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

/**
 * 初始化权限功能点击事件
 */
function initFuncBtnEvent(){
	//绑定工具条事件
	$("#sysMessageInfoAdd").click(function () {
		//设置传送对象
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'add';
		top.app.info.iframe.params.msgType = g_msgTypeDict;
		top.app.info.iframe.params.operUrl = top.app.conf.url.apigateway + $("#sysMessageInfoAdd").data('action-url');
		
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "messageinfo-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#sysMessageInfoEdit").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 || rows.length > 1){
			top.app.message.alert("请选择一条数据进行编辑！");
			return;
		}
		if(rows[0].sendDate != null && rows[0].sendDate != undefined && rows[0].sendDate != '' ){
			top.app.message.alert("已发送的消息不能编辑！");
			return;
		}
		//设置参数
		//设置传送对象
		top.app.info.iframe.params = {};
		top.app.info.iframe.params.type = 'edit';
		top.app.info.iframe.params.rows = rows[0];
		top.app.info.iframe.params.msgType = g_msgTypeDict;
		top.app.info.iframe.params.operUrl = top.app.conf.url.apigateway + $("#sysMessageInfoEdit").data('action-url');
		
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		var url = "messageinfo-edit.html?_pid=" + pid;
		window.location.href = encodeURI(url);
    });
	$("#sysMessageInfoDel").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要删除的数据！");
			return;
		}
		var idsList = "";
		var hasSend = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.msgId;
			if(rowData.sendDate != null && rowData.sendDate != undefined && rowData.sendDate != '' ){
				hasSend = true;
			}
    		});
		if(hasSend){
			top.app.message.alert("已发送的消息不能删除！");
			return;
		}
		appTable.delData($table, $("#sysMessageInfoDel").data('action-url'), idsList);
    });
	$("#sysMessageInfoSend").click(function () {
		var rows = appTable.getSelectionRows($table);
		if(rows.length == 0 ){
			top.app.message.alert("请选择要发送的消息！");
			return;
		}
		var idsList = "";
		var hasSend = false;
		$.each(rows, function(i, rowData) {
			if(idsList != "") idsList = idsList + ",";
			idsList = idsList + rowData.msgId;
			if(rowData.sendDate != null && rowData.sendDate != undefined && rowData.sendDate != '' ){
				hasSend = true;
			}
    	});
		if(hasSend){
			top.app.message.alert("已发送的消息不能重复发送！");
			return;
		}
		appTable.postData($table, $("#sysMessageInfoSend").data('action-url'), idsList,
				"确定发送当前选中的消息？", "消息发送成功！");
    });
}

function formatMsgType(value,row,index){
	var i = g_msgTypeDict.length;
	while (i--) {
		if(g_msgTypeDict[i].ID == value){
			return g_msgTypeDict[i].NAME;
		}
	}
	return "未知";
}

function tableFormatSendStatus(value,row,index){
	if($.utils.isEmpty(row.sendDate)) return '<font color="red">未发送</font>';
	else return '<font color="green">已发送</font>';
}

function tableFormatIsRevoke(value,row,index){
	if(value == '0') return '否';
	else return '<font color="red">是</font>';
}
