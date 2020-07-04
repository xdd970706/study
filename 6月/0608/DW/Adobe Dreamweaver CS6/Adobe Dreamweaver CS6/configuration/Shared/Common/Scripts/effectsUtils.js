//SHARE-IN-MEMORY=true

// Copyright 2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.


//--------------------------------------------------------------------
// CLASS:
//   effectsUtils
//
// DESCRIPTION:
//   This class is used to create a namespace for the functions
//   contained within this file.  This namespace will make it
//   easier to identify these functions within the code, and
//   ensure that no other functions exist with these names. This
//   is important when using the SHARE-IN-MEMORY flag.
//
// PUBLIC FUNCTIONS:
//
//   effectsUtils.elementNameIsAllowed(elementName, checkElements, allowed)
//   effectsUtils.fetchSuitableElements(startEltIn, checkElementsIn, allowedIn, targetEltsOut)
//   effectsUtils.stripWhitespaces(whiteString)
//   effectsUtils.addLibraryInclude()
//   effectsUtils.removeLibraryIncludeIfUnused()
//   effectsUtils.onlyDigits(inputString, negativeAllowed, decimalPointAllowed)
//   effectsUtils.getPopupIndex(popup, value)
//
//--------------------------------------------------------------------

function effectsUtils()
{
}

// Static Methods

//properties
effectsUtils.elementNameIsAllowed = effectsUtils_elementNameIsAllowed;
effectsUtils.fetchSuitableElements = effectsUtils_fetchSuitableElements;
effectsUtils.stripWhitespaces = effectsUtils_stripWhitespaces;
effectsUtils.addLibraryInclude = effectsUtils_addLibraryInclude;
effectsUtils.addJQueryInclude = effectsUtils_addJQueryInclude;
effectsUtils.removeLibraryIncludeIfUnused = effectsUtils_removeLibraryIncludeIfUnused;
effectsUtils.onlyDigits = effectsUtils_onlyDigits;
effectsUtils.getPopupIndex = effectsUtils_getPopupIndex;



//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.elementNameIsAllowed
//
// DESCRIPTION:
//   Checks if the element with the name 'elementName' is allowed according the
//   entries in the arry 'checkElements'.
//
// ARGUMENTS:
//   elementName - string - name of the element to search for
//   checkElements - array - array cantaining the names of the elemnts which are not allowed
//   allowed - boolean - true if the elements in the 'checkElements'-array indicates allowed elements
//                       false if the elements in the 'checkElements'-array indicates not allowed elements
//
// RETURNS:
//   boolean - true if the element with the name 'elementName' is an allowed element
//             false otherwise
//--------------------------------------------------------------------

function effectsUtils_elementNameIsAllowed(elementName, checkElements, allowed)
{
	if(!elementName || !checkElements)
		return false;

	if(allowed)
	{
		for(var i=0; i<checkElements.length; i++)
			if(checkElements[i] == elementName.toLowerCase())
				return true;

		return false;
	}
	else
	{
		for(var i=0; i<checkElements.length; i++)
			if(checkElements[i] == elementName.toLowerCase())
				return false;

		return true;
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.fetchSuitableElements
//
// DESCRIPTION:
//   Fetches all suitable target elements of the document to which the effect can be applyed.
//
// ARGUMENTS:
//   startEltIn - dom object - the dom node to begin searching from
//   checkElementsIn - array - array of element names
//   allowedIn - boolean - true indicates that the elements listed in the 'checkElementsIn'-array are names of allowed elements
//                         false indicates that the elements listed in the 'checkElementsIn'-array are names of not allowed elements
//   targetEltsOut - array - array cantaining valid target elements in the form [element name, id value]
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function effectsUtils_fetchSuitableElements(startEltIn, checkElementsIn, allowedIn, targetEltsOut)
{
	if(!startEltIn || startEltIn.nodeType != 1 || !targetEltsOut || !checkElementsIn)
		return;

	var potAttrNameCurr = startEltIn.getAttribute('id');

	if(potAttrNameCurr != undefined)
	{
		var potEltNameCurr = startEltIn.tagName;

		if(effectsUtils_elementNameIsAllowed(potEltNameCurr, checkElementsIn, allowedIn))
			targetEltsOut.push([potEltNameCurr,potAttrNameCurr]);
	}

	if(startEltIn.hasChildNodes())
	{
		var childCnt = startEltIn.childNodes.length;
		for(var i=0; i<childCnt; i++)
		{
			var potChildCurr = startEltIn.childNodes[i];
			if(potChildCurr.nodeType == 1) // element node
				effectsUtils_fetchSuitableElements(potChildCurr, checkElementsIn, allowedIn, targetEltsOut);
		}
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.stripWhitespaces
//
// DESCRIPTION:
//   Strips leading and trailing whitespaces from the sting 'whiteString'.
//
// ARGUMENTS:
//   whiteString - string - input-string to determine for whitespaces
//
// RETURNS:
//   string containing the value of 'whiteString', but without leading and trailing whitespaces
//--------------------------------------------------------------------

function effectsUtils_stripWhitespaces(whiteString)
{
	return whiteString.replace(/^\s*(\S?|\S+.*\S+)\s*$/,'$1');
}


//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.addLibraryInclude
//
// DESCRIPTION:
//   Make sure that the necessary 'SpryEffects.js' is included to the document.
//   If already included, the function does nothing.
//   If not already included, the function adds a JavaScript-element into the head element with a reference to 'SpryEffects.js'
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function effectsUtils_addLibraryInclude()
{
	var theDOM    = dreamweaver.getDocumentDOM(); // DOM of the current document
	var assetList = new Array();
	var assetInfo = new AssetInfo("Shared/Spry/Effects/SpryEffects.js", "SpryEffects.js", "javascript");

	assetList.push(assetInfo);
	theDOM.copyAssets(assetList);
}

//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.addJQueryInclude
//
// DESCRIPTION:
//   Make sure that the necessary 'jquery-x-x-x.js' is included to the document.
//   If already included, the function does nothing.
//   If not already included, the function adds a JavaScript-element into the head element with a reference to 'jquery-1.6.1.min.js'
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function effectsUtils_addJQueryInclude() {

    var theDOM = dreamweaver.getDocumentDOM(); // DOM of the current document
    if (theDOM == null)
        return;

    var assetList = new Array();
    if (assetList == null)
        return;
    
    var assetInfo = new AssetInfo("Shared/jQuery/jquery-1.6.1.min.js", "jquery-1.6.1.min.js", "javascript");
    if (assetInfo == null)
        return;

    assetList.push(assetInfo);
    theDOM.copyAssets(assetList);
}
//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.removeLibraryIncludeIfUnused
//
// DESCRIPTION:
//   Removes the include to 'SpryEffects.js' from the document if it is
//   no longer in use. The function checks if there exists at least one
//   function which name starts with 'MM_effect...'
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   none
//--------------------------------------------------------------------

function effectsUtils_removeLibraryIncludeIfUnused()
{
	var theDOM = dreamweaver.getDocumentDOM();
	if(theDOM.documentElement.innerHTML.indexOf("function MM_effect") == -1)
	{
		var allScripts = theDOM.getElementsByTagName("script");

		if(allScripts)
		{
			for (var i=0; i<allScripts.length; i++)
			{
				var scriptSource = allScripts[i].getAttribute("src");
				if(scriptSource && scriptSource.indexOf("SpryEffects.js") >= 0)
				{
					allScripts[i].outerHTML = "";
					return;
				}
			}
		}
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.onlyDigits
//
// DESCRIPTION:
//   Checks if the string 'inputString' contains only digits (leading and trailing whitespaces will bes skipped).
//   With the argument 'negativeAllowed' you can specify if also a negative number is allowed.
//   With the argument 'decimalPointAllowed' you can specify if also a decimal point is allowed.
//
// ARGUMENTS:
//   inputString - string - string to be determined
//   negativeAllowed - boolean - true if also a negative number is allowed 
//                               false if only a positive number is allowd
//   decimalPointAllowed - boolean - true if also a decimal point is allowed
//                                   false if no decimal point is allowed
//
// RETURNS:
//   boolean - true if the string 'inputString' contains only digits (according the parameters 'negativeAllowed' and 'decimalPointAllowed')
//             false otherwise
//--------------------------------------------------------------------

function effectsUtils_onlyDigits(inputString, negativeAllowed, decimalPointAllowed)
{
	if(inputString)
	{
		var pattern;
		if(decimalPointAllowed)
		{
			if(negativeAllowed)
				pattern = /^\s*-?\s*\d+(?:\.\d*)?\s*$/;
			else
				pattern = /^\s*\d+(?:\.\d*)?\s*$/;
		}
		else
		{
			if(negativeAllowed)
				pattern = /^\s*-?\s*\d+\s*$/;
			else
				pattern = /^\s*\d+\s*$/;
		}

		return pattern.test(inputString);
	}

	return false;
}


//--------------------------------------------------------------------
// FUNCTION:
//   effectsUtils.getPopupIndex
//
// DESCRIPTION:
//   Returns the index of the option-item with the given value of the popup-element.
//   The popup-element is of the form
//   <select>
//     <option value="value_1">content_1</option>    <!-- index: 0 -->
//     <option value="value_2">content_2</option>    <!-- index: 1 -->
//   </select>
//
// ARGUMENTS:
//   popup - dom object - the dom node of the popup (select-tag)
//   value - string - value to search for (should be in lowercase)
//
// RETURNS:
//   integer - returns the index of the option-element with the given value
//             -1: if no option element with the given value is available
//--------------------------------------------------------------------

function effectsUtils_getPopupIndex(popup, value)
{
	if(popup && popup.tagName.toLowerCase() == 'select')
	{
		var idx = popup.options.length-1;

		while(idx>=0)
		{
			if(popup.options[idx].value.toLowerCase() == value)
				return idx;
			else
				idx--;
		}
	}

	return -1;
}
