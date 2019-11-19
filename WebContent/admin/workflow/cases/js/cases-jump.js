var g_params = {}, g_iframeIndex = null;
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
	$('.selectpicker').selectpicker({
		width: '510px'
	});
});

/**
 * 获取从父窗口传送过来的值
 * @param value
 */
function receiveParams(value){
	g_params = value;
	//初始化界面
	initView();
}

/**
 * 初始化界面
 */
function initView(){
	//获取所有的任务节点
	$.ajax({
	    url: top.app.conf.url.apigateway + "/api/workflow/getWorkflowAllNode",
	    method: 'GET',
	    data: {
		    	access_token: top.app.cookies.getCookiesToken(),
		    	processDefinitionId: g_params.rows.processDefinitionId
	    },
	    success : function(data) { 
	        	if(top.app.message.code.success == data.RetCode){
	        		top.app.addComboBoxOption($('#jumpNode'), data.RetData, false);
	        		//刷新数据，否则下拉框显示不出内容
	        		$('.selectpicker').selectpicker('refresh');
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}


/**
 * 提交数据
 */
function submitAction(){
	//定义提交数据
	var submitData = {};
	submitData["processInstanceId"] = g_params.rows.processInstanceId;
	submitData["processDefinitionId"] = g_params.rows.processDefinitionId;
	submitData["targetTaskDefinitionKey"] = $("#jumpNode").val();
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("流程跳转设置成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}