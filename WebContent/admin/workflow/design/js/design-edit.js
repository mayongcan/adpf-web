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
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#name').val(g_params.rows.name);
		$('#key').val(g_params.rows.key);
		$('#category').val(g_params.rows.category);
		$('#desc').val(g_params.rows.desc);
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
	//定义提交数据
	var submitData = {};
	if(g_params.rows != null && g_params.rows != undefined)
		submitData['id'] = g_params.rows.id;
	submitData["name"] = $.trim($("#name").val());
	submitData["key"] = $("#key").val();
	submitData["category"] = $.trim($("#category").val());
	submitData["desc"] = $("#desc").val();
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
	   			top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}