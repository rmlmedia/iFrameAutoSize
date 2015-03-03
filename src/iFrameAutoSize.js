/* -----------------------
 * iFrame Auto Size Script
 * -----------------------
 * This script is used to create auto sizing iFrames, even if they are served from a different domain.
 * NB: This script needs to be loaded into the parent page AND the embedded page so you need access to include the script on the iFrame domain
 *
 * Usage: http://scripts.deependmelbourne.com.au/iFrameAutoSize.html
 * 
 * Author: Rick Lannan, Deepend
 * Version: 1.2 
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

if (!iFrameAutoSize) {
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
		 * minHeight: Optional parameter to set a minumum height when calculating frame height. Defaults to 0
		 * scrollOnResize: A boolean indicating if the page should be scrolled to the top of the frame on a resize
		 * additionalCSS: Extra CSS to set on the iFrame
		 * loaderCSS: Extra CSS to set on the loader image. Defaults to 'display: block; margin: 0 auto'
		 * onResize: Function to run when iFrame resized
		 */
		create: function(options) {
			var settings = {
				domId: (typeof(options) != 'undefined' && typeof(options.domId) != 'undefined' ? options.domId : ''),
				iFrameUrl: (typeof(options) != 'undefined' && typeof(options.iFrameUrl) != 'undefined' ? options.iFrameUrl : ''),
				resizeHelperUrl: (typeof(options) != 'undefined' && typeof(options.resizeHelperUrl) != 'undefined' ? options.resizeHelperUrl : ''),
				loaderUrl: (typeof(options) != 'undefined' && typeof(options.loaderUrl) != 'undefined' ? options.loaderUrl : ''),
				waitForPageLoad: (typeof(options) != 'undefined' && typeof(options.waitForPageLoad) != 'undefined' ? options.waitForPageLoad : false),
				adjustWidth: (typeof(options) != 'undefined' && typeof(options.adjustWidth) != 'undefined' ? options.adjustWidth : false),
				initialWidth: (typeof(options) != 'undefined' && typeof(options.initialWidth) != 'undefined' ? options.initialWidth : '100%'),
				initialHeight: (typeof(options) != 'undefined' && typeof(options.initialHeight) != 'undefined' ? options.initialHeight : '0px'),
				minHeight: (typeof(options) != 'undefined' && typeof(options.minHeight) != 'undefined' ? options.minHeight.replace(/ ?px/, '') : 0),
				scrollOnResize: (typeof(options) != 'undefined' && typeof(options.scrollOnResize) != 'undefined' ? options.scrollOnResize : true),
				additionalCSS: (typeof(options) != 'undefined' && typeof(options.additionalCSS) != 'undefined' ? options.additionalCSS : ''),
				loaderCSS: (typeof(options) != 'undefined' && typeof(options.loaderCSS) != 'undefined' ? options.loaderCSS : ''),
				onResize: (typeof(options) != 'undefined' && typeof(options.onResize) != 'undefined' ? options.onResize : null)
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
						domElem: container,
						iFrame: null,
						loader: null,
						adjustWidth: false,
						onResize: null,
						connectionId: '',
						messageNum: 0,
						minHeight: settings.minHeight,
						scrollOnResize: settings.scrollOnResize,
						pageLoaded: false
					}
					var iFrameSettings = iFrameAutoSize.iFrameSettings[settings.domId];

					function createResizingIFrame() {
						if (settings.adjustWidth) iFrameSettings.adjustWidth = settings.adjustWidth;
						iFrameSettings.iFrame = document.getElementById('iFrameAutoSize-' + settings.domId);
						if (settings.onResize) iFrameSettings.onResize = settings.onResize;
						if (!iFrameSettings.iFrame) {
							iFrameSettings.iFrame = document.createElement('IFRAME');
							iFrameSettings.iFrame.setAttribute('style', settings.additionalCSS);
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
							iFrameSettings.iFrame.setAttribute('class', 'iFrameAutoSize-iFrame');
							container.appendChild(iFrameSettings.iFrame);
						}
						iFrameSettings.iFrame.setAttribute('src', settings.iFrameUrl + (settings.iFrameUrl.indexOf('?') == -1 ? '?' : '&') + (settings.resizeHelperUrl ? 'helperUrl=' + encodeURIComponent(settings.resizeHelperUrl) : '') + '&parentDomId=' + settings.domId + '&pageLoading=true');
					}

					// Show the loader
					if (settings.loaderUrl) {
						iFrameSettings.loader = document.createElement('IMG');
						iFrameSettings.loader.setAttribute('src', settings.loaderUrl);
						iFrameSettings.loader.setAttribute('style', "display: block; margin: 0 auto; " + settings.loaderCSS);
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
				parentUrl: (typeof(options) != 'undefined' && typeof(options.parentUrl) != 'undefined' ? options.parentUrl : '')
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
		 * parentDomId: The id of the dom element containing the iFrame on the parent page
		 * resizeOnLoadOnly: This controls if the iFrame will keep sending messages to the parent to adjust the size. Defaults to false
		 * waitForPageLoad: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to true
		 * useCookie: A boolean indicating if the resize helper URL should be stored in a cookie. Defaults to true
		 */
		resize: function(options) {
			var settings = {
				resizeHelperUrl: (typeof(options) != 'undefined' && typeof(options.resizeHelperUrl) != 'undefined' ? options.resizeHelperUrl : ''),
				domId: (typeof(options) != 'undefined' && typeof(options.domId) != 'undefined' ? options.domId : ''),
				parentDomId: (typeof(options) != 'undefined' && typeof(options.parentDomId) != 'undefined' ? options.parentDomId : ''),
				resizeOnLoadOnly: (typeof(options) != 'undefined' && typeof(options.resizeOnLoadOnly) != 'undefined' ? options.resizeOnLoadOnly : false),
				waitForPageLoad: (typeof(options) != 'undefined' && typeof(options.waitForPageLoad) != 'undefined' ? options.waitForPageLoad : false),
				useCookie: (typeof(options) != 'undefined' && typeof(options.useCookie) != 'undefined' ? options.useCookie : true)
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

			// Run this resize process if we have a URL for the helper frame and an ID for the dom element on the parent page
			if (settings.resizeHelperUrl) {

				// Store the url of the helper frame and parent dom id in a cookie (persists the settings if the page within the frame changes)
				if (settings.useCookie) {
					iFrameAutoSize.helpers.setCookie('iFrameAutoSize_helperUrl', settings.resizeHelperUrl);
				}

				// Function to inject an iframe from the parent domain that calls a JS function in the parent domain (neatly gets around cross domain scripting issues)
				function pipeDimensionsToParentIFrame()	{
					// Get the page height and width
					var pageDimensions = iFrameAutoSize.helpers.getPageDimensions();
					if (settings.domId && document.getElementById(settings.domId)) {
						pageDimensions = iFrameAutoSize.helpers.getDimensions(document.getElementById(settings.domId));
					} else {
						var wrapperDiv = document.getElementsByTagName('div')[0];
						if (wrapperDiv) {
							var tempDimensions = iFrameAutoSize.helpers.getDimensions(wrapperDiv);
							if (tempDimensions.height > pageDimensions.height) pageDimensions.height = tempDimensions.height;
							if (tempDimensions.width > pageDimensions.width) pageDimensions.width = tempDimensions.width;
						}					
					}

					if (!iFrameAutoSize.iFrameSettings) iFrameAutoSize.iFrameSettings = new Array();
					if (!iFrameAutoSize.iFrameSettings[settings.parentDomId]) {
						iFrameAutoSize.iFrameSettings[settings.parentDomId] = {
							currHeight: 0,
							currWidth: 0,
							frameLoaded: false,
							messageNum: 1,
							connectionId: encodeURIComponent(window.location.href),
							pageLoading: (window.location.href.match(/&pageLoading=true$/) ? 'true' : 'false')
						}
					}
					var iFrameSettings = iFrameAutoSize.iFrameSettings[settings.parentDomId];
					if (pageDimensions.height != iFrameSettings.currHeight || pageDimensions.width != iFrameSettings.currWidth || (iFrameSettings.lastUrl && iFrameSettings.lastUrl != window.location.href)) {
						iFrameSettings.currWidth = pageDimensions.width;
						iFrameSettings.currHeight = (iFrameSettings.frameLoaded ? pageDimensions.height : 0);
						// Need to check if URL has changed as the HTML5 History API can change the URL and this needs to trigger a resize
						if (iFrameSettings.lastUrl && iFrameSettings.lastUrl != window.location.href) {
							iFrameSettings.connectionId = encodeURIComponent(window.location.href);
							iFrameSettings.messageNum = 1;
						}
						iFrameSettings.lastUrl = window.location.href;

						// 'Pipe' the page dimensions to the parent through the injected helper frame (which is on the same domain as the parent)
						if (!iFrameSettings.frameLoaded || iFrameSettings.currHeight != 0) {
							pipe = document.createElement('IFRAME');
							pipe.style.width = 0;
							pipe.style.height = 0;
							pipe.setAttribute('frameborder', 0);
							pipe.setAttribute('id', 'iFrameAutoSizePipe');
							pipe.setAttribute('visibility', 'hidden');
							pipe.setAttribute('src', settings.resizeHelperUrl + '?connectionId=' + iFrameSettings.connectionId + '&messageNum=' + iFrameSettings.messageNum + '&domId=' + settings.parentDomId + '&height=' + iFrameSettings.currHeight + '&width=' + iFrameSettings.currWidth + '&pageLoading=' + iFrameSettings.pageLoading);
							document.body.appendChild(pipe);
							iFrameSettings.messageNum += 1;
						}
						iFrameSettings.frameLoaded = true;
					}

					// Set a timeout to continually adjust the page size
					if (!settings.resizeOnLoadOnly || !iFrameSettings.frameLoaded) iFrameAutoSize.resizeInterval = setTimeout(pipeDimensionsToParentIFrame, 100);
				}

				// If wating for the window.onload event, add the binding
				if (settings.waitForPageLoad) {
					iFrameAutoSize.helpers.addDomEvent(window, 'load', pipeDimensionsToParentIFrame());
				} else {
					pipeDimensionsToParentIFrame();
				}

			}
		},

		helpers: {
			// Private function called from the iFrameAutoSizeHelper.html to resize the iframe to fit the page contained within
			resizeIFrame: function(connectionId, messageNum, domId, width, height, pageLoading) {
				var iFrameSettings = iFrameAutoSize.iFrameSettings[domId];
				var messageNumber = parseInt(messageNum);
				// If the frame could not be found, default to the frame that is visible on the page (determined by page position)
				if (!iFrameSettings) {
					var maxPercentageShown = -1;
					for (var currFrameSettings in iFrameAutoSize.iFrameSettings) {
						if (typeof(currFrameSettings) == 'string') currFrameSettings = iFrameAutoSize.iFrameSettings[currFrameSettings];
						if (currFrameSettings.iFrame) {
							// Remove the active class from all frames and go over them again to mark the active one (after loop)
							currFrameSettings.domElem.className = currFrameSettings.domElem.className.replace(/ iframe-active/, '');
							// If more of this frame is visible on the screen then set this frame as the active frame
							var percentageShown = iFrameAutoSize.helpers.getPercentageOfFrameVisible(currFrameSettings.iFrame);
							if (percentageShown > maxPercentageShown) {
								iFrameSettings = currFrameSettings;
								maxPercentageShown = percentageShown;
							}
						}
					}
					// Flag iFrame as active
					iFrameSettings.domElem.className = iFrameSettings.domElem.className + ' iframe-active';
				}
				if (iFrameSettings && iFrameSettings.iFrame) {
					// Only process this if this is a new message from the child page (caters for packets being received out of order)
					if (iFrameSettings.connectionId != connectionId) {
						iFrameSettings.connectionId = connectionId;
						iFrameSettings.messageNum = 0;
					}
					if (iFrameSettings.messageNum < messageNumber) {
						var pageLoaded = (iFrameSettings.pageLoaded || !pageLoading);
						// Store the packet number
						iFrameSettings.messageNum = messageNumber;
						// Resize the frame
						if (height > 0) {
							iFrameSettings.domElem.style.height = parseInt(Math.max(iFrameSettings.minHeight, height)) + 'px';
						}
						iFrameSettings.iFrame.style.height = parseInt(Math.max(iFrameSettings.minHeight, height)) + 'px';
						if (iFrameSettings.adjustWidth) {
							iFrameSettings.iFrame.style.width = parseInt(width) + 'px';
						} else {
							iFrameSettings.iFrame.style.width = '100%';
						}
						// Call the on resize function if it is defined
						if (typeof(iFrameSettings.onResize) == "function") {
							iFrameSettings.onResize.call(iFrameSettings.iFrame, pageLoaded);
						}
						// Scroll to the top of the frame if required
						if (pageLoaded && iFrameSettings.scrollOnResize) {
							iFrameSettings.pageLoaded = true;
							var topOfFrame = iFrameAutoSize.helpers.getPageOffset(iFrameSettings.iFrame).top;
							if (document.body.scrollTop) {
								document.body.scrollTop = topOfFrame;
							} else if (document.documentElement.scrollTop) {
								document.documentElement.scrollTop = topOfFrame;
							}
						}
						// Hide the loader
						if (iFrameSettings.loader && height > 1) {
							iFrameSettings.loader.style.display = 'none';
						}
					}
				}
			},

			// Get the percentage of the frame visible (used to determine which frame sent the last message)
			getPercentageOfFrameVisible: function(elem) {
				var frameDimensions = iFrameAutoSize.helpers.getDimensions(elem);
				var framePosition = iFrameAutoSize.helpers.getPageOffset(elem);
				var scrollPosition = iFrameAutoSize.helpers.getScrollPosition();
				var pixelsHiddenY = (scrollPosition.top - framePosition.top < 0 ? 0 : scrollPosition.top - framePosition.top);
				var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
				var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
				pixelsHiddenY += ((framePosition.top + frameDimensions.height - pixelsHiddenY) - (scrollPosition.top + windowHeight) < 0 ? 0 : (framePosition.top + frameDimensions.height - pixelsHiddenY) - (scrollPosition.top + windowHeight));
				var pixelsHiddenX = (scrollPosition.left - framePosition.left < 0 ? 0 : scrollPosition.left - framePosition.left);
				pixelsHiddenX += ((framePosition.left + frameDimensions.width - pixelsHiddenX) - (scrollPosition.left + windowWidth) < 0 ? 0 : (framePosition.left + frameDimensions.width - pixelsHiddenX) - (scrollPosition.left + windowWidth));
				var percentageVisibleY = (frameDimensions.height != 0 ? (frameDimensions.height - pixelsHiddenY) / frameDimensions.height * 100 : 1);
				var percentageVisibleX = (frameDimensions.width != 0 ? (frameDimensions.width - pixelsHiddenX) / frameDimensions.width * 100 : 1);
				var percentageShown = Math.min(percentageVisibleY, percentageVisibleX);
				return (percentageShown < 0 ? 0 : percentageShown);
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

			// Cross browser function to get the scroll position
			getScrollPosition: function() {
				var d = document;
				return {
					top: Math.max(d.body.scrollTop, d.documentElement.scrollTop),
					left: Math.max(d.body.scrollLeft, d.documentElement.scrollLeft)
				}
			},

			// Cross browser function to get the dimensions of a DOM element
			getDimensions: function(elem) {
				if (elem) {
					return {
						width: Math.max(Math.max(elem.scrollWidth, elem.offsetWidth), elem.clientWidth),
						height: Math.max(Math.max(elem.scrollHeight, elem.offsetHeight), elem.clientHeight)
					}
				} else {
					return iFrameAutoSize.helpers.getPageDimensions();
				}
			},

			// Cross browser function to get page offset of a DOM element
			getPageOffset: function(elem) {
				var x = 0;
				var y = 0;
				if (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
					x += elem.offsetLeft - elem.scrollLeft;
					y += elem.offsetTop - elem.scrollTop;
					elem = elem.offsetParent;
				}
				return { top: y, left: x };
			},

			// Cross browser function to get a session cookie
			setCookie: function(key, value) {
				document.cookie = key + "=" + escape(value) + "; path=/";
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
}