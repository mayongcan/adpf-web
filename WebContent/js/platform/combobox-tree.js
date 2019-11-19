/*!
 * 作者：zzd
 * 时间：2017-04-19
 * 描述：下拉树工具
 */
var AppCombotree = {
	createNew: function(){
		var combotree = {};
		//是否显示树面板
		combotree.display = false;
		//combo-tree对象
		combotree.divObj = null;
		//下拉按钮对象
		combotree.button = null;
		//显示信息对象
		combotree.info = null;
		//树面板外围对象
		combotree.treeBorder = null;
		//树对象
		combotree.tree = null;
		//选中的树节点
		combotree.selectNode = null;
		//根节点
		combotree.rootNode = null;
		//刷新后是否设置显示根节点
		combotree.showRootNode = false;
		//是否被禁用
		combotree.disable = false;
		//刷新成功后调用的函数
		combotree.refreshTreeEvent = null;
		//点击树的回调函数
		combotree.clickTreeEvent = null;
		//是否默认打开第一个节点
		combotree.isOpenFirst = true;
		
		/**
		 * 初始化
		 */
		combotree.init = function(divObj, dataHandle, width){
			if(width == null || width == undefined) width = "225px";
			combotree.divObj = divObj;
			divObj.addClass("edit-comboboxtree-parent");
			divObj.empty();
			var html = "<button type='button' class='btn btn-select-default' id='comboTree' style='width:" + width + ";'>" + 
							"<span class='filter-option pull-left'></span>" + 
							"<span class='bs-caret' style='float:right;'>" + 
		   						"<span class='caret'></span>" + 
		   					"</span>" +
		   				"</button>" + 
		   				"<div class='edit-comboboxtree' style='width:" + width + ";'>" +
	                   		"<div id='organizerTree' style='overflow: auto;padding-bottom: 25px;height:230px;'></div>" +
	                    "</div>";
			divObj.append(html);
			combotree.button = divObj.find('#comboTree');
			combotree.info = divObj.find('.filter-option');
			combotree.treeBorder = divObj.find('.edit-comboboxtree');
			combotree.tree = divObj.find('#organizerTree');
			//初始化树菜单
			if($.isFunction(dataHandle)){
				combotree.tree.jstree({
					'core': {
						"check_callback": true,
						'data': function (objNode, cb) {
							if(dataHandle != null && dataHandle != undefined)
								dataHandle(objNode, cb);
						}
					},
					"plugins": ["types"],
					"types": {
						"default": {
							"icon": "fa fa-folder"
						}
					}
	    	    });
			}else{
				combotree.tree.jstree({
					'core': {
						"check_callback": true,
						'data': dataHandle
					},
					"plugins": ["types"],
					"types": {
						"default": {
							"icon": "fa fa-folder"
						}
					}
	    	    });
			}
			//初始化按钮点击事件
			combotree.button.click(function (event) {
				if(combotree.display){
					combotree.treeBorder.css('display', 'none');
					combotree.display = false;
				}else{
					combotree.treeBorder.css('display', 'block');
					combotree.display = true;
					
					$(document).one("click", function () {//对document绑定一个隐藏树菜单的方法 
						combotree.treeBorder.css('display', 'none');
						combotree.display = false;
					});
					event.stopPropagation();//点击Button阻止事件冒泡到document 
				}
		    });
			//加载根节点后触发
			combotree.tree.bind("loaded.jstree", function (e, data) {
				var inst = data.instance;  
			    var rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild); 
			    //隐藏虚拟节点
			    if(rootNode.id == '-1') combotree.tree.jstree('hide_node', rootNode);
			    //展开根节点
			    if(combotree.isOpenFirst) combotree.tree.jstree('open_node', rootNode);
			});
			//树点击事件
			combotree.tree.bind("activate_node.jstree", function (obj, e) {
			    // 获取当前节点
				combotree.selectNode = e.node;
				combotree.info.text(combotree.selectNode.text);
				
				combotree.treeBorder.css('display', 'none');
				combotree.display = false;
				
				//触发点击树回调函数
				if(combotree.clickTreeEvent != null && combotree.clickTreeEvent != undefined && typeof combotree.clickTreeEvent == 'function'){
					combotree.clickTreeEvent(combotree.selectNode);
				}
			});
			//刷新节点后获取根节点
			combotree.tree.bind("refresh.jstree", function (e, data) {
				var inst = data.instance;  
				combotree.rootNode = inst.get_node(e.target.firstChild.firstChild.lastChild);
				if(combotree.showRootNode) {
					combotree.setValue(combotree.rootNode);
					combotree.showRootNode = false;
				}
				//返回刷新事件
				if(combotree.refreshTreeEvent != null && combotree.refreshTreeEvent != undefined && typeof combotree.refreshTreeEvent == 'function'){
					combotree.refreshTreeEvent();
					combotree.refreshTreeEvent = null;
				}
			    //展开根节点
				if(combotree.isOpenFirst) combotree.tree.jstree('open_node', combotree.rootNode);
			});
			combotree.treeBorder.click(function (event) { 
				event.stopPropagation();//在Div区域内的点击事件阻止冒泡到document 
			}); 
		}
		
		/**
		 * 刷新
		 */
		combotree.refreshTree = function(showRootNode, callback){
			combotree.rootNode = null;
			combotree.tree.jstree(true).refresh();
			combotree.showRootNode = showRootNode;
			combotree.refreshTreeEvent = callback;
		}
		
		/**
		 * 设置值
		 */
		combotree.setValue = function(node, loadDelay){
			if($.utils.isEmpty(loadDelay)){
				if(node != null){
					combotree.selectNode = node;
					combotree.info.text(node.text);
				}else{
					combotree.selectNode = null;
					combotree.info.text("");
				}
			}else{
				setTimeout(function () {
					if(node != null){
						combotree.selectNode = node;
						combotree.info.text(node.text);
					}else{
						combotree.selectNode = null;
						combotree.info.text("");
					}
			    }, loadDelay);
			}
		}
		
		/**
		 * 设置值
		 */
		combotree.setValueById = function(nodeId, loadDelay){
			if($.utils.isEmpty(loadDelay)){
				var node = combotree.tree.jstree('get_node', nodeId)
				if(node != null){
					combotree.selectNode = node;
					combotree.info.text(node.text);
				}
			}else{
				setTimeout(function () {
					var node = combotree.tree.jstree('get_node', nodeId)
					if(node != null){
						combotree.selectNode = node;
						combotree.info.text(node.text);
					}
			    }, loadDelay);
			}
		}
		
		/**
		 * 获取节点ID
		 */
		combotree.getNodeId = function(){
			if(combotree.selectNode == null) return null;
			else {
				if(combotree.selectNode.id == null || combotree.selectNode.id == undefined) return '';
				else return combotree.selectNode.id;
			}
		}
		
		/**
		 * 获取值
		 */
		combotree.getNodeText = function(){
			if(combotree.selectNode == null) return "";
			else {
				if(combotree.selectNode.text == null || combotree.selectNode.text == undefined) return '';
				else return combotree.selectNode.text;
			}
		}
		
		/**
		 * 判断是否选中
		 */
		combotree.isSelectNode = function(){
			if(combotree.selectNode == null) return false;
			else return true;
		}
		
		/**
		 * 设置禁用
		 */
		combotree.setDisable = function(){
			combotree.button.attr('disabled', true);
			combotree.disable = true;
		}

		/**
		 * 判断是否禁用
		 */
		combotree.isDisable = function(){
			return combotree.disable;
		}
		
		/**
		 * 设置点击树回调函数
		 */
		combotree.setClickTreeEvent = function(callback){
			combotree.clickTreeEvent = callback;
		}
		
		
		return combotree;
	}
};