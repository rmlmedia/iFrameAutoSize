/* -----------------------
 * iFrame Auto Size Script
 * -----------------------
 * This script is used to create auto sizing iFrames, even if they are served from a different domain.
 * NB: This script needs to be loaded into the parent page AND the embedded page so you need access to include the script on the iFrame domain
 *
 * Usage: http://scripts.deependmelbourne.com.au/iFrameAutoSize
 * 
 * Author: Rick Lannan, Deepend
 * Version: 1.0 
 * References: http://stackoverflow.com/questions/153152/resizing-an-iframe-based-on-content
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
	 * id: The id of the DOM element to add the iFrame to
	 * iFrameUrl: The src of the iFrame
	 * resizeHelperUrl: The url of the helper frame that passes the page dimensions back to the parent (must be served from the same domain as the parent)
	 * loaderUrl: A Url of a loader GIF that shold be shown. Default to '' (no loader)
	 * runImmediately: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to false
	 * adjustWidth: A boolean indicating if the iFrame width should adjust. Defaults to false
	 * initialWidth: The initial width of the iFrame. Defaults to 100%
	 * initialHeight: The initial height of the iFrame. Defaults to 0px
	 * additionalCSS: Extra CSS to set on the iFrame
	 */
	create: function(options) {
		var settings = {
			divId: (options && options.divId ? options.divId : ''),
			iFrameUrl: (options && options.iFrameUrl ? options.iFrameUrl : ''),
			resizeHelperUrl: (options && options.resizeHelperUrl ? options.resizeHelperUrl : ''),
			loaderUrl: (options && options.loaderUrl ? options.loaderUrl : ''),
			runImmediately: (options && options.runImmediately ? options.runImmediately : false),
			adjustWidth: (options && options.adjustWidth ? options.adjustWidth : false),
			initialWidth: (options && options.initialWidth ? options.initialWidth : '100%'),
			initialHeight: (options && options.initialHeight ? options.initialHeight : '0px'),
			additionalCSS: (options && options.additionalCSS ? options.additionalCSS : ''),
		}

		// Check we have been passed the required parameters
		if (settings.divId && settings.iFrameUrl && settings.resizeHelperUrl) {
			var container = document.getElementById(settings.divId);
			if (container) {

				function createResizingIFrame() {
					if (settings.adjustWidth) iFrameAutoSize.adjustWidth = settings.adjustWidth;
					iFrameAutoSize.iFrame = document.getElementById('iFrameAutoSize-' + settings.divId);
					if (!iFrameAutoSize.iFrame) {
						iFrameAutoSize.iFrame = document.createElement('IFRAME');
						iFrameAutoSize.iFrame.style.width = settings.initialWidth;
						iFrameAutoSize.iFrame.style.height = settings.initialHeight;
						iFrameAutoSize.iFrame.setAttribute('frameborder', 0);
						iFrameAutoSize.iFrame.setAttribute('id', 'iFrameAutoSize-' + settings.divId);
						iFrameAutoSize.iFrame.setAttribute('scrolling', 'no');
						container.appendChild(iFrameAutoSize.iFrame);
					}
					iFrameAutoSize.iFrame.setAttribute('src', settings.iFrameUrl + (settings.iFrameUrl.indexOf('?') == -1 ? '?' : '&') + (settings.resizeHelperUrl ? 'helperUrl=' + encodeURI(settings.resizeHelperUrl) : ''));
				}

				// Show the loader
				if (settings.loaderUrl) {
					iFrameAutoSize.loader = document.createElement('IMG');
					iFrameAutoSize.loader.setAttribute('src', settings.loaderUrl);
					iFrameAutoSize.loader.style.display = 'block';
					iFrameAutoSize.loader.style.margin = '1em auto';
					iFrameAutoSize.loader.setAttribute('id', 'iFrameAutoSize-loader');
					container.appendChild(iFrameAutoSize.loader);
				}

				// If wating for the window.onload event, add the binding
				if (!settings.runImmediately) {
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
			window.location.href = settings.parentUrl + (settings.parentUrl.indexOf('?') == -1 ? '?' : '&') + 'frameUrl=' + encodeURI(window.location.href);
		}
	},

	/* This function should be called from the embeded page to allow for page size data to be passed back to the parent page
	 *
	 * -------
	 * Options:
	 * -------
	 * resizeOnLoadOnly: This controls if the iFrame will keep sending messages to the parent to adjust the size. Defaults to false
	 * runImmediately: A boolean indicating if we should bind to the window.onload event, or run the resize code straight away. Defaults to false
	 */
	resize: function(options) {
		var settings = {
			resizeOnLoadOnly: (options && options.resizeOnLoadOnly ? options.resizeOnLoadOnly : false),
			runImmediately: (options && options.runImmediately ? options.runImmediately : false)
		}
		// Get the url of the helper frame from the query string parameters
		var helperUrl = iFrameAutoSize.helpers.getQueryStringParam(window.location.search, 'helperUrl');

		// Run this resize process if we have a URL for the helper frame
		if (helperUrl) {

			// Function to inject an iframe from the parent domain that calls a JS function in the parent domain (neatly gets around cross domain scripting issues)
			function pipeDimensionsToParentIFrame()	{
				// Get the page height and width
				var pageDimensions = iFrameAutoSize.helpers.getPageDimensions();

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
						pipe.setAttribute('src', helperUrl + '?height=' + iFrameAutoSize.currHeight + '&width=' + iFrameAutoSize.currWidth + '&cacheb=' + Math.random());
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
			if (!settings.runImmediately) {
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