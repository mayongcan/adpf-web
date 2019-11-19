function findByChannelId(){
	//定义提交数据
	//var submitData = {};
	var idList = [];
	$.ajax({
		url: top.app.conf.url.apigateway+"/api/adpf/tracking/channel/getList"+"?access_token=" + top.app.cookies.getCookiesToken(),
	    method: 'GET',
		//data:JSON.stringify(submitData),
		contentType: "application/json",
		success: function(data){
			top.app.message.loadingClose();
			if(top.app.message.code.success == data.RetCode){
				for(var i = 0;i <= data.rows.length-1;i++){
					idList.push(data.rows[i].id);
				}
	   		}
        }
	
		error:function(){
			alert(".........");
		}
	});
	
	return idList;
}