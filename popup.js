var background = chrome.extension.getBackgroundPage();
var currentTab = null;
var currentTabUrl = null;

var toggle_pagespeed = document.querySelector('[data-key="ModPagespeed"]');
var toggle_admin = document.querySelector('[data-key="admin"]');
var toggle_debug = document.querySelector('[data-key="debug"]');
var toggle_ga_debug = document.querySelector('[data-key="ga_debug"]');

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
	currentTab = tabs[0];

	currentTabUrl = document.createElement("a");
	currentTabUrl.href = currentTab.url;

	if (currentTabUrl.hostname in background.domainMods) {
		toggle_pagespeed.dataset.value = background.domainMods[currentTabUrl.hostname]["ModPagespeed"];
		toggle_admin.dataset.value = background.domainMods[currentTabUrl.hostname]["admin"];
		toggle_debug.dataset.value = background.domainMods[currentTabUrl.hostname]["debug"];
		toggle_ga_debug.dataset.value = background.domainMods[currentTabUrl.hostname]["ga_debug"];
	} else {
		// authorize tab via optional permissions!!
	}
});

function dual_switch_click(e) {
	this.dataset.value = (this.dataset.value == "undefined") ? "on" : "undefined";
	background.updateDomainMods(currentTabUrl.hostname, this.dataset.key, this.dataset.value == "undefined" ? undefined : this.dataset.value);
	// chrome.tabs.reload(currentTab.id, { bypassCache:true });

	var exploded = background.explodeQueryString(currentTabUrl.search);
	delete exploded[this.dataset.key];
	currentTabUrl.search = background.implodeQueryString(exploded);
	chrome.tabs.update(currentTab.id, {url: currentTabUrl.href});

}

function tri_switch_click(e) {
	if (e.offsetX < (this.clientWidth/2)) { // click on the left
		this.dataset.value = (this.dataset.value == "undefined") ? "off" : "undefined";
	} else {
		this.dataset.value = (this.dataset.value == "undefined") ? "on" : "undefined";
	}
	background.updateDomainMods(currentTabUrl.hostname, this.dataset.key, this.dataset.value == "undefined" ? undefined : this.dataset.value);
	// chrome.tabs.reload(currentTab.id, { bypassCache:true });

	var exploded = background.explodeQueryString(currentTabUrl.search);
	delete exploded[this.dataset.key];
	currentTabUrl.search = background.implodeQueryString(exploded);
	chrome.tabs.update(currentTab.id, {url: currentTabUrl.href});

}

toggle_pagespeed.addEventListener('click', tri_switch_click);
toggle_admin.addEventListener('click', dual_switch_click);
toggle_debug.addEventListener('click', dual_switch_click);
toggle_ga_debug.addEventListener('click', dual_switch_click);


// document.querySelector('button#reset').addEventListener('click', function(e) {
// 	background.updateDomainMods(currentTabUrl.hostname);

// 	var exploded = background.explodeQueryString(currentTabUrl.search);
// 	delete exploded["ModPagespeed"];
// 	delete exploded["admin"];
// 	delete exploded["debug"];
// 	currentTabUrl.search = background.implodeQueryString(exploded);
// 	chrome.tabs.update(currentTab.id, {url: currentTabUrl.href});

// });


