var g_params = {}, g_iframeIndex, g_filePath = null, $treeView = $('#treeView');

$(function () {
	g_iframeIndex = parent.layer.getFrameIndex(window.name);
	// 取消按钮
	$("#layerCancel").click(function () {
		parent.layer.close(g_iframeIndex);
    });
	$("#layerImport").click(function () {
    		ajaxUpload();
    });
	$("#layerOk").click(function () {
		top.app.message.confirm("确定要保存当前的权限树？", function(){
			submitAction();
		});
    });
	$('input[type="file"]').prettyFile({text:"请选择权限文件"});
});

/**
 * 获取从父窗口传送过来的值
 * 
 * @param value
 */
function receiveParams(value){
	g_params = value;
}

/**
 * 提交数据
 */
function submitAction(){
	if($("#funcFile")[0].files[0] == null || $("#funcFile")[0].files[0] == undefined){
		top.app.message.alert("请选择要导入的权限文件！");
		return;
	}
	if($("#funcFile")[0].files[0].size / 1024 / 1024 > 2){
		top.app.message.alert("请选择2MB以下的文件进行上传！");
		return;
	}
	// 启动加载层
	top.app.message.loading();
	var formData = new FormData();
	formData.append("file",	$("#funcFile")[0].files[0]);
	$.ajax({  
		url: top.app.conf.url.api.system.func.saveImportFunc + "?access_token=" + top.app.cookies.getCookiesToken() + "&funcId=" + g_params.node.id ,
        type: 'POST',  
        data: formData,  
        // 告诉jQuery不要去处理发送的数据
        processData : false, 
        // 告诉jQuery不要去设置Content-Type请求头
        contentType : false,
        success : function(data) { 
   			top.app.message.loadingClose();
   			if(top.app.message.code.success == data.RetCode){
   				// 关闭页面前设置结果
				parent.app.layer.editLayerRet = true;
	   			top.app.message.notice("数据保存成功！");
				parent.layer.close(g_iframeIndex);
	   		}else{
	   			top.app.message.noticeError(data.RetMsg);
	   		}
        },  
        error : function(responseStr) { 
   			top.app.message.loadingClose();
   			top.app.message.noticeError("保存数据失败，请稍后重试！");
        }  
    }); 
}

/**
 * 提交图片
 */
function ajaxUpload(){
	if($("#funcFile")[0].files[0] == null || $("#funcFile")[0].files[0] == undefined){
		top.app.message.alert("请选择要导入的权限文件！");
		return;
	}
	if($("#funcFile")[0].files[0].size / 1024 / 1024 > 2){
		top.app.message.alert("请选择2MB以下的文件进行上传！");
		return;
	}
	// 启动加载层
	top.app.message.loading();
	var formData = new FormData();
	formData.append("file",	$("#funcFile")[0].files[0]);
	$.ajax({  
		url: g_params.operUrl + "?access_token=" + top.app.cookies.getCookiesToken() + "&funcId=" + g_params.node.id ,
        type: 'POST',  
        data: formData,  
        // 告诉jQuery不要去处理发送的数据
        processData : false, 
        // 告诉jQuery不要去设置Content-Type请求头
        contentType : false,
        success : function(data) { 
        	if(top.app.message.code.success == data.RetCode){
        		$treeView.jstree({
					'core': {
						"check_callback": true,
						'data': data.RetData
					},
					"plugins": ["types"],
					"types": {
						"default": {
							"icon": "fa fa-folder"
						}
					}
	    	    });
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
   			top.app.message.loadingClose();
        },  
        error : function(responseStr) { 
   			top.app.message.loadingClose();
   			top.app.message.error("上传权限文件失败，请稍后重试！");
        }  
    }); 
}