var g_params = {}, g_comboBoxTree = null, g_imagePath = null, g_filePath = null; 
var g_userIdList = "", g_userCodeList = "", g_userNameList = "";
$(function () {
	formValidate();
	//取消按钮
	$("#btnBack").click(function () {
		var pid = $.utils.getUrlParam(window.location.search,"_pid");
		window.location.href= "messageinfo.html?_pid=" + pid;
    });
	$("#btnSave").click(function () {
		$("form").submit();
    });
	//初始化ckeditor
	CKEDITOR.replace('editorContent',{
		filebrowserImageUploadUrl: top.app.conf.url.res.uploadCKEditorImage,
		filebrowserUploadUrl: top.app.conf.url.res.uploadCKEditorFile
	});
	g_params = top.app.info.iframe.params;
	initView();
});

/**
 * 初始化界面
 */
function initView(){
	top.app.addComboBoxOption($("#msgType"), g_params.msgType);
	//判断是新增还是修改
	if(g_params.type == "edit"){
		$('#msgTitle').val(g_params.rows.msgTitle);
		$('#msgType').val(g_params.rows.msgType);
		CKEDITOR.instances.editorContent.setData(g_params.rows.msgContent);
		g_userIdList = g_params.rows.userIdList;
		g_userCodeList = g_params.rows.userCodeList;
		g_userNameList = g_params.rows.userNameList;
		$("#msgUser").val(g_userNameList);
		//初始化文件上传框
		$('#msgImg').prettyFile({text:"请选择图片", placeholder:"若不修改图片，请留空"});
		$('#msgFile').prettyFile({text:"请选择附件", placeholder:"若不修改附件，请留空"});
	}else{
		//初始化文件上传框
		$('#msgImg').prettyFile({text:"请选择图片"});
		$('#msgFile').prettyFile({text:"请选择附件"});
	}

	if($('#msgType').val() == '1'){
		$('#divReceiver').css("display", "none");
	}else{
		$('#divReceiver').css("display", "");
	}
	
	//刷新数据，否则下拉框显示不出内容
	$('.selectpicker').selectpicker('refresh');
	
	//权限类型下拉框变更事件
	$('#msgType').on('changed.bs.select', function (e) {
		if($('#msgType').val() == '1'){
			$('#divReceiver').css("display", "none");
		}else{
			$('#divReceiver').css("display", "");
		}
	});
	
	//选择消息接收人
	$("#msgUser").click(function () {
		//设置参数
		var params = {};
		params.userIdList = g_userIdList;
		params.userCodeList = g_userCodeList;
		params.userNameList = g_userNameList;
		top.app.layer.editLayer('选择消息接收人', ['900px', '550px'], '/admin/system/message/messageinfo-user.html', params, function(retParams){
			if(retParams == null || retParams == undefined && retParams.length > 0) {
				top.app.message.alert("获取返回内容失败！");
				return;
			}
			g_userIdList = retParams[0].userIdList;
			g_userCodeList = retParams[0].userCodeList;
			g_userNameList = retParams[0].userNameList;
			$("#msgUser").val(retParams[0].userNameList);
		});
    });
}

/**
 * 表单验证
 */
function formValidate(){
	$("#divEditForm").validate({
        rules: {
	        	msgTitle: {required: true},
	        	weight: {required: true, digits:true}
        },
        messages: {
        		msgTitle: {required: "请输入消息标题"}
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
        	ajaxUpload();
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
		submitData['msgId'] = g_params.rows.msgId;
	submitData["msgTitle"] = $("#msgTitle").val();
	submitData["msgType"] = $("#msgType").val();
	submitData["msgContent"] = CKEDITOR.instances.editorContent.getData();
	if(g_imagePath != null && g_imagePath != undefined)
		submitData["msgImg"] = g_imagePath;
	if(g_filePath != null && g_filePath != undefined)
		submitData["msgFile"] = g_filePath;
	submitData["userIdList"] = g_userIdList;
	//异步处理
	$.ajax({
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.alert("数据保存成功！");

	   			var pid = $.utils.getUrlParam(window.location.search,"_pid");
	   			window.location.href= "messageinfo.html?_pid=" + pid;
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

/**
 * 提交图片
 */
function ajaxUpload(){
	if(CKEDITOR.instances.editorContent.getData() == ''){
		top.app.message.alert("请填写消息内容！");
		return;
	}
	var hasImage = true, hasFile = true;
	var finishImage = 0, finishFile = 0;
	if($("#msgImg")[0].files[0] == null || $("#msgImg")[0].files[0] == undefined){
		hasImage = false;
		finishImage = 1;
	}
	if($("#msgFile")[0].files[0] == null || $("#msgFile")[0].files[0] == undefined){
		hasFile = false;
		finishFile = 1;
	}
	//上传图片到资源服务器
	if(hasImage){
		top.app.uploadMultiImage($("#msgImg")[0].files, function(data){
			g_imagePath = data;
			finishImage = 1;
		});
	}
	if(hasFile){
		top.app.uploadMultiFile($("#msgFile")[0].files, function(data){
			g_filePath = data;
			finishFile = 1;
		});
	}
	//使用定时器判断是否已上传结束
	$('#onTime').timer({
	    duration: '1s',
	    callback: function() {
		    	if(finishImage == 1 && finishFile == 1){
		    		$("#onTime").timer('pause');
		    		submitAction();
		    	}
	    },
	    repeat: true //重复调用
	});
	
}