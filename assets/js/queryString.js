function getQueryString() {
	var params = location.search.substring(1);
	if(params !='')
	{
		//decode base64 to string
		params= atob(params);	
		//convert into json object
		var obj= JSON.parse('{"' + decodeURI(params).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
		return obj;
	}
	return null;
}