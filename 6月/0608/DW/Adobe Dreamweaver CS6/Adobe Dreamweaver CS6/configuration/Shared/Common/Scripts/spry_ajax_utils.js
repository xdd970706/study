// Copyright 2006-2007 Adobe Systems Incorporated.  All rights reserved.

// PATENT:
// Adobe Patent or Adobe Patent Pending Invention Included Within this File"

//--------------------------------------------------------------------
// CLASS:
//   ajaxUtils
//
// DESCRIPTION:
//   This class is used to create a namespace for the functions
//   contained within this file.  This namespace will make it
//   easier to identify these functions within the code, and
//   ensure that no other functions exist with these names.
//
//   The functions in this file make it easier to deal with
//   objects, PIs, and server behaviors for AJAX controls,
//   which are translated.
//
// PUBLIC FUNCTIONS:
//
//--------------------------------------------------------------------

function ajaxUtils()
{
}

// Static Methods
ajaxUtils.getAjaxDataSetNames = ajaxUtils_getAjaxDataSetNames;
ajaxUtils.isDataSetExisting	  = ajaxUtils_isDataSetExisting;
ajaxUtils.getNextAvailableDataSetName = ajaxUtils_getNextAvailableDataSetName;
ajaxUtils.getAjaxDataSets = ajaxUtils_getAjaxDataSets;
ajaxUtils.isAjaxDataSet = ajaxUtils_isAjaxDataSet;
ajaxUtils.addAjaxDSJSCode = ajaxUtils_addAjaxDSJSCode;
ajaxUtils.editAjaxDSJSCode = ajaxUtils_editAjaxDSJSCode;
ajaxUtils.getAjaxDataTableCode = ajaxUtils_getAjaxDataTableCode;
ajaxUtils.deleteAjaxDataSet = ajaxUtils_deleteAjaxDataSet;
ajaxUtils.isDynamicFeed  = ajaxUtils_isDynamicFeed;
ajaxUtils.isHTTPReference = ajaxUtils_isHTTPReference;
ajaxUtils.fixDynamicFeed  = ajaxUtils_fixDynamicFeed;
ajaxUtils.docRelativeToSiteRelative = ajaxUtils_docRelativeToSiteRelative;
ajaxUtils.getDesignTimeSchemaURI = ajaxUtils_getDesignTimeSchemaURI;
ajaxUtils.setDesignTimeSchemaURI = ajaxUtils_setDesignTimeSchemaURI;
ajaxUtils.removeDesignTimeSchemaURI = ajaxUtils_removeDesignTimeSchemaURI;
ajaxUtils.trimXPath = ajaxUtils_trimXPath;
ajaxUtils.trimQuotes = ajaxUtils_trimQuotes;
ajaxUtils.initSpryLibraries = ajaxUtils_initSpryLibraries;
ajaxUtils.isInsideSpryRegion = ajaxUtils_isInsideSpryRegion;
ajaxUtils.containsSpryRegion = ajaxUtils_containsSpryRegion;
ajaxUtils.promptForSpryRegion = ajaxUtils_promptForSpryRegion;
ajaxUtils.wrapWithSpryRegion = ajaxUtils_wrapWithSpryRegion;
ajaxUtils.isInsideBody = ajaxUtils_isInsideBody;
ajaxUtils.formatSpryDataRef = ajaxUtils_formatSpryDataRef;
ajaxUtils.getSpryImageReference = ajaxUtils_getSpryImageReference;
ajaxUtils.initSpryNS = ajaxUtils_initSpryNS;
ajaxUtils.fixDTDSchemaPathReference = ajaxUtils_fixDTDSchemaPathReference;
ajaxUtils.canInsertSpryDataSets	= ajaxUtils_canInsertSpryDataSets;
ajaxUtils._matchedNode = null;
ajaxUtils._xmlDSInit = 'var @@jsname@@ = new Spry.Data.XMLDataSet("@@xmlsource@@", "@@xpathref@@"@@options@@);';
ajaxUtils._xmlDSColType = '@@jsname@@.setColumnType("@@colname@@", "@@coltype@@");';
ajaxUtils._dynamicFeedExts = new Array("cfm","cfml","cfc","asp","jsp","jst","aspx","ascx","asmx","php","php3","php4","php5");
ajaxUtils._testDialogTreeWidth = 500; //500px;
ajaxUtils._testColBuffer = 10;
ajaxUtils._lf = "\n";
ajaxUtils._dsPrefix = "ds";


//--------------------------------------------------------------------
// FUNCTION:
//   getAjaxDataSetNames
//
// DESCRIPTION:
//	looks for the ajax reg exps and returns a list of ajax datasets names only
//
// ARGUMENTS:
//	 aDOM : the document object
//
// RETURNS:
//   array of ajax data sets
//--------------------------------------------------------------------
function ajaxUtils_getAjaxDataSetNames(aDOM)
{
	var ajaxDataSetNames = new Array();

	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	if (aDOM != null)
	{
    var dsManager = Spry.DesignTime.DataSets.Manager.getManagerForDocument(aDOM);
  	if (dsManager)
  	{
      ajaxDataSetNames = dsManager.getAllDataSetNames();
    }
  }  

	return ajaxDataSetNames;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isDataSetExisting
//
// DESCRIPTION:
//	checks if data set with name is already existing
//
// ARGUMENTS:
//	 aDOM : the document object
//
// RETURNS:
//   array of ajax data sets
//--------------------------------------------------------------------
function ajaxUtils_isDataSetExisting(dsName, aDOM)
{
	var bDataSetExisting = false;
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	var ajaxDSNames = ajaxUtils.getAjaxDataSetNames(aDOM);		 
	if (ajaxDSNames.length > 0)
	{
		for (var i=0; i < ajaxDSNames.length; i++)
		{
			if (ajaxDSNames[i] == dsName)
			{
				bDataSetExisting = true;
				break;
			}
		}
	}
	return bDataSetExisting;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_getNextAvailableDataSetName
//
// DESCRIPTION:
//	get next available data set name
//
// ARGUMENTS:
//	 aDOM : the document object
//
// RETURNS:
//   array of ajax data sets
//--------------------------------------------------------------------
function ajaxUtils_getNextAvailableDataSetName(aDOM)
{
	var dsName = "";
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	var ajaxDSNames = ajaxUtils.getAjaxDataSetNames(aDOM);		 
	if (ajaxDSNames.length > 0)
	{
		var index = 0;
		var bDone = false;
		while (!bDone)
		{
			index++;
			bDone = true; //by default
			dsName = ajaxUtils._dsPrefix + index;
			for (var i=0; i < ajaxDSNames.length; i++)
			{
				if (ajaxDSNames[i] == dsName)
				{
					bDone = false;
					break;
				}
			}
		}
	}
	else
	{
		dsName = ajaxUtils._dsPrefix + "1"; //"ds1"
	}
	return dsName;
}



//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_getAjaxDataSets
//
// DESCRIPTION:
//	looks for the ajax reg exps and returns a list of ajax datasets
//
// ARGUMENTS:
//	 aDOM : the document object
//
// RETURNS:
//   array of ajax data sets
//--------------------------------------------------------------------
function ajaxUtils_getAjaxDataSets(aDOM,dsName)
{
	var ajaxDataSets = new Array();
	var dsAjaxRegExpStr  = "(\\w*)\\s*=\\s*new\\s*Spry\\.Data\\.XMLDataSet\\([\"'](.*?)[\"']\\s*,\\s*([\"].*?[\"]|['].*?['])\\s*(,\\{.*?\\})?";
	var dsOptRegExpStr   = "(\\w*)\\s*:\\s*([\\w@\\:\"]*)";
	var dsAjaxRegExp = new RegExp(dsAjaxRegExpStr,"ig");
	var dsOptRegExp = new RegExp(dsOptRegExpStr,"ig");
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	if (aDOM != null)
	{
		var jsScriptBlocks = aDOM.getElementsByTagName("script");
		for (var i=0; i < jsScriptBlocks.length; i++)
		{
			var aJSScriptBlock = jsScriptBlocks[i];
			if (aJSScriptBlock != null)
			{
				var jsCode = aJSScriptBlock.innerHTML;
				if ((jsCode != null) && (jsCode.length > 0))
				{
				    var arr = null;
					var optsArr = null;
					while (arr = dsAjaxRegExp.exec(jsCode) != null)
					{
						if ((dsName != null ) && (dsName.length>0))
						{
							if (dsName == RegExp.$1)
							{
								//add the specific data set requested
								var aAjaxDataSet = new ajaxDesignTimeDataSet(RegExp.$1, RegExp.$2, ajaxUtils.trimQuotes(RegExp.$3));
								var optionsArr   = aAjaxDataSet.getOptions();
								var optionsStr = RegExp.$4;
								if (optionsStr && optionsStr.length)
								{
									while (optsArr = dsOptRegExp.exec(optionsStr) != null)
									{
										var optKey = RegExp.$1;
										var optVal = RegExp.$2;
										if ((optKey == "sortOnLoad") || (optKey == "sortOrderOnLoad"))
										{
											var beginQIndex = optVal.indexOf("\"");
											var endQIndex = optVal.lastIndexOf("\"");
											optVal = optVal.substring(beginQIndex+1,endQIndex);
										}
										//set options key , value
										optionsArr[optKey] = optVal;
									}
								}

								//look for column type specification
								var dsColTypeRegExpStr = dsName + "\\.setColumnType\\s*\\([\"']([\\w@\\:\\/]*)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);";
								var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
								var colTypeArr = null;
								var colList = new Array();
								while ((colTypeArr = dsColTypeRegExp.exec(jsCode)) != null)
								{
									var colName = RegExp.$1;
									var colType = RegExp.$2;
									colList.push(new ajaxDSColNode(colName,colType));
								}
								aAjaxDataSet.setColumnList(colList);
								ajaxDataSets.push(aAjaxDataSet);
								break;
							}
						}
						else
						{
							//add all datasets
							var aAjaxDataSet = new ajaxDesignTimeDataSet(RegExp.$1, RegExp.$2, ajaxUtils.trimQuotes(RegExp.$3));
							ajaxDataSets.push(aAjaxDataSet);
						}
					}
				}
			}
		}
	}
	return ajaxDataSets;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isAjaxDataSet
//
// DESCRIPTION:
//	return true if it matches the signature for an ajax dataset
//
// ARGUMENTS:
//	 source string, dsName
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------
function ajaxUtils_isAjaxDataSet(sourceStr,dsName)
{
	var isAjaxDS = false;
	var dsAjaxRegExpStr  = "var\\s*(@@dsName@@)\\s*=\\s*new\\s*Spry\\.Data\\.XMLDataSet\\(\"(.*?)\"\\s*,\\s*\"(.*)\"\\s*";
	dsAjaxRegExpStr = dsAjaxRegExpStr.replace("@@dsName@@",dsName);
	var dsAjaxRegExp = new RegExp(dsAjaxRegExpStr,"ig");
	if (sourceStr.search(dsAjaxRegExp) != -1)
	{
		isAjaxDS = true;
	}
	return isAjaxDS;
}



//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_addAjaxDSJSCode
//
// DESCRIPTION:
//	adds an ajax dataset js code to the page 
//
// ARGUMENTS:
//	 ajaxDS
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_addAjaxDSJSCode(ajaxDS)
{
	var jsCode="";
	if (ajaxDS != null)
	{
		//initialize spry libraries
		ajaxUtils.initSpryLibraries();
		var jsName = ajaxDS.getJSVarName();
		var xmlSource = ajaxDS.getDataSetURL();
		var xpathRef = ajaxDS.getDataSetPath();
		jsCode = ajaxUtils._xmlDSInit;
		//for each col . set the corresponding data type
		var colList = ajaxDS.getColumnList();
		if (colList)
		{
			for (var i=0; i < colList.length; i++)
			{
				var colType = colList[i].getDataType();
				if (colType != "text")
				{
					jsCode+=ajaxUtils._lf;				
					var js_setColType = ajaxUtils._xmlDSColType;
					js_setColType = js_setColType.replace(/@@colname@@/ig,colList[i].getColName());
					js_setColType = js_setColType.replace(/@@coltype@@/ig,colList[i].getDataType());
					jsCode+=js_setColType;				
				}
			} 
		}
		//replace the js name
		jsCode = jsCode.replace(/@@jsname@@/ig,jsName);
		jsCode = jsCode.replace(/@@xmlsource@@/ig,xmlSource);
		jsCode = jsCode.replace(/@@xpathref@@/ig,xpathRef);

		//get the options string
		var optionsString = ajaxDS.buildOptionsString();
		//replace the code with options value
		if (optionsString.length)
		{
			//add a comma for param seperator
			optionsString = "," + optionsString;
		}
		jsCode = jsCode.replace(/@@options@@/ig,optionsString);		

		// after inserting the spry ajax dataset, give the data bindings panel focus
		if ( !dw.getFloaterVisibility('data bindings'))
		{
			dw.toggleFloater('data bindings');
		}

		//add js code to the head
		var aDOM = dw.getDocumentDOM();
		//add it to list of expanded node
		dw.dbi.setExpanded(jsName, true);
		aDOM.addJavaScript(jsCode, true);
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_editAjaxDSJSCode
//
// DESCRIPTION:
//	edits an ajax dataset js code to the page 
//
// ARGUMENTS:
//	 ajaxDS, editDSName
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_editAjaxDSJSCode(editedDS, origDS, aDOM)
{
 var _lf = "\n";
 if (origDS != null)
 {
	//get the original ds name
	var origDSName = origDS.getJSVarName();
	var origDSFeed = origDS.getDataSetURL();
	var origXPath  = origDS.getDataSetPath();
	var origOptionsStr = origDS.buildOptionsString();

	var dsAjaxRegExpStr  = "var\\s*" + origDSName + "\\s*=\\s*new\\s*Spry\\.Data\\.XMLDataSet\\([\"'](.*)[\"']\\s*,\\s*([\"].*?[\"]|['].*?['])\\s*(,\\{.*?\\})?\\s*\\)\\s*;?";
	var dsAjaxRegExp = new RegExp(dsAjaxRegExpStr,"ig");
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	if (aDOM != null)
	{
		var jsScriptBlocks = aDOM.getElementsByTagName("script");
		for (var i=0; i < jsScriptBlocks.length; i++)
		{
			var aJSScriptBlock = jsScriptBlocks[i];
			if (aJSScriptBlock != null)
			{
				var jsCode = aJSScriptBlock.innerHTML;
				var result;
				if ((result = dsAjaxRegExp.exec(jsCode)) != null)
				{
					//found the js block containing the dataset
					var dsConstructorCode = result[0];

					var editedDSName = editedDS.getJSVarName();
					var editedDSFeed = editedDS.getDataSetURL();
					var editedXPath  = editedDS.getDataSetPath();
					var editedOptions = editedDS.buildOptionsString();

					//apply the name/id changes.
					if ((editedDSName  != origDSName) ||
					    (editedDSFeed  != origDSFeed) ||
						(editedXPath   != origXPath)  ||
						(editedOptions != origOptionsStr))
					{						
						//replace the dataset name , reconstruct the constructor
						var newDSConstructorCode = ajaxUtils._xmlDSInit;	
																	
						//replace the js name , xml source , xpath reference
						newDSConstructorCode = newDSConstructorCode.replace(/@@jsname@@/ig,editedDSName);
						newDSConstructorCode = newDSConstructorCode.replace(/@@xmlsource@@/ig,editedDSFeed);
						newDSConstructorCode = newDSConstructorCode.replace(/@@xpathref@@/ig,editedXPath);
						//set the options values
						if (editedOptions.length)
						{
							//add a comma for param seperator
							editedOptions = "," + editedOptions;
						}
						newDSConstructorCode = newDSConstructorCode.replace(/@@options@@/ig,editedOptions);

						//replace the constructor code
						//if we are missing the ";" as the last character , add the line feed character
						var dsConstLen = dsConstructorCode.length;
						if (dsConstLen > 0)
						{			
							//add the line feed character
							if (dsConstructorCode[dsConstLen - 1] != ';')				
							{
								newDSConstructorCode += ajaxUtils._lf;
							}
						}
						jsCode = jsCode.replace(dsConstructorCode,newDSConstructorCode);

						if (editedDSName != origDSName)
						{
							//replace the col signature
							var dsColTypeRegExpStr = origDSName + "\\.setColumnType\\s*\\([\"']([\\w@\\:\\/]*)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);\\s*";
							var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
							while (jsCode.search(dsColTypeRegExp) != -1)
							{
								var matchColStr = RegExp.lastMatch;
								var newmatchColStr = matchColStr.replace(origDSName, editedDSName);
								jsCode = jsCode.replace(matchColStr,newmatchColStr);
							}
						}
					}
					else
					{
						//default the newDSConstructorCode
						newDSConstructorCode = dsConstructorCode;
					}

					//get the column list to update the column data types incase they are changed
					var bColListModified = false;
					var editedColList = editedDS.getColumnList();
					var origColList   = origDS.getColumnList();

					//if the length differs
					if (editedColList.length != origColList.length)
					{
						bColListModified = true;
					}

					for (var i=0; i < editedColList.length; i++)
					{
						var bFoundOrigCol = false;
						var aEditCol = editedColList[i];
						var editedColName = aEditCol.getColName();
						var editedDataType = aEditCol.getDataType();
						var bFoundInOrigColList = false;
						for (var j=0; j < origColList.length ; j++)
						{
							var origCol = origColList[j];
							var origColName = origCol.getColName();
							if (origColName == editedColName)
							{
								bFoundInOrigColList = true;
								aEditCol.bChanged = false;
								origCol.bExists = true; //if the column are found in new list , then they continue to exist
								var origDataType = origCol.getDataType();
								if (origDataType != editedDataType)
								{
									aEditCol.bChanged = true;
									aEditCol.bChange = "modified";
									bColListModified = true;
								}
							}
						}

						//if we cannot find the column in the orig list, then mark it for add if not of type = "text"
						if (bFoundInOrigColList == false)
						{
							if (editedDataType != "text")
							{
								aEditCol.bChanged = true;
								aEditCol.bChange = "added";
								bColListModified = true;
							}
						} 	
					}
																
					//do the column type edits for modified and added columns
					if (bColListModified)
					{
						var bColsAdded = false;
						var newConstructorCodeWithNewCols = newDSConstructorCode;
						for (var i=0; i < editedColList.length ; i++)
						{	
							var aEditCol = editedColList[i];
							if (aEditCol && aEditCol.bChanged)
							{
								if (aEditCol.bChange == "modified")
								{
									var dsColTypeRegExpStr = editedDSName + "\\.setColumnType\\s*\\([\"']" + aEditCol.getColName() + "[\"'](,\\s*[\"'])(\\w*)[\"']\\s*\\);\\s*";								
									var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
									if (jsCode.search(dsColTypeRegExp) != -1)
									{
										//replace the datatype
										var colCode = RegExp.lastMatch;
										var editedDataType = aEditCol.getDataType();
										if (editedDataType != "text")
										{
											//update the jsCode
											var newColCode = colCode;
											//adding RegExp.$1 narrows the search to second parameter in case the 
											//colname has the datatype name as part of it for example (e.g. boximage)
											newColCode = newColCode.replace(RegExp.$1 + RegExp.$2,RegExp.$1 + editedDataType);
										}
										else
										{
											//remove the data type declaration for the column with type="text"
											newColCode = "";
										}
										jsCode = jsCode.replace(colCode,newColCode);
									}
								}	
								else if (aEditCol.bChange == "added")
								{												
									//add the new column type													
									newConstructorCodeWithNewCols+=_lf;				
									var js_setColType = ajaxUtils._xmlDSColType;
									js_setColType = js_setColType.replace(/@@jsname@@/ig,editedDSName);
									js_setColType = js_setColType.replace(/@@colname@@/ig,aEditCol.getColName());
									js_setColType = js_setColType.replace(/@@coltype@@/ig,aEditCol.getDataType());
									newConstructorCodeWithNewCols+=js_setColType;
									bColsAdded = true;
								}
							}
						}
						if (bColsAdded)
						{
							//replace the constructor with the modified constructor and col list
							jsCode = jsCode.replace(newDSConstructorCode,newConstructorCodeWithNewCols);
						}
					}
															
					//remove cols which no longer exists 
					for (var i=0; i < origColList.length ; i++)
					{	
						var aOrigCol = origColList[i];
						if (aOrigCol && (!(aOrigCol.bExists)))
						{
							var dsColTypeRegExpStr = editedDSName + "\\.setColumnType\\s*\\([\"']" + aOrigCol.getColName() + "[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);\\s*";								
							var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
							if (jsCode.search(dsColTypeRegExp) != -1)
							{
								var colCode = RegExp.lastMatch;
								newColCode = "";
								jsCode = jsCode.replace(colCode,newColCode);
							}
						}
					}
					
					//update the node 
					aJSScriptBlock.innerHTML = jsCode;
					//if the feed, xpath differ update the bindings panel
					if ((editedDSFeed  != origDSFeed) ||
						(editedXPath   != origXPath))
					{
						//refresh the data bindings 
						dw.dbi.refresh();
					}

					if (editedDSName  != origDSName)
					{
						//sync dom tree & update the variable code hinting 
						aDOM.source.refreshVariableCodeHints(true);
					}

					break;
				}
			}
		}
	}
 }
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_deleteAjaxDataSet
//
// DESCRIPTION:
//	deletes an ajax dataset js code to the page 
//
// ARGUMENTS:
//	 dsName
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_deleteAjaxDataSet(dsName,aDOM)
{
	if (dsName && dsName.length)
	{
		if (confirm(MM.MSG_Spry_Del_DataReferences) == true)
		{
			var dsAjaxRegExpStr  =  "var\\s*" + dsName + "\\s*=\\s*new\\s*Spry\\.Data\\.XMLDataSet\\([\"'](.*)[\"']\\s*,\\s*([\"].*?[\"]|['].*?['])\\s*(,\\{.*?\\})?\\s*\\);?\\s*";
			var dsAjaxRegExp = new RegExp(dsAjaxRegExpStr,"ig");
			if (aDOM == null)
			{
				aDOM = dw.getDocumentDOM();
			}
			if (aDOM != null)
			{
				var jsScriptBlocks = aDOM.getElementsByTagName("script");
				for (var i=0; i < jsScriptBlocks.length; i++)
				{
					var aJSScriptBlock = jsScriptBlocks[i];
					if (aJSScriptBlock != null)
					{
						var jsCode = aJSScriptBlock.innerHTML;
						if ((jsCode != null) && (jsCode.length > 0))
						{
							var arr = null;
							if (jsCode.search(dsAjaxRegExp) != -1)
							{
								//replace the matched constructor with "";
								jsCode = jsCode.replace(dsAjaxRegExp,"");

								//replace the column signature if any
								var dsColTypeRegExpStr = dsName + "\\.setColumnType\\s*\\([\"']([\\w@\\:\\/]*)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);\\s*";
								var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
								//replace the column types
								while (jsCode.search(dsColTypeRegExp) != -1)
								{
									jsCode = jsCode.replace(dsColTypeRegExp,"");
								}
								//update the node 
								aJSScriptBlock.innerHTML = jsCode;
								break;
							}												
						}
					}
				}
			}
		}
	}
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isHTTPReference
//
// DESCRIPTION:
//	checks if the feedURI has http prefix already
//
// ARGUMENTS:
//	 feedURL
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_isHTTPReference(feedURL)
{
	var isHTTPReference = false;
	if (feedURL && feedURL.length)
	{
		isHTTPReference = ((feedURL.indexOf("http://") != -1) || (feedURL.indexOf("https://") != -1));
	}
	return isHTTPReference;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_docRelativeToSiteRelative
//
// DESCRIPTION:
//	convert from docrelative to site relative
//
// ARGUMENTS:
//	 feedURL
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_docRelativeToSiteRelative(feedURL, dom)
{
	var aFeedURL = feedURL;
	if ((aFeedURL.charAt(0) != '/') && dom)
	{
		//convert doc relative to site relative
		if (dom.URL && dom.URL.length)
		{
			var siteRootURL	= dreamweaver.getSiteRoot();
			var absoluteURL = dreamweaver.relativeToAbsoluteURL( dom.URL, siteRootURL, aFeedURL ); 
			aFeedURL = dom.localPathToSiteRelative(absoluteURL);
		}
	}
	return aFeedURL;	
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isDynamicFeed
//
// DESCRIPTION:
//	checks if extension of the feed is dynamic
//
// ARGUMENTS:
//	 feedURL
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_isDynamicFeed(feedURL)
{
	var bIsDynamic = false;
	if (feedURL && feedURL.length)
	{
		//remove the query params
		var qsParamsIndex = feedURL.indexOf("?");
		if  (qsParamsIndex != -1)
		{
			feedURL = feedURL.substring(0,qsParamsIndex);
		}

		var bDotIndex = feedURL.lastIndexOf(".");
		var fileExt = feedURL.substring(bDotIndex+1);
		for (var i=0; i < ajaxUtils._dynamicFeedExts.length; i++)
		{
			if (ajaxUtils._dynamicFeedExts[i] == fileExt)
			{
				bIsDynamic = true;
				break;
			}
		}
	}
	return bIsDynamic;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_fixDynamicFeed
//
// DESCRIPTION:
//	checks if extension of the feed is dynamic
//
// ARGUMENTS:
//	 feedURL
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_fixDynamicFeed(feedURL)
{
	var fixedFeedURL = feedURL;
	if (ajaxUtils.isHTTPReference(feedURL) == false)
	{
		var dom = dw.getDocumentDOM();
		var domURL = dom.URL;
		var siteName = null;
		if (domURL.length)
		{
			siteName = site.getSiteForURL(domURL);
		}
		else
		{
			siteName = site.getCurrentSite();
		}
		if (siteName && siteName.length)
		{
			var appURLPrefix = site.getAppURLPrefixForSite(siteName);
			if (appURLPrefix && appURLPrefix.length)
			{
				//convert the doc relative to site relative feed
				feedURL = ajaxUtils.docRelativeToSiteRelative(feedURL, dom);
				if (feedURL.charAt(0) == '/')
				{				
					//remove the prefix if existing from feedURL since it already part
					//of the appURLPrefix
					var siteURLPrefix = dom.getSiteURLPrefixFromDoc();
					var siteURLPrefixIndex = feedURL.indexOf(siteURLPrefix);
					if (siteURLPrefixIndex == 0)
					{
						siteURLPrefixIndex += siteURLPrefix.length + 1;
						feedURL = feedURL.substring(siteURLPrefixIndex);
					}
					fixedFeedURL = appURLPrefix + feedURL;
				}
			}
		}
	}
	return fixedFeedURL;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_trimXPath
//
// DESCRIPTION:
//	it trims the xpath , removes the filter expression
//
// ARGUMENTS:
//	 xpath
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_trimXPath(xPathRef)
{
	var retXPathRef = xPathRef;
	if (xPathRef && xPathRef.length)
	{
		var beginFilterIndex = xPathRef.indexOf("[");
		var endFilterIndex   = xPathRef.indexOf("]",beginFilterIndex);
		while ((beginFilterIndex != -1) && (endFilterIndex != -1))
		{
			//remove the "[foo]" filter criteria
			retXPathRef      = xPathRef.substring(0,beginFilterIndex) + xPathRef.substring(endFilterIndex+1);
			xPathRef		 = retXPathRef;
			beginFilterIndex = xPathRef.indexOf("[");
			endFilterIndex   = xPathRef.indexOf("]",beginFilterIndex);
		}
		retXPathRef = dwscripts.trim(retXPathRef);
		//if the first character is "/" , remove it
		if (retXPathRef.charAt(0) == "/")
		{
			//remove it an end slash
			retXPathRef = retXPathRef.substring(1,retXPathRef.length);
		}
	}
	return retXPathRef;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_trimQuotes
//
// DESCRIPTION:
//	it trims the quotes (double or single)
//
// ARGUMENTS:
//	 xpath
//
// RETURNS:
//   true/false
//--------------------------------------------------------------------
function ajaxUtils_trimQuotes(xPathRef)
{
	var retXPathRef = xPathRef;
	if (xPathRef && xPathRef.length)
	{
		//try to remove the double quotes 
		var firstCharIndex = 0;
		var lastCharIndex = xPathRef.length - 1;
		if ((xPathRef[firstCharIndex] == '"') && (xPathRef[lastCharIndex] == '"'))
		{
			retXPathRef = xPathRef.substring(firstCharIndex+ 1,lastCharIndex);
		}
		else if ((xPathRef[firstCharIndex] == "'") && (xPathRef[lastCharIndex] == "'"))
		{
			retXPathRef = xPathRef.substring(firstCharIndex+ 1,lastCharIndex);
		}

	}
	return retXPathRef;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_getDesignTimeSchemaURI
//
// DESCRIPTION:
//	get design time schema uri
//
// ARGUMENTS:
//	 dsName
//
// RETURNS:
//   return the design time schema uri
//
// PATENT:
//	Adobe patent application tracking #B463, entitled Design Time Feed, inventors: Amit Kishnani, Jorge Taylor 
//--------------------------------------------------------------------
function ajaxUtils_getDesignTimeSchemaURI(dsName)
{
	var designTimeSchemaURI = "";
	if (dsName)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = "spry_ds_" + dsName;
				designTimeSchemaURI = MMNotes.get(filePtr,dsKey);
				MMNotes.close(filePtr);
			}
		}
	}
	return designTimeSchemaURI;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_setDesignTimeSchemaURI
//
// DESCRIPTION:
//	set design time schema uri
//
// ARGUMENTS:
//	 dsName
//	 dsDesignTimeSchemaURI
//
// RETURNS:
//   return the design time schema uri
//--------------------------------------------------------------------
function ajaxUtils_setDesignTimeSchemaURI(dsName,dsDesignTimeSchemaURI)
{
	if (dsName && dsDesignTimeSchemaURI)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = "spry_ds_" + dsName;
				MMNotes.set(filePtr,dsKey, dsDesignTimeSchemaURI);
				MMNotes.close(filePtr);
			}
		}
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_removeDesignTimeSchemaURI
//
// DESCRIPTION:
//	remove design time schema uri
//
// ARGUMENTS:
//	 dsName
//
// RETURNS:
//   removes the design time schema uri
//--------------------------------------------------------------------
function ajaxUtils_removeDesignTimeSchemaURI(dsName)
{
	if (dsName && dsName.length)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = "spry_ds_" + dsName;
				MMNotes.remove(filePtr,dsKey);
				MMNotes.close(filePtr);
			}
		}
	}
}






//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_getAjaxDataTableCode
//
// DESCRIPTION:
//	adds an ajax data table html code to the page 
//
// ARGUMENTS:
//	 data table component
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_getAjaxDataTableCode(aDataTableComponent)
{
	var dsAjaxTableCode = "";
	var _lf = "\n";
	var _tab = "\t";
	var thHeader = '<th@@sort@@>@@colnamedisplay@@</th>';
	//var templateDivOpen = '<div id="@@dataTableId@@" spryregion="@@dsName@@">';
	//var templateDivClose = '</div>';
	if (aDataTableComponent != null)
	{
		//var dataTableId = aDataTableComponent.getDataTableId();
		var dsName = aDataTableComponent.getDataSetName();
		//form the html table code
		//dsAjaxTableCode = templateDivOpen;
		dsAjaxTableCode+='<table>';
		var schema
		var dom = dw.getDocumentDOM();
		var ajaxDataSets = ajaxUtils.getAjaxDataSets(dom,dsName);
		var anAjaxDataSet = null;
		var colList = aDataTableComponent.getColumnList();
		if (colList.length)
		{
			//add the column headers
			dsAjaxTableCode+=_tab;
			dsAjaxTableCode+='<tr>';
			for (var i=0; i < colList.length; i++)
			{
				//add it to the binding arrays,add it to the list
				var sortOrder = "";
				var aColNode = colList[i];
				var colNodeName = colList[i].getColLabel();
				var colNodeNameForDisplay = colList[i].getColLabelForDisplay();
				dsAjaxTableCode+=_lf;
				dsAjaxTableCode+=_tab;
				dsAjaxTableCode+=_tab;
				var jsColHeaderCode = thHeader;
				if (colList[i].isSortable())
				{
					sortOrder = colList[i].getSortOrder();					
					//jsColHeaderCode = jsColHeaderCode.replace(/@@sort@@/ig," onclick=\"@@dsName@@.sort(\'@@colname@@\',\'@@sortorder@@\')\"");
					//change to use spry 1.4 form
					jsColHeaderCode = jsColHeaderCode.replace(/@@sort@@/ig,' spry:sort="@@colname@@"');
				}
				else
				{
					jsColHeaderCode = jsColHeaderCode.replace(/@@sort@@/ig,"");
				}
				jsColHeaderCode = jsColHeaderCode.replace(/@@colname@@/ig,colNodeName);
				jsColHeaderCode = jsColHeaderCode.replace(/@@colnamedisplay@@/ig,colNodeNameForDisplay);				
				jsColHeaderCode = jsColHeaderCode.replace(/@@sortorder@@/ig,sortOrder);				
				dsAjaxTableCode+=jsColHeaderCode;
				//dsAjaxTableCode+='</th>';
			}
			dsAjaxTableCode+=_lf;
			dsAjaxTableCode+=_tab;
			dsAjaxTableCode+='</tr>';

			//add the data row
			dsAjaxTableCode+=_lf;
			dsAjaxTableCode+=_tab;

			if (aDataTableComponent.getCurrentRowBehavior())
			{
				//add the on click behavior
				//dsAjaxTableCode+='<tr spry:repeat="@@dsName@@" onclick="@@dsName@@.setCurrentRow(\'{ds_RowID}\');"';
				//change to use spry 1.4 form
				dsAjaxTableCode+='<tr spry:repeat="@@dsName@@" spry:setrow="@@dsName@@"';
			}
			else
			{
				dsAjaxTableCode+='<tr spry:repeat="@@dsName@@"';
			}
			//dsAjaxTableCode+='<tr spry:repeat="@@dsName@@"  onclick="@@dsName@@.setCurrentRow(\'{ds_RowID}\');" spryhover="rowHover" spryselect="rowSelected">';

			
			var oddClass    = aDataTableComponent.getOddClass();
			var evenClass   = aDataTableComponent.getEvenClass();
			var hoverClass  = aDataTableComponent.getHoverClass();
			var selectClass = aDataTableComponent.getSelectionClass();

			//set the odd row class if specified
			if (oddClass && oddClass.length)
			{
				dsAjaxTableCode = dsAjaxTableCode + ' spry:odd="' + oddClass + '"';
			}
			//set the even row class if specified
			if (evenClass && evenClass.length)
			{
				dsAjaxTableCode = dsAjaxTableCode + ' spry:even="' + evenClass + '"';
			}

			if (hoverClass && hoverClass.length)
			{
				dsAjaxTableCode = dsAjaxTableCode + ' spry:hover="' + hoverClass + '"';
			}

			if (selectClass && selectClass.length)
			{
				dsAjaxTableCode = dsAjaxTableCode + ' spry:select="' + selectClass + '"';
			}

			dsAjaxTableCode+='>';
			for (var i=0; i < colList.length; i++)
			{
				//add it to the binding arrays,add it to the list
				colNodeName = colList[i].getColLabel();
				colNodeName  = "{" + dsName + "::" + colNodeName  + "}";
				if (colList[i].getColType() == "image")
				{
					colNodeName = ajaxUtils.getSpryImageReference(colNodeName);
				}
				dsAjaxTableCode+=_lf;
				dsAjaxTableCode+=_tab;
				dsAjaxTableCode+=_tab;
				dsAjaxTableCode+='<td>';
				dsAjaxTableCode+=colNodeName ;
				dsAjaxTableCode+='</td>';
			}
			dsAjaxTableCode+=_lf;
			dsAjaxTableCode+=_tab;
			dsAjaxTableCode+='</tr>';
		}
		dsAjaxTableCode+=_lf;
		dsAjaxTableCode+='</table>';
		//dsAjaxTableCode+=_lf;
		//dsAjaxTableCode+= templateDivClose;
		//form the col header
		//form the row tokens
		//dsAjaxTableCode = dsAjaxTableCode.replace(/@@dataTableId@@/ig,dataTableId);
		dsAjaxTableCode = dsAjaxTableCode.replace(/@@dsName@@/ig,dsName);
	}
	return dsAjaxTableCode; 
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_initSpryLibraries
//
// DESCRIPTION:
//	 addeds the spry data libraries
//
// ARGUMENTS:
//	 none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_initSpryLibraries()
{
	var aDOM = dw.getDocumentDOM();
	var includeFileList = new Array();

	//add xpath.js
	var xPathIncludeFileInfo = new AssetInfo("Shared/Spry/Data/xpath.js","xpath.js", "javascript");
	includeFileList.push(xPathIncludeFileInfo);

	//add spryData.js
	var spryDataFileInfo = new AssetInfo("Shared/Spry/Data/SpryData.js","SpryData.js", "javascript");
	includeFileList.push(spryDataFileInfo);	

	//copy the include file list
	aDOM.copyAssets(includeFileList);
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_initSpryNS
//
// DESCRIPTION:
//	adds the spry namespace
//	
// ARGUMENTS:
//	 none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_initSpryNS()
{
	var spryNSLength   = 0;
	var bHasSpryNSAttr = false;
	var aDOM = dw.getDocumentDOM();
	var htmlNodes = aDOM.getElementsByTagName("html");
	if (htmlNodes && htmlNodes.length)
	{
		var aHTMLNode = htmlNodes[0];
		if (aHTMLNode)
		{
			var attrVal = aHTMLNode.getAttribute("xmlns:spry");
			if (attrVal == null)
			{
				//add the spry namespace attribute if not there
				var spryNSAttr = "xmlns:spry";
				var spryNSAttrValue = "http://ns.adobe.com/spry";				
				var lenBefore = aHTMLNode.outerHTML.length;
				aHTMLNode.setAttribute(spryNSAttr,spryNSAttrValue);
				spryNSLength = aHTMLNode.outerHTML.length - lenBefore;
			}
		}
	}
	return spryNSLength;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isInsideSpryRegion
//
// DESCRIPTION:
//	checks if the current selection has a spry region around it
//	
// ARGUMENTS:
//	 aDOM
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_isInsideSpryRegion(aDOM)
{
	var bIsInsideSpryRegion = false;
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}

	if (aDOM)
	{
		var selection = aDOM.getSelection();
		var origStartOffset = selection[0];
		var origEndOffset   = selection[1];
		var currNode    = aDOM.offsetsToNode(origStartOffset,origEndOffset);		
		if (currNode != null)
		{			
			var aParentNode = currNode;
			//get the node to offsets to compare whether there was an exact, complete selection
			var nodeOffsets = aDOM.nodeToOffsets(currNode);
			var bNodeItSelfIsSelected = false;

			if (((nodeOffsets[0] == origStartOffset) && (nodeOffsets[1] == origEndOffset)) ||
				((nodeOffsets[0] == origStartOffset) && (nodeOffsets[0] == origEndOffset)))
			{
				//also check when we are left at the tag by comparing the selection offsets
				//to beginning node offset of the tag(nodeOffsets[0])
				bNodeItSelfIsSelected = true; //node itself is completely selected
				//there can be two alternative wrap , replace the exact selection
				//wrap nesting is handled in contains spry region.
				aParentNode = currNode.parentNode;
			}						
			while (aParentNode)
			{
				if (aParentNode.nodeType == Node.ELEMENT_NODE)
				{
					//see if we have spry:region or spry:detailregion
					var spryRegionAttr = aParentNode.getAttribute("spry:region");
					if (spryRegionAttr == null)
					{
						spryRegionAttr = aParentNode.getAttribute("spry:detailregion");
					}					
					if (spryRegionAttr != null)
					{
						bIsInsideSpryRegion = true;
						break;	
					}
				}
				aParentNode = aParentNode.parentNode;
			}
		}
	}
	return bIsInsideSpryRegion;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_isInsideBody
//
// DESCRIPTION:
//	checks if the current selection is inside body
//	
// ARGUMENTS:
//	 aDOM
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_isInsideBody(aDOM)
{
	var bIsInsideBody = false;
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}

	if (aDOM)
	{
		var selection = aDOM.getSelection();
		var origStartOffset = selection[0];
		var origEndOffset   = selection[1];
		var currNode    = aDOM.offsetsToNode(origStartOffset,origEndOffset);		
		if (currNode != null)
		{			
			var aParentNode = currNode;
			//get the node to offsets to compare whether there was an exact, complete selection
			var nodeOffsets = aDOM.nodeToOffsets(currNode);
			var bNodeItSelfIsSelected = false;
			if ((nodeOffsets[0] == origStartOffset) && (nodeOffsets[1] == origEndOffset))
			{
				bNodeItSelfIsSelected = true; //node itself is completely selected
				//there can be two alternative wrap , replace the exact selection
				//wrap nesting is handled in contains spry region.
				aParentNode = currNode.parentNode;
			}						
			while (aParentNode)
			{
				if (aParentNode.nodeType == Node.ELEMENT_NODE)
				{
					if (aParentNode.tagName == "BODY")
					{
						bIsInsideBody = true;
						break;	
					}
				}
				aParentNode = aParentNode.parentNode;
			}
		}
	}
	return bIsInsideBody;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_containsSpryRegion
//
// DESCRIPTION:
//	checks if the current selection contains a spry:region
//	
// ARGUMENTS:
//	 aDOM
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_containsSpryRegion(aDOM)
{
	var bContainsSpryRegion = false;
	if (aDOM == null)
	{
		aDOM = dw.getDocumentDOM();
	}
	if (aDOM)
	{
		var selection = aDOM.getSelection();
		var origStartOffset = selection[0];
		var origEndOffset   = selection[1];
		var code = aDOM.source.getText(origStartOffset,origEndOffset);
		var cbObject = new Object();
		cbObject.attribute = function (name, code)
		{
			if ((name == "spry:region") || (name == "spry:detailregion"))
			{
				bContainsSpryRegion = true;
				return false;
			}

		}
		//call scan source string
		dw.scanSourceString(code, cbObject , false /*skip whitespace false*/);
	}
	return bContainsSpryRegion;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_promptForSpryRegion
//
// DESCRIPTION:
//	prompts for spry region
//	
// ARGUMENTS:
//	 codeOffsets
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_promptForSpryRegion(codeOffsets)
{
	var bAddSpryRegion = false;
	var bIsInsideSpryRegion = false;
	var aDOM = dw.getDocumentDOM();
	if (aDOM)
	{
		var origStartOffset = -1;
		var origEndOffset   = -1;
		if (codeOffsets)
		{
			origStartOffset = codeOffsets.startoffset;
			origEndOffset   = codeOffsets.endoffset;
		}
		else
		{
			var selection = aDOM.getSelection();
			origStartOffset = selection[0];
			origEndOffset   = selection[1];
		}
		var currNode    = aDOM.offsetsToNode(origStartOffset,origEndOffset);		
		if (currNode != null)
		{			
			var aParentNode = currNode;
			//get the node to offsets to compare whether there was an exact, complete selection
			var nodeOffsets = aDOM.nodeToOffsets(currNode);
			var bNodeItSelfIsSelected = false;
			if ((nodeOffsets[0] == origStartOffset) && (nodeOffsets[1] == origEndOffset))
			{
				bNodeItSelfIsSelected = true; //node itself is completely selected
				//there can be two alternative wrap , replace the exact selection
				//wrap nesting is handled in contains spry region.
				aParentNode = currNode.parentNode;
			}						
			while (aParentNode)
			{
				if (aParentNode.nodeType == Node.ELEMENT_NODE)
				{
					//see if we have spry:region or spry:detailregion
					var spryRegionAttr = aParentNode.getAttribute("spry:region");
					if (spryRegionAttr == null)
					{
						spryRegionAttr = aParentNode.getAttribute("spry:detailregion");
					}					
					if (spryRegionAttr != null)
					{
						bIsInsideSpryRegion = true;
						break;	
					}
				}
				aParentNode = aParentNode.parentNode;
			}
		}

		if (bIsInsideSpryRegion == false)
		{
			var bSpryRegionRegistry = dw.getPreferenceString("SPRY", "Add Spry Region", -1);
			if (bSpryRegionRegistry != -1)
			{
				//we have a persisted value
				bAddSpryRegion = (bSpryRegionRegistry == "true") ? true : false;
			}
			else
			{
				//else show the box again
				bAddSpryRegion = dwscripts.askOkCancel(MM.MSG_InsertASpryRegion,"SPRY", "Add Spry Region");
			}
		}
	}
	return bAddSpryRegion;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_wrapWithSpryRegion
//
// DESCRIPTION:
//	wraps a code chunk with spry region
//	
// ARGUMENTS:
//	 dsName
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_wrapWithSpryRegion(code,dsName)
{
	var codeWithSpryRegion = code;
	if (codeWithSpryRegion)
	{
		var spryContainerTag = "div";
		var spryRegionType = "spry:region";
		var startTag = "<" + spryContainerTag + " " + spryRegionType +"=\""  + dsName  + "\"" + ">";
		var endTag   = "</" + spryContainerTag + ">";
		codeWithSpryRegion = startTag  +  ajaxUtils._lf + codeWithSpryRegion;
		codeWithSpryRegion = codeWithSpryRegion + ajaxUtils._lf + endTag;
	}
	return codeWithSpryRegion;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_formatSpryDataRef
//
// DESCRIPTION:
//	formats a spry data reference (dsname , colName)
//	
// ARGUMENTS:
//	 dsName, colName
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_formatSpryDataRef(dsName, colName)
{
	var dsRef = "{" + dsName + "::" + colName + "}";
	return dsRef;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_getSpryImageReference
//
// DESCRIPTION:
//	gets a spry image reference
//	
// ARGUMENTS:
//	 spry image reference
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function ajaxUtils_getSpryImageReference(spryReference)
{
	var spryImgRef = "<img src=\"" + spryReference + "\"/>";
	return spryImgRef;
}

//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_fixDTDSchemaPathReference
//
// DESCRIPTION:
//	fix the dtd. schema path reference , remove the dtd, schema path 
//	
// ARGUMENTS:
//	xmlSource
//
// RETURNS:
//   xmlSource (without the dtd, schema)
//--------------------------------------------------------------------
function ajaxUtils_fixDTDSchemaPathReference(xmlSource)
{
	if (xmlSource && xmlSource.length)
	{
		var isDTD = false;
		var dtdRegExp = /<!\s*DOCTYPE\s*(.*)(SYSTEM|PUBLIC)\s*"(.*)"\s*>/ig;
		if (xmlSource.match(dtdRegExp) != null)
		{
			isDTD = true;
		}
		if (isDTD)
		{
			var dtdString = "";
			xmlSource = xmlSource.replace(dtdRegExp,dtdString);
		}
	}
	return xmlSource;
}


//--------------------------------------------------------------------
// FUNCTION:
//   ajaxUtils_canInsertSpryDataSets
//
// DESCRIPTION:
//	can insert spry datasets
//	
// ARGUMENTS:
//	nothing
//
// RETURNS:
//   checks if doc is saved or not
//--------------------------------------------------------------------
function ajaxUtils_canInsertSpryDataSets()
{
	var bCanInsert = false;
	var aDOM = dw.getDocumentDOM();
	if (aDOM)
	{
		if(aDOM.URL == '' )
		{
			bCanInsert = false; //cannot insert since document is not saved.
			if(confirm(MM.MSG_saveDocument))
			{
				if (dw.canSaveDocument(aDOM))
				{
					//check if document is saved
					dw.saveDocument(aDOM);
					bCanInsert = (aDOM.URL != '');
				}
			}					
		}
		else
		{
			bCanInsert = true;
		}
	}
	return bCanInsert;
}




//--------------------------------------------------------------------
// CLASS:
//   ajaxDesignTimeDataSet
//
// DESCRIPTION:
//	 design time represention for ajax data set
//
// PUBLIC FUNCTIONS:
//
//    ajaxDesignTimeDataSet
//--------------------------------------------------------------------
function ajaxDesignTimeDataSet(jsVarName,dataSetURL, dataSetPath)
{
	this.jsVarName = jsVarName;
	this.dataSetURL = dataSetURL;
	this.dataSetPath = dataSetPath;
	this.loadingError = false;
	//the resolved file url path
	this.fileDataSetURL = null;
	//col list
	this.colList = new Array();
	//options
	this.options = new Array();
	this.options["sortOnLoad"] = "";
	this.options["sortOrderOnLoad"] = "";
	this.options["distinctOnLoad"] = false;
	//true by default for useCache	
	this.options["useCache"] = true;
	this.options["loadInterval"] = -1;
	//internal, private variable
	this._createdSelfReferenceNode = null;
}

ajaxDesignTimeDataSet.prototype = 
{
	setColumnList: function(colList)
	{
		this.colList = colList;
	},
	getColumnList: function()
	{
		return this.colList;
	},
	getColType : function(colName)
	{
		var colType = null;
		for (var i=0; i < this.colList.length; i++)
		{
			var aCol = this.colList[i];
			if (aCol.getColName() == colName)
			{
				colType = aCol.getDataType();
				break;
			}
		}
		return colType;
	},
	getJSVarName : function()
	{
		return this.jsVarName;
	},
	getDataSetURL : function()
	{
		return this.dataSetURL;
	},
	getDataSetPath : function()
	{
		return this.dataSetPath;
	},
	IsError : function()
	{
		return this.loadingError;
	},
	getOptions: function()
	{
		return this.options;
	},
	getSortColOnLoad : function()
	{
		return this.options["sortOnLoad"];
	},
	setSortColOnLoad : function(sortColOnLoad)
	{
		this.options["sortOnLoad"] = sortColOnLoad;
	},
	getSortOrderOnLoad : function()
	{
		return this.options["sortOrderOnLoad"];
	},
	setOrderOnLoad : function(sortOrderOnLoad)
	{
		this.options["sortOrderOnLoad"] = sortOrderOnLoad;
	},
	getDistinct : function()
	{
		return this.options["distinctOnLoad"];
	},
	setDistinct : function (bDistinct)
	{
		this.options["distinctOnLoad"] = bDistinct;
	},
	getUseCache : function()
	{
		return this.options["useCache"];
	},
	setUseCache : function(bUseCache)
	{
		this.options["useCache"] = bUseCache;
	},
	getAutoRefreshInterval : function()
	{
		return this.options["loadInterval"] ;
	},
	getSelfReferenceNode : function()
	{
		return this._createdSelfReferenceNode;
	},
	setAutoRefreshInterval : function(autoRefreshInterval)
	{
		this.options["loadInterval"]  = autoRefreshInterval;
	},
	getResolvedURI : function (aURI)
	{
		var resolvedURI = aURI;
		if (aURI)
		{
			if (ajaxUtils.isDynamicFeed(aURI))
			{
				aURI = ajaxUtils.fixDynamicFeed(aURI);
			}
			//HACK: replace {dsTopSongs:@id} with 01 for sample data feed
			//dataSetURL = dataSetURL.replace(/\{\w+::@id\}/,"01");
			var isAbsReference = ((aURI.indexOf("http://") != -1) || (aURI.indexOf("https://") != -1) || (aURI.indexOf("file://") != -1));
			if (!isAbsReference)
			{
				if (aURI.charAt(0) == '/')
				{
					 //check for site relative path and map them to absolute path
					resolvedURI = site.siteRelativeToLocalPath(aURI);										
					resolvedURI = dwscripts.filePathToLocalURL(resolvedURI);
				}
				else
				{
					//doc relative to absolute
					var currDocURL = dreamweaver.getDocumentPath("DOCUMENT");
					var siteRootURL	= dreamweaver.getSiteRoot();
					if ((currDocURL != null) && (currDocURL.length))
					{
						resolvedURI = dreamweaver.relativeToAbsoluteURL( currDocURL, siteRootURL, aURI);
					}
					else
					{
						//append the site root folder if existing
						if ((siteRootURL != null) && (siteRootURL.length))
						{
							//append the uri to site root path
							resolvedURI =  siteRootURL + aURI;
						}
					}
				}
			}
			else
			{
				resolvedURI = aURI;
			}
		}
		return resolvedURI;
	},
	getFileDataSetURL : function()
	{
		if (this.fileDataSetURL == null)
		{
			this.fileDataSetURL = this.getResolvedURI(this.dataSetURL);
		}
		return this.fileDataSetURL;
	},
	getDesignTimeFeed : function()
	{
		// PATENT:
		// Adobe patent application tracking #B463, entitled Design Time Feed, inventors: Amit Kishnani, Jorge Taylor 

		var designTimeSchemaURI = ajaxUtils.getDesignTimeSchemaURI(this.jsVarName);
		if (designTimeSchemaURI && designTimeSchemaURI.length)
		{
			designTimeSchemaURI = this.getResolvedURI(designTimeSchemaURI);
		}
		return designTimeSchemaURI;
	},
	getSchemaString : function(bRefresh)
	{
		var xmlSchemaString = "";
		//give precedence to value of design time feed if supplied

		// PATENT:
		// Adobe patent application tracking #B463, entitled Design Time Feed, inventors: Amit Kishnani, Jorge Taylor 
		var dsDesignTimeSchemaURI = this.getDesignTimeFeed();
		if (dsDesignTimeSchemaURI && dsDesignTimeSchemaURI.length)
		{
			if (bRefresh)
			{
				xmlSchemaString = MMXSLT.getXMLSchema(dsDesignTimeSchemaURI,true,false);
			}
			else
			{
				xmlSchemaString = MMXSLT.getXMLSchema(dsDesignTimeSchemaURI,false,false);
			}
		}
		else
		{
			//else go for the live feed uri
			this.getFileDataSetURL();
			if (this.fileDataSetURL && this.fileDataSetURL.length)
			{
				if (bRefresh)
				{
					xmlSchemaString = MMXSLT.getXMLSchema(this.fileDataSetURL,true,false);
				}
				else
				{
					xmlSchemaString = MMXSLT.getXMLSchema(this.fileDataSetURL,false,false);
				}
			}
		}
		return xmlSchemaString;
	},
	IsValidSchemaString : function(schemaString)
	{
		var bIsValid = true;
		if (!schemaString)
		{
			bIsValid = false;
		}
		else
		{
			if (schemaString.length == 0)
			{
				bIsValid = false;
			}
		}
		if (bIsValid)
		{
			//try to locate if there are any error nodes
			var bErrorsOpenRegExp = /<errors>/ig;
			var bErrorsCloseRegExp = /<\/errors>/ig;
			if ((schemaString.search(bErrorsOpenRegExp) != -1) && (schemaString.search(bErrorsCloseRegExp) != -1))
			{
				bIsValid = false;
			}
		}
		return bIsValid;
	},
	getSchemaArray : function(bRefresh)
	{
		//get xml string
		var schemaArr = new Array();
		this.getFileDataSetURL();
		//get the file contents
		var xmlSchemaString = this.getSchemaString(bRefresh);
		if (xmlSchemaString && xmlSchemaString.length)
		{
			var newDOM = dwscripts.getEmptyDOM(); 
			newDOM.documentElement.outerHTML = xmlSchemaString; 				
			var elementNodes = newDOM.getElementsByTagName("ELEMENT");
			if ((elementNodes != null) && (elementNodes.length))
			{
				var parentRootElement = elementNodes[0];
				//append the "/" at the end if missing
				var xPathRef = this.dataSetPath;
				if (xPathRef && xPathRef.length)
				{
					//trim the xPathRef
					xPathRef = ajaxUtils.trimXPath(xPathRef);
					if (xPathRef.charAt(xPathRef.length -1) != "/")
					{
						//append an end slash
						xPathRef += "/";
					}
				}
				ajaxUtils._matchedNode = null;
				this.getDataSetNode(parentRootElement,xPathRef);
				dsNode = ajaxUtils._matchedNode;
				if (dsNode != null)
				{
					var bHasElementNodes = false;
					for (var i=0; i < dsNode.childNodes.length; i++)
					{
						var localname = dsNode.childNodes[i].getAttribute("localname");
						var nsname = dsNode.childNodes[i].getAttribute("ns");
						var nodetype = "ELEMENT";
						if (dsNode.childNodes[i].tagName == "ATTRIBUTE")
						{
							nodetype = "ATTRIBUTE";
							//add it to schemaArr
						}

						//add the schema node
						var aSchemaNode = new ajaxDSSchemaNode(nsname, localname, nodetype);
						schemaArr.push(aSchemaNode);
						if (dsNode.childNodes[i].tagName == "ELEMENT")
						{
							bHasElementNodes = true;
							//try to get attributes children for first level element nodes
							var elementNode = dsNode.childNodes[i];
							for (var j=0; j < elementNode.childNodes.length; j++)
							{
								if (elementNode.childNodes[j].tagName == "ATTRIBUTE")
								{
									var attrlocalname = elementNode.childNodes[j].getAttribute("localname");
									var attrnsname = elementNode.childNodes[j].getAttribute("ns");
									if (attrnsname.length == 0)
									{
										if (nsname && nsname.length)
										{
											//make the attribute namespace same as element namespace
											attrnsname = nsname;	
										}
									}
									nodetype = "ATTRIBUTE";
									var aSchemaAttrNode = new ajaxDSSchemaNode(attrnsname, attrlocalname, nodetype,aSchemaNode.getNodeName());
									aSchemaAttrNode.setNodeForAttr
									schemaArr.push(aSchemaAttrNode);
								}
							}
						}
					}

					//if we don't have any element node , then create a reference for self
					if (bHasElementNodes == false)
					{
						var localname = dsNode.getAttribute("localname");
						var nsname = dsNode.getAttribute("ns");
						var nodetype = "ELEMENT";
						if (dsNode.tagName == "ATTRIBUTE")
						{
							nodetype = "ATTRIBUTE";
						}
						var selfSchemaArr = new Array();
						var aSchemaNode = new ajaxDSSchemaNode(nsname, localname, nodetype);
						selfSchemaArr.push(aSchemaNode);
						//concat the schema array
						for (var k =0 ; k < schemaArr.length; k++)
						{
							selfSchemaArr.push(schemaArr[k]);
						}
						//schema array with self reference
						schemaArr = selfSchemaArr;	
						//store the self reference node
						this._createdSelfReferenceNode = aSchemaNode;					
					}
				}
			}
		}
		return schemaArr;
	},
	generateSampleDataTree : function(schemaNameArray, selfReferenceNode)
	{		
		//get the filedataseturl
		var sampleData = "";
		this.getFileDataSetURL();
		if (this.fileDataSetURL && this.fileDataSetURL.length)
		{
			var xmlSource  = "";
			var designTimeFeed = this.getDesignTimeFeed();
			if (designTimeFeed && designTimeFeed.length)
			{
				xmlSource = MMXSLT.getXML(designTimeFeed);
			}
			else
			{
				xmlSource = MMXSLT.getXML(this.fileDataSetURL);
			}			
			var xsltSource = this.generateXSLTSourceForTree(schemaNameArray,selfReferenceNode);
			//alert("xsltSource:" + xsltSource);
			//TODO : handle encoding for different languages

			//trim to remove spaces around the xmlsource
			xmlSource  = dwscripts.trim(xmlSource);
			var xmlCommentRegExp = /(<!--.*-->$)/i;
			while (xmlSource.match(xmlCommentRegExp) != null)
			{			
				//get the last index of the string
				var xmlCommentIndex = xmlSource.lastIndexOf(RegExp.$1);
				if (xmlCommentIndex != -1)
				{
					//remove the trailing xml comment
					xmlSource = xmlSource.substring(0,xmlCommentIndex);
					//trim to remove spaces around the xmlsource after removing the trailing xml comment
					xmlSource  = dwscripts.trim(xmlSource);
				}
			}

			//there could be multi-line trailing comment
			if (xmlSource && xmlSource.length)
			{
				var xmlSourceLength = xmlSource.length;
				var closingCommentIndex = xmlSource.lastIndexOf("-->");
				//check for last trailing multi-line comment if not caught by the above regular expression
				if ((closingCommentIndex != -1) && (closingCommentIndex == (xmlSourceLength - 3)))
				{
					//search backward for "<--"
					var beginClosingCommentIndex = xmlSource.lastIndexOf("<!--",closingCommentIndex);
					if (beginClosingCommentIndex != -1)
					{
						//remove the trailing multiline xml comment
						xmlSource = xmlSource.substring(0,beginClosingCommentIndex);						
						//trim to remove spaces around the xmlsource after removing the trailing xml comment
						xmlSource  = dwscripts.trim(xmlSource);
					}
				}
			}

			//remove any dtd references from xmlsource if it contains - since we are not validating
			//the xml source
			xmlSource = ajaxUtils.fixDTDSchemaPathReference(xmlSource);

			sampleData = XSLT.transform(xmlSource, xsltSource, null);
			//replace carriage return and tab character since they appear as square brackets
			if (sampleData && sampleData.length)
			{
				sampleData = sampleData.replace(/&#10;/ig,"");
				sampleData = sampleData.replace(/\t/ig,"");
			}			
			//replace it "mm_treecolumn and mm_treenode
			//sampleData = sampleData.replace(/mm_treecolumn/ig,"mm:treecolumn");
			//sampleData = sampleData.replace(/mm_treenode/ig,"mm:treenode");
			//alert("theHtmlTransformCode:" + sampleData);
		}
		return sampleData;
	},
	generateSampleDataHTMLTable : function(schemaNameArray)
	{		
		//get the filedataseturl
		var sampleData = "";
		this.getFileDataSetURL();
		if (this.fileDataSetURL && this.fileDataSetURL.length)
		{
			var xmlSource = MMXSLT.getXML(this.fileDataSetURL);
			var xsltSource = this.generateXSLTSource(schemaNameArray);
			//alert("xsltSource:" + xsltSource);
			//TODO : handle encoding for different languages
			sampleData = XSLT.transform(xmlSource, xsltSource, null);
			//replace carriage return and tab character since they appear as square brackets
			if (sampleData && sampleData.length)
			{
				sampleData = sampleData.replace(/&#10;/ig,"");
				sampleData = sampleData.replace(/\t/ig,"");
			}			
			//alert("theHtmlTransformCode:" + sampleData);
		}
		return sampleData;
	},
	generateXSLTSource : function(schemaNameArray,selfReferenceNode)
	{
		var xsltSource = "";		
		var xsltBeginCode = '<?xml version="1.0" encoding="iso-8859-1"?>\
		<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\
		<xsl:output method="html" encoding="iso-8859-1"/>\
		<xsl:template match="/">';
		xsltSource = xsltBeginCode;

		//add the table header
		//xsltSource+= "<table><tr>";
		xsltSource+= "<tr>";
		for (var i=0; i < schemaNameArray.length ; i++)
		{
			xsltSource+= '<th>';
			xsltSource+= schemaNameArray[i];
			xsltSource+= '</th>';
		}
		//close the header
		xsltSource += "</tr>";

		//add the xsl:for-each
		xsltSource += '<xsl:for-each select="';
		xsltSource += this.dataSetPath;
		xsltSource += '">';

		xsltSource+= "<tr>";
		for (var i=0; i < schemaNameArray.length ; i++)
		{
			xsltSource += '<td>';
			xsltSource += '<xsl:value-of select="';
			xsltSource += schemaNameArray[i];
			xsltSource += '"/>';
			xsltSource += '</td>';
		}
		//close the data row
		xsltSource += "</tr>";
		xsltSource += "</xsl:for-each>";
		//close the table
		//xsltSource += "</table>";

		//end of xslt code
		var xsltEndCode = '</xsl:template>\
		</xsl:stylesheet>';
		xsltSource += xsltEndCode;
		
		return xsltSource;
	},
	generateXSLTSourceForTree : function(schemaNameArray,selfReferenceNode)
	{
		var xsltSource = "";		
		var xsltBeginCode = '<?xml version="1.0" encoding="iso-8859-1"?>\
		<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mm="http://www.adobe.com">\
		<xsl:output method="html" encoding="iso-8859-1"/>\
		<xsl:template match="/">';
		xsltSource = xsltBeginCode;

		//add the column headers
		if (schemaNameArray && schemaNameArray.length)
		{
			var aColWidth = (Math.floor(ajaxUtils._testDialogTreeWidth/schemaNameArray.length));
			for (var i=0; i < schemaNameArray.length ; i++)
			{
				xsltSource+= '<mm:treecolumn name="' + schemaNameArray[i] + '" width="' +  aColWidth + '" value="' + schemaNameArray[i] + '" align="left">';
				xsltSource+= '</mm:treecolumn>';
			}
		}
		else
		{
			var schemaColName = "";
			var slashIndex = this.dataSetPath.lastIndexOf("/");
			if (slashIndex != -1)
			{
				schemaColName = this.dataSetPath.substring(slashIndex+1);
			}
			if (schemaColName != null)
			{
				xsltSource+= '<mm:treecolumn name="' + schemaColName + '" value="' + schemaColName + '" align="left">';
				xsltSource+= '</mm:treecolumn>';
			}
		}
		//close the header

		//add the xsl:for-each
		xsltSource += '<xsl:for-each select="';
		xsltSource += this.dataSetPath;
		xsltSource += '">';
		//limit the preview to first 20 rows of data
		xsltSource += '<xsl:if test="position() &lt;= 20">';		  

		xsltSource += '<mm:treenode ' + ' value="';
		if (schemaNameArray && schemaNameArray.length)
		{
			for (var i=0; i < schemaNameArray.length ; i++)
			{
				xsltSource += '{';				
				if (selfReferenceNode && (selfReferenceNode.getFullNodeName() == schemaNameArray[i]))
				{
					xsltSource += ".";
				}
				else
				{
					xsltSource += schemaNameArray[i];
				}
				xsltSource += '}';
				xsltSource += '|'; //pipe delimited string
			}
		}
		//close the data row
		xsltSource += '" state="expanded"></mm:treenode>';

		xsltSource += '</xsl:if>';
		xsltSource += "</xsl:for-each>";

		//end of xslt code
		var xsltEndCode = '</xsl:template>\
		</xsl:stylesheet>';
		xsltSource += xsltEndCode;
		return xsltSource;
	},
	getDataSetNode : function(aNode, dataSetPath)
	{
		if ((aNode.tagName == "ELEMENT") || (aNode.tagName == "ATTRIBUTE"))
		{
			var pathToMap = dataSetPath;
			var slashIndex = dataSetPath.indexOf("/");
			if (slashIndex != -1)
			{
				pathToMap = dataSetPath.substring(0,slashIndex);
			}
			var aNodeTagName = aNode.getAttribute("localname");
			var nsName = aNode.getAttribute("ns");
			if (nsName && nsName.length)
			{
				aNodeTagName = nsName + ":" + aNodeTagName;
			}
			if (pathToMap && pathToMap.length)
			{
				if (pathToMap[0] == '@')
				{
					//remove it for comparision purpose
					pathToMap = pathToMap.substr(1);
				}
			}
			if (aNodeTagName == pathToMap)
			{
				if (slashIndex != -1)
				{
					dataSetPath = dataSetPath.substring(slashIndex+1);
				}
				else
				{
					//last piece
					dataSetPath = "";
				}
				if (dataSetPath.length)
				{
					if (aNode.childNodes.length)
					{
						for (var i=0; i < aNode.childNodes.length; i++)
						{
							if (this.getDataSetNode(aNode.childNodes[i],dataSetPath))
							{
								return aNode.childNodes[i];
							}
						}
					}
				}
				else
				{
					ajaxUtils._matchedNode = aNode;
					return aNode;
				}
			}
			else
			{
				return null;
			}
		}			
	},
	buildOptionsString : function()
	{
		var optionsString = "";
		var optionsArray = this.getOptions();
		for (optKey in optionsArray)
		{
			var optVal = optionsArray[optKey];
			if (((optKey == "sortOnLoad") && (optVal && optVal.length)) ||
				((optKey == "sortOrderOnLoad") && (optVal && optVal.length)) ||
				((optKey == "distinctOnLoad") && (optVal == true)) ||
				((optKey == "useCache") && (optVal == false)) ||
				((optKey == "useCache") && (optVal == "false")) ||
				((optKey == "loadInterval") && (optVal != -1))) 
			{
					if (optionsString.length)
					{
						optionsString += ",";
					}
					//add the option key
					optionsString += optKey;
					//for string parameter
					optionsString += ":";
					if ((optKey == "sortOnLoad") || (optKey == "sortOrderOnLoad"))
					{
						optionsString += "\"";
					}
					//add the option value
					optionsString += optVal;
					if ((optKey == "sortOnLoad") || (optKey == "sortOrderOnLoad"))
					{
						optionsString += "\"";
					}
			}				 
		}
		if (optionsString.length)
		{
			optionsString = "{" + optionsString + "}";
		}
		return optionsString;
	}
}


//--------------------------------------------------------------------
// CLASS:
//   ajaxDSSchemaNode
//
// DESCRIPTION:
//	 design time represention for ajax schema nodes
//
// PUBLIC FUNCTIONS:
//
//    ajaxDSSchemaNode
//--------------------------------------------------------------------
function ajaxDSSchemaNode(nsname, nodename, nodetype, nodeForAttr)
{
	this.nsname = nsname;
	this.nodename = nodename;
	this.nodetype = nodetype;
	this.nodeForAttr = nodeForAttr;
}

ajaxDSSchemaNode.prototype = 
{
	getNSName: function()
	{
		return this.nsname;
	},
	getNodeName: function()
	{
		return this.nodename;
	},
	getNodeType : function()
	{
		return this.nodetype;
	},
	getNodeForAttr : function()
	{
		return this.nodeForAttr;
	},
	getFullNodeName : function()
	{
		var aNodeName = this.getNodeName();
		//add the namespace if not empty
		if ((this.nsname) && (this.nsname.length > 0))
		{
			aNodeName = this.nsname + ":" + aNodeName;
		}
		if (this.getNodeType() == "ATTRIBUTE")
		{
			aNodeName = "@" + aNodeName;
		}
		if (this.getNodeForAttr() != null)
		{
			aNodeName = this.getNodeForAttr() + "/" + aNodeName;
		}
		return aNodeName;
	}
}


//--------------------------------------------------------------------
// CLASS:
//   ajaxDSColNode
//
// DESCRIPTION:
//	 design time UI represention for ajax col nodes
//
// PUBLIC FUNCTIONS:
//
//    ajaxDSSchemaNode
//--------------------------------------------------------------------
function ajaxDSColNode(colname, datatype, displayformat, sourceformat)
{
	this.colname = colname;
	this.datatype= datatype;
	this.displayformat = displayformat;
	this.sourceformat = sourceformat;
}

ajaxDSColNode.prototype = 
{
	getColName: function()
	{
		return this.colname;
	},
	getDataType: function()
	{
		return this.datatype;
	},
	setDataType : function (datatype)
	{
		this.datatype = datatype;
	},
	getDisplayFormat : function()
	{
		return this.displayformat;
	},
	getSourceFormat : function()
	{
		return this.sourceformat;
	}
}


//--------------------------------------------------------------------
// CLASS:
//   ajaxDataTable
//
// DESCRIPTION:
//	 design time UI represention for ajax dataTable
//
// PUBLIC FUNCTIONS:
//
//    ajaxDataTable
//--------------------------------------------------------------------
function ajaxDataTable(dataTableId,dataSet, oddClass, evenClass, hoverClass, selectionClass)
{
	this.dataTableId = dataTableId;
	this.dataSet = dataSet;
	this.oddClass = oddClass;
	this.evenClass = evenClass;
	this.hoverClass = hoverClass;
	this.selectionClass = selectionClass;
	this.colList = new Array();
	this.bHasCurrentRowBehavior = false;
}

ajaxDataTable.prototype = 
{
	getColumnList : function()
	{
		return this.colList;
	},
	setColumnList : function(aColList)
	{
		this.colList = aColList;
	},
	getDataTableId: function()
	{
		return this.dataTableId;
	},
	getDataSetName: function()
	{
		return this.dataSet;
	},
	setDataSetName: function(dataSetName)
	{
		this.dataSet = dataSetName;
	},
	getOddClass : function()
	{
		return this.oddClass;
	},
	getEvenClass: function()
	{
		return this.evenClass;
	},
	getHoverClass : function()
	{
		return this.hoverClass;
	},
	getSelectionClass : function()
	{
		return this.selectionClass;
	},
	getCurrentRowBehavior : function()
	{
		return this.bHasCurrentRowBehavior;
	},
	setCurrentRowBehavior : function (bHasCurrentRowBehavior)
	{
		this.bHasCurrentRowBehavior = bHasCurrentRowBehavior;
	}
}

function ajaxDataTableColumn(colLabel, sortable , sortOrder, colType, colIdx)
{
	this.colLabel = colLabel;
	this.sortable = sortable;
	this.sortOrder = sortOrder;
	this.colType = colType;
	this.colIdx = colIdx;
}

ajaxDataTableColumn.prototype = 
{
	getColLabel : function()
	{
		return this.colLabel;
	},
	getColType : function()
	{
		return this.colType;
	},
	getColLabelForDisplay : function()
	{
		var colLabel = this.colLabel;
		if (colLabel && colLabel.length)
		{
			//get the first char
			var bAttr = false;
			var aFirstChar = colLabel[0];
			if (aFirstChar == '@')
			{
				//skip the "@" character , capitalize the character after "@"
				aFirstChar = colLabel[1];
				bAttr = true;
			}
			var strFirstChar = "" + aFirstChar;
			//convert it to upper case
			strFirstChar = strFirstChar.toUpperCase();
			//append it to label
			if (!bAttr)
			{
				colLabel = strFirstChar + colLabel.substr(1);
			}
			else
			{
				colLabel = strFirstChar + colLabel.substr(2);
			}
		}
		return colLabel;
	},
	setColLabel : function(colLabel)
	{
		this.colLabel = colLabel;
	},
	isSortable : function()
	{
		return this.sortable;
	},
	setSortable : function(sortable)
	{
		this.sortable = sortable;
	},
	getSortOrder : function()
	{
		return this.sortOrder;
	},
	setSortOrder : function(sortOrder)
	{
		this.sortOrder = sortOrder;
	},
	getColIndex : function()
	{
		return this.colIdx;
	},
	setColIndex : function(colIdx)
	{
		this.colIdx = colIdx;
	}
}

