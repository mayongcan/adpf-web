var $table = $('#tableList'), g_operRights = [];

$(function () {
	//初始化字典
	initView();
	//初始化权限
	//initFunc();
	//初始化列表信息
	//initTable();
	//初始化权限功能按钮点击事件
	//initFuncBtnEvent();
	
});

/**
 * 初始基础视图
 * @returns
 */
function initView(){
	
}



/**
 * 初始化列表信息
 */
function initTable(){
	//搜索参数
	var searchParams = function (params) {
        var param = {   //这里的键的名字和控制器的变量名必须一直，这边改动，控制器也需要改成一样的
		    access_token: top.app.cookies.getCookiesToken(),
            size: params.limit,   						//页面大小
            page: params.offset / params.limit,  		//当前页
			name: $("#searchEquipment").val(),
        };
        return param;
    };
    //初始化列表
	$table.bootstrapTable({
        url: top.app.conf.url.apigateway + "/api/adpf/tracking/channelurl/getList",   		//请求后台的URL（*）
        queryParams: searchParams,											//传递参数（*）
        uniqueId: 'id',
        onClickRow: function(row, $el){
        	appTable.setRowClickStatus($table, row, $el);
        }
    });
	//初始化Table相关信息
	appTable.initTable($table);
	
	//搜索点击事件
	$("#btnSearch").click(function () {
		$table.bootstrapTable('refresh');
    });
	$("#btnReset").click(function () {
		$("#searchEquipment").val("");
		$('.selectpicker').selectpicker('refresh');
		$table.bootstrapTable('refresh');
    });
}

function getEquipment(){
	if($("#searchEquipment").val() != ""){
		var equipmen = $("#searchEquipment").val();
		var html = "<div class='panel-body form-horizontal remove'>"+
               		"<label class='control-label page-search-label' id='appName' style = 'margin-right:20px;font-size:14px'>产品名称:</label> "+             		                 	
                   	"<label class='control-label page-search-label' id='appKey' style = 'margin-right:20px;font-size:14px'>key:</label>" +           		
       			"</div>"+       			
       			"<div class='panel-body form-horizontal remove'>"+
               		"<label class='control-label page-search-label' id='channelName' style = 'margin-right:20px;font-size:14px'>来源渠道 :</label>"+              		                  
                   	"<label class='control-label page-search-label' id = 'promoName' style = 'margin-right:20px;font-size:14px'>来源活动 :</label>"+           		
       			"</div>"+       			       			
       			"<div class='panel-body form-horizontal remove'>"+
               		"<label class='control-label page-search-label' id = 'createTime' style = 'margin-right:20px;font-size:14px'>点击广告 :</label>"+              		 
                   "<label class='control-label page-search-label' id = 'startTime' style = 'margin-right:20px;font-size:14px'>激活设备 :</label> "+          		
       			"</div>"
		$.ajax({
			url:top.app.conf.url.apigateway + "/api/adpf/tracking/promocurr/getEquipment",
			method: 'GET',
			data:{
				access_token: top.app.cookies.getCookiesToken(),
				equipmen:equipmen				
				},
			success: function(data){
				//alert(data.RetData) ;
				if(data.RetData != null ){
					$(".remove").remove();
					$("#panel").after(html);
					$("#appName").after("<label class='control-label page-search-label' style = 'margin-right:10px;color:red;'>"+data.RetData[0].appName+"</label>")
					$("#appKey").after("<label class='control-label page-search-label' style = 'margin-right:10px;color:red'>"+data.RetData[0].appKey+"</label>")
					$("#channelName").after("<label class='control-label page-search-label' style = 'margin-right:10px;color:red'>"+data.RetData[0].channelName+"</label>")
					$("#promoName").after("<label class='control-label page-search-label' style = 'margin-right:10px;color:red'>"+data.RetData[0].promoName+"</label>")
					$("#createTime").after("<label class='control-label page-search-label' style = 'margin-right:10px;color:red'>"+data.RetData[0].createTime+"</label>")
					if(data.RetData[0].startTime != undefined || data.RetData[0].startTime != null ){
						$("#startTime").after("<label class='control-label page-search-label' style = 'margin-right:10px'>"+data.RetData[0].startTime+"</label>")
					}
					html = "";
				}
			}
		})
	}
	
}

function reSet(){
	$("#searchEquipment").val("");
	$(".remove").remove();
}











