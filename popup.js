var background = chrome.extension.getBackgroundPage();
var currentTab = null;
var currentTabUrl = null;

var toggle_pagespeed = document.querySelector('[data-key="PageSpeed"]');
var toggle_admin = document.querySelector('[data-key="admin"]');
var toggle_debug = document.querySelector('[data-key="debug"]');
var toggle_tracking = document.querySelector('[data-key="tracking"]');
var toggle_ga_debug = document.querySelector('[data-key="ga_debug"]');
var button_toggle_dev = document.querySelector('button#toggle_dev');
var button_domain_reset = document.querySelector('button#domain_reset');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	currentTab = tabs[0];
	currentTabUrl = new URL(currentTab.url.startsWith('view-source:') ? currentTab.url.slice(12) : currentTab.url);

	if (background.ga_debug) toggle_ga_debug.dataset.value = "on";

	if (currentTabUrl.hostname in background.domains) {
		if ("PageSpeed" in background.domains[currentTabUrl.hostname]) toggle_pagespeed.dataset.value = background.domains[currentTabUrl.hostname]["PageSpeed"];
		if ("admin" in background.domains[currentTabUrl.hostname]) toggle_admin.dataset.value = background.domains[currentTabUrl.hostname]["admin"];
		if ("debug" in background.domains[currentTabUrl.hostname]) toggle_debug.dataset.value = background.domains[currentTabUrl.hostname]["debug"];
		if ("tracking" in background.domains[currentTabUrl.hostname]) toggle_tracking.dataset.value = background.domains[currentTabUrl.hostname]["tracking"];
	} else {
		// authorize tab via optional permissions!!
	}
});

function dual_switch_click(e) {
	if (this.dataset.value === undefined) {
		this.dataset.value = "on";
	} else {
		delete(this.dataset.value);
	}
	background.updateDomain(currentTabUrl.hostname, this.dataset.key, this.dataset.value);
	chrome.tabs.reload(currentTab.id, { bypassCache:true });
}

function tri_switch_click(e) {
	if (e.offsetX < (this.clientWidth/2) && this.dataset.value === undefined) { // click on the left
		this.dataset.value = "off";
	} else if (this.dataset.value === undefined) { // click on the right
		this.dataset.value = "on";
	} else { // already set, so unset
		delete(this.dataset.value);
	}
	background.updateDomain(currentTabUrl.hostname, this.dataset.key, this.dataset.value);
	chrome.tabs.reload(currentTab.id, { bypassCache:true });
}

function ga_debug_switch_click(e) {
	if (this.dataset.value === undefined) {
		this.dataset.value = "on";
	} else {
		delete(this.dataset.value);
	}
	background.ga_debug = this.dataset.value !== undefined;
	chrome.tabs.reload(currentTab.id, { bypassCache:true });
}

// function tracking_switch_click(e) {
// 	if (this.dataset.value === undefined) {
// 		this.dataset.value = "on";
// 	} else {
// 		delete(this.dataset.value);
// 	}
// 	background.tracking = this.dataset.value !== undefined;
// 	// chrome.tabs.reload(currentTab.id, { bypassCache:true });
// 	// chrome.runtime.onMessage.addListener(tracking_listener);
// 		chrome.tabs.executeScript({
// 			code: 'document.body.style.backgroundColor="orange"'
// 		});


// }

// function tracking_listener(message, callback) {
// 	// if (message == "changeColor"){
// 		chrome.tabs.executeScript({
// 			code: 'document.body.style.backgroundColor="orange"'
// 		});
// 	// }
// }




toggle_pagespeed.addEventListener("click", tri_switch_click);
toggle_admin.addEventListener("click", dual_switch_click);
toggle_debug.addEventListener("click", dual_switch_click);
toggle_tracking.addEventListener("click", dual_switch_click);
toggle_ga_debug.addEventListener("click", ga_debug_switch_click);



button_toggle_dev.addEventListener('click', function(e) {
	if (currentTabUrl.hostname.match(/\.compucastweb\.com$/)) {
		currentTabUrl.hostname = currentTabUrl.hostname.replace(/\.compucastweb.com$/, '.com');
	} else {
		currentTabUrl.hostname = currentTabUrl.hostname.replace(/\.com$/, '.compucastweb.com');
	}
	chrome.tabs.update(currentTab.id, {url: currentTabUrl.href});
});
button_toggle_dev.addEventListener('auxclick', function(e) {
	if (currentTabUrl.hostname.match(/\.compucastweb\.com$/)) {
		currentTabUrl.hostname = currentTabUrl.hostname.replace(/\.compucastweb.com$/, '.com');
	} else {
		currentTabUrl.hostname = currentTabUrl.hostname.replace(/\.com$/, '.compucastweb.com');
	}
	// TODO: this pollutes the currentTabUrl variable
	chrome.tabs.create({ url:currentTabUrl.href, active:false, index:currentTab.index+1 });
});
// button_domain_reset.addEventListener('click', function(e) {
// 	background.updateDomain(currentTabUrl.hostname);

// 	var exploded = background.explodeQueryString(currentTabUrl.search);
// 	delete exploded["PageSpeed"];
// 	delete exploded["admin"];
// 	delete exploded["debug"];
// 	currentTabUrl.search = background.implodeQueryString(exploded);
// 	chrome.tabs.update(currentTab.id, {url: currentTabUrl.href});

// });


// // Temp test for oauth
// document.querySelector('button#oauth').addEventListener('click', function() {
// 	url = new URL('https://auth.compucast.com/authorize');
// 	url.searchParams.set('response_type', 'code');
// 	url.searchParams.set('client_id', 'compucast-assistant');
// 	url.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
// 	// url.searchParams.set('scope', 'openid basic');
// 	url.searchParams.set('state', 'xyz');
// 	chrome.identity.launchWebAuthFlow({url:url.href, interactive:true}, function(responseUrl) {
// 		rurl = new URL(responseUrl);
// 		if (rurl.searchParams.get('state') == url.searchParams.get('state')) {
// 			authcode = rurl.searchParams.get('code');

// 			url2 = new URL('https://auth.compucast.com/token');
// 			url2.searchParams.set('grant_type', 'authorization_code');
// 			url2.searchParams.set('client_id', 'compucast-assistant');
// 			url2.searchParams.set('client_secret', 'compucast-assistant');
// 			url2.searchParams.set('redirect_uri', chrome.identity.getRedirectURL());
// 			url2.searchParams.set('code', authcode);

// 			chrome.identity.launchWebAuthFlow({url:url2.href, interactive:true}, function(responseUrl) {
// 				return true;
// 			});

// 		}
// 	});

// 	// chrome.identity.getAuthToken({interactive: true}, function(token) {
// 	// 	console.log(token);
// 	// });
// });


