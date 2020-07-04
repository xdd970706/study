// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

//A common function for translating widgets in the DOM. They don't have to be spry widgets
//as long as they follow the same coding convetions. The main difference in translators 
//is the regex to find your widgets and your constructors.

function translateWidgetsInDOM( dom, origSourceStr, widgetIdRegExp, widgetConstructors)
{
	if( typeof dom == 'undefined' )
	{
		return;
	}
	
	var widgetMgr = Spry.DesignTime.Widget.Manager.getManagerForDocument(dom);
	var curWidgetIds = new Array();
	
	//prepare to handle error conditions
	var brokenWidgetSearches = new Array();
	var brokenWidgetObject = new Array();
	
	//render widgets in other files
	dw.useTranslatedSource(true);
	
	//Only search in script tags
	var scriptTags = dom.getElementsByTagName("script");
	for( var i = 0; i < scriptTags.length; i++ )
	{
		var scriptTag = scriptTags[i];
		var scriptStr = scriptTag.innerHTML;
		if( !scriptStr || scriptStr.length <= 0 )
			continue;
	
		//Tokenize all the servermarkup in the document so we can find dynamic widgets easier
		var tokenMap = new Object();
		var sourceStr = dwscripts.tokenizeServerMarkup(dom, scriptStr, tokenMap);
		
		//begin searching
		var widgetIdMatch = widgetIdRegExp.exec(sourceStr);
		
		while( widgetIdMatch )
		{
			if( widgetIdMatch.length >= 3 )
			{
				var widgetFullMatch = widgetIdMatch[0];
				var widgetObject = widgetIdMatch[1];
				var widgetType = widgetIdMatch[2];
				var widgetId = widgetIdMatch[3];
				
				//remove any servermarkup tokens
				widgetFullMatch = dwscripts.untokenizeServerMarkup(widgetFullMatch, tokenMap);
				widgetObject = dwscripts.untokenizeServerMarkup(widgetObject, tokenMap);
				widgetType = dwscripts.untokenizeServerMarkup(widgetType, tokenMap);
				widgetId = dwscripts.untokenizeServerMarkup(widgetId, tokenMap);

				// [jblas 07/17/2009]
				// We only want to translate markup/code for Spry widgets that have design-time support.
				// Limiting our widgets to those that have design-time support allows us to load pages
				// with newer Spry widgets that use selectors instead of ids.
				
				if (widgetConstructors[widgetType])
				{
					//see if the widgets html node is still in the document
					var ele = dom.getElementById(widgetId);
					
					if(typeof ele == 'undefined')
					{
						//check our dom reference to see if we've already warned about this match
						//so we only warn the user once each time the doc is opened
						if( typeof dom.SpryWidgetTranslatorWarnings == 'undefined' )
							dom.SpryWidgetTranslatorWarnings = new Array;
						
						if( typeof dom.SpryWidgetTranslatorWarnings[widgetFullMatch] == 'undefined' )
						{
							var searchObj = new Object;
							searchObj.searchString = widgetFullMatch;
							searchObj.searchSource = true;
							searchObj.matchCase = true;
							searchObj.matchWholeWord = true;
							searchObj.searchWhat = "document";
							
							brokenWidgetSearches.push(searchObj);
							
							searchObj = new Object;
							searchObj.searchString = widgetObject;
							searchObj.searchSource = true;
							searchObj.matchCase = true;
							searchObj.matchWholeWord = true;
							searchObj.searchWhat = "document";
								
							brokenWidgetSearches.push(searchObj);
							
							brokenWidgetObject.push(widgetFullMatch);
							dom.SpryWidgetTranslatorWarnings[widgetFullMatch] = true;
						}
					}
					else
					{
						//wrap the actual widget code in a try/catch since
						//the code may not be in a good state for that actual
						//widget. The widgets PI should be able to tell how to correct this
						
						try
						{
							//create the object for this id		 
							var widget =  widgetMgr.getWidget(widgetType, widgetId);
							if( widget ) {
								if( widget.refresh ) {
									widget.refresh();
								}
							}
							else
							{
								var cons = widgetConstructors[widgetType];
								if (!cons)
								  cons = widgetConstructors["Spry.Widget.Base"];
								if( cons )
								{
									var consArgs = Spry.DesignTime.Editing.Utils.getParamsAsStrings(sourceStr, widgetIdMatch.index, '(', ')', true);
									for (var j = 0; j < consArgs.length; j++)
										consArgs[j] = dwscripts.untokenizeServerMarkup(consArgs[j], tokenMap);
									//create the new widget
									widget = new cons(dom, widgetObject, widgetId, consArgs);
									widget.setWidgetType(widgetType);
									widgetMgr.setWidget(widgetType, widgetId, widget);
								}
							}
						}
						catch(e)
						{
						}
						
						//save the id for this type
						if(typeof curWidgetIds[widgetType] == 'undefined')
							curWidgetIds[widgetType] = new Array();
						curWidgetIds[widgetType].push(widgetId);
						
						setTranslatedAttributes(ele, widgetType, widgetId);
						
						//add a delete handler for this widget to remove the constructor
						var deleteFunction = getDeleteFunction(widgetFullMatch, widgetType, widgetId, widgetConstructors);
						ele.addEventListener( "DOMNodeRemovedFromDocument", deleteFunction , false ); 
						
						var insertFunction = getInsertFunction(widgetFullMatch, widgetType, widgetId, dom, widgetConstructors);
						ele.addEventListener( "DOMNodeInsertedIntoDocument", insertFunction , false ); 
						
						//listen to modifed events on the script tag
						var subtreeModifiedFunction = getSubtreeModifiedFunction(widgetType, scriptTag);
						scriptTag.parentNode.addEventListener( "DOMSubtreeModified",subtreeModifiedFunction , false );
						
						//If this widget is inside an editable region, we should warn the user 
						if( !dom.isTemplateInstance() )
						{
							var editableRegion = dom.getSelectedEditableRegion();
							if( editableRegion != -1 )
							{
								//an editable region is selected, see if it's this node
								var selNode = dom.getSelectedNode();
								if( ele == selNode || dwscripts.nodeIsChildOfNode(ele, selNode) )
								{
								
									if( typeof dom.SpryWidgetTranslatorEditableWidgetWarnings == 'undefined' )
											dom.SpryWidgetTranslatorEditableWidgetWarnings = new Array;
											
									var alertIndex = widgetFullMatch + editableRegion.toString();
								
									if( typeof dom.SpryWidgetTranslatorEditableWidgetWarnings[alertIndex] == 'undefined' )
									{
										alert(dw.loadString("spry/widget/alert/widget found in editable region"));
										dom.SpryWidgetTranslatorEditableWidgetWarnings[alertIndex] = true;
									}
								}
							}
						}
					}
				}
			}
			
			widgetIdMatch = widgetIdRegExp.exec(sourceStr);
		}
	}
	
	//now go through all the widget types and remove and instances that no longer
	//exist on the page
	for( widgetType in curWidgetIds )
	{
		var removedWidgets = widgetMgr.removeUnlistedWidgets(widgetType, curWidgetIds[widgetType]);
		
		//give each widget a chance to cleanup before it's removed
		for( var widgetId in removedWidgets )
		{
			var remWidget = removedWidgets[widgetId];
			if( remWidget.onRemoved )
				remWidget.onRemoved();
			else
			if( remWidget.getId )
			{
				var remEle = dom.getElementById(remWidget.getId());	
				removeTranslatedAttributes(remEle, widgetType, widgetId);
			}
			
		}
		
	}
		
	//prompt to find all the missing objects
	if( brokenWidgetSearches.length > 0 )
	{
	
		//user has a widget constuctor without the corresponding code, prompt to delete
		var message = "<p>" + dw.loadString("spry/widget/alert/constructor missing html") + "</p>";
		
		for( var i = 0 ; i < brokenWidgetObject.length ; i++ ) {
			message += "<p>" + dw.loadString("spry/widget/label") + ": " + brokenWidgetObject[i] + "</p>";
		}
			
		var onYes = function() {
			
			var searches = brokenWidgetSearches;
			var clearPreviousFindResults = true;
			
			for( var i = 0 ; i < searches.length ; i++ )
			{
				dw.setUpFind(searches[i]);
				dw.findAll(true, dom, clearPreviousFindResults);
				clearPreviousFindResults = false;
			}
		}
		dwscripts.askYesNo(message, MM.BTN_Yes, onYes);
	}
}


// This function returns a hash of extra options from the widget definition. The value returned
// will be passed as a constructor argument for the current widget
function prepareWidgetOptions(optionsStr)
{
	var optionsHash = new Object();
	eval("optionsHash = {" + optionsStr + "}");
	return optionsHash;
}


//This function returns the function that gets called whenever a node is deleted. We need
//to create the function in it's own function so the closure is clear.
function getDeleteFunction(removeString, widgetType, widgetId, widgetConstructors)
{
	var deleteFunction = function(e)
	{
		var targetDom = e.target.ownerDocument;					
		var scriptTags = targetDom.getElementsByTagName("script");
		for( var i = 0; i < scriptTags.length; i++ )
		{
			var str = scriptTags[i].innerHTML;
			var index = str.indexOf(removeString);
			if( index >= 0 )
			{
				var strBefore = str.substr(0, index);
				var strAfter = str.substr(index+removeString.length);
				while( strBefore.length > 0 && ( strBefore.charAt(strBefore.length-1) == ' ' ||
												strBefore.charAt(strBefore.length-1) == '\t' ||
												strBefore.charAt(strBefore.length-1) == '\n' ||
												strBefore.charAt(strBefore.length-1) == '\r' ) )
				{
					strBefore = strBefore.substr(0, strBefore.length-1);
				}
				// We'll store the new InnerHTML to newInnerHTML and we'll decide later whether we'll replace the inner value with this
				// one or we'll simply remove the SCRIPT tag.
				var newInnerHTML = strBefore + strAfter;

				// Look if there is any valid JS code remining in the SCRIPT tag; of empty (or only comments were found) => go and remove it
				var tempInnerHTML = newInnerHTML;
				if (tempInnerHTML && tempInnerHTML.replace)
				{
					tempInnerHTML = tempInnerHTML.replace(/[\r\n]*(?:\<\!\-\-|\/\/\-\-\>)[\r\n]*/gi, "");
					tempInnerHTML = tempInnerHTML.replace(/[\r\n\s\t]*/gi, "")
				}
				
				// If the InnerHTML is empty, we'll remove the entire SCRIPT tag.
				if (tempInnerHTML === "")
				{
					scriptTags[i].outerHTML = "";
				}
				else
				{
					scriptTags[i].innerHTML = newInnerHTML;
				}
				
				// Get WidgetManager instance
				var widgetMgr = Spry.DesignTime.Widget.Manager.getManagerForDocument(targetDom);

				// Search for widgets of the same type in the page, but different from the current one (compared by ID)
				var count = 0;
				var allWidgets = widgetMgr.getAllWidgets(widgetType);
				for (var widget in allWidgets) {
					if (widget != widgetId)
					{
						count++;
						break;
					}
				}

				if (count == 0)
				{
					// There are no more widgets remaining in the page of the current type, we'll remove the assets as well
					var cons = widgetConstructors[widgetType];
					if (!cons)
					  cons = widgetConstructors["Spry.Widget.Base"];
					var assets = cons.getAssets();
					
					var tags = new Array();
					tags = tags.concat(targetDom.getElementsByTagName("script"));
					tags = tags.concat(targetDom.getElementsByTagName("link"));
					
					for (var j=0; j<tags.length; j++)
					{
						var tag = tags[j];
						if (tag && tag.getAttribute)
						{
							// Get the value to search; the attribute is different according to tag name: script or link
							var valueToSearch = tag.getAttribute("src");
							if (!valueToSearch)
							{
								valueToSearch = tag.getAttribute("href");
							}

							// Once we have a value, we test it against all assets
							if (valueToSearch)
							{
								for (var k=0; k<assets.length; k++)
								{
									if (assets[k].type)
									{
										// If the current tag's value matches an asset we'll remove the tag from page
										if (valueToSearch.match && valueToSearch.match(new RegExp("(?:^|[\\/\\\\])" + dwscripts.escRegExpChars(assets[k].file) + "$", "gi")))
										{
											tag.outerHTML = "";
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	};
	return deleteFunction;
}

function getInsertFunction(constructorJs, widgetType, widgetId, curDom, widgetConstructors)
{
  // Get the constructor for the widget:
    var cons = widgetConstructors[widgetType];
        
   // If the constructor has a custom insert function
  if (cons && cons.getInsertWidgetCallback){
    return cons.getInsertWidgetCallback(constructorJs, widgetId);
    }
        
   // The widget doesn’t provide its own insert callback, so
   // use the default one
   return function(e)
   {
		var targetDom = e.target.ownerDocument;	
		var newId = e.target.id;
		var newConJs = constructorJs;

		var assetList = new Array();

		// Construct the assets list using the array of assets returned by the static getAssets() function
		var assets = cons.getAssets();
		for (var i=0; i<assets.length; i++)
		{
			assetInfo = new AssetInfo(assets[i].fullPath, assets[i].file, assets[i].type);
			assetList.push(assetInfo);
		}
		
		if (assetList && assetList.length)
		{
			targetDom.copyAssets(assetList);
		}

		//id got renamed on paste, update our constructor
		if( newId && newId != widgetId )
		{
			newConJs = newConJs.replace( widgetId, newId, "gm" );
		}
		
		targetDom.addJavaScript(newConJs, false);
	};
}

//This function is for when the last scriptag with our objects is deleted. Our translator
//won't run again so we need to do a little post cleanup.
function getSubtreeModifiedFunction(widgetType, ele)
{
	var subtreeModifiedFunction = function(e)
	{
		if( ele && ele.ownerDocument && ele.innerHTML.indexOf(widgetType) >= 0 )
			return; //at least one widget of this type exists
		
		//no more widgets of this type exist, remove them all
		var dom = e.target.ownerDocument;
		
		//check to see if there's another scripttag we're in now
		var scriptTags = dom.getElementsByTagName("script");
		for( var i = 0; i < scriptTags.length; i++ )
		{
			var scriptTag = scriptTags[i];
			var scriptStr = scriptTag.innerHTML;
			if( !scriptStr || scriptStr.length <= 0 )
				continue;
			if ( scriptStr.indexOf(widgetType) > -1 )
				return; //still exists somewhere in the document
		}
		
		var widgetMgr = Spry.DesignTime.Widget.Manager.getManagerForDocument(dom);
		
		var removedWidgets = widgetMgr.removeUnlistedWidgets(widgetType, {});
		
		//give each widget a chance to cleanup before it's removed
		for( var widgetId in removedWidgets )
		{
			var remWidget = removedWidgets[widgetId];
			if( remWidget.onRemoved )
				remWidget.onRemoved();

			if( remWidget.getId )
			{
				var remEle = dom.getElementById(remWidget.getId());	
				removeTranslatedAttributes(remEle, widgetType, widgetId);
			}
		}
	};
	return subtreeModifiedFunction;
}

function setTranslatedAttributes(ele, widgetType, widgetId)
{
	if( !ele ) return;
	
	// See if there's a localized version of the label
	var stringId = widgetType + "/outlineLabel";
	var outlineLabel = dw.loadString( stringId );
	if( (outlineLabel == ("UNDEFINED STRING " + stringId)) || !outlineLabel || outlineLabel == "" )
		outlineLabel = widgetType;
	
	// Add attributes to the main element for tabbedoutlines
	ele.setTranslatedAttribute("outline", outlineLabel + ": " + widgetId);
	ele.setTranslatedAttribute("outlineId", "unique");
	ele.setTranslatedAttribute("outlineForSelection", "outlineForSelection");
	ele.setTranslatedAttribute("hiliteChildrenOnSelect", "false");
	// Leave a marker for the PI to know it can inspect this selection
	ele.setTranslatedAttribute(widgetType, widgetId);
}

function removeTranslatedAttributes(ele, widgetType, widgetId)
{
	if( !ele ) return;
	
	ele.removeTranslatedAttribute("outline");
	ele.removeTranslatedAttribute("outlineId");
	ele.removeTranslatedAttribute("outlineForSelection");
	ele.removeTranslatedAttribute(widgetType);
}
