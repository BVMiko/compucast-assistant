

// /*
// This is the page for which we want to rewrite the User-Agent header.
// */
// var targetPage = "https://httpbin.org/*";

// /*
// Set UA string to Opera 12
// */
// var ua = "Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16";

// /*
// Rewrite the User-Agent header to "ua".
// */
// function rewriteUserAgentHeader(e) {
//   for (var header of e.requestHeaders) {
//     if (header.name.toLowerCase() === "user-agent") {
//       header.value = ua;
//     }
//   }
//   return {requestHeaders: e.requestHeaders};
// }

// /*
// Add rewriteUserAgentHeader as a listener to onBeforeSendHeaders,
// only for the target page.

// Make it "blocking" so we can modify the headers.
// */
// chrome.webRequest.onBeforeSendHeaders.addListener(
// 	rewriteUserAgentHeader,
// 	null,
// 	// {urls: [targetPage]},
// 	["blocking", "requestHeaders"]
// );



// var currentTab = null;
// var currentTabParser = null;
// var currentTabSearch = [];

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
// 	currentTab = tabs[0];
// 	explodeQueryString(currentTab.url);
// });

function explodeQueryString(qs) {
	var ret = [];
	if (qs != "") {
		var vars = qs.substring(1).split("&");
		for (var i = 0; i < vars.length; i++) {
			var [key, val] = vars[i].split('=', 2);
			key = decodeURIComponent(key);
			val = val === undefined ? undefined : decodeURIComponent(val);
			if (key.substr(-2) == "[]") {
				key = key.substr(0, key.length - 2);
				if (!Array.isArray(ret[key])) ret[key] = [];
				ret[key].push(val);
			} else {
				ret[key] = val;
			}
		}
	}
	// console.log('original qs:',  qs);
	// console.log('exploded qs:',  ret);
	return ret;
}

function implodeQueryString(bits) {
	var ret = Object.entries(bits).map(function(pair) {
		const [key, val] = pair;
		if (Array.isArray(val)) {
			var subret = [];
			val.forEach(function (subval) { subret.push(encodeURIComponent(key + "[]") + "=" + encodeURIComponent(subval)); });
			return subret.join("&");
		} else if (val === undefined) {
			return encodeURIComponent(key);
		} else {
			return encodeURIComponent(key) + "=" + encodeURIComponent(val);
		}
	}).join("&");
	// console.log('imploded qs:',  ret.length ? '?'+ret : '');
	return ret.length ? '?'+ret : '';
}

// document.querySelector('button#toggle_pagespeed').addEventListener('click', function(e) {
// 	currentTabSearch['ModPagespeed'] = (currentTabSearch['ModPagespeed'] == "off") ? "on" : "off";

// 	currentTabParser.search = implodeQueryString();
// 	chrome.tabs.update(currentTab.id, {url: currentTabParser.href });

// });






//////////////////////////////////// CHROME STORAGE API ////////////////////////////////////
// https://developer.chrome.com/extensions/storage#type-StorageArea
// //  Usage:

// //  PERSISTENT Storage - Globally
// //  Save data to storage across their browsers...

// chrome.storage.sync.set({ "yourBody": "myBody" }, function(){
//     //  A data saved callback omg so fancy
// });

// chrome.storage.sync.get(/* String or Array */["yourBody"], function(items){
//     //  items = [ { "yourBody": "myBody" } ]
// });

// //  LOCAL Storage

// // Save data to storage locally, in just this browser...

// chrome.storage.local.set({ "phasersTo": "awesome" }, function(){
//     //  Data's been saved boys and girls, go on home
// });

// chrome.storage.local.get(/* String or Array */["phasersTo"], function(items){
//     //  items = [ { "phasersTo": "awesome" } ]
// });







var domainMods = [];
chrome.storage.local.get(["domainMods"], function(items){
	if ('domainMods' in items) {
		domainMods = items['domainMods'];
	}
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	var parser = document.createElement("a");
	parser.href = details.url;

	if (parser.hostname in domainMods) {
		currMods = domainMods[parser.hostname];
		var exploded = explodeQueryString(parser.search);
		if ("ModPagespeed" in currMods && currMods["ModPagespeed"] != undefined) {
			exploded['ModPagespeed'] = currMods["ModPagespeed"];
		}
		if ("admin" in currMods && currMods["admin"] != undefined) {
			exploded['admin'] = undefined;
		}
		if ("debug" in currMods && currMods["debug"] != undefined) {
			exploded['debug'] = undefined;
		}

		var imploded = implodeQueryString(exploded);
		if (parser.search != imploded) {
			parser.search = imploded;
			return { redirectUrl: parser.href };
		}
	}
}, {urls: ["<all_urls>"]}, ["blocking"]);


chrome.permissions.getAll(function(perm) {
	// console.log(perm);
});



function updateDomainMods(hostname, mod, value) {
	if (mod === undefined) {
		delete domainMods[hostname];
	} else if (!(hostname in domainMods)) {
		domainMods[hostname] = {};
		domainMods[hostname][mod] = value;
	} else {
		domainMods[hostname][mod] = value;
	}

	chrome.storage.local.set({ "domainMods": domainMods });
}





// chrome.webRequest.onBeforeSendHeaders.addListener(
// function(details) {
// 	console.log(details);
// 	for (var i = 0; i < details.requestHeaders.length; ++i) {
// 		if (details.requestHeaders[i].name === 'User-Agent') {
// 			details.requestHeaders.splice(i, 1);
// 			break;
// 		}
// 	}
// 	return {requestHeaders: details.requestHeaders};
// },
// {urls: ["<all_urls>"]},
// ["blocking", "requestHeaders"]);





