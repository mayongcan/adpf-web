var g_tabList = null, g_userPicPath = null, g_isFirstClilck = true, g_isFirstClilckMessage = true;

$(function () {
	//初始化tab
	g_tabList = new Vue({el:"#tabInfo"});
	initView();
});

/**
 * 初始化界面数据
 */
function initView(){
	//设置高度
	$('#headerInfo').css('height', $(window).height() - 45);
	$('#divEditInfo').css('height', $(window).height() - 163);
	$('#divEditPassword').css('height', $(window).height() - 163);
	top.app.addComboBoxOption($("#sex"), top.app.getDictDataByDictTypeValue('SYS_SEX_TYPE'));
	$('.selectpicker').selectpicker({
		width: '482px'
	});
	$('input[type="file"]').prettyFile({text:"请选择图片"});
	$('#birthday').datepicker({language: 'zh-CN',todayBtn:"linked",keyboardNavigation:false,forceParse:false,autoclose:true});
	
	//设置用户头像
	$("#infoUserPhoto").attr("src", top.app.conf.url.res.url + top.app.info.userInfo.photo + "?tm=" + new Date().getTime());
	$('#infoUserPhoto').error(function () {
		//获取失败时，加载默认图片
		$("#infoUserPhoto").attr("src", "../../../img/default-header-1.png");
    });
	
	$('#infoUserCode').html(top.app.info.userInfo.userCode);
	$('#infoUserName').html("名称：" + top.app.info.userInfo.userName);
	$('#infoUserRole').html("角色：" + top.app.info.userRole);
	$('#infoUserOrg').html("所属组织：" + top.app.info.organizerInfo.namePath);
	
	//填写用户信息
	$('#userName').val(top.app.info.userInfo.userName);
	$('#email').val(top.app.info.userInfo.email);
	$('#mobile').val(top.app.info.userInfo.mobile);
	$('#sex').val(top.app.info.userInfo.sex);
	$('#birthday').val($.date.timestampToStrDate(top.app.info.userInfo.birthday));

	$('.selectpicker').selectpicker('refresh');
	
	//保存用户信息
	$("#submitInfo").click(function () {
		if($('#userName').val() == ''){
			top.app.message.notice("请输入用户名称");
			return;
		}
		ajaxUploadUserPic();
    });
	
	//更新用户密码
	$("#submitPassword").click(function () {
		if($('#oldPassword').val() == ''){
			top.app.message.notice("请输入旧密码");
			return;
		}
		if($('#newPassword').val() == ''){
			top.app.message.notice("请输入新密码");
			return;
		}
		if($('#passwordConfirm').val() == ''){
			top.app.message.notice("请再次输入新密码");
			return;
		}
		if($('#newPassword').val() != $('#passwordConfirm').val()){
			top.app.message.notice("两次输入的密码不一样");
			return;
		}
		submitPasswordAction();
    });
	
	//绑定tab元素
	$(document).on("click", ".tab-info", function(){
		if($(this).children("a").children("span").html() == '操作日志'){
			if(g_isFirstClilck){
				$('#iframeLog').attr('src', 'user-log.html');
				g_isFirstClilck = false;
			}
		}else if($(this).children("a").children("span").html() == '我的消息'){
			if(g_isFirstClilckMessage){
				$('#iframeMessage').attr('src', 'user-message.html');
				g_isFirstClilckMessage = false;
			}
		}
	}) 
}

/**
 * 更新用户数据
 */
function submitUserInfoAction(){
	top.app.message.loading();
	//定义提交数据
	var submitData = {};
	submitData['userId'] = top.app.info.userInfo.userId;
	submitData['tenantsId'] = top.app.info.tenantsId;
	submitData["userName"] = $.trim($("#userName").val());
	submitData["email"] = $.trim($("#email").val());
	submitData["mobile"] = $.trim($("#mobile").val());
	submitData["sex"] = $("#sex").val();
	submitData["birthday"] = $("#birthday").val();
	if(g_userPicPath != null && g_userPicPath != undefined && g_userPicPath != '')
		submitData["photo"] = g_userPicPath;
	//异步处理
	$.ajax({
		url: top.app.conf.url.api.system.user.editUser + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.notice("用户信息更新成功！");
	   			//获取用户信息
	   			top.app.getUserInfo();
	   			//刷新页面
	   			location.reload();
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}

/**
 * 上传用户头像
 */
function ajaxUploadUserPic(){
	if($("#photo")[0].files[0] == null || $("#photo")[0].files[0] == undefined){
		submitUserInfoAction();
		return;
	}
	//上传图片到资源服务器
	top.app.uploadImage($("#photo")[0].files[0], function(data){
		g_userPicPath = data;
		//提交数据
		submitUserInfoAction();
	});
}


/**
 * 更新用户密码
 */
function submitPasswordAction(){
	top.app.message.loading();
	//定义提交数据
	var submitData = {};
	submitData['userId'] = top.app.info.userInfo.userId;
	submitData["oldPassword"] = $.trim($("#oldPassword").val());
	submitData["newPassword"] = $.trim($("#newPassword").val());
	//异步处理
	$.ajax({
		url: top.app.conf.url.api.system.user.updatePassword + "?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'POST',
		data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
	   			top.app.message.notice("用户密码更新成功！");
	   			//获取用户信息
	   			top.app.getUserInfo();
	   			//刷新页面
	   			location.reload();
	   		}else{
	   			top.app.message.error(data.RetMsg);
	   		}
        }
	});
}