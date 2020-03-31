//shortcut for standard ajax GET (json) calls,
//performs some preliminary actions on .fail() and .always(),
//but returns the Promise object allowing for additional actions with the data
function stdGet(settings, queryString, alertOnFail){
		settings = {
			url: "http://localhost:8080/users/dd",
			// data: "{\"firstName\":\"Yilin2\",\"lastName\":\"Bai2\",\"email\":\"ybai060@uottawa.ca\",\"password\":\"baiyilin\"}",
			type: "GET",
			dataType: 'json'  // 请求方式为jsonp
			// headers: { Authorization: "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ6aGFveWk4NjUwODgxQGdtYWlsLmNvbSIsImV4cCI6MTU4NDA2ODA2OX0.kVzOqoBdzRRyL6bWt8UAuqzonYEJcHowYXMtskVwHq2_KTV5UliuMAa8HuRurEPUm02Lb0pKpr8AC5oE9ObBqQ" },
			// headers: { "Authorization": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ5YmFpMDYwQHVvdHRhd2EuY2EiLCJleHAiOjE1ODU2NzQ0MDh9.GYUteQKB3UNbJufPl4iNCi3CKcTv6a_ob32TlnJsc-B-e1sdQCX51oiiq1TlmWMpgoQNtD2_6_5uX8SD-tAXFw"



		
		}	
	console.log(settings.type, settings.url);
	
	return $.ajax(settings)
	.fail(function( xhr, status, errorThrown ) {
		if(alertOnFail != false && errorThrown != "abort")
			alert("failed");
		console.log( "Error: " + errorThrown );
	 	console.log( "Status: " + status );
	 	console.dir( xhr );
	})
	.always (function() {
		console.log( "The request is complete!" );
	});
}

// var std = stdGet("" + "", "");
//     //    var std = stdGetLocal(prod+"wsapi/meters/3/4/getId","");
//     std.done(function(Data) {
//         if (Data === undefined) {
//             alert("undefined");
//             return;
//         }
//        console.log(Data);
//     });
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {

    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);

  } else if (typeof XDomainRequest != "undefined") {

    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);

  } else {

    // Otherwise, CORS is not supported by the browser.
    xhr = null;

  }
  return xhr;
}

var xhr = createCORSRequest('GET', "http://localhost:8080/users/du");
if (!xhr) {
	console.log("ASD");
  throw new Error('CORS not supported');
}else {
	console.log ("ASD");
}
var url = "http://localhost:8080/users/du";
var xhr = createCORSRequest('GET', url);
xhr.send();
