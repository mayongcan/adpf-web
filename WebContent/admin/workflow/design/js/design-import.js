var g_params = {}, g_iframeIndex = null;
$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	formValidate();
	//取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$('.selectpicker').selectpicker({
		width: '550px'
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
	top.app.addComboBoxOption($("#category"), g_params.typeDict);
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
	$('input[type="file"]').prettyFile({text:"请选择流程文件"});
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	name: {required: true},
	        	key:  {required: true},
        },
        messages: {
	        	name: {required: "请输入流程名称"},
	        	key: {required: "请输入流程Key"},
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
	if($("#bpmnFile")[0].files[0] == null || $("#bpmnFile")[0].files[0] == undefined){
		top.app.message.alert("请选择要导入的流程文件！");
		return;
	}
	if($("#bpmnFile")[0].files[0].size / 1024 / 1024 > 2){
		top.app.message.alert("请选择2MB以下的文件进行上传！");
		return;
	}
	
	//定义提交数据
	var submitParams = "&name=" + $("#name").val() + "&key=" + $("#key").val() + "&category=" + $("#category").val() + "&desc=" + $("#desc").val();
	//启动加载层
	top.app.message.loading();
	var formData = new FormData();
	formData.append("file",	$("#bpmnFile")[0].files[0]);
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + submitParams,
		type: 'POST',  
        data: formData,  
        // 告诉jQuery不要去处理发送的数据
        processData : false, 
        // 告诉jQuery不要去设置Content-Type请求头
        contentType : false,
		success: function(data){
   			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
				//关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}