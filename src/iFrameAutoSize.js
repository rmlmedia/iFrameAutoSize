/* -----------------------
 * iFrame Auto Size Script
 * -----------------------
 * This script is used to create auto sizing iFrames, even if they are served from a different domain.
 * NB: This script needs to be loaded into the parent page AND the embedded page so you need access to include the script on the iFrame domain
 *
 * Usage: http://scripts.deependmelbourne.com.au/iFrameAutoSize.html
 * 
 * Author: Rick Lannan, Deepend
 * Version: 1.0 
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
	iFrame: null,
	loader: null,
	adjustWidth: false,
	currHeight: 0,
	currWidth: 0,
	sizeAdjusted: false,
	frameLoaded: false,

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
			additionalCSS: (options && options.additionalCSS ? options.additionalCSS : '')
		}

		// Check we have been passed the required parameters
		if (settings.domId && settings.iFrameUrl && settings.resizeHelperUrl) {
			var container = document.getElementById(settings.domId);
			if (container) {

				function createResizingIFrame() {
					if (settings.adjustWidth) iFrameAutoSize.adjustWidth = settings.adjustWidth;
					iFrameAutoSize.iFrame = document.getElementById('iFrameAutoSize-' + settings.domId);
					if (!iFrameAutoSize.iFrame) {
						iFrameAutoSize.iFrame = document.createElement('IFRAME');
						iFrameAutoSize.iFrame.style.width = settings.initialWidth;
						iFrameAutoSize.iFrame.style.height = settings.initialHeight;
						iFrameAutoSize.iFrame.style.border = 0;
						iFrameAutoSize.iFrame.setAttribute('frameborder', 0);
						iFrameAutoSize.iFrame.setAttribute('frameBorder', 0);  // IE7 hack
						iFrameAutoSize.iFrame.setAttribute('border', 0);
						iFrameAutoSize.iFrame.setAttribute('cellspacing', 0);
						iFrameAutoSize.iFrame.setAttribute('marginwidth', 0);
						iFrameAutoSize.iFrame.setAttribute('marginheight', 0);
						iFrameAutoSize.iFrame.setAttribute('scrolling', 'no');
						iFrameAutoSize.iFrame.setAttribute('id', 'iFrameAutoSize-' + settings.domId);
						container.appendChild(iFrameAutoSize.iFrame);
					}
					iFrameAutoSize.iFrame.setAttribute('src', settings.iFrameUrl + (settings.iFrameUrl.indexOf('?') == -1 ? '?' : '&') + (settings.resizeHelperUrl ? 'helperUrl=' + encodeURIComponent(settings.resizeHelperUrl) : ''));
				}

				// Show the loader
				if (settings.loaderUrl) {
					iFrameAutoSize.loader = document.createElement('IMG');
					iFrameAutoSize.loader.setAttribute('src', settings.loaderUrl);
					iFrameAutoSize.loader.style.display = 'block';
					iFrameAutoSize.loader.style.margin = '0 auto';
					iFrameAutoSize.loader.setAttribute('id', 'iFrameAutoSize-loader');
					container.appendChild(iFrameAutoSize.loader);
				}

				// If wating for the window.onload event, add the binding
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
	 * resizeOnLoadOnly: This controls if the iFrame will keep sending messages to the parent to adjust the size. Defaults to false
	 * waitForPageLoad: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to true
	 */
	resize: function(options) {
		var settings = {
			resizeHelperUrl: (options && options.resizeHelperUrl ? options.resizeHelperUrl : ''),
			domId: (options && options.domId ? options.domId : ''),
			resizeOnLoadOnly: (options && options.resizeOnLoadOnly ? options.resizeOnLoadOnly : false),
			waitForPageLoad: (options && options.waitForPageLoad ? options.waitForPageLoad : false)
		}
		// Get the url of the helper frame from the query string parameters if not already provided
		if (!settings.resizeHelperUrl) {
			settings.resizeHelperUrl = decodeURIComponent(iFrameAutoSize.helpers.getQueryStringParam(window.location.search, 'helperUrl'));
		}

		// Run this resize process if we have a URL for the helper frame
		if (settings.resizeHelperUrl) {

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

				if (pageDimensions.height != iFrameAutoSize.currHeight || pageDimensions.width != iFrameAutoSize.currWidth) {
					iFrameAutoSize.currWidth = pageDimensions.width;
					iFrameAutoSize.currHeight = (iFrameAutoSize.frameLoaded ? pageDimensions.height : 0);
					if (!iFrameAutoSize.sizeAdjusted) {
						pipe.setAttribute('src', settings.resizeHelperUrl + '?height=' + iFrameAutoSize.currHeight + '&width=' + iFrameAutoSize.currWidth + '&cacheb=' + Math.random());
					}
					if (!iFrameAutoSize.frameLoaded) {
						iFrameAutoSize.frameLoaded = true;
					} else {
						iFrameAutoSize.sizeAdjusted = true;
					}
				} else {
					iFrameAutoSize.sizeAdjusted = false;
				}

				// Set a timeout to continually adjust the page size
				if (!settings.resizeOnLoadOnly || !iFrameAutoSize.frameLoaded) setTimeout(pipeDimensionsToParentIFrame, 100);
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
		resizeIFrame: function(width, height) {
			if (iFrameAutoSize.iFrame) {
				iFrameAutoSize.iFrame.style.height = parseInt(height) + 'px';
				if (iFrameAutoSize.adjustWidth) {
					iFrameAutoSize.iFrame.style.width = parseInt(width) + 'px';
				} else {
					iFrameAutoSize.iFrame.style.width = '100%';
				}
			}
			if (iFrameAutoSize.loader && height > 1) {
				iFrameAutoSize.loader.style.display = 'none';
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

		// Helper function, parse param from request string
		getQueryStringParam: function(params, name) {
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
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