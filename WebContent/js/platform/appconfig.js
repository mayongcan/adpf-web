/*!
 * 作者：zzd
 * 时间：2017-04-19
 * 描述：app通用配置与函数
 */
//初始化工作
(function ($) {
	$(document).ready(function() {
		//初始化toastr
		toastr.options = {
		  "closeButton": true,
		  "debug": false,
		  "newestOnTop": false,
		  "progressBar": false,
		  "positionClass": "toast-bottom-right",
		  "preventDuplicates": false,
		  "onclick": null,
		  "showDuration": "300",
		  "hideDuration": "1000",
		  "timeOut": "5000",
		  "extendedTimeOut": "1000",
		  "showEasing": "swing",
		  "hideEasing": "linear",
		  "showMethod": "fadeIn",
		  "hideMethod": "fadeOut"
		}
	});
})(jQuery);

var app = app || {};
(function() {
	//+---------------------------------------------------   
	//| 全局变量
	//+--------------------------------------------------- 
	app.info = {};
	app.info.iframe = {};
	app.info.hasPrjName = false;			//判断是否有项目名
	app.info.rootPath = $.utils == undefined ? "" : ($.utils.getRootPath == undefined ? "" : $.utils.getRootPath(app.info.hasPrjName));
	app.info.userInfo = null;
	app.info.userRole = null;
	app.info.tenantsInfo = null;
	app.info.organizerInfo = null;
	app.info.rootOrganizerId = null;
	app.info.topOrganizerId = null;    //用户上级机构，即机构类型为1的上级机构ID
	app.info.isOrganizerManager = false;
	app.info.dataPermissionIdList = "";
	app.info.dataPermissionNameList = "";
	app.info.dataPermissionId = "";
	app.info.dataPermissionName = "";
	app.info.extraInfo = {};
	
	//+---------------------------------------------------   
	//| 启动内置工作流时，从下面的key中获取工作流发布的最新版本
	//+--------------------------------------------------- 
	app.info.workflow = {};
	app.info.workflow.key = {};
	app.info.workflow.key.leave = "WorkflowLeave";
	app.info.workflow.key.loan = "WorkflowLoan";
	
	//+---------------------------------------------------   
	//| 初始化基础属性
	//+--------------------------------------------------- 
	app.conf = {};
	app.conf.isDebug = true;
	app.conf.url = {};
	app.conf.url.apigateway = "http://localhost:8050";
	app.conf.url.getTokenUrl = app.conf.url.apigateway + "/authServer/oauth/token";
	app.conf.url.getVerifyCode = app.conf.url.apigateway + "/authServer/kaptcha/getKaptchaCode";
	app.conf.url.checkVerifyCode = app.conf.url.apigateway + "/authServer/kaptcha/checkKaptchaCode";
	app.conf.url.checkLoginIp = app.conf.url.apigateway + "/authServer/user/checkLoginIp";
	app.conf.url.getSmsCode = app.conf.url.apigateway + "/authServer/user/getSmsCode";
	app.conf.url.getSmsCodeByPhone = app.conf.url.apigateway + "/authServer/user/getSmsCodeByPhone";
	app.conf.url.checkSmsVerifyCode = app.conf.url.apigateway + "/authServer/user/checkSmsVerifyCode";
	app.conf.url.resetPasswd = app.conf.url.apigateway + "/authServer/user/resetPasswd";
	app.conf.url.checkToken = app.conf.url.apigateway + "/authServer/user/checkToken";
	app.conf.url.uploadTokenCache = app.conf.url.apigateway + "/authServer/user/uploadTokenCache";
	app.conf.url.basicAuth = "Basic Z2ltcF93ZWI6Z2ltcF93ZWI=";
	
	//+---------------------------------------------------   
	//| 初始化图片文件资源服务器路径
	//+--------------------------------------------------- 
	app.conf.url.res = {};
	app.conf.url.res.url = top.app.conf.url.apigateway + "/res/";
	app.conf.url.res.uploadCKEditorImage = app.conf.url.res.url + "upload/ckeditor/uploadImage?backUrl=" + app.info.rootPath + "/admin/ckeditor-recv-file.html";
	app.conf.url.res.uploadCKEditorFile = app.conf.url.res.url + "upload/ckeditor/uploadFile?backUrl=" + app.info.rootPath + "/admin/ckeditor-recv-file.html";
	app.conf.url.res.uploadImage = app.conf.url.res.url + "upload/uploadImage";
	app.conf.url.res.uploadMultiImage = app.conf.url.res.url + "upload/uploadMultiImage";
	app.conf.url.res.uploadFile = top.app.conf.url.apigateway + "/zuul/res/upload/uploadFile";
	app.conf.url.res.uploadMultiFile = top.app.conf.url.apigateway + "/zuul/res/upload/uploadMultiFile";
	app.conf.url.res.downloadFile = app.conf.url.res.url + "download/downloadFile";
	app.conf.url.api = {};
	app.conf.url.api.system = {}
	app.conf.url.api.system.logout = app.conf.url.apigateway + "/api/system/logout";

	//+---------------------------------------------------   
	//| 用户模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.user = {}
	app.conf.url.api.system.user.getUserInfo = app.conf.url.apigateway + "/api/system/user/getUserInfo";
	app.conf.url.api.system.user.getUserFunc = app.conf.url.apigateway + "/api/system/user/getUserFunc";
	app.conf.url.api.system.user.getUserFuncByFd = app.conf.url.apigateway + "/api/system/user/getUserFuncByFd";
	app.conf.url.api.system.user.getUserRights = app.conf.url.apigateway + "/api/system/user/getUserRights";
	app.conf.url.api.system.user.getUserList = app.conf.url.apigateway + "/api/system/user/getUserList";
	app.conf.url.api.system.user.getTenantsUser = app.conf.url.apigateway + "/api/system/user/getTenantsUser";
	app.conf.url.api.system.user.getUserKeyVal = top.app.conf.url.apigateway + "/api/system/user/getUserKeyVal";
	app.conf.url.api.system.user.getSubordinate = top.app.conf.url.apigateway + "/api/system/user/getSubordinate";
	app.conf.url.api.system.user.editUser = app.conf.url.apigateway + "/api/system/user/editUser";
	app.conf.url.api.system.user.updatePassword = app.conf.url.apigateway + "/api/system/user/updatePassword";
	app.conf.url.api.system.user.getLockAccount = app.conf.url.apigateway + "/api/system/user/getLockAccount";

	//+---------------------------------------------------   
	//| 租户模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.tenants = {}
	app.conf.url.api.system.tenants.getAllTenantsList = app.conf.url.apigateway + "/api/system/tenants/getAllTenantsList";
	app.conf.url.api.system.tenants.getTenantsList = app.conf.url.apigateway + "/api/system/tenants/getTenantsList";
	app.conf.url.api.system.tenants.getTenFuncTree = app.conf.url.apigateway + "/api/system/tenants/getTenFuncTree";
	app.conf.url.api.system.tenants.getFuncIdByTenantsId = app.conf.url.apigateway + "/api/system/tenants/getFuncIdByTenantsId";

	//+---------------------------------------------------   
	//| 组织模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.organizer = {}
	app.conf.url.api.system.organizer.getOrganizerTree = app.conf.url.apigateway + "/api/system/organizer/getOrganizerTree";
	app.conf.url.api.system.organizer.getParentId = app.conf.url.apigateway + "/api/system/organizer/getParentId";
	app.conf.url.api.system.organizer.getRoleAndData = app.conf.url.apigateway + "/api/system/organizer/getRoleAndData";
	app.conf.url.api.system.organizer.getExtraInfo = app.conf.url.apigateway + "/api/system/organizer/getExtraInfo";

	//+---------------------------------------------------   
	//| 字典模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.dict = {}
	app.conf.url.api.system.dict.getDictDataByDictTypeValue = app.conf.url.apigateway + "/api/system/dict/getDictDataByDictTypeValue";
	app.conf.url.api.system.dict.getDictList = app.conf.url.apigateway + "/api/system/dict/getDictList";
	app.conf.url.api.system.dict.getDictDataList = app.conf.url.apigateway + "/api/system/dict/getDictDataList";

	//+---------------------------------------------------   
	//| 权限模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.func = {}
	app.conf.url.api.system.func.getFuncList = app.conf.url.apigateway + "/api/system/func/getFuncList";
	app.conf.url.api.system.func.getFuncTree = app.conf.url.apigateway + "/api/system/func/getFuncTree";
	app.conf.url.api.system.func.saveImportFunc = app.conf.url.apigateway + "/api/system/func/saveImportFunc";

	//+---------------------------------------------------   
	//| 角色模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.role = {}
	app.conf.url.api.system.role.getRoleList = app.conf.url.apigateway + "/api/system/role/getRoleList";
	app.conf.url.api.system.role.getRoleUserList = app.conf.url.apigateway + "/api/system/role/getRoleUserList";
	app.conf.url.api.system.role.getFuncTreeByRoleId = app.conf.url.apigateway + "/api/system/role/getFuncTreeByRoleId";
	app.conf.url.api.system.role.getRoleKeyVal = top.app.conf.url.apigateway + "/api/system/role/getRoleKeyVal";

	//+---------------------------------------------------   
	//| 数据权限模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.data = {}
	app.conf.url.api.system.data.getDataPermissionTreeList = app.conf.url.apigateway + "/api/system/data/getDataPermissionTreeList";
	app.conf.url.api.system.data.getDataPermissionRootTreeList = app.conf.url.apigateway + "/api/system/data/getDataPermissionRootTreeList";
	app.conf.url.api.system.data.getUserListByDataPermission = app.conf.url.apigateway + "/api/system/data/getUserListByDataPermission";
	app.conf.url.api.system.data.getDataPermissionKeyVal = top.app.conf.url.apigateway + "/api/system/data/getDataPermissionKeyVal";

	//+---------------------------------------------------   
	//| 系统日志模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.log = {}
	app.conf.url.api.system.log.getLogList = app.conf.url.apigateway + "/api/system/log/getLogList";

	//+---------------------------------------------------   
	//| 代码自增模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.tbgenerator = {}
	app.conf.url.api.system.tbgenerator.getList = app.conf.url.apigateway + "/api/system/tbgenerator/getList";

	//+---------------------------------------------------   
	//| 任务调度模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.scheduler = {}
	app.conf.url.api.system.scheduler.jobList = app.conf.url.apigateway + "/api/system/scheduler/jobList";
	app.conf.url.api.system.scheduler.addProcJob = app.conf.url.apigateway + "/api/system/scheduler/addProcJob";
	app.conf.url.api.system.scheduler.editProcJob = app.conf.url.apigateway + "/api/system/scheduler/editProcJob";
	app.conf.url.api.system.scheduler.addRestfulJob = app.conf.url.apigateway + "/api/system/scheduler/addRestfulJob";
	app.conf.url.api.system.scheduler.editRestfulJob = app.conf.url.apigateway + "/api/system/scheduler/editRestfulJob";
	app.conf.url.api.system.scheduler.addCustomJob = app.conf.url.apigateway + "/api/system/scheduler/addCustomJob";
	app.conf.url.api.system.scheduler.editCustomJob = app.conf.url.apigateway + "/api/system/scheduler/editCustomJob";
	app.conf.url.api.system.scheduler.getProcParams = app.conf.url.apigateway + "/api/system/scheduler/getProcParams";
	app.conf.url.api.system.scheduler.triggerList = app.conf.url.apigateway + "/api/system/scheduler/triggerList";
	app.conf.url.api.system.scheduler.jobHistoryList = app.conf.url.apigateway + "/api/system/scheduler/jobHistoryList";

	//+---------------------------------------------------   
	//| 授权认证模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.oauth = {}
	app.conf.url.api.system.oauth.getOauthList = app.conf.url.apigateway + "/api/system/oauth/getOauthList";
	
	//+---------------------------------------------------   
	//| 代码生成模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.gencode = {};
	app.conf.url.api.system.gencode.getList = top.app.conf.url.apigateway + "/api/system/gencode/getList";

	//+---------------------------------------------------   
	//| 客户端版本模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.version = {};
	app.conf.url.api.system.version.getList = top.app.conf.url.apigateway + "/api/system/client/getAppVersionList";

	//+---------------------------------------------------   
	//| 区域管理模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.system.district = {}
	app.conf.url.api.system.district.getListByParentId = top.app.conf.url.apigateway + "/api/system/district/getListByParentId";

	app.conf.url.api.system.apidoc = app.conf.url.apigateway + "/api/system/apiDoc";
	
	//+---------------------------------------------------   
	//| 工作流管理模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.workflow = {}
	app.conf.url.api.workflow.design = {}
	app.conf.url.api.workflow.design.getList = app.conf.url.apigateway + "/api/workflow/design/getList";
	app.conf.url.api.workflow.deploy = {}
	app.conf.url.api.workflow.deploy.getList = app.conf.url.apigateway + "/api/workflow/deploy/getList";
	app.conf.url.api.workflow.cases = {}
	app.conf.url.api.workflow.cases.getList = app.conf.url.apigateway + "/api/workflow/cases/getList";
	app.conf.url.api.workflow.historytask = {}
	app.conf.url.api.workflow.historytask.getList = app.conf.url.apigateway + "/api/workflow/historytask/getList";
	app.conf.url.api.workflow.historyprocess = {}
	app.conf.url.api.workflow.historyprocess.getList = app.conf.url.apigateway + "/api/workflow/historyprocess/getList";

	//+---------------------------------------------------   
	//| 个人办公模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.workflow.personal = {}
	app.conf.url.api.workflow.personal.mytask = {}
	app.conf.url.api.workflow.personal.mytask.getList = app.conf.url.apigateway + "/api/workflow/personal/mytask/getList";
	app.conf.url.api.workflow.personal.grouptask = {}
	app.conf.url.api.workflow.personal.grouptask.getList = app.conf.url.apigateway + "/api/workflow/personal/grouptask/getList";
	app.conf.url.api.workflow.personal.myhistorytask = {}
	app.conf.url.api.workflow.personal.myhistorytask.getList = app.conf.url.apigateway + "/api/workflow/personal/myhistorytask/getList";
	app.conf.url.api.workflow.personal.myprocess = {}
	app.conf.url.api.workflow.personal.myprocess.getList = app.conf.url.apigateway + "/api/workflow/personal/myprocess/getList";
	
	//+---------------------------------------------------   
	//| 业务申请模块Restful API接口路径
	//+--------------------------------------------------- 
	app.conf.url.api.workflow.buapply = {}
	app.conf.url.api.workflow.buapply.loan = {}
	app.conf.url.api.workflow.buapply.loan.getList = app.conf.url.apigateway + "/api/workflow/buapply/loan/getList";
	app.conf.url.api.workflow.buapply.leave = {}
	app.conf.url.api.workflow.buapply.leave.getList = app.conf.url.apigateway + "/api/workflow/buapply/leave/getList";
	
	//+---------------------------------------------------   
	//| 判断是否登录
	//+--------------------------------------------------- 
	app.isLogin = function(){
		//首先判断cookies里面是否有token
		if(app.cookies.getCookiesToken() == null) return false;
		else return true;
	};
	
	//+---------------------------------------------------   
	//| 获取token
	//+--------------------------------------------------- 
	app.getToken = function(username, password, callbackSuccess, callbackError){
		$.ajax({
		    url : app.conf.url.getTokenUrl,
		    method : 'POST',
		    data: {
		    	grant_type: "password",
		    	username: username,
		    	password: password,
		    },
		    beforeSend : function(req) {
		    	req.setRequestHeader('Authorization', app.conf.url.basicAuth);
		    },
		    success: function(data){
		    	if(data.access_token == null || data.access_token == undefined || data.access_token == ""){
			    	if(callbackError != undefined && callbackError != null) callbackError("获取授权失败");
			    	return;
		    	}
		    	//将token相关数据写入cookies
		    	app.cookies.setCookiesToken(data.access_token, data.expires_in);
		    	app.cookies.setCookiesRefreshToken(data.refresh_token, data.expires_in);
		    	app.cookies.setCookiesTokenExpires(data.expires_in, data.expires_in);
		    	if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
			},
			error:function(xhr, textStatus, errorThrown){
		    	if(callbackError != undefined && callbackError != null) {
		    		var message = "用户名或密码错误！";
		    		if(xhr.responseJSON != null && xhr.responseJSON.error_description != null && xhr.responseJSON.error_description != "Bad credentials")
		    			message = xhr.responseJSON.error_description;
		    		callbackError(message);
		    	}
		    	console.error("获取token失败:" + message);
    	   	}
		});
	}
	
	//+---------------------------------------------------   
	//| 刷新token
	//+--------------------------------------------------- 
	app.refreshToken = function(callbackSuccess, callbackError){
		console.log("begin to refresh token");
		$.ajax({
		    url : app.conf.url.getTokenUrl,
		    method : 'POST',
		    data: {
		    	grant_type: "refresh_token",
		    	refresh_token: app.cookies.getCookiesRefreshToken()
		    },
		    beforeSend : function(req) {
		        req.setRequestHeader('Authorization', app.conf.url.basicAuth);
		    },
		    success: function(data){
		    	if(data.access_token == null || data.access_token == undefined || data.access_token == ""){
			    	if(callbackError != undefined && callbackError != null) callbackError("获取授权失败");
			    	return;
		    	}
		    	app.cookies.setCookiesToken(data.access_token, data.expires_in);
		    	app.cookies.setCookiesRefreshToken(data.refresh_token, data.expires_in);
		    	app.cookies.setCookiesTokenExpires(data.expires_in, data.expires_in);
		    	if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess(data);
			},
			error:function(xhr, textStatus, errorThrown){
		    	if(callbackError != undefined && callbackError != null) {
		    		var message = "未知错误！";
		    		if(xhr.responseJSON != null && xhr.responseJSON.error_description != null && xhr.responseJSON.error_description != "Bad credentials")
		    			message = xhr.responseJSON.error_description
		    		callbackError(message);
		    	}
				console.error("刷新token失败:" + message);
//				//刷新token失败，返回登录页面
//				window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
    	   	}
		});
	}
	
	//+---------------------------------------------------   
	//| 检查token
	//+--------------------------------------------------- 
	app.checkToken = function(callbackSuccess, callbackError){
		console.log("begin to check token");
		var submitData = {};
		submitData["userCode"] = app.info.userInfo.userCode;
		submitData["access_token"] = app.cookies.getCookiesToken();
		submitData["refresh_token"] = app.cookies.getCookiesRefreshToken();
		submitData["expires_in"] = app.cookies.getCookiesTokenExpires();
		$.ajax({
		    url : app.conf.url.checkToken,
		    method : 'POST',
			contentType: "application/json",
			data: JSON.stringify(submitData),
		    success: function(data){
		    	if(app.message.code.success == data.RetCode){
		    		//判断是否通知刷新token
		    		if(data.RetData.refresh != null && data.RetData.refresh != undefined && data.RetData.refresh != ''){
		    			var oldToken = app.cookies.getCookiesToken();
		    			app.refreshToken(function(data){
		    				//更新授权缓存
		    				app.uploadTokenCache(oldToken);
		    			},function(msg){
		    				app.message.alertEvent('获取授权失败，请重新登录!', function(){
					    		window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
				    		})
		    			});
			    	}
		    		//判断是否要求重新登录
		    		else if(data.RetData.relogin != null && data.RetData.relogin != undefined && data.RetData.relogin != ''){
			    		app.message.alertEvent('当前账号被异地强制登录或session超时，请重新登录!', function(){
				    		window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
			    		})
			    	}else{
			    		//更新本地的token信息
			    		if(data.RetData.access_token != null && data.RetData.access_token != undefined && data.RetData.access_token != ''){
					    	app.cookies.setCookiesToken(data.RetData.access_token, data.RetData.expires_in);
					    	app.cookies.setCookiesRefreshToken(data.RetData.refresh_token, data.RetData.expires_in);
					    	app.cookies.setCookiesTokenExpires(data.RetData.expires_in, data.RetData.expires_in);
			    		}
			    		//判断是否已过期，即cookies为空
			    		if($.utils.isEmpty(app.cookies.getCookiesToken()) || $.utils.isEmpty(app.cookies.getCookiesRefreshToken())){
			    			window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
//			    			app.message.alertEvent('当前账号登录的授权已超时，请重新登录!', function(){
//			    	    		window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
//			        		})
			    		}
			    	}
			    	if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
		   		}else{
		   			//检查token失败，返回登录界面
		   			console.error("检查token失败");
		   			window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
		   			if(callbackError != undefined && callbackError != null) callbackError("检查token失败");
		   		}
			},
			error:function(xhr, textStatus, errorThrown){
		    	if(callbackError != undefined && callbackError != null) {
		    		var message = "未知错误！";
		    		if(xhr.responseJSON != null && xhr.responseJSON.error_description != null && xhr.responseJSON.error_description != "Bad credentials")
		    			message = xhr.responseJSON.error_description
		    		callbackError(message);
		    	}
				console.error("刷新token失败:" + message);
				debugger
				//刷新token失败，返回登录页面
				window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
			}
		});
	}

	//+---------------------------------------------------   
	//| 更新token授权缓存
	//+--------------------------------------------------- 
	app.uploadTokenCache = function(oldToken){
		var submitData = {};
		submitData["userCode"] = app.info.userInfo.userCode;
		submitData["oldToken"] = oldToken;
		submitData["access_token"] = app.cookies.getCookiesToken();
		submitData["refresh_token"] = app.cookies.getCookiesRefreshToken();
		submitData["expires_in"] = app.cookies.getCookiesTokenExpires();
		$.ajax({
		    url : app.conf.url.uploadTokenCache,
		    method : 'POST',
			contentType: "application/json",
			data: JSON.stringify(submitData),
		    success: function(data){	},
		    error:function(xhr, textStatus, errorThrown){}
		});
	}

	//+---------------------------------------------------   
	//| 检查登录IP
	//+--------------------------------------------------- 
	app.checkLoginIp = function(username, callbackSuccess, callbackError){
		var submitData = {};
		submitData["userCode"] = username;
		//校验IP的时候保存登录详情，保存浏览器版本等
		var browserInfo = new Browser();
		submitData["deviceType"] = browserInfo.device;
		submitData["deviceDetail"] = "内核:" + browserInfo.engine + " 浏览器:" + browserInfo.browser + " 版本:" + browserInfo.version ;
		submitData["osDetail"] = browserInfo.os + ' ' + browserInfo.osVersion;
		$.ajax({
		    url : app.conf.url.checkLoginIp,
		    method : 'POST',
			contentType: "application/json",
		    data: JSON.stringify(submitData),
		    success: function(data){
	    		if(app.message.code.success == data.RetCode){
	    			if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
		   		}else{
		   			if(callbackError != undefined && callbackError != null) callbackError(data.RetMsg);
		   		}
			},
			error:function(xhr, textStatus, errorThrown){
		    	if(callbackError != undefined && callbackError != null) {
		    		var message = "校验IP失败！";
		    		if(xhr.responseJSON != null && xhr.responseJSON.error_description != null && xhr.responseJSON.error_description != "Bad credentials")
		    			message = xhr.responseJSON.error_description;
		    		callbackError(message);
		    	}
				console.error("校验IP失败:" + message);
			}
		});
	}

	//+---------------------------------------------------   
	//| 获取短信验证码(需要校验账号绑定的手机号码是否正确)
	//+--------------------------------------------------- 
	app.getSmsCode = function(userCode, phone, callbackSuccess, callbackError){
		var submitData = {}, url = "";
		if(userCode == ''){
			submitData["phone"] = phone;
			url = app.conf.url.getSmsCodeByPhone;
		}else{
			submitData["userCode"] = userCode;
			submitData["phone"] = phone;
			url = app.conf.url.getSmsCode;
		}
		$.ajax({
		    url : url,
		    method : 'POST',
			contentType: "application/json",
		    data: JSON.stringify(submitData),
		    success: function(data){
	    		if(app.message.code.success == data.RetCode){
	    			if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
		   		}else{
		   			if(callbackError != undefined && callbackError != null) callbackError(data.RetMsg);
		   		}
			},
			error:function(xhr, textStatus, errorThrown){
			    	if(callbackError != undefined && callbackError != null) {
			    		callbackError("获取短信验证码失败！");
			    	}
	    	   	}
		});
	}

	//+---------------------------------------------------   
	//| 校验短信验证码
	//+--------------------------------------------------- 
	app.checkSmsVerifyCode = function(phone, code, callbackSuccess, callbackError){
		top.app.message.loading();
		var submitData = {};
		submitData["phone"] = phone;
		submitData["smsCode"] = code;
		$.ajax({
		    url : app.conf.url.checkSmsVerifyCode,
		    method : 'POST',
			contentType: "application/json",
		    data: JSON.stringify(submitData),
		    success: function(data){
				top.app.message.loadingClose();
				if(app.message.code.success == data.RetCode){
			    	if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
		   		}else{
		   			if(callbackError != undefined && callbackError != null) callbackError(data.RetMsg);
		   		}
			},
			error:function(xhr, textStatus, errorThrown){
				top.app.message.loadingClose();
	    		if(callbackError != undefined && callbackError != null) {
	    			callbackError("校验短信验证码失败！");
	    		}
	   		}
		});
	}

	//+---------------------------------------------------   
	//| 根据手机号码重置密码
	//+--------------------------------------------------- 
	app.resetPasswd = function(userCode, phone, password, callbackSuccess, callbackError){
		top.app.message.loading();
		var submitData = {};
		submitData["userCode"] = userCode;
		submitData["phone"] = phone;
		submitData["password"] = password;
		$.ajax({
		    url : app.conf.url.resetPasswd,
		    method : 'POST',
			contentType: "application/json",
		    data: JSON.stringify(submitData),
		    success: function(data){
				top.app.message.loadingClose();
	    		if(app.message.code.success == data.RetCode){
	    			if(callbackSuccess != undefined && callbackSuccess != null) callbackSuccess();
		   		}else{
		   			if(callbackError != undefined && callbackError != null) callbackError(data.RetMsg);
		   		}
			},
			error:function(xhr, textStatus, errorThrown){
				top.app.message.loadingClose();
	    		if(callbackError != undefined && callbackError != null) {
	    			callbackError("重置密码失败！");
	    		}
			}
		});
	}
	
	//+---------------------------------------------------   
	//| 获取登录用户信息
	//+--------------------------------------------------- 
	app.getUserInfo = function(){
		$.ajax({
		    url: app.conf.url.api.system.user.getUserInfo,
		    method: 'GET',
		    async: false,
		   	timeout:5000,
		    data: {
	    		access_token: app.cookies.getCookiesToken()
		    },
		    success: function(data){
		    	//写入用户信息
		    	app.info.userInfo = data.UserInfo;
		    	app.info.userRole = data.UserRole;
		    	app.info.tenantsInfo = data.TenantsInfo;
		    	app.info.organizerInfo = data.OrganizerInfo;
		    	app.info.rootOrganizerId = data.RootOrganizerId;
		    	app.info.topOrganizerId = data.TopOrganizerId;
		    	app.info.isOrganizerManager = data.isOrganizerManager;
		    	app.info.dataPermissionIdList = data.DataPermissionIdList;
		    	app.info.dataPermissionNameList = data.DataPermissionNameList;
		    	app.info.dataPermissionId = data.DataPermissionId;
		    	app.info.dataPermissionName = data.DataPermissionName;
		    	//转换租户扩展信息
		    	if($.utils.isEmpty(app.info.tenantsInfo.extendData)) app.info.tenantsInfo.extendData = [];
		    	else app.info.tenantsInfo.extendData =eval("(" + app.info.tenantsInfo.extendData + ")");
		    	if($.utils.isEmpty(top.app.info.tenantsInfo.extendData.loginPage)) {
		    		var loginUrl = $.cookies.get("loginUrl");
		    		if(loginUrl != null && loginUrl != undefined && loginUrl != '')
		    			top.app.info.tenantsInfo.extendData.loginPage = loginUrl;
		    		else
		    			top.app.info.tenantsInfo.extendData.loginPage = app.info.rootPath + "/login.html";
		    	}
		    	else 
		    		top.app.info.tenantsInfo.extendData.loginPage = top.app.info.rootPath + top.app.info.tenantsInfo.extendData.loginPage;
		    	//显示页面信息
		    	index.showPageInfo();
			},
			error:function(xhr, textStatus, errorThrown){
				//获取用户信息错误，跳转到首页
				app.cookies.delCookiesToken();
				app.cookies.delCookiesRefreshToken();
				window.location.href = app.info.rootPath + "/login.html";
	   		}
		});
	};

	//+---------------------------------------------------   
	//| 记录打开权限模块的日志
	//+--------------------------------------------------- 
	app.logFuncIndex = function(url){
		$.ajax({
		    url: app.conf.url.apigateway + url,
		    method: 'GET',
		    data: {
	    		access_token: app.cookies.getCookiesToken()
		    }
		});
	};

	//+---------------------------------------------------   
	//| 通过字典类型值获取字典数据
	//+--------------------------------------------------- 
	app.getDictDataByDictTypeValue = function(dictTypeValue){
		var dictData = [];
		$.ajax({
			url: app.conf.url.api.system.dict.getDictDataByDictTypeValue,
		    method: 'GET',
		    async: false,
		   	timeout:5000,
		   	data:{
		    	access_token: app.cookies.getCookiesToken(),
		    	dictTypeValue: dictTypeValue
		   	},
		   	success: function(data){
		   		if(app.message.code.success == data.RetCode){
		   			dictData = data.RetData;
		   		}
		   	}
		});
		if(dictData == undefined) dictData = [];
		return dictData;
	}

	//+---------------------------------------------------   
	//| 获取字典名称
	//+--------------------------------------------------- 
	app.getDictName = function(dictId, dict){
		if(dictId == null || dictId.toString() == "" || dict == null || dict == ""){
			return "";
		}
		var dictName = "";
		try{
			var data = null;
			if(typeof(dict) == "object"){
				data = dict;
			}else{
				data = eval("(" + dict + ")");
			}
			$.each(data, function(i, dict){
				if(dict.ID == dictId){
					dictName = dict.NAME;
					return false;
				}
			});
		}catch(e){}
		return dictName;
	}

	//+---------------------------------------------------   
	//| 通过权限标识获取用户权限，多个标识之间用逗号隔开
	//+--------------------------------------------------- 
	app.getUserRights = function(funcPid){
		var rights = {};
		$.ajax({
			url: app.conf.url.api.system.user.getUserRights,
		   	async: false,
		   	timeout:5000,
		   	data:{
		    	access_token: app.cookies.getCookiesToken(),
		    	funcPid: funcPid
		   	},
		   	success: function(data){
		   		if(app.message.code.success == data.RetCode){
		   			rights = data.RetData;
		   		}else{
		   			console.log(data.RetMsg);
		   		}
		   	}
		});
		return rights;
	}
	
	//+---------------------------------------------------   
	//| 是否存在该角色
	//+--------------------------------------------------- 
	app.hasRole = function(roleName){
	    if(top.app.info.userRole == null || top.app.info.userRole == undefined || top.app.info.userRole == '') return false;
	    if(Array.isArray(top.app.info.userRole)){
	        for(var i = 0; i < top.app.info.userRole.length; i++){
	            if(top.app.info.userRole[i] === roleName) return true;
	        }
	        return false;
	    }else{
	        if(top.app.info.userRole === roleName) return true;
	        else return false;
	    }
	};

	//+---------------------------------------------------   
	//| 设置租户列表下拉框
	//+--------------------------------------------------- 
	app.getTenantsListBox = function(tenantsBox, callback, addAll){
		if(tenantsBox == null || tenantsBox == undefined) return;
		$.ajax({
			url: app.conf.url.api.system.tenants.getAllTenantsList,
		    method: 'GET',
		   	data:{
		   		access_token: app.cookies.getCookiesToken()
		   	},
			success: function(data){
				if(top.app.message.code.success == data.RetCode){
					tenantsBox.empty();
					var html = "";
					if(addAll != null && addAll != undefined && addAll == true) {
						html += "<option value=''>全部</option>";
					}
					var length = data.RetData.length;
					for (var i = 0; i < length; i++) {
						html += "<option value='" + data.RetData[i].tenantsId + "'>" + data.RetData[i].tenantsName + "</option>";
					}
					tenantsBox.append(html);
					//设置默认值
					tenantsBox.val(app.info.tenantsInfo.tenantsName);
					if(callback != null && callback != undefined) callback();
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        }
		});
	}

	//+---------------------------------------------------   
	//| 获取区域信息
	//+--------------------------------------------------- 
	app.getDistrictByParentId = function(parentId, callback){
		if(parentId == null || parentId == undefined) return;
		$.ajax({
			url: app.conf.url.api.system.district.getListByParentId,
		    method: 'GET',
		   	data:{
		    	access_token: app.cookies.getCookiesToken(),
		    	parentId: parentId
		   	},
			success: function(data){
				if(top.app.message.code.success == data.RetCode){
					if(callback != null && callback != undefined) callback(data.RetData);
		   		}else{
					if(callback != null && callback != undefined) callback(null);
		   		}
	        }
		});
	}

	//+---------------------------------------------------   
	//| 初始化区域信息
	//+--------------------------------------------------- 
	app.initDistrict = function(objProvince, objCity, objDistrict, initData, loadEmpty){
		if(objProvince == null || objCity == undefined) return;
		if(objCity == null || objCity == undefined) return;
		if(objDistrict == null || objDistrict == undefined) return;
		var districtId = null;
		if(initData != null && initData != undefined && initData != '')
			districtId = initData.split(',');

		top.app.getDistrictByParentId(0, function(data){
			top.app.addComboBoxOption(objProvince, data);
			if(districtId != null && districtId[0] != null) objProvince.val(districtId[0]);
			objProvince.selectpicker('refresh');
			//加载下级节点
			top.app.getDistrictByParentId(objProvince.val(), function(data){
				if(loadEmpty)
					top.app.addComboBoxOption(objCity, data, true, ' ');
				else 
					top.app.addComboBoxOption(objCity, data);
				if(districtId != null && districtId[1] != null) objCity.val(districtId[1]);
				objCity.selectpicker('refresh');
				//加载下级节点
				top.app.getDistrictByParentId(objCity.val(), function(data){
					if(loadEmpty)
						top.app.addComboBoxOption(objDistrict, data, true, ' ');
					else
						top.app.addComboBoxOption(objDistrict, data);
					if(districtId != null && districtId[2] != null) objDistrict.val(districtId[2]);
					objDistrict.selectpicker('refresh');
				});
			});
		});
		//绑定下拉框变更事件
		objProvince.on('changed.bs.select', function (e) {
			top.app.getDistrictByParentId(objProvince.val(), function(data){
				if(loadEmpty)
					top.app.addComboBoxOption(objCity, data, true, ' ');
				else 
					top.app.addComboBoxOption(objCity, data);
				objCity.selectpicker('refresh');
				//加载下级节点
				if(objCity.val() == '') {
					objDistrict.empty();
					objDistrict.selectpicker('refresh');
				}else{
					top.app.getDistrictByParentId(objCity.val(), function(data){
						if(loadEmpty)
							top.app.addComboBoxOption(objDistrict, data, true, ' ');
						else
							top.app.addComboBoxOption(objDistrict, data);
						objDistrict.selectpicker('refresh');
					});
				}
			});
		});
		//绑定下拉框变更事件
		objCity.on('changed.bs.select', function (e) {
			if(objCity.val() == ''){
				objDistrict.empty();
				objDistrict.selectpicker('refresh');
			}else{
				top.app.getDistrictByParentId(objCity.val(), function(data){
					if(loadEmpty)
						top.app.addComboBoxOption(objDistrict, data, true, ' ');
					else
						top.app.addComboBoxOption(objDistrict, data);
					objDistrict.selectpicker('refresh');
				});
			}
		});
	}

	//+---------------------------------------------------   
	//| 将字典值写入下拉框
	//+---------------------------------------------------
	app.addComboBoxOption = function(htmlObj, dict, addDefault, defalutName){
		if(htmlObj == null || htmlObj == undefined || dict == null || dict == undefined || dict.length == 0) return;
		if(addDefault == null || addDefault == undefined) addDefault = false;
		htmlObj.empty();
		var html = "";
		if(addDefault) {
			if(defalutName == null || defalutName == undefined || defalutName =="")
				html = "<option value=''>全部</option>";
			else
				html = "<option value=''>" + defalutName + "</option>";
		}
		var length = dict.length;
		for (var i = 0; i < length; i++) {
			html += "<option value='" + dict[i].ID + "'>" + dict[i].NAME + "</option>";
		}
		htmlObj.append(html);
	}

	//+---------------------------------------------------   
	//| 将字典值写入单选框
	//+---------------------------------------------------
	app.addRadioButton = function(htmlObj, dict, name, checkDefVal){
		if(htmlObj == null || htmlObj == undefined || dict == null || dict == undefined || dict.length == 0) return;
		htmlObj.empty();
		var html = "";
		var length = dict.length;
		for (var i = 0; i < length; i++) {
			var check = ""
			if(!$.utils.isNull(checkDefVal) && checkDefVal == dict[i].ID) check = "checked";
			html += '<label class="checkbox-inline">' +
				      	'<input type="radio" name="' + name + '" value="' + dict[i].ID + '" ' + check + '> ' + dict[i].NAME +
				    '</label>';
		}
		htmlObj.append(html);
	}

	//+---------------------------------------------------   
	//| 将字典值写入多选框
	//+---------------------------------------------------
	app.addCheckBoxButton = function(htmlObj, dict, name, checkList){
		if(htmlObj == null || htmlObj == undefined || dict == null || dict == undefined || dict.length == 0) return;
		htmlObj.empty();
		var html = "";
		var length = dict.length;
		var arrayCheck = [];
		if(checkList == null || checkList == undefined){
			for (var i = 0; i < length; i++) {
				arrayCheck[i] = '0';
			}
		}else{
			arrayCheck = checkList.split(',');
		}
		for (var i = 0; i < length; i++) {
			var check = "";
			if(arrayCheck[i] == '1') check = 'checked';
			html += '<label style="margin-right:20px;margin-bottom:0px;font-weight: normal;">' +
				      	'<input type="checkbox" id="' + name + dict[i].ID + '" value="" ' + check + '> ' + dict[i].NAME +
				    '</label>';
		}
		htmlObj.append(html);
	}

	//+---------------------------------------------------   
	//| 获取多选框字典值
	//+---------------------------------------------------
	app.getCheckBoxButton = function(htmlObj, dict, name){
		if(htmlObj == null || htmlObj == undefined || dict == null || dict == undefined || dict.length == 0) return;
		var retVal = "";
		$.each(htmlObj.find("label").find("input"), function(i, item){
			retVal += ($(item).prop('checked') ? '1' : '0') + ',';
		});
		if(retVal != "") retVal = retVal.substring(0, retVal.length - 1);
		return retVal;
	}

	//+---------------------------------------------------   
	//| 获取多选框字典值
	//+---------------------------------------------------
	app.setCheckBoxButton = function(htmlObj, dict, name, stat){
		if(htmlObj == null || htmlObj == undefined || dict == null || dict == undefined || dict.length == 0) return;
		$.each(htmlObj.find("label").find("input"), function(i, item){
			$(item).prop("checked", stat);
		});
	}

	//+---------------------------------------------------   
	//| 上传文件到资源服务器
	//+--------------------------------------------------- 
	app.uploadFile = function(fileObj, callback, modifyName){
		if(fileObj == null || fileObj == undefined) return;
		if(fileObj.size / 1024 / 1024 > 50){
			top.app.message.alert("请选择50MB以下的文件进行上传！");
			return;
		}
		top.app.message.loading();
		var formData = new FormData();
		formData.append("file",	fileObj);
		if(modifyName == null || modifyName == undefined || modifyName == '')
			formData.append("modifyName", "");
		else formData.append("modifyName", modifyName);
		$.ajax({  
			url: top.app.conf.url.res.uploadFile,
	        type: 'POST',  
	        data: formData,  
	        // 告诉jQuery不要去处理发送的数据
	        processData : false, 
	        // 告诉jQuery不要去设置Content-Type请求头
	        contentType : false,
	        success : function(data) { 
				top.app.message.loadingClose();
	        		if(top.app.message.code.success == data.RetCode){
					if(callback != null && callback != undefined) callback(data.RetData);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        },  
	        error : function(responseStr) { 
	   			top.app.message.error("上传文件失败，请稍后重试！");
	        }  
	    }); 
	}

	//+---------------------------------------------------   
	//| 上传多个文件到资源服务器
	//+--------------------------------------------------- 
	app.uploadMultiFile = function(fileObj, callback, modifyName){
		if(fileObj == null || fileObj == undefined) return;
		var size = 0;
		for(var i = 0; i < fileObj.length; i++){
			size += fileObj[i].size;
		}
		if(size / 1024 / 1024 > 50){
			top.app.message.alert("总文件数不能大于50M！");
			return;
		}
		top.app.message.loading();
		var formData = new FormData();
		for(var i = 0; i < fileObj.length; i++){
			formData.append("file",	fileObj[i]);
		}
		if(modifyName == null || modifyName == undefined || modifyName == '')
			formData.append("modifyName", "");
		else formData.append("modifyName", modifyName);
		$.ajax({  
			url: top.app.conf.url.res.uploadMultiFile,
	        type: 'POST',  
	        data: formData,  
	        // 告诉jQuery不要去处理发送的数据
	        processData : false, 
	        // 告诉jQuery不要去设置Content-Type请求头
	        contentType : false,
	        success : function(data) { 
				top.app.message.loadingClose();
				if(top.app.message.code.success == data.RetCode){
					if(callback != null && callback != undefined) callback(data.RetData, size, fileObj.length);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        },  
	        error : function(responseStr) { 
	   			top.app.message.error("上传文件失败，请稍后重试！");
	        }  
	    }); 
	}

	//+---------------------------------------------------   
	//| 上传图片到资源服务器
	//+--------------------------------------------------- 
	app.uploadImage = function(imageObj, callback){
		if(imageObj == null || imageObj == undefined) return;
		if(imageObj.size / 1024 / 1024 > 2){
			top.app.message.alert("请选择2MB以下的文件进行上传！");
			return;
		}
		top.app.message.loading();
		var formData = new FormData();
		formData.append("file",	imageObj);
		$.ajax({  
			url: top.app.conf.url.res.uploadImage,
	        type: 'POST',  
	        data: formData,  
	        // 告诉jQuery不要去处理发送的数据
	        processData : false, 
	        // 告诉jQuery不要去设置Content-Type请求头
	        contentType : false,
	        success : function(data) { 
				top.app.message.loadingClose();
	        		if(top.app.message.code.success == data.RetCode){
					if(callback != null && callback != undefined) callback(data.RetData);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        },  
	        error : function(responseStr) { 
	   			top.app.message.error("上传文件失败，请稍后重试！");
	        }  
	    }); 
	}

	//+---------------------------------------------------   
	//| 上传多个图片到资源服务器
	//+--------------------------------------------------- 
	app.uploadMultiImage = function(imageObj, callback){
		if(imageObj == null || imageObj == undefined) return;
		var size = 0;
		for(var i = 0; i < imageObj.length; i++){
			size += imageObj[i].size;
		}
		if(size / 1024 / 1024 > 10){
			top.app.message.alert("总文件数不能大于10M！");
			return;
		}
		top.app.message.loading();
		var formData = new FormData();
		for(var i = 0; i < imageObj.length; i++){
			formData.append("file",	imageObj[i]);
		}
		$.ajax({  
			url: top.app.conf.url.res.uploadMultiImage,
	        type: 'POST',  
	        data: formData,  
	        // 告诉jQuery不要去处理发送的数据
	        processData : false, 
	        // 告诉jQuery不要去设置Content-Type请求头
	        contentType : false,
	        success : function(data) { 
				top.app.message.loadingClose();
	        		if(top.app.message.code.success == data.RetCode){
					if(callback != null && callback != undefined) callback(data.RetData);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        },  
	        error : function(responseStr) { 
	   			top.app.message.error("上传文件失败，请稍后重试！");
	        }  
	    }); 
	}

	//+---------------------------------------------------   
	//| 获取工作流启动表单
	//+--------------------------------------------------- 
	app.getWorkflowStartFrom = function(key, callback){
		$.ajax({
		    url: top.app.conf.url.apigateway + "/api/workflow/getWorkflowStartFrom",
		    method: 'GET',
		    data: {
		    	access_token: top.app.cookies.getCookiesToken(),
		    	modelKey: key
		    },
		    success : function(data) { 
	    		if(top.app.message.code.success == data.RetCode){
	    			if(callback != null && callback != undefined) callback(data);
		   		}else{
		   			top.app.message.error(data.RetMsg);
		   		}
	        }
		});
	}
	
})();


//+---------------------------------------------------   
//| 封装app cookies函数
//+--------------------------------------------------- 
(function() {
	app.cookies = {};
	//获取保存在cookies中的token
	app.cookies.getCookiesToken = function(){
		return $.cookies.get("webCookiesToken");
	};
	
	//设置保存在cookies中的token(单位秒)
	app.cookies.setCookiesToken = function(token, time){
		$.cookies.set("webCookiesToken", token, {expires: time});
	};
	
	//删除保存在cookies中的token
	app.cookies.delCookiesToken = function(){
		$.cookies.del("webCookiesToken");
	};
	
	//获取保存在cookies中的token
	app.cookies.getCookiesRefreshToken = function(){
		return $.cookies.get("webCookiesRefreshToken");
	};
	
	//设置保存在cookies中的token(单位秒)
	app.cookies.setCookiesRefreshToken = function(refreshToken, time){
		$.cookies.set("webCookiesRefreshToken", refreshToken, {expires: time * 10});
	};
	
	//删除保存在cookies中的token
	app.cookies.delCookiesRefreshToken = function(){
		$.cookies.del("webCookiesRefreshToken");
	};

	//获取保存在cookies中的token
	app.cookies.getCookiesTokenExpires = function(){
		return $.cookies.get("webCookiesTokenExpires");
	};
	
	//设置保存在cookies中的token(单位秒)
	app.cookies.setCookiesTokenExpires = function(expires, time){
		$.cookies.set("webCookiesTokenExpires", expires + "", {expires: time});
	};
})();

//+---------------------------------------------------   
//| 封装app提示消息函数
//+--------------------------------------------------- 
(function() {
	app.message = {};
	app.message.code = {};
	app.message.code.success = "000000";
	
	//+---------------------------------------------------   
	//| 消息提示框
	//+--------------------------------------------------- 
	app.message.info = function(title, message){
		sweetAlert(title, message, "");
	};
	
	//+---------------------------------------------------   
	//| 消息提示框
	//+--------------------------------------------------- 
	app.message.alert = function(message){
		sweetAlert("", message, "info");
	};
	
	//+---------------------------------------------------   
	//| 错误信息框
	//+--------------------------------------------------- 
	app.message.error = function(message){
		sweetAlert("", message, "error");
	};
	
	//+---------------------------------------------------   
	//| 消息确认框
	//+--------------------------------------------------- 
	app.message.confirm = function(message, callbackFun, callbackCancel){
		swal({
			  title: "",
			  text: message,
			  type: "warning",
			  showCancelButton: true,
			  confirmButtonColor: "#DD6B55",
			  confirmButtonText: "确 定",
			  cancelButtonText: "取 消",
			  closeOnConfirm: false,
			  closeOnCancel: false
			},
			function(isConfirm){
				if (isConfirm) { 
					if(callbackFun != undefined && callbackFun != null) callbackFun();
					app.message.close();
				} else { 
					if(callbackCancel != undefined && callbackCancel != null) callbackCancel();
					app.message.close();
				} 
			}
		);
	};
	
	//+---------------------------------------------------   
	//| 消息提示框,点击确定触发事件
	//+--------------------------------------------------- 
	app.message.alertEvent = function(message, callbackFun){
		swal({
			  title: "",
			  text: message,
			  type: "info",
			  allowEscapeKey: false,
			  allowOutsideClick: false,
			  showCancelButton: false,
			  confirmButtonText: "确 定",
			  closeOnConfirm: false
			},
			function(){
				if(callbackFun != undefined && callbackFun != null) callbackFun();
			}
		);
	};
	
	//+---------------------------------------------------   
	//| 选择消息框
	//+--------------------------------------------------- 
	app.message.chooseEvent = function(title, text, btn1, btn2, callback1, callback2){
		swal({ 
			  title: title, 
			  text: text, 
			  type: "info",
			  showCancelButton: true, 
			  confirmButtonColor: "#c8c8c8",
			  confirmButtonText: btn2, 
			  cancelButtonText: btn1,
			  closeOnConfirm: true, 
			  closeOnCancel: true	
			},
			function(isConfirm){ 
			  if (isConfirm) { 
				  if(callback2 != undefined && callback2 != null) callback2();
			  } else { 
				  if(callback1 != undefined && callback1 != null) callback1();
			  } 
		});
	};
	
	//+---------------------------------------------------   
	//| 关闭消息框
	//+--------------------------------------------------- 
	app.message.close = function(){
		swal.close();
	}
	
	//+---------------------------------------------------   
	//| 打开加载层
	//+--------------------------------------------------- 
	app.message.loading = function(){
		if (!!window.ActiveXObject || "ActiveXObject" in window) { 
			$.LoadingOverlay("show",{
			    image       : "",
			    text        : ""
			});
		}else{ 
			$.LoadingOverlay("show",{
			    image       : "",
			    fontawesome : "fa fa-spinner fa-spin"
			});
		}  
		//防止没关闭，10秒后默认关闭
		setTimeout("$.LoadingOverlay('hide')", 12000);
	}
	
	//+---------------------------------------------------   
	//| 关闭加载层
	//+--------------------------------------------------- 
	app.message.loadingClose = function(time){
		//判断是否需要延迟执行
		if(time != null && time != undefined && !isNaN(time)){
			setTimeout("$.LoadingOverlay('hide')", time);
		}else
			$.LoadingOverlay("hide");
	}
	
	//+---------------------------------------------------   
	//| 通知事件，使用toastr
	//+--------------------------------------------------- 
	app.message.notice = function(message){
		toastr["info"](message);
	};
	
	//+---------------------------------------------------   
	//| 通知事件，使用toastr
	//+--------------------------------------------------- 
	app.message.noticeError = function(message){
		toastr["error"](message);
	};
})();



//+---------------------------------------------------   
//| 封装app弹层
//+--------------------------------------------------- 
(function() {
	app.layer = {};
	//导出项的选择参数
	app.layer.exportParams = [];
	app.layer.retParams = [];
	//弹层点击结果，若为true，则说明点击了确认按钮
	app.layer.editLayerRet = false;
	
	//+---------------------------------------------------   
	//| 打开导出层（导出Excel,word等）
	//+--------------------------------------------------- 
	app.layer.exportLayer = function(callback){
		layer.open({
		  type: 2,
		  title: "导出表单内容",
		  area: ['500px', '250px'],
		  resize: false,
		  content: 'layer-export.html',
		  end: function(){
			  if(callback != null && callback != undefined && typeof callback === 'function'){
				  if(app.layer.exportParams != null && app.layer.exportParams.length == 3 && app.layer.exportParams[0] == "1"){
					  callback(1, app.layer.exportParams[1], app.layer.exportParams[2]);
				  }else{
					  callback(0, "", "");
				  }
			  }
			  app.layer.exportParams = [];
		  }
		});
	}
	
	//+---------------------------------------------------   
	//| 打开新增或修改层
	//+--------------------------------------------------- 
	app.layer.editLayer = function(title, area, url, params, callback){
		layer.open({
		  type: 2,
		  title: title,
		  area: area,
		  resize: false,
		  content: app.info.rootPath + url,
		  success: function(layero, index){
			  //获取弹出层对象，并赋值
			  var iframeWin = window[layero.find('iframe')[0]['name']];
			  iframeWin.receiveParams(params);
		  },
		  end: function(){
			  if(callback != null && callback != undefined && typeof callback === 'function'){
				  if(app.layer.editLayerRet){
					  //生成回调函数，通知刷新内容
					  callback(app.layer.retParams);
				  }
				  app.layer.editLayerRet = false;
			  }
			  app.layer.retParams = [];
		  }
		});
	}
	
	//+---------------------------------------------------   
	//| 带最大最小化按钮的弹层
	//+--------------------------------------------------- 
	app.layer.editLayerWidthMax = function(title, area, url, params, callback){
		layer.open({
		  type: 2,
		  title: title,
		  area: area,
		  resize: false,
		  maxmin: true, //开启最大化最小化按钮
		  content: app.info.rootPath + url,
		  success: function(layero, index){
			  //获取弹出层对象，并赋值
			  var iframeWin = window[layero.find('iframe')[0]['name']];
			  iframeWin.receiveParams(params);
		  },
		  end: function(){
			  if(callback != null && callback != undefined && typeof callback === 'function'){
				  if(app.layer.editLayerRet){
					  //生成回调函数，通知刷新内容
					  callback(app.layer.retParams);
				  }
				  app.layer.editLayerRet = false;
			  }
			  app.layer.retParams = [];
		  }
		});
	}
	
	//+---------------------------------------------------   
	//| 独立链接的弹层
	//+--------------------------------------------------- 
	app.layer.openWindows = function(title, area, url){
		layer.open({
		  type: 2,
		  title: title,
		  area: area,
		  resize: false,
		  maxmin: true, //开启最大化最小化按钮
		  content: app.info.rootPath + url
		});
	}
})();
