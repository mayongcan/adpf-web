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
	//index.getTaskCount();
	//关闭遮罩层
	var endTime = new Date().getTime();
	if(endTime - startTime < 1500)
		top.app.message.loadingClose(1500);
	else 
		top.app.message.loadingClose();
	//禁止浏览器返回按钮
	$.utils.stopBrowserGoBack();
});

var index = index || {};
(function() {
	
	//顶部菜单栏
	index.topMenuList = null;
	//左侧一级菜单栏
	index.leftMenuMainList = {};
	//左侧一级以下的菜单栏
	index.leftMenuSubList = {};
	index.currentFuncId = null;

	//+---------------------------------------------------   
	//| 显示页面信息
	//+--------------------------------------------------- 
	index.showPageInfo = function(){
		$('#spanNavLabel').text(app.info.tenantsInfo.extendData.showName);
		$('#spanCopyright').text(app.info.tenantsInfo.extendData.copyright);
		if(!$.utils.isEmpty(app.info.tenantsInfo.extendData.showName))
			$(document).attr("title", app.info.tenantsInfo.extendData.showName + " - 首页");
		else
			$(document).attr("title", "通用信息管理平台  - 首页");
		
		$("#spanUserName").text(app.info.userInfo.userName);
		$("#spanUserRole").text(app.info.userRole[0]);

		$('#lbUserCode').text(app.info.userInfo.userCode);
		$('#lbUserName').text(app.info.userInfo.userName);
		$('#lbUserRole').text(app.info.userRole[0]);
		$('#lbUserDataPermission').text(app.info.dataPermissionName);
		$('#lbUserOrganizer').text(app.info.organizerInfo.organizerName);
	}

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
	    $('#titleMyTask').on('click', index.leftMenuItemOnClick);
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
	    //$('.index-tab-show-active').on('click', index.showActiveTab);
	    // 左移按扭
	    $('.index-tab-left').on('click', index.scrollTabLeft);
	    // 右移按扭
	    $('.index-tab-right').on('click', index.scrollTabRight);
	    // 关闭全部
	    $('.index-tab-close-all').on('click', function () {
	        $('.page-tabs-content').children("[data-id]").each(function () {
	  	      	//判断没有子元素的，则不用关闭（没有li的关闭图标元素）
	  			if(this.children.length != 0){
	  		        $('.index-iframe[data-id="' + $(this).data('id') + '"]').remove();
	  		        $(this).remove();
	  			}
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

	    //绑定事件
	    $(window).bind("load resize click scroll", function () {
	        if (!$("body").hasClass('body-small')) {
	        		index.fixHight();
	        }
	    });
	    //窗口重载时，重新加载顶部菜单
	    $(window).bind("resize", function () {
	        if (!$("body").hasClass('body-small')) {
	        		index.fixHight();
	        }
	        index.loadTopMenu(false);
	    });
	    //显示侧边栏缩小
	    $(window).bind("load resize", function () {
	        if ($(this).width() < 769) {
	            $('body').addClass('mini-navbar');
	            $('.navbar-static-side').fadeIn();
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
		//判断是否打开了右侧的下拉菜单
		if($('#dropdownMenu').hasClass("open")){
			$('#dropdownMenu').toggleClass("open");	
		}
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
	        funcId = $(this).data('funcid'), 
	        flag = true;
	    //获取当前tab的funcId
	    index.currentFuncId = funcId;
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
                //****************** 特殊需求，点击左侧菜单栏后，刷新tab begin *************************//
        			var target = null;
        			$('.index-main-content .index-iframe').each(function () {
                    if ($(this).data('id') == dataUrl) {
                        target = $(this);
                        return false;
                    }
                });
	            if(target != null && target != undefined){
	            		//判断当前页是否进行了iframe的内置功能跳转（通过url和当前的src进行对比，如果不一样，则说明有跳转）
	            		if(target[0].contentWindow.location.href != target.attr('src')){
	            			//如果发生了跳转，则进行重新加载页面
	    		            top.app.message.loading();
				    	    target.attr('src', target.attr('src')).load(function () {
				    	        //关闭loading提示
				    	    		top.app.message.loadingClose();
				    	    });
	            		}
	            }
                //****************** 特殊需求，点击左侧菜单栏后，刷新tab end *************************//
	            flag = false;
	            return false;
	        }
	    });

	    // 选项卡菜单不存在
	    if (flag) {
	        var str = '<a href="javascript:;" class="active index-tab-menu-item" data-id="' + dataUrl + '" data-funcid="' + funcId + '">' + menuName + ' <i class="fa fa-times-circle"></i><!--&nbsp;<i class="fa fa-refresh"></i>--></a>';
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
	        
	        //前后都没有同辈元素是，也要关闭当前页
	        if (!$(this).parents('.index-tab-menu-item').next('.index-tab-menu-item').size() && 
	        		!$(this).parents('.index-tab-menu-item').prev('.index-tab-menu-item').size()){
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
		$('.page-tabs-content').children("[data-id]").not(".active").each(function () {
			//判断没有子元素的，则不用关闭（没有li的关闭图标元素）
			if(this.children.length != 0){
		        $('.index-iframe[data-id="' + $(this).data('id') + '"]').remove();
		        $(this).remove();
			}
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
		//获取旧的激活的tab
		var oldActiveTab = null;
		$(".index-menu-item").each(function (option, element) {
			if($(this).data('funcid') == index.currentFuncId) {
				oldActiveTab = $(this);
	    			index.currentActiveTab = $(this);
				return false;//实现break功能
			}
		});
		//显示内容区域
		var destId = "";
	    if (!$(this).hasClass('active')) {
	        var destId = $(this).data('id');
	        // 显示tab对应的内容区
	        $('.index-main-content .index-iframe').each(function () {
	            if ($(this).data('id') == destId) {
	                $(this).show().siblings('.index-iframe').hide();
	                return false;
	            }
	        });
	        $(this).addClass('active').siblings('.index-tab-menu-item').removeClass('active');
	        index.scrollToTab(this);
	    }
	    //循环查找左侧栏，并展开
	    destId = $(this).data('id');
	    var isExist = index.activeTabLeftMenu(destId, oldActiveTab);
	    //不在当前的左侧栏，需要检查所有的左侧栏
	    if(!isExist){
		    var funcId = $(this).data('funcid');
		    var activeFuncId = "";
		    	for(var funcKey in index.leftMenuMainList){
		    		var isFound = false;
		    		if(index.leftMenuMainList.hasOwnProperty(funcKey)){
			    		for(var i = 0; i < index.leftMenuMainList[funcKey].length; i++){
			    			//查找到在某个顶栏的菜单栏
			    			if(funcId == index.leftMenuMainList[funcKey][i].funcId){
			    				activeFuncId = funcKey;
			    				isFound = true;
			    				break;
			    			}
			    		}
		    	    }
		    		if(isFound) break; 
		    	}
		    	//检查二层菜单
		    	if(activeFuncId == "") {
				//遍历二层菜单
		    		for(var funcKey in index.leftMenuSubList){
		    	    		var isFound = false;
		    	    		if(index.leftMenuSubList.hasOwnProperty(funcKey)){
		    	    			for(var funcSubKey in index.leftMenuSubList[funcKey]){
				    	    		if(index.leftMenuSubList[funcKey].hasOwnProperty(funcSubKey)){
				    		    		for(var i = 0; i < index.leftMenuSubList[funcKey][funcSubKey].length; i++){
				    		    			//查找到在某个顶栏的菜单栏
				    		    			if(funcId == index.leftMenuSubList[funcKey][funcSubKey][i].funcId){
				    		    				activeFuncId = funcKey;
				    		    				isFound = true;
				    		    				break;
				    		    			}
				    		    		}
				    	    	    }
				    	    		if(isFound) break; 
				    	    	}
		    	    	    }
		    	    		if(isFound) break; 
		    	    	}
			}
		    	//找到所在的顶部菜单
		    	if(activeFuncId != ""){
		    		//遍历顶部菜单
		    		$(".index-top-item").each(function (index, element) {
			    	    	if(activeFuncId == $(this).data('id')){
			    	    		//触发点击事件
			    	    		$(this).trigger("click");
			    	    		return false;
			    	    	}
		    	    });
		    		//重新计算
		    		$(".index-menu-item").each(function (option, element) {
		    			if($(this).data('funcid') == index.currentFuncId) {
		    				oldActiveTab = $(this);
		    	    			index.currentActiveTab = $(this);
		    				return false;//实现break功能
		    			}
		    		});
		    		index.activeTabLeftMenu(destId, oldActiveTab);
		    	}
	    }
	    
	    //最后赋值，重置当前tab的权限ID
	    index.currentFuncId = $(this).data('funcid');
	}

	//+---------------------------------------------------   
	//| 点击选项卡菜单,切换侧边栏
	//+--------------------------------------------------- 
	index.activeTabLeftMenu = function(destId, oldActiveTab){
		//if(oldActiveTab == null || oldActiveTab == undefined) return;
		var isExist = false;
		var newActiveTab = null;
	    $(".index-menu-item").each(function (option, element) {
		    	if(element.href == destId){
		    		isExist = true;
		    		newActiveTab = $(this);
		    		return false;
		    	}
	    });
		//if(isExist && oldActiveTab.data('funcid') != newActiveTab.data('funcid')){
	    if(isExist){
	    		if(oldActiveTab != null && oldActiveTab != undefined){
				//循环递归去除旧的active
				if(oldActiveTab.parent("li") != null && oldActiveTab.parent("li") != undefined) 
					oldActiveTab.parent("li").removeClass("active");
				//判断oldActiveTab是否还在列表中(当页面切换后，就不在页面中)
				var oldIsExist = false;
				$(".index-menu-item").each(function (option, element) {
					if($(this).data('funcid') == oldActiveTab.data('funcid')) {
						oldIsExist = true;
				    		return false;
				    	}
			    });
				if(oldIsExist) index.closeLeftMenuTab(oldActiveTab);
	    		}
			
			//循环递归激活新的active
			newActiveTab.parent("li").toggleClass("active");
			index.openLeftMenuTab(newActiveTab);
		}
	    return isExist;
	}
	
	index.closeLeftMenuTab = function(activeTab){
		if(activeTab.parent() != null){
			if(activeTab.parent().hasClass('active')){
				activeTab.parent().toggleClass("active").children("ul").collapse("toggle");
			}
			if(activeTab.parent().hasClass('side-menu')){
				return;
			}else if(activeTab.parent().hasClass('gray-bg')){
				return;
			}else{
				index.closeLeftMenuTab(activeTab.parent());
			}
		}
	}
	
	index.openLeftMenuTab = function(activeTab){
		if(activeTab.parent() != null){
			if(activeTab.parent().children("ul").length != 0){
				activeTab.parent().addClass("active").children("ul").addClass("collapse in");
			}
			if(activeTab.parent().hasClass('side-menu')){
				return;
			}else if(activeTab.parent().hasClass('gray-bg')){
				return;
			}else{
				index.openLeftMenuTab(activeTab.parent());
			}
		}
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
		$(elements).each(function() {
			width += $(this).outerWidth(true);
		});
		return width;
	}

	// +---------------------------------------------------
	//| 滚动到指定选项卡
	//+--------------------------------------------------- 
	index.scrollToTab = function(element) {
		var marginLeftVal = index.calSumWidth($(element).prevAll()), marginRightVal = index.calSumWidth($(element).nextAll());
		// 可视区域非tab宽度
		var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
		// 可视区域tab宽度
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		// 实际滚动宽度
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
		$('.page-tabs-content').animate({marginLeft : 0 - scrollVal + 'px'}, "fast");
	}

	// +---------------------------------------------------
	//| 查看左侧隐藏的选项卡
	//+--------------------------------------------------- 
	index.scrollTabLeft = function() {
		var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
		// 可视区域非tab宽度
		var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
		// 可视区域tab宽度
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		// 实际滚动宽度
		var scrollVal = 0;
		if ($(".page-tabs-content").width() < visibleWidth) {
			return false;
		} else {
			var tabElement = $(".index-tab-menu-item:first");
			var offsetVal = 0;
			while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {// 找到离当前tab最近的元素
				offsetVal += $(tabElement).outerWidth(true);
				tabElement = $(tabElement).next();
			}
			offsetVal = 0;
			if (index.calSumWidth($(tabElement).prevAll()) > visibleWidth) {
				while ((offsetVal + $(tabElement).outerWidth(true)) < (visibleWidth)&& tabElement.length > 0) {
					offsetVal += $(tabElement).outerWidth(true);
					tabElement = $(tabElement).prev();
				}
				scrollVal = index.calSumWidth($(tabElement).prevAll());
			}
		}
		$('.page-tabs-content').animate({marginLeft : 0 - scrollVal + 'px'}, "fast");
	}

	// +---------------------------------------------------
	// | 查看右侧隐藏的选项卡
	//+--------------------------------------------------- 
	index.scrollTabRight = function() {
		var marginLeftVal = Math.abs(parseInt($('.page-tabs-content').css('margin-left')));
		// 可视区域非tab宽度
		var tabOuterWidth = index.calSumWidth($(".content-tabs").children().not(".index-tab-menu"));
		// 可视区域tab宽度
		var visibleWidth = $(".content-tabs").outerWidth(true) - tabOuterWidth;
		// 实际滚动宽度
		var scrollVal = 0;
		if ($(".page-tabs-content").width() < visibleWidth) {
			return false;
		} else {
			var tabElement = $(".index-tab-menu-item:first");
			var offsetVal = 0;
			while ((offsetVal + $(tabElement).outerWidth(true)) <= marginLeftVal) {// 找到离当前tab最近的元素
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
				$('.page-tabs-content').animate({marginLeft : 0 - scrollVal + 'px'}, "fast");
			}
		}
	}

	// +---------------------------------------------------
	// | Toggle
	// +---------------------------------------------------
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
			    		index.topMenuList = data.RetData;
			    		$(index.topMenuList).each(function(idx,func){
			    			//加载子菜单数据
			    			index.getUserFuncByFd(func.funcId, "folder_" + func.funcId, true);
			    		});
			    		//加载顶部菜单界面
			    		index.loadTopMenu(true);
			    	}else{
			    		app.message.error(data.RetMsg);
			    	}
			}
		});
	};

	//+---------------------------------------------------   
	//| 获取子菜单
	//+--------------------------------------------------- 
	index.getUserFuncByFd = function(funcId, folderId, isTopMenu){
		$.ajax({
		    url: app.conf.url.api.system.user.getUserFuncByFd + "/" + funcId,
		    method: 'GET',
		    async: false,
		   	timeout:5000,
		    data: {
		    		access_token: app.cookies.getCookiesToken()
		    },success: function(data){
			    	if(app.message.code.success == data.RetCode){
			    		if(isTopMenu) {
				    		index.leftMenuMainList[funcId] = data.RetData;
			    			index.leftMenuSubList[funcId] = {};
			    		}else {
			    			//查找所属的leftMenuMainList
			    			var parentId = "";
			    			for(var funcKey in index.leftMenuMainList){
				    	    		var isFound = false;
				    	    		if(index.leftMenuMainList.hasOwnProperty(funcKey)){
				    		    		for(var i = 0; i < index.leftMenuMainList[funcKey].length; i++){
				    		    			//查找到在某个顶栏的菜单栏
				    		    			if(funcId == index.leftMenuMainList[funcKey][i].funcId){
				    		    				parentId = funcKey;
				    		    				isFound = true;
				    		    				break;
				    		    			}
				    		    		}
				    	    	    }
				    	    		if(isFound) break; 
				    	    	}
			    			if(parentId == "") {
			    				//遍历二层菜单
			    				for(var funcKey in index.leftMenuSubList){
					    	    		var isFound = false;
					    	    		if(index.leftMenuSubList.hasOwnProperty(funcKey)){
					    	    			for(var funcSubKey in index.leftMenuSubList[funcKey]){
							    	    		if(index.leftMenuSubList[funcKey].hasOwnProperty(funcSubKey)){
							    		    		for(var i = 0; i < index.leftMenuSubList[funcKey][funcSubKey].length; i++){
							    		    			//查找到在某个顶栏的菜单栏
							    		    			if(funcId == index.leftMenuSubList[funcKey][funcSubKey][i].funcId){
							    		    				parentId = funcKey;
							    		    				isFound = true;
							    		    				break;
							    		    			}
							    		    		}
							    	    	    }
							    	    		if(isFound) break; 
							    	    	}
					    	    	    }
					    	    		if(isFound) break; 
					    	    	}
			    			}
			    			if(parentId != "") index.leftMenuSubList[parentId][funcId] = data.RetData;
			    		}
			    		//递归查找子菜单
			    		for(var i = 0; i < data.RetData.length; i++){
			    			if(data.RetData[i].funcType == '100200'){
			    				index.getUserFuncByFd(data.RetData[i].funcId, "folder_" + data.RetData[i].funcId, false);		    				
			    			}
			    		}
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
	//| 加载顶部菜单栏
	//+--------------------------------------------------- 
	index.loadTopMenu = function(firstLoad){
		//根据右侧栏，设置左侧栏宽度
		$('.navbar-header').width($('.navbar-static-top').outerWidth(true) - $('.navbar-top-links').width() - 10);
		//新增的div用于计算菜单宽度
		$('.navbar-header').append('<div id="test-nav-tab-width" class="nav navbar-toolbar nav-tabs" style="display:none"></div>');
		$("#index-top-menu").empty();
		var topMenuWidth = $("#index-top-menu").outerWidth(true);
		var subMenu = "", isAddAll = false; 
		$(index.topMenuList).each(function(idx,func){
			var icon = "fa fa-columns";
			if(func.funcIcon != "" && func.funcIcon != undefined) icon = func.funcIcon;
			//一级菜单
			var active = "";
			if(idx == 0) active = "active";
			var topMenu = "<li class='" + active + "'>" + 
	                            "<a data-toggle='tab' id='folder_" + func.funcId + "' name='folder_" + func.funcId + "' data-id='" + func.funcId + "' data-name='" + func.funcName + "' class='index-top-item'>" + 
	                            	"<i class='" + icon + "'></i> " +
	                            	"<span>" + func.funcName + "</span>" + 
	                            "</a>" +
	    					"</li>";
			//获取已经加入topMenu的菜单宽度
			var width = 0, isBeyondWidth = false;
			$("#index-top-menu").children("li").each(function () {
				width += $(this).outerWidth(true);
	        });
			//判断是否超出范围，超出则放进更多操作里面（已加入的 + 待加入的 > 总宽度-下拉宽度）【同时要防止后续的菜单宽度合适但添加进去，isAddAll就是为了防止这种情况而进行判断】
			$("#test-nav-tab-width").empty();
			$("#test-nav-tab-width").append(topMenu);
			width += $("#test-nav-tab-width").outerWidth(true);
			if(width > (topMenuWidth - $('.navbar-minimalize').outerWidth(true) - 50)) isAddAll = true;
			if(isAddAll || width > (topMenuWidth - $('.navbar-minimalize').outerWidth(true) - 50)){
				subMenu += topMenu;
			}else{
				$("#index-top-menu").append(topMenu);
			}
		});
		//用完后移除
		$('#test-nav-tab-width').remove();
		//是否加入子菜单
		if(subMenu != ""){
			var tmpHtml = "<li class='dropdown' id='index-top-submenu'>" + 
								"<a class='dropdown-toggle' data-toggle='dropdown' href='#' data-animation='slide-bottom' aria-expanded='true' role='button' style='padding-left:20px;padding-right:0px;'>" + 
									"<i class='icon wb-more-vertical'></i>" + 
								"</a>" + 
								"<ul class='dropdown-menu' role='menu'>";
			tmpHtml += subMenu;
			tmpHtml += "</ul>" + "</li>";
			$("#index-top-menu").append(tmpHtml);
		}
		$(".index-top-item").on('click', index.topMenuItemOnClick);
		//加载完后，加载第一个顶部菜单
		if(firstLoad){
			//加载特殊的菜单（右上角待办任务提醒）
			index.loadTopRightMenu();
			$(".index-top-item").each(function (index, element) {
			    	if(index == 0){ $(this).trigger("click"); return false;}
		    });
		}
		//（需要判断是否为第一次加载）加载租户扩展表里面指定的菜单
		if(firstLoad && !$.utils.isEmpty(app.info.tenantsInfo.extendData.homePage)){
			var isFound = false;
			$(".index-top-item").each(function () {
				//循环遍历指定的url
				$("#side-menu").children("li").each(function (index) {
					if($(this).children("a") != null && $(this).children("a") != undefined){
				        var tabHref = $(this).children("a").attr('href');
						if(!$.utils.isEmpty(tabHref)) tabHref = tabHref.replace(app.info.rootPath, "");
				        if(tabHref == app.info.tenantsInfo.extendData.homePage){
				        	$(this).children("a").trigger("click");
							//跳出循环
				        	isFound = true;
							return false;
				        }
					}
			    });
				if(isFound) return false;
	        });
		}
	}

	//+---------------------------------------------------   
	//| 加载左侧菜单栏
	//+--------------------------------------------------- 
	index.loadLeftMenu = function(funcId, funcName){
		var funcList = index.leftMenuMainList[funcId];
		if(funcList != null && funcList != undefined && funcList != "" ){
			var leftMenu = "";
			$("#side-menu").empty();
			//添加顶部菜单名称
			var topInfo = "<li style='height:40px;padding-left: 25px;line-height: 40px;margin-top:0px;' >" + 
							//"<i class='fa fa-columns' style='color: #62a8eb;margin-right:10px;'></i>" +
		                		//"<span class='nav-label' style='color: #76838f;font-size:12px;'>" + funcName + "</span>" +
							"<span class='nav-label' style='color: #62a8eb;font-size:14px;'>" + funcName + "</span>" +
		                		"<span class='fa'></span>" + 
		                	  "</li>";
			$("#side-menu").append(topInfo);
			for(var i = 0; i < funcList.length; i++){
				var icon = "fa fa-columns";
	    			if(funcList[i].funcIcon != "" && funcList[i].funcIcon != undefined) icon = funcList[i].funcIcon;
	    			//判断是菜单还是叶子节点
	    			if(funcList[i].funcType == '100200'){
	    				leftMenu = "<li id='folder_" + funcList[i].funcId + "' name='folder_" + funcList[i].funcId + "'> " +
									"<a href='#'> " +
										"<i class='" + icon + "'></i> " +
										"<span class='nav-label'>" + funcList[i].funcName + "</span>" +
										"<span class='fa arrow'></span>" + 
									"</a>" +
								"</li>";
	    			}else if(funcList[i].funcType == '100300'){
	    				var link = app.info.rootPath + funcList[i].funcLink;
	    				if(funcList[i].funcLink.indexOf("?") != -1){  
	    					link = link + "&";
	    			    }else{   
	    					link = link + "?";
	    			    }  
	    				leftMenu = "<li>" + 
					                    "<a class='index-menu-item' href='" + link + "_pid=" + funcList[i].funcId + "' data-flag='" + funcList[i].funcFlag + "' data-isblank='" + funcList[i].isBlank + "' data-funcid='" + funcList[i].funcId + "'>" + funcList[i].funcName + "</a>" +		    							
					               "</li>";
	    			}
	    			$("#side-menu").append(leftMenu);
	    			//加载目录的子菜单
	    			index.loadLeftSubMenu(funcId, funcList[i].funcId, 1);
			}
    			//重新初始化菜单项
    			index.initLeftMenuItems();
		}
	}

	//+---------------------------------------------------   
	//| 加载左侧子菜单栏(包括二级、三级等菜单)
	//+--------------------------------------------------- 
	index.loadLeftSubMenu = function(parentId, funcId, deepIndex){
		if(index.leftMenuSubList[parentId][funcId] == null || index.leftMenuSubList[parentId][funcId] == undefined || 
				index.leftMenuSubList[parentId][funcId] == ""){
			return;
		}
		var funcList = index.leftMenuSubList[parentId][funcId];
		var subMenu = "";
		if(deepIndex == 1)
			subMenu = "<ul class='nav nav-second-level'>";
		else if(deepIndex == 2){
			subMenu = "<ul class='nav nav-third-level'>";
		}else if(deepIndex == 3){
			subMenu = "<ul class='nav nav-four-level'>";
		}
		for(var i = 0; i < funcList.length; i++){
			var icon = "fa fa-columns";
			if(funcList[i].funcIcon != "" && funcList[i].funcIcon != undefined) icon = funcList[i].funcIcon;
			//判断是菜单还是叶子节点
			if(funcList[i].funcType == '100200'){
				subMenu += "<li id='folder_" + funcList[i].funcId + "' name='folder_" + funcList[i].funcId + "'> " +
							"<a href='#'> " +
								"<i class='" + icon + "'></i> " +
								"<span class='nav-label'>" + funcList[i].funcName + "</span>" +
								"<span class='fa arrow'></span>" + 
							"</a>" +
						"</li>";
			}else if(funcList[i].funcType == '100300'){
				var link = app.info.rootPath + funcList[i].funcLink;
				if(funcList[i].funcLink.indexOf("?") != -1){  
					link = link + "&";
			    }else{   
					link = link + "?";
			    }  
				subMenu += "<li>" + 
			                    "<a class='index-menu-item' href='" + link + "_pid=" + funcList[i].funcId + "' data-flag='" + funcList[i].funcFlag + "' data-isblank='" + funcList[i].isBlank + "' data-funcid='" + funcList[i].funcId + "'>" + funcList[i].funcName + "</a>" +		    							
			               "</li>";
			}
		};
		subMenu += "</ul>"
		$("#folder_" + funcId).append(subMenu);
		//递归加载下级菜单
		for(var i = 0; i < funcList.length; i++){
			//判断是菜单还是叶子节点
			if(funcList[i].funcType == '100200'){
				index.loadLeftSubMenu(parentId, funcList[i].funcId, ++deepIndex);
			}
		};
	}

	//+---------------------------------------------------   
	//| 加载顶部特殊的菜单:待办任务等
	//+--------------------------------------------------- 
	index.loadTopRightMenu = function(){
		//首先查找一级菜单
		var isExist = false;
		for(var funcKey in index.leftMenuMainList){
	    		var isFound = false;
	    		if(index.leftMenuMainList.hasOwnProperty(funcKey)){
		    		for(var i = 0; i < index.leftMenuMainList[funcKey].length; i++){
		    			//查找到在某个顶栏的菜单栏
					if(index.leftMenuMainList[funcKey][i].funcName == '我的任务'){
						$('#titleMyTask').attr("href", app.info.rootPath + index.leftMenuMainList[funcKey][i].funcLink + "?_pid=" + index.leftMenuMainList[funcKey][i].funcId);
						$('#titleMyTask').attr("data-flag", index.leftMenuMainList[funcKey][i].funcFlag);
						$('#titleMyTask').attr("data-isblank", index.leftMenuMainList[funcKey][i].isBlank);
						$('#titleMyTask').attr("data-funcid", index.leftMenuMainList[funcKey][i].funcId);
						isExist = true;
						isFound = true;
						break;
					}
		    		}
	    	    }
	    		if(isFound) break; 
	    	}
	    	//如果一级菜单不存在，则继续查找二级及以下菜单
	    	if(!isExist) {
			//遍历二层菜单
			for(var funcKey in index.leftMenuSubList){
		    		var isFound = false;
		    		if(index.leftMenuSubList.hasOwnProperty(funcKey)){
		    			for(var funcSubKey in index.leftMenuSubList[funcKey]){
			    	    		if(index.leftMenuSubList[funcKey].hasOwnProperty(funcSubKey)){
			    		    		for(var i = 0; i < index.leftMenuSubList[funcKey][funcSubKey].length; i++){
			    		    			//查找到在某个顶栏的菜单栏
		    						if(index.leftMenuSubList[funcKey][funcSubKey][i].funcName == '我的任务'){
		    							$('#titleMyTask').attr("href", app.info.rootPath + index.leftMenuSubList[funcKey][funcSubKey][i].funcLink + "?_pid=" + index.leftMenuSubList[funcKey][funcSubKey][i].funcId);
		    							//$('#titleMyTask').attr("data-flag", index.leftMenuSubList[funcKey][funcSubKey][i].funcFlag);
		    							//$('#titleMyTask').attr("data-isblank", index.leftMenuSubList[funcKey][funcSubKey][i].isBlank);
		    							//$('#titleMyTask').attr("data-funcid", index.leftMenuSubList[funcKey][funcSubKey][i].funcId);
		    							isFound = true;
		    							break;
		    						}
			    		    		}
			    	    	    }
			    	    		if(isFound) break; 
			    	    	}
		    	    }
		    		if(isFound) break; 
		    	}
		}
	}

	//+---------------------------------------------------   
	//| 顶部菜单栏点击事件
	//+--------------------------------------------------- 
	index.topMenuItemOnClick = function(obj){
		var funcIc = $(this).data('id');
		var funcName = $(this).data('name');
		index.loadLeftMenu(funcIc, funcName);
		//跳转到当前已激活的tab上
		index.changeToActiveTab();
	}

	//+---------------------------------------------------   
	//| 跳转到当前已激活的tab上
	//+--------------------------------------------------- 
	index.changeToActiveTab = function(){
		var activeTabFuncId = $(".page-tabs-content").children("a.active").data('funcid');
		var isExist = false;
		if(!$.utils.isNull(activeTabFuncId)){
			isExist = index.changeToActiveTabCheckSub(activeTabFuncId, $("#side-menu"));
		}
		if(!isExist){
			index.changeToActiveTabTriggerSub($("#side-menu"));
		}
	}

	//+---------------------------------------------------   
	//| 递归判断
	//+--------------------------------------------------- 
	index.changeToActiveTabCheckSub = function(activeTabFuncId, obj){
		var isExist = false;
		if(!$.utils.isNull(obj)){
			obj.children("li").each(function () {
				//先递归判断子循环
				isExist = index.changeToActiveTabCheckSub(activeTabFuncId, $(this).children("ul"));
				if(isExist) return false;
				if($(this).children("a") != null && $(this).children("a") != undefined){
			        if($(this).children("a").data('funcid') == activeTabFuncId){isExist = true;}
				}
				if(isExist) return false;
		    });
		}
		return isExist;
	}

	//+---------------------------------------------------   
	//| 递归判断
	//+--------------------------------------------------- 
	index.changeToActiveTabTriggerSub = function(obj){
		var isFound = false;
		if(!$.utils.isNull(obj)){
			obj.children("li").each(function () {
				//先递归判断子循环
				isFound = index.changeToActiveTabTriggerSub($(this).children("ul"));
				if(isFound) {$(this).children("a").trigger("click");return false;}
				if($(this).children("a") != null && $(this).children("a") != undefined){
			        var leftTabFundId = $(this).children("a").data('funcid');
			        if(leftTabFundId != null && leftTabFundId != undefined){
				        //遍历右侧菜单，是否存在相同的funcid
				        $(".page-tabs-content").children("a").each(function () {
					        var tabFuncId = $(this).data('funcid');
					        //遍历右侧菜单，是否存在相同的funcid
					        if(leftTabFundId == tabFuncId) {
					        		isFound = true;
					        		return false;
					        }
					    });
			        }
				}
				if(isFound) {$(this).children("a").trigger("click");return false;}
		    });
		}
		return isFound;
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
		    duration: '1m',
		    callback: function() {
	    		app.checkToken();
	    		//index.getTaskCount();
		    },
		    repeat: true //重复调用
		});
		//每秒刷新token过期时间
		$('#onTokenExpiresTime').timer({
		    duration: '1s',
		    callback: function() {
	    		var expires = parseInt(app.cookies.getCookiesTokenExpires()) - 1;
	    		if(isNaN(expires)) expires = 0;
	    		app.cookies.setCookiesTokenExpires(expires + "", 846000);
		    },
		    repeat: true //重复调用
		});
	}
})();
