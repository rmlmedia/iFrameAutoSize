/* -----------------------
 * iFrame Auto Size Script
 * -----------------------
 * This script is used to create auto sizing iFrames, even if they are served from a different domain.
 * NB: This script needs to be loaded into the parent page AND the embedded page so you need access to include the script on the iFrame domain
 *
 * Usage: http://scripts.deependmelbourne.com.au/iFrameAutoSize.html
 * 
 * Author: Rick Lannan, Deepend
 * Version: 1.1 
 * References: http://stackoverflow.com/questions/153152/resizing-an-iframe-based-on-content
 * Copyright (C): Rick Lannan, 2013 
 * Distibution & Modification: GNU License, please give credit
 *
 * -----------
 * GNU Licence
 * -----------
 * @source: https://github.com/rmlmedia/iFrameAutoSize/blob/master/src/iFrameAutoSize.js
 *
 * @licstart  The following is the entire license notice for the JavaScript code in this page.
 *
 * Copyright (C) 2012  Loic J. Duros
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice for the JavaScript code in this page.
 */

var iFrameAutoSize = {
	iFrameSettings: null,

	/* This function should be called from the parent page to construct the auto sizing iFrame
	 *
	 * -------
	 * Options:
	 * -------
	 * domId: The id of the DOM element to add the iFrame to
	 * iFrameUrl: The src of the iFrame
	 * resizeHelperUrl: The url of the helper frame that passes the page dimensions back to the parent (must be served from the same domain as the parent)
	 * loaderUrl: A Url of a loader GIF that should be shown. Default to '' (no loader)
	 * waitForPageLoad: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to false
	 * adjustWidth: A boolean indicating if the iFrame width should adjust. Defaults to false
	 * initialWidth: The initial width of the iFrame. Defaults to 100%
	 * initialHeight: The initial height of the iFrame. Defaults to 0px
	 * additionalCSS: Extra CSS to set on the iFrame
	 * onResize: Function to run when iFrame resized
	 */
	create: function(options) {
		var settings = {
			domId: (options && options.domId ? options.domId : ''),
			iFrameUrl: (options && options.iFrameUrl ? options.iFrameUrl : ''),
			resizeHelperUrl: (options && options.resizeHelperUrl ? options.resizeHelperUrl : ''),
			loaderUrl: (options && options.loaderUrl ? options.loaderUrl : ''),
			waitForPageLoad: (options && options.waitForPageLoad ? options.waitForPageLoad : false),
			adjustWidth: (options && options.adjustWidth ? options.adjustWidth : false),
			initialWidth: (options && options.initialWidth ? options.initialWidth : '100%'),
			initialHeight: (options && options.initialHeight ? options.initialHeight : '0px'),
			additionalCSS: (options && options.additionalCSS ? options.additionalCSS : ''),
			onResize: (options && options.onResize ? options.onResize : null)
		}

		// Check we have been passed the required parameters
		if (settings.domId && settings.iFrameUrl && settings.resizeHelperUrl) {

			// Change the protocol of resizeHelperUrl if it doesn't match the page
			settings.resizeHelperUrl = settings.resizeHelperUrl.replace(/^(https?:)?\/\//i, window.location.protocol + "//");
			// Convert from a relative url to an abolute
			if (settings.resizeHelperUrl.indexOf("/") == 0) settings.resizeHelperUrl = window.location.protocol + "//" + window.location.host + settings.resizeHelperUrl;
			if (settings.resizeHelperUrl.indexOf("http") != 0) settings.resizeHelperUrl = window.location.href.replace(/[^\/]*$/, "") + settings.resizeHelperUrl;

			var container = document.getElementById(settings.domId);
			if (container) {

				//Create the settings for this iFrame
				if (!iFrameAutoSize.iFrameSettings) iFrameAutoSize.iFrameSettings = new Array();
				iFrameAutoSize.iFrameSettings[settings.domId] = {
					iFrame: null,
					loader: null,
					adjustWidth: false,
					onResize: null
				}
				var iFrameSettings = iFrameAutoSize.iFrameSettings[settings.domId];

				function createResizingIFrame() {
					if (settings.adjustWidth) iFrameSettings.adjustWidth = settings.adjustWidth;
					iFrameSettings.iFrame = document.getElementById('iFrameAutoSize-' + settings.domId);
					if (settings.onResize) iFrameSettings.onResize = settings.onResize;
					if (!iFrameSettings.iFrame) {
						iFrameSettings.iFrame = document.createElement('IFRAME');
						iFrameSettings.iFrame.style.width = settings.initialWidth;
						iFrameSettings.iFrame.style.height = settings.initialHeight;
						iFrameSettings.iFrame.style.border = 0;
						iFrameSettings.iFrame.setAttribute('frameborder', 0);
						iFrameSettings.iFrame.setAttribute('frameBorder', 0);  // IE7 hack
						iFrameSettings.iFrame.setAttribute('border', 0);
						iFrameSettings.iFrame.setAttribute('cellspacing', 0);
						iFrameSettings.iFrame.setAttribute('marginwidth', 0);
						iFrameSettings.iFrame.setAttribute('marginheight', 0);
						iFrameSettings.iFrame.setAttribute('scrolling', 'no');
						iFrameSettings.iFrame.setAttribute('id', 'iFrameAutoSize-' + settings.domId);
						container.appendChild(iFrameSettings.iFrame);
					}
					iFrameSettings.iFrame.setAttribute('src', settings.iFrameUrl + (settings.iFrameUrl.indexOf('?') == -1 ? '?' : '&') + (settings.resizeHelperUrl ? 'helperUrl=' + encodeURIComponent(settings.resizeHelperUrl) : '') + '&parentDomId=' + settings.domId);
				}

				// Show the loader
				if (settings.loaderUrl) {
					iFrameSettings.loader = document.createElement('IMG');
					iFrameSettings.loader.setAttribute('src', settings.loaderUrl);
					iFrameSettings.loader.style.display = 'block';
					iFrameSettings.loader.style.margin = '0 auto';
					iFrameSettings.loader.setAttribute('id', 'iFrameAutoSize-' + settings.domId + '-loader');
					iFrameSettings.loader.setAttribute('class', 'iFrameAutoSize-loader');
					container.appendChild(iFrameSettings.loader);
				}

				// If waiting for the window.onload event, add the binding
				if (settings.waitForPageLoad) {
					iFrameAutoSize.helpers.addDomEvent(window, 'load', createResizingIFrame);
				} else {
					createResizingIFrame();
				}

			}

		}
	},

	/* This function can be called from the embeded page to force the page to be loaded in a parent frame
	 *
	 * -------
	 * Options:
	 * -------
	 * parentUrl: The url the iFrame will be loaded into if it is directly accessed (i.e. not loaded within an iFrame)
	 */
	forceParentFrame: function(options) {
		var settings = {
			parentUrl: (options && options.parentUrl ? options.parentUrl : '')
		}
		// If this page was accessed directly (i.e. it's not an iFrame), reload the page using the embed url
		if (settings.parentUrl && window.self === window.top) {
			window.location.href = settings.parentUrl + (settings.parentUrl.indexOf('?') == -1 ? '?' : '&') + 'frameUrl=' + encodeURIComponent(window.location.href);
		}
	},

	/* This function should be called from the embeded page to allow for page size data to be passed back to the parent page
	 *
	 * -------
	 * Options:
	 * -------
	 * resizeHelperUrl: The url of the helper frame that passes the page dimensions back to the parent (must be served from the same domain as the parent)
	 * domId: Will use this dom element to get sizings, can return better results cross browser to use a wrapper div. If element not found the body element will be used to determine the page size
	 * parentDomId: The id of the dom element comtaining the iFrame on the parent page
	 * resizeOnLoadOnly: This controls if the iFrame will keep sending messages to the parent to adjust the size. Defaults to false
	 * waitForPageLoad: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to true
	 * useCookie: A boolean indicating if the resize helper URL should be stored in a cookie. Defaults to true
	 */
	resize: function(options) {
		var settings = {
			resizeHelperUrl: (options && options.resizeHelperUrl ? options.resizeHelperUrl : ''),
			domId: (options && options.domId ? options.domId : ''),
			parentDomId: (options && options.parentDomId ? options.parentDomId : ''),
			resizeOnLoadOnly: (options && options.resizeOnLoadOnly ? options.resizeOnLoadOnly : false),
			waitForPageLoad: (options && options.waitForPageLoad ? options.waitForPageLoad : false),
			useCookie: (options && options.useCookie ? options.useCookie : true)
		}
		// Get the url of the helper frame from the query string parameters if not already provided
		if (!settings.resizeHelperUrl) {
			settings.resizeHelperUrl = decodeURIComponent(iFrameAutoSize.helpers.getQueryStringParam(window.location.search, 'helperUrl'));
		}
		// Get the url of the helper frame from a cookie if not already provided
		if (settings.useCookie && !settings.resizeHelperUrl) {
			settings.resizeHelperUrl = iFrameAutoSize.helpers.getCookie('iFrameAutoSize_helperUrl');
		}

		// Get the id of the dom element containing the iFrame on the parent page from the query string parameters if not already provided
		if (!settings.parentDomId) {
			settings.parentDomId = decodeURIComponent(iFrameAutoSize.helpers.getQueryStringParam(window.location.search, 'parentDomId'));
		}
		// Get the id of the dom element containing the iFrame on the parent page from a cookie if not already provided
		if (settings.useCookie && !settings.parentDomId) {
			settings.parentDomId = iFrameAutoSize.helpers.getCookie('iFrameAutoSize_parentDomId');
		}

		// Run this resize process if we have a URL for the helper frame and an ID for the dom element on the parent page
		if (settings.resizeHelperUrl && settings.parentDomId) {

			// Store the url of the helper frame and parent dom id in a cookie (persists the settings if the page within the frame changes)
			if (settings.useCookie) {
				iFrameAutoSize.helpers.setCookie('iFrameAutoSize_helperUrl', settings.resizeHelperUrl);
				iFrameAutoSize.helpers.setCookie('iFrameAutoSize_parentDomId', settings.parentDomId);
			}

			// Function to inject an iframe from the parent domain that calls a JS function in the parent domain (neatly gets around cross domain scripting issues)
			function pipeDimensionsToParentIFrame()	{
				// Get the page height and width
				var pageDimensions = iFrameAutoSize.helpers.getPageDimensions();
				if (settings.domId) {
					pageDimensions = iFrameAutoSize.helpers.getDimensions(settings.domId);
				}

				// 'Pipe' the page dimensions to the parent through the injected helper frame (which is on the same domain as the parent)
				var pipe = document.getElementById('iFrameAutoSizePipe');
				if (!pipe) {
					pipe = document.createElement('IFRAME');
					pipe.style.width = 0;
					pipe.style.height = 0;
					pipe.setAttribute('frameborder', 0);
					pipe.setAttribute('id', 'iFrameAutoSizePipe');
					pipe.setAttribute('visibility', 'hidden');
					document.body.appendChild(pipe);
				}

				if (!iFrameAutoSize.iFrameSettings) {
					iFrameAutoSize.iFrameSettings = {
						currHeight: 0,
						currWidth: 0,
						sizeAdjusted: false,
						frameLoaded: false
					}
				}
				var iFrameSettings = iFrameAutoSize.iFrameSettings;
				if (pageDimensions.height != iFrameSettings.currHeight || pageDimensions.width != iFrameSettings.currWidth) {
					iFrameSettings.currWidth = pageDimensions.width;
					iFrameSettings.currHeight = (iFrameSettings.frameLoaded ? pageDimensions.height : 0);
					if (!iFrameSettings.sizeAdjusted) {
						pipe.setAttribute('src', settings.resizeHelperUrl + '?domId=' + settings.parentDomId + '&height=' + iFrameSettings.currHeight + '&width=' + iFrameSettings.currWidth + '&cacheb=' + Math.random());
					}
					if (!iFrameSettings.frameLoaded) {
						iFrameSettings.frameLoaded = true;
					} else {
						iFrameSettings.sizeAdjusted = true;
					}
				} else {
					iFrameSettings.sizeAdjusted = false;
				}

				// Set a timeout to continually adjust the page size
				if (!settings.resizeOnLoadOnly || !iFrameSettings.frameLoaded) setTimeout(pipeDimensionsToParentIFrame, 100);
			}

			// If wating for the window.onload event, add the binding
			if (settings.waitForPageLoad) {
				iFrameAutoSize.helpers.addDomEvent(window, 'load', pipeDimensionsToParentIFrame);
			} else {
				pipeDimensionsToParentIFrame();
			}

		}
	},

	helpers: {
		// Private function called from the iFrameAutoSizeHelper.html to resize the iframe to fit the page contained within
		resizeIFrame: function(domId, width, height) {
			var iFrameSettings = iFrameAutoSize.iFrameSettings[domId];
			if (iFrameSettings && iFrameSettings.iFrame) {
				iFrameSettings.iFrame.style.height = parseInt(height) + 'px';
				if (iFrameSettings.adjustWidth) {
					iFrameSettings.iFrame.style.width = parseInt(width) + 'px';
				} else {
					iFrameSettings.iFrame.style.width = '100%';
				}
				// Call the on resize function if it is defined
				if (typeof(iFrameSettings.onResize) == "function") {
					iFrameSettings.onResize.apply(iFrameSettings.iFrame);
				}
				if (iFrameSettings.loader && height > 1) {
					iFrameSettings.loader.style.display = 'none';
				}
			}
		},

		// Cross browser function to add an event to a DOM object
		addDomEvent: function(elem, type, eventHandle) {
			if (elem == null || elem == undefined) return;
			if (elem.addEventListener) {
				elem.addEventListener(type, eventHandle, false);
			} else if (elem.attachEvent) {
				elem.attachEvent('on' + type, eventHandle);
			} else {
				elem['on' + type] = eventHandle;
			}
		},

		// Cross browser function to get page dimensions
		getPageDimensions: function() {
			var d = document;
			return {
				width: Math.max(
					Math.max(d.body.scrollWidth, d.documentElement.scrollWidth),
					Math.max(d.body.offsetWidth, d.documentElement.offsetWidth),
					Math.max(d.body.clientWidth, d.documentElement.clientWidth)
				),
				height: Math.max(
					Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
					Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
					Math.max(d.body.clientHeight, d.documentElement.clientHeight)
				)
			}
		},

		// Cross browser function to get the dimensions of a DOM element
		getDimensions: function(domId) {
			var e = document.getElementById(domId);
			if (e) {
				return {
					width: Math.max(Math.max(e.scrollWidth, e.offsetWidth), e.clientWidth),
					height: Math.max(Math.max(e.scrollHeight, e.offsetHeight), e.clientHeight)
				}
			} else {
				return getPageDimensions();
			}
		},

		// Cross browser function to get a session cookie
		setCookie: function(key, value) {
			document.cookie = key + "=" + escape(value);
		},

		// Cross browser function to get a session cookie
		getCookie: function(key) {
			key = key.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); //escape the regular expression characters
			var regexS = "(^|[;,\\s])" + key + "\\s?=\\s?([^;,\\s]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(document.cookie);
			if (results == null) {
				return "";
			} else {
				return unescape(results[2]);
			}
		},

		// Cross browser function to get a query string parameter
		getQueryStringParam: function(params, name) {
			name = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"); //escape the regular expression characters
			var regexS = "[\\?&]" + name + "=([^&#]*)";
			var regex = new RegExp(regexS);
			var results = regex.exec(params);
			if (results == null) {
				return "";
			} else {
				return results[1];
			}
		}
	}
}