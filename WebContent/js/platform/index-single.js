/*!
 * 作者：zzd
 * 时间：2017-04-19
 * 描述：首页框架js文件
 */
//执行加载内容
$(document).ready(function(){
	var startTime = new Date().getTime(); // 开始时间
	//启动遮罩层
	top.app.message.loading();
	//初始化界面元素
	index.initView();
	//获取用户信息
	top.app.getUserInfo();
	//获取用户权限菜单
	index.getUserFunc();
	index.refreshTokenOnTime();
	//获取任务数量
	index.getTaskCount();
	//关闭遮罩层
	var endTime = new Date().getTime();
	if(endTime - startTime < 1500)
		top.app.message.loadingClose(1500);
	else 
		top.app.message.loadingClose();
});

var index = index || {};
(function() {

	//+---------------------------------------------------   
	//| 初始化界面视图
	//+--------------------------------------------------- 
	index.initView = function(){
		//初始化侧边菜单栏
		index.initLeftMenu();
		//初始化菜单项
		index.initLeftMenuItems();
		//初始化tab菜单栏
		index.initTabMenu();
		//右侧栏
		index.initRightContent();
	}
	
	//+---------------------------------------------------   
	//| 初始化侧边菜单栏
	//+--------------------------------------------------- 
	index.initLeftMenu = function(){
	    //菜单栏相关事件
	    $('.nav-close').click(index.navToggle);
	    $('.sidebar-collapse').slimScroll({
	        height: '100%',
	        railOpacity: 0.9,
	        alwaysVisible: false
	    });
	    $('#side-menu>li').click(function () {
	        if ($('body').hasClass('mini-navbar')) {
	        	index.navToggle();
	        }
	    });
	    $('#side-menu>li li a').click(function () {
	        if ($(window).width() < 769) {
	        	index.navToggle();
	        }
	    });
	    // 菜单切换(左侧菜单缩小与打开)
	    $('.navbar-minimalize').click(function () {
	        $("body").toggleClass("mini-navbar");
	        index.smoothlyMenu();
	    });
	}
	
	//+---------------------------------------------------   
	//| 初始化菜单项
	//+---------------------------------------------------
	index.initLeftMenuItems = function(){
	    // MetsiMenu
	    $('#side-menu').metisMenu();
	    //通过遍历给菜单项加上data-index属性
	    $(".index-menu-item").each(function (index) {
	        if (!$(this).attr('data-index')) {
	            $(this).attr('data-index', index);
	        }
	    });
	    $('.index-menu-item').on('click', index.leftMenuItemOnClick);
	}

	//+---------------------------------------------------   
	//| 初始化tab菜单栏
	//+--------------------------------------------------- 
	index.initTabMenu = function(){
		//关闭tab事件
	    $('.index-tab-menu').on('click', "i[class='fa fa-times-circle']", index.closeTab);
	    //刷新tab按钮(改为双击刷新)
	    $('.index-tab-menu').on('click', "i[class='fa fa-refresh']", index.refreshTab);
	    //点击事件
	    $('.index-tab-menu').on('click', '.index-tab-menu-item', index.activeTab);
	    //双击
	    $('.index-tab-menu').on('dblclick', '.index-tab-menu-item', index.refreshTab);
	    //tab操作项
	    $('.index-tab-close-other').on('click', index.closeOtherTabs);
	    $('.index-tab-show-active').on('click', index.showActiveTab);
	    // 左移按扭
	    $('.index-tab-left').on('click', index.scrollTabLeft);
	    // 右移按扭
	    $('.index-tab-right').on('click', index.scrollTabRight);
	    // 关闭全部
	    $('.index-tab-close-all').on('click', function () {
	        $('.page-tabs-content').children("[data-id]").not(":first").each(function () {
	            $('.index-iframe[data-id="' + $(this).data('id') + '"]').remove();
	            $(this).remove();
	        });
	        $('.page-tabs-content').children("[data-id]:first").each(function () {
	            $('.index-iframe[data-id="' + $(this).data('id') + '"]').show();
	            $(this).addClass("active");
	        });
	        $('.page-tabs-content').css("margin-left", "0");
	    });
	}

	index.initRightContent = function(){
	    //ios浏览器兼容性处理
	    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
	        $('#content-main').css('overflow-y', 'auto');
	    }
	    
	    //设置侧边栏高度
	    index.fixHight();

	    $(window).bind("load resize click scroll", function () {
	        if (!$("body").hasClass('body-small')) {
	        	index.fixHight();
	        }
	    });

	    //侧边栏滚动
	    $(window).scroll(function () {
	        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
	            $('#right-sidebar').addClass('sidebar-top');
	        } else {
	            $('#right-sidebar').removeClass('sidebar-top');
	        }
	    });
	}
	
	//+---------------------------------------------------   
	//| 修复侧边栏高度
	//+--------------------------------------------------- 
	index.fixHight = function(){
		var heightWithoutNavbar = $("body > #wrapper").height() - 61;
		$(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");
	}
	
	//+---------------------------------------------------   
	//| 左侧菜单栏点击事件
	//+--------------------------------------------------- 
	index.leftMenuItemOnClick = function() {
		//设置为激活状态
		$('.index-menu-item').each(function () {
			$(this).parent("li").removeClass("active");
        });
		$(this).parent("li").toggleClass("active");
		
	    // 获取标识数据
	    var dataUrl = $(this).attr('href'),
	        dataIndex = $(this).data('index'),
	        menuName = $.trim($(this).text()),
	        dataFlag = $(this).data('flag'), 
	        dataIsBlank = $(this).data('isblank'), 
	        flag = true;
	    //替换tabname
	    var tabname = $(this).data('tabname');
	    if(tabname != null && tabname != undefined && tabname != '') menuName = tabname;
	    if (dataUrl == undefined || $.trim(dataUrl).length == 0)return false;
	    
	    //判断是否空白页打开
	    if(dataIsBlank == 'Y'){
	    	window.open(dataUrl);
	    	return false;
	    }

	    // 选项卡菜单已存在
	    $('.index-tab-menu-item').each(function () {
	        if ($(this).data('id') == dataUrl) {
	            if (!$(this).hasClass('active')) {
	                $(this).addClass('active').siblings('.index-tab-menu-item').removeClass('active');
	                index.scrollToTab(this);
	                // 显示tab对应的内容区
	                $('.index-main-content .index-iframe').each(function () {
	                    if ($(this).data('id') == dataUrl) {
	                        $(this).show().siblings('.index-iframe').hide();
	                        return false;
	                    }
	                });
	            }
	            flag = false;
	            return false;
	        }
	    });

	    // 选项卡菜单不存在
	    if (flag) {
	        var str = '<a href="javascript:;" class="active index-tab-menu-item" data-id="' + dataUrl + '">' + menuName + ' <i class="fa fa-times-circle"></i><!--&nbsp;<i class="fa fa-refresh"></i>--></a>';
	        $('.index-tab-menu-item').removeClass('active');

	        // 添加选项卡对应的iframe
	        var str1 = '<iframe class="index-iframe" name="iframe' + dataIndex + '" width="100%" height="100%" src="' + dataUrl + '" frameborder="0" data-id="' + dataUrl + '" seamless></iframe>';
	        $('.index-main-content').find('iframe.index-iframe').hide().parents('.index-main-content').append(str1);

	        //显示loading提示
	        top.app.message.loading();
	        $('.index-main-content iframe:visible').load(function () {
	            //iframe加载完成后隐藏loading提示
	        	top.app.message.loadingClose();
	        });
	        // 添加选项卡
	        $('.index-tab-menu .page-tabs-content').append(str);
	        index.scrollToTab($('.index-tab-menu-item.active'));
	        //记录日志
	        app.logFuncIndex(dataFlag);
	    }
	    return false;
	}
	
	//+---------------------------------------------------   
	//| 关闭选项卡菜单
	//+--------------------------------------------------- 
	index.closeTab = function() {
	    var closeTabId = $(this).parents('.index-tab-menu-item').data('id');
	    var currentWidth = $(this).parents('.index-tab-menu-item').width();

	    // 当前元素处于活动状态
	    if ($(this).parents('.index-tab-menu-item').hasClass('active')) {

	        // 当前元素后面有同辈元素，使后面的一个元素处于活动状态
	        if ($(this).parents('.index-tab-menu-item').next('.index-tab-menu-item').size()) {

	            var activeId = $(this).parents('.index-tab-menu-item').next('.index-tab-menu-item:eq(0)').data('id');
	            $(this).parents('.index-tab-menu-item').next('.index-tab-menu-item:eq(0)').addClass('active');

	            $('.index-main-content .index-iframe').each(function () {
	                if ($(this).data('id') == activeId) {
	                    $(this).show().siblings('.index-iframe').hide();
	                    return false;
	                }
	            });

	            var marginLeftVal = parseInt($('.page-tabs-content').css('margin-left'));
	            if (marginLeftVal < 0) {
	                $('.page-tabs-content').animate({
	                    marginLeft: (marginLeftVal + currentWidth) + 'px'
	                }, "fast");
	            }

	            //  移除当前选项卡
	            $(this).parents('.index-tab-menu-item').remove();

	            // 移除tab对应的内容区
	            $('.index-main-content .index-iframe').each(function () {
	                if ($(this).data('id') == closeTabId) {
	                    $(this).remove();
	                    return false;
	                }
	            });
	        }

	        // 当前元素后面没有同辈元素，使当前元素的上一个元素处于活动状态
	        if ($(this).parents('.index-tab-menu-item').prev('.index-tab-menu-item').size()) {
	            var activeId = $(this).parents('.index-tab-menu-item').prev('.index-tab-menu-item:last').data('id');
	            $(this).parents('.index-tab-menu-item').prev('.index-tab-menu-item:last').addClass('active');
	            $('.index-main-content .index-iframe').each(function () {
	                if ($(this).data('id') == activeId) {
	                    $(this).show().siblings('.index-iframe').hide();
	                    return false;
	                }
	            });

	            //  移除当前选项卡
	            $(this).parents('.index-tab-menu-item').remove();

	            // 移除tab对应的内容区
	            $('.index-main-content .index-iframe').each(function () {
	                if ($(this).data('id') == closeTabId) {
	                    $(this).remove();
	                    return false;
	                }
	            });
	        }
	    }
	    // 当前元素不处于活动状态
	    else {
	        //  移除当前选项卡
	        $(this).parents('.index-tab-menu-item').remove();

	        // 移除相应tab对应的内容区
	        $('.index-main-content .index-iframe').each(function () {
	            if ($(this).data('id') == closeTabId) {
	                $(this).remove();
	                return false;
	            }
	        });
	        index.scrollToTab($('.index-tab-menu-item.active'));
	    }
	    return false;
	}

	//+---------------------------------------------------   
	//| 关闭其他选项卡
	//+--------------------------------------------------- 
	index.closeOtherTabs = function(){
	    $('.page-tabs-content').children("[data-id]").not(":first").not(".active").each(function () {
	        $('.index-iframe[data-id="' + $(this).data('id') + '"]').remove();
	        $(this).remove();
	    });
	    $('.page-tabs-content').css("margin-left", "0");
	}
	
	//+---------------------------------------------------   
	//| 滚动到已激活的选项卡
	//+--------------------------------------------------- 
	index.showActiveTab = function(){
	    index.scrollToTab($('.index-tab-menu-item.active'));
	}

	//+---------------------------------------------------   
	//| 点击选项卡菜单
	//+--------------------------------------------------- 
	index.activeTab = function() {
	    if (!$(this).hasClass('active')) {
	        var currentId = $(this).data('id');
	        // 显示tab对应的内容区
	        $('.index-main-content .index-iframe').each(function () {
	            if ($(this).data('id') == currentId) {
	                $(this).show().siblings('.index-iframe').hide();
	                return false;
	            }
	        });
	        $(this).addClass('active').siblings('.index-tab-menu-item').removeClass('active');
	        index.scrollToTab(this);
	    }
	    //循环查找左侧栏，并展开
	    var currentId = $(this).data('id');
	    $(".index-menu-item").each(function (index, element) {
		    	if(element.href == currentId){
		    	    //取消所有
		    		$('.index-menu-item').each(function () {
		    			$(this).parent("li").removeClass("active");
		            });
		    		$(this).parent("li").toggleClass("active");
		    		//判断当前节点所在的目录菜单是否有active,有则说明当前目录正在展开，否则需要展开目录，并关闭具有active的目录
		    		if(!$(this).parent("li").parent("ul").parent("li").hasClass('active')){
		    			//关闭正在展开的目录
		    			$(this).parent("li").parent("ul").parent("li").parent("ul").children("li").each(function () {
		    		    	if($(this).hasClass("active")){
		    		    		$(this).toggleClass("active").children("ul").collapse("toggle");
		    		    	}
		    		    });
		    			//打开当前目录
			    		$(this).parent("li").parent("ul").parent("li").toggleClass("active").children("ul").collapse("toggle");
		    		}
		    		
		    	}
	    });
	    
	}

	//+---------------------------------------------------   
	//| 刷新iframe
	//+--------------------------------------------------- 
	index.refreshTab = function() {
	    var target = $('.index-iframe[data-id="' + $(this).data('id') + '"]');
	    if(target==undefined){
	        target = $('.index-iframe[data-id="' + $(this).parent().data('id') + '"]');
	    }
	    var url = target.attr('src');
	    //显示loading提示
	    top.app.message.loading();
	    target.attr('src', url).load(function () {
	        //关闭loading提示
	    		top.app.message.loadingClose();
	    });
	}

	//+---------------------------------------------------   
	//| 计算元素集合的总宽度
	//+--------------------------------------------------- 
	index.calSumWidth = function(elements) {
	  var width = 0;
	  $(elements).each(function () {
	      width += $(this).outerWidth(true);
	  });
	  return width;
	}

	//+---------------------------------------------------   
	//| 滚动到指定选项卡
	//+--------------------------------------------------- 
	index.scrollToTab = function(element) {
	  var marginLeftVal = index.calSumWidth($(element).prevAll()), marginRightVal = index.calSumWidth($(element).nextAll());
	  // 可视区域非tab宽度
	  var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
	  //可视区域tab宽度
	  var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
	  //实际滚动宽度
	  var scrollVal = 0;
	  if ($(".page-tabs-content").outerWidth() < visibleWidth) {
	      scrollVal = 0;
	  } else if (marginRightVal <= (visibleWidth - $(element).outerWidth(true) - $(element).next().outerWidth(true))) {
	      if ((visibleWidth - $(element).next().outerWidth(true)) > marginRightVal) {
	          scrollVal = marginLeftVal;
	          var tabElement = element;
	          while ((scrollVal - $(tabElement).outerWidth()) > ($(".page-tabs-content").outerWidth() - visibleWidth)) {
	              scrollVal -= $(tabElement).prev().outerWidth();
	              tabElement = $(tabElement).prev();
	          }
	      }
	  } else if (marginLeftVal > (visibleWidth - $(element).outerWidth(true) - $(element).prev().outerWidth(true))) {
	      scrollVal = marginLeftVal - $(element).prev().outerWidth(true);
	  }
	  $('.page-tabs-content').animate({
	      marginLeft: 0 - scrollVal + 'px'
	  }, "fast");
	}

	//+---------------------------------------------------   
	//| 查看左侧隐藏的选项卡
	//+--------------------------------------------------- 
	index.scrollTabLeft = function() {
	  var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
	  // 可视区域非tab宽度
	  var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
	  //可视区域tab宽度
	  var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
	  //实际滚动宽度
	  var scrollVal = 0;
	  if ($(".page-tabs-content").width() < visibleWidth) {
	      return false;
	  } else {
	      var tabElement = $(".index-tab-menu-item:first");
	      var offsetVal = 0;
	      while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
	          offsetVal += $(tabElement).outerWidth(true);
	          tabElement = $(tabElement).next();
	      }
	      offsetVal = 0;
	      if (index.calSumWidth($(tabElement).prevAll()) > visibleWidth) {
	          while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
	              offsetVal += $(tabElement).outerWidth(true);
	              tabElement = $(tabElement).prev();
	          }
	          scrollVal = index.calSumWidth($(tabElement).prevAll());
	      }
	  }
	  $('.page-tabs-content').animate({
	      marginLeft: 0 - scrollVal + 'px'
	  }, "fast");
	}

	//+---------------------------------------------------   
	//| 查看右侧隐藏的选项卡
	//+--------------------------------------------------- 
	index.scrollTabRight = function() {
	  var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
	  // 可视区域非tab宽度
	  var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
	  //可视区域tab宽度
	  var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
	  //实际滚动宽度
	  var scrollVal = 0;
	  if ($(".page-tabs-content").width() < visibleWidth) {
	      return false;
	  } else {
	      var tabElement = $(".index-tab-menu-item:first");
	      var offsetVal = 0;
	      while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {//找到离当前tab最近的元素
	          offsetVal += $(tabElement).outerWidth(true);
	          tabElement = $(tabElement).next();
	      }
	      offsetVal = 0;
	      while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth) && tabElement.length > 0) {
	          offsetVal += $(tabElement).outerWidth(true);
	          tabElement = $(tabElement).next();
	      }
	      scrollVal = index.calSumWidth($(tabElement).prevAll());
	      if (scrollVal > 0) {
	          $('.page-tabs-content').animate({
	              marginLeft: 0 - scrollVal + 'px'
	          }, "fast");
	      }
	  }
	}

	//+---------------------------------------------------   
	//| Toggle
	//+--------------------------------------------------- 
	index.navToggle = function() {
	    $('.navbar-minimalize').trigger('click');
	}

	//+---------------------------------------------------   
	//| smoothlyMenu
	//+--------------------------------------------------- 
	index.smoothlyMenu = function() {
	    if (!$('body').hasClass('mini-navbar')) {
	        $('#side-menu').hide();
	        setTimeout(
	            function () {
	                $('#side-menu').fadeIn(500);
	            }, 100);
	    } else if ($('body').hasClass('fixed-sidebar')) {
	        $('#side-menu').hide();
	        setTimeout(
	            function () {
	                $('#side-menu').fadeIn(500);
	            }, 300);
	    } else {
	        $('#side-menu').removeAttr('style');
	    }
	}
	
	//+---------------------------------------------------   
	//| 初始化左侧菜单基础信息
	//+--------------------------------------------------- 
	index.initDefaultLeftMenu = function(){
		$("#side-menu").empty();
		var title = "<li style='height:60px;padding-left: 25px;line-height: 60px;' >" + 
	                	"<span class='nav-label' style='color: #f3f3f4;font-size:18px;'>通用信息管理平台</span>" + 
                     	"<span class='fa'></span>" + 
	                "</li>";
		$("#side-menu").append(title);
		var homePage = "<li>" + 
                        	"<a class='index-menu-item' href='home-page.html'>" + 
                            	"<i class='fa fa-home'></i>" + 
                            	"<span class='nav-label'> 首页</span>" +
                            "</a>" +
                       "</li>";
		$("#side-menu").append(homePage);
	};
	
	//+---------------------------------------------------   
	//| 获取登录用户权限
	//+--------------------------------------------------- 
	index.getUserFunc = function(){
		$.ajax({
		    url: app.conf.url.api.system.user.getUserFunc,
		    method: 'GET',
		    data: {
		    	access_token: app.cookies.getCookiesToken()
		    },success: function(data){
		    	if(app.message.code.success == data.RetCode){
		    		index.initDefaultLeftMenu();
		    		var fData = data.RetData;
		    		$(fData).each(function(idx,func){
		    			var icon = "fa fa-columns";
		    			if(func.funcIcon != "" && func.funcIcon != undefined) icon = func.funcIcon;
		    			var menu = "<li id='folder_" + func.funcId + "' name='folder_" + func.funcId + "'> " +
		    							"<a href='#'> " +
		    								"<i class='" + icon + "'></i> " +
		    								"<span class='nav-label'>" + func.funcName + "</span>" +
		    								"<span class='fa arrow'></span>" + 
		    							"</a>" +
		    						"</li>";
		    			$("#side-menu").append(menu);
		    			index.getUserFuncByFd(func.funcId, "folder_" + func.funcId);
		    		});
		    		//重新初始化菜单项
		    		index.initLeftMenuItems();
		    	}else{
		    		app.message.error(data.RetMsg);
		    	}
			}
		});
	};

	//+---------------------------------------------------   
	//| 获取子菜单
	//+--------------------------------------------------- 
	index.getUserFuncByFd = function(funcId, folderId){
		$.ajax({
		    url: app.conf.url.api.system.user.getUserFuncByFd + "/" + funcId,
		    method: 'GET',
		    async: false,
		   	timeout:5000,
		    data: {
		    	access_token: app.cookies.getCookiesToken()
		    },success: function(data){
		    	if(app.message.code.success == data.RetCode){
		    		var subMenu = "<ul class='nav nav-second-level'>";
		    		var fData = data.RetData;
		    		$(fData).each(function(idx,func){
		    			subMenu += "<li>" + 
		                                "<a class='index-menu-item' href='" + app.info.rootPath + func.funcLink + "?_pid=" + func.funcId + "' data-flag='" + func.funcFlag + "' data-isblank='" + func.isBlank + "'>" + func.funcName + "</a>" +		    							
		                           "</li>";
		    			if(func.funcName == '我的任务'){
		    				$('#titleMyTask').attr("href", app.info.rootPath + func.funcLink + "?_pid=" + func.funcId);
		    			}
		    		});
		    		subMenu += "</ul>"
		    		$("#" + folderId).append(subMenu);
		    	}else{
		    		app.message.error(data.RetMsg);
		    	}
			}
		});
	};

	//+---------------------------------------------------   
	//| 获取待办任务数
	//+--------------------------------------------------- 
	index.getTaskCount = function(){
		$.ajax({
		    url: app.conf.url.apigateway + "/api/system/user/getTaskCount",
		    method: 'GET',
		    data: {
		    	access_token: app.cookies.getCookiesToken()
		    },success: function(data){
		    	if(app.message.code.success == data.RetCode){
		    		$('#taskCount').html(data.RetData);
		    	}else{
		    		console.error("获取待办任务数失败:" + data.RetMsg);
		    	}
			}
		});
	};

	//+---------------------------------------------------   
	//| 显示页面信息
	//+--------------------------------------------------- 
	index.showPageInfo = function(){
		$("#spanUserName").text(app.info.userInfo.userName);
		$("#spanUserRole").text(app.info.userRole[0]);
	}
	
	//+---------------------------------------------------   
	//| 登出过程，删除后台session，刷新token，然后删除cookies里面的token，然后跳转登录页面
	//+--------------------------------------------------- 
	index.logout = function(){
		app.message.confirm("确定退出当前系统？", function(){
			app.cookies.delCookiesToken();
			app.cookies.delCookiesRefreshToken();
			window.location.href = top.app.info.tenantsInfo.extendData.loginPage;
		});
	}
	
	//+---------------------------------------------------   
	//| 每隔一段时间刷新一次token
	//+--------------------------------------------------- 
	index.refreshTokenOnTime = function(){
		$('#onTime').timer({
		    duration: '20m',
		    callback: function() {
		    	app.checkToken();
		    	//index.getTaskCount();
		    },
		    repeat: true //重复调用
		});
	}
})();


$(window).bind("load resize", function () {
    if ($(this).width() < 769) {
        $('body').addClass('mini-navbar');
        $('.navbar-static-side').fadeIn();
    }
});
