var g_params = {}, g_iframeIndex = null, g_extendData = null;
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerOk").click(function () {
		submitAction();
    });
	//设置select的宽度
	$('.selectpicker').selectpicker({
		width: '225px'
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
	if(!$.utils.isEmpty(g_params.rows.extendData)){
		g_extendData = eval("(" + g_params.rows.extendData + ")");
		if(!$.utils.isNull(g_extendData)){
			$('#showName').val(g_extendData.showName);
			$('#copyright').val(g_extendData.copyright);
			$('#homePage').val(g_extendData.homePage);
			$('#loginPage').val(g_extendData.loginPage);
		}
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 提交数据
 */
function submitAction(){
	top.app.message.loading();
	//定义提交数据
	var submitData = {};
	submitData['tenantsId'] = g_params.rows.tenantsId;
	
	var extendData = new Object();
	extendData.showName = $('#showName').val();
	extendData.copyright = $('#copyright').val();
	extendData.homePage = $('#homePage').val();
	extendData.loginPage = $('#loginPage').val();
	submitData["extendData"] = JSON.stringify(extendData);
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}