var g_params = {}, g_iframeIndex = null;

$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	//设置select的宽度为
	$('.selectpicker').selectpicker({
		width: '515px'
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
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#triggerName').val(g_params.rows.triggerName);
		$('#triggerType').val(g_params.rows.triggerType);
		$('#triggerValue').val(g_params.rows.triggerValue);
		$('#triggerDesc').val(g_params.rows.triggerDesc);
		$('#triggerName').attr("readonly","readonly");
	}
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	triggerName: {required: true},
	        	triggerValue: {required: true}
        },
        messages: {
	        	triggerName: {required: "请输入触发器名称"},
	        	triggerValue: {required: "请输入触发器值"}
        },
        //重写showErrors
        showErrors: function (errorMap, errorList) {
            $.each(errorList, function (i, v) {
                //在此处用了layer的方法
                layer.tips(v.message, v.element, { tips: [1, '#3595CC'], time: 2000 });
                return false;
            });  
        },
        //失去焦点时不验证
        onfocusout: false,
        submitHandler: function () {
            //提交内容
        		submitAction();
        }
    });
}

/**
 * 提交数据
 */
function submitAction(){
	top.app.message.loading();
	//定义提交数据
	var submitData = {};
	submitData["jobName"] = g_params.jobName;
	submitData["jobGroup"] = g_params.jobGroup;
	submitData["triggerGroup"] = g_params.jobGroup;
	submitData["triggerName"] = $.trim($("#triggerName").val());
	submitData["triggerType"] = $("#triggerType").val();
	submitData["triggerValue"] = $.trim($("#triggerValue").val());
	submitData["triggerDesc"] = $.trim($("#triggerDesc").val());
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