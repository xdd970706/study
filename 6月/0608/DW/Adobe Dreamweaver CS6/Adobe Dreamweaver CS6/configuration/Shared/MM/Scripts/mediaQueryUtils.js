/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2010 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and may be covered by U.S. and Foreign Patents,
* patents in process, and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
*
**************************************************************************/
 
// Example usage of dw.mediaQueryListToJSON(strMediaQueryList):
//
//			var strJSON = dw.mediaQueryListToJSON('only screen and (min-width:769px)');
//
//			strJSON is now:
//
//				{ mediaQueryList : [ { restrictor : 'only',
//										mediaType : 'screen', 
//										mediaFeatures : [ {	feature : 'width', 
//															comparisonType : 'min', 
//															value : '769px'
//															} 
//														] 
//											} 
//										],
//					errorStr : ''
//				}
//
//			var obj = eval('(' + strJSON + ')'); // Convert the JSON string to a Javascript object.
//
//			if (!obj.errorStr)
//				alert('Num media queries: " + obj.mediaQueryList.length);


function parseMediaQueryList(strMediaQueryList)
{
	// Takes a string (from the Media attr of a Link tag, for example) and returns a JS object that represents the parsed 
	// Media Query List.  If there is a parsing error, the returned object has its 'errorStr' property set, otherwise,
	// the object's 'mediaQueryList' property is an array of Media Query objects.
	
	var strJSON = dw.mediaQueryListToJSON(strMediaQueryList); 	
	var mqObj = eval('(' + strJSON + ')');
	return mqObj;	
}

function unparseMediaQueryList(mediaQueryList)
{
	// Takes a JS array that is a list of Media Query JS objects and returns a string that is the Media Query List.
	
	var strOut = "";
	
	for (var i = 0; i < mediaQueryList.length; i++)
	{
		var mediaQuery = mediaQueryList[i];		
		
		if (mediaQuery.mediaType == '' && mediaQuery.mediaFeatures.length == 0)
			continue;  // Don't output empty media queries.

		if (strOut != "")
			strOut += ", ";

		strOut += mediaQuery.restrictor;
		
		if (mediaQuery.mediaType)
		{
			if (mediaQuery.restrictor)
				strOut += " ";
				
			strOut += mediaQuery.mediaType;	
		}
		
		for (var j = 0; j < mediaQuery.mediaFeatures.length; j++)
		{
			if (   (j > 0)   ||   (j == 0 && (mediaQuery.mediaType || mediaQuery.restrictor))   )
					strOut += " and ";	
					
			var mediaFeature = mediaQuery.mediaFeatures[j];
			strOut += "(";
			
			if (mediaFeature.comparisonType != "exact")
				strOut += mediaFeature.comparisonType + "-";
				
			strOut += mediaFeature.feature;
			
			if (mediaFeature.value)
				strOut += ":" + mediaFeature.value;
				
			strOut += ")";
		}
	}
	
	return strOut;
}