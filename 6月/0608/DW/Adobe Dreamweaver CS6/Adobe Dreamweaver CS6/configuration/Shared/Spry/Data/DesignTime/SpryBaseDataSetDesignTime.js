// SpryDataSetDesignTime.js

/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2007 Adobe Systems Incorporated
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
**************************************************************************/

//////////////////////////////////////////////////////////////////////
//  NOTE: This file contains the definition of two classes the 
//        Spry.DesginTime.DataSet and the SpryDataSetProxy. 
//////////////////////////////////////////////////////////////////////
  


//////////////////////////////////////////////////////////////////////
//
//  CLASS:
//    Spry.DesignTime.DataSet
//
//  DESCRIPTION:
//    This is the base class for the design-time objects of the spry data sets.
//     
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       DataSet(dsName, dsURL, optionsObj)

//   Static methods:
//      selectionIsInsideSpryRegion(codeOffsets)
//
//   Getters and setters:
//      setWindowObj(parentWindow)
//      getDataSetName()
//      setDataSetName(dsName)
//      getDataSetURL()
//      setDataSetURL(fileURL)
//      getOptions()
//      setOptions(optionsObj)
//      IsDataLoaded()
//      setPreviewCtrl(previewCtrl, higlightColumns)
//      getNewDataSetName()
//      getDataSetNamesFromDoc(aDOM)
//      getNotesKeyPrefix()
//      getDesignTimeSchemaURI()
//      setDesignTimeSchemaURI(dsDesignTimeSchemaURI)
//      removeDesignTimeSchemaURI()
//
//   Utils:     
//      filterAndSortData()
//      showMessageInPreviewCtrl(strMessage)
//      clearPreviewCtrl()
//      highlightColumn(colIdx)
//      normalizeValueForPreview(value)
//      updateJSCode(theDOM, oldJSName)
//      removeFromPage(theDOM)
//      mapColumnTypesToIdx()
//
// PRIVATE METHODS:
//      _getResolvedURI(paramURI)
//      _isStaticPage(paramURI)
//      _feedIsFromTestingServer(paramURI)
//      _distinct(columnNames)
//      _sort(columnNames, sortOrder)
//      _getSortFunc(prop, type, order)
//      _buildSecondarySortFunc(funcA, funcB)
//      _convertToMultiline(strParam)
//      _attachDataPreviewEvents(headerElement, columnIdx, proxyObj)
//
//////////////////////////////////////////////////////////////////////

var Spry;
if (!Spry) Spry = {};
if (!Spry.DesignTime) Spry.DesignTime = {};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesginTime.DataSet
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of an Data Set object.
//
// ARGUMENTS:
//   dsName - string - The dataset name
//   dsURL - string - source file URL
//   optionsObj - object - dataset optional arguments.  
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet = function(dsName, dsURL, optionsObj)
{
  this.dsName = (dsName) ? dsName : null;                              // the data set name 
  this.dataSetURL = (dsURL) ? dsURL : null;
  this.realDataSetURL = null;
  this.isDataLoaded = false;

  this.parentWindowObj = null;       // the command dialog window
  this.previewBrowserCtrl = null;  
  this.previewColumnPrefix = "headerColumn";
  this.dsKeyPrefix = "";
  this.urlPointsToTestingServer = false;  
  this.strPreviewCSS = '<link href="dw://Configuration/Shared/Spry/Data/DesignTime/DataSetPreview.css" rel="stylesheet" type="text/css" />';
  this.strNotifyElementID = "spryDSNotifyContainer";
  this.strNotifyElement = '<table id="' + this.strNotifyElementID + '" border="0" width="100%" \
                                style="position: absolute; \
                                       left: 0px; \
                                       top: 0px; \
                                       height: 30px; \
                                       background-color: #FFFF99; \
                                       border: 1px solid black; \
                                       padding: 2px; \
                                       font-size: .8em;">\
                            <tr>\
                              <td style="border: 0px;" width="1%"><img src="%s" /></td>\
                              <td style="border: 0px"> %s </td> \
                            </tr>\
                           </table>';
};

//****************************** STATIC PROPERTIES **********************

Spry.DesignTime.DataSet.InfoImage = "dw://configuration/Shared/MM/Images/P_InfoMac_Sm_N.png";
Spry.DesignTime.DataSet.XMLDataSetType = "XMLDataSet";
Spry.DesignTime.DataSet.HTMLDataSetType = "HTMLDataSet";
Spry.DesignTime.DataSet.BrowserNotifyFrameSrc = "NotifyMessage";
Spry.DesignTime.DataSet.StaticPagesExt = ["HTM","HTML","HTA","HTC","XHTML", "XML", "RSS", "RDF"];
Spry.DesignTime.DataSet.DataTypes = ["string","number","date","html"];


//****************************** STATIC METHODS **********************
//--------------------------------------------------------------------
// FUNCTION:
//   selectionIsInsideSpryRegion
//
// DESCRIPTION:
//    This function determine if the IP is inside another spry region. 
//    Since we allways insert at the end of the selection, we will transform the selection
//    into an IP considering only the end offset.
//
// ARGUMENTS:
//    codeOffsets - (array - optional) selection offsets
//
// RETURNS:
//   (string) - the spry region name in which the IP is placed or null if the IP is not inside a Spry Region.
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.selectionIsInsideSpryRegion = function(codeOffsets)
{
	var retRegionName = null;
	var aDOM = dw.getDocumentDOM();

	if (aDOM)
	{
		var selection = aDOM.getSelection();
		var insertionPoint;
    
    if (codeOffsets)
    {
      insertionPoint = codeOffsets.endoffset;
    }
    else
    {
  		insertionPoint = selection[1];
    }

		var currNode = aDOM.offsetsToNode(insertionPoint,insertionPoint);
		// when the insertion point or the selection is just before or just after the spry region tag
		// this function will report that the selection is inside a spry region; we will correct that
		// by excluding those edge cases
  	var matchOffsets = aDOM.nodeToOffsets(currNode); 
  	if (insertionPoint == matchOffsets[0] || insertionPoint == matchOffsets[1])
  	{
  	  if (currNode && currNode.tagName != "BODY" && currNode.parentNode)
  	  {
    		currNode = currNode.parentNode;
    	}
  	}
    		
		if (currNode != null)
		{			
			var aParentNode = currNode;
			while (aParentNode)
			{
				if (aParentNode.nodeType == Node.ELEMENT_NODE)
				{
					//see if we have spry:region
					var spryRegionAttr = aParentNode.getAttribute("spry:region");
  				if (spryRegionAttr == null)
					{
            spryRegionAttr = aParentNode.getAttribute("spry:detailregion");
          }
					if (spryRegionAttr != null)
					{
						retRegionName = spryRegionAttr;
						break;	
					}
				}
				aParentNode = aParentNode.parentNode;
			}
		}
	}
	
	return retRegionName;
}


//****************************** PUBLIC METHODS **********************


//****************************** GETTERS/SETTERS  **********************

//--------------------------------------------------------------------
// FUNCTION:
//   setWindowObj
//
// DESCRIPTION:
//   Sets the command dialog window that use this design-time object. 
//
// ARGUMENTS:
//   parentWindow - object - window object
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setWindowObj = function(parentWindow)
{
  this.parentWindowObj = parentWindow;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetName
//
// DESCRIPTION:
//   This function returns the JS variable name.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - the JS variable name
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getDataSetName = function()
{
  return this.dsName;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDataSetName
//
// DESCRIPTION:
//   Sets the JS variable name. 
//
// ARGUMENTS:
//   dsName - string - JS variable name
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setDataSetName = function(dsName)
{
  this.dsName = dsName;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetURL
//
// DESCRIPTION:
//   Returns the file source URL. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   string - null if the file source is current document, file source URL if it's set 
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getDataSetURL = function()
{
  return this.realDataSetURL;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDataSetURL
//
// DESCRIPTION:
//   This function set's the Data Set URL, in addition if the fileURL is a relative
//  path, it will transform it in absolute http schema URL and store it in a
//  a private member variable.
//
// ARGUMENTS:
//   fileURL - (string) http/https schema URL or a document relative or site relative path
// RETURNS:
//   (string) - an empty string if the file path was converted successfully to an absolute http URL, an error message otherwise
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setDataSetURL = function(fileURL)
{
  var errStr;
  var isDesignTimeFeed = false;
  this.realDataSetURL = fileURL;
  if (fileURL)
  {
    // if there is a design time feed use it instead of the provided URL
    var designTimeFeed = this.getDesignTimeSchemaURI();
		if (designTimeFeed)
		{
      this.dataSetURL = designTimeFeed;
      isDesignTimeFeed = true; 
		}
		else
		{
    	this.dataSetURL = fileURL;
    }

  	this.fileDataSetURL = this._getResolvedURI(this.dataSetURL, isDesignTimeFeed);
  	if (!this.fileDataSetURL)
  	{
      errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/unsuportedSchema"), this.dataSetURL);
    }
  }
  else
  {
    errStr = dw.loadString("spry/dataset/designtime/message/emptyURL");
  }

  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getOptions
//
// DESCRIPTION:
//   Returns the data set options.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (object) - data set options
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getOptions = function()
{
  var optionsObj = new Object();
  for (var key in this.options)
  {
  optionsObj[key] = this.options[key];
  }

  return optionsObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setOptions
//
// DESCRIPTION:
//  Sets the data set options. 
//
// ARGUMENTS:
//   optionsObj - (object) new dataset options
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setOptions = function(optionsObj)
{
  if (optionsObj)
  {
    for (var key in optionsObj)
    {
      this.options[key] = optionsObj[key];
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   IsDataLoaded
//
// DESCRIPTION:
//   Checks to see if the this object contains any customization. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (boolean) - true of the design time object is customized
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.IsDataLoaded = function()
{
  return this.isDataLoaded;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setPreviewCtrl
//
// DESCRIPTION:
//   Sets the dialog control in which a preview of the first 20 rows will be displayed.  
//
// ARGUMENTS:
//  previewCtrl - (object) dialog preview control object 
//  higlightColumns - (boolean) decide if the header of the data previewed should be selectable 
//                              and the columns will be highlighted
//  
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setPreviewCtrl = function(previewCtrl, higlightColumns)
{
  if (previewCtrl)
  {
    this.previewBrowserCtrl = previewCtrl;
    this.previewHighlight = higlightColumns;
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNewDataSetName
//
// DESCRIPTION:
//   This function generates a new dataset unique name.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - new data set name
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getNewDataSetName = function()
{
  var theDOM = dw.getDocumentDOM();
  var arrDSNames = this.getDataSetNamesFromDoc(theDOM);

	if (arrDSNames.length > 0)
	{
		var index = 0;
		var bDone = false;
		while (!bDone)
		{
			index++;
			bDone = true; //by default
			dsName = this.varName + index;
			for (var i = 0; i < arrDSNames.length; i++)
			{
				if (arrDSNames[i] == dsName)
				{
					bDone = false;
					break;
				}
			}
		}
	}
	else
	{
		dsName = this.varName + "1"; //"ds1"
	}
	// set also the private member
	this.dsName = dsName;
   
	return dsName;
}

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetNamesFromDoc
//
// DESCRIPTION:
//	This function looks for the data sets in the document received as parameter 
//  and returns a list of all datasets names found.
//
// ARGUMENTS:
//	 aDOM - (object) the document object
//
// RETURNS:
//   (array) - list of html data set names
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getDataSetNamesFromDoc = function(aDOM)
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
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNotesKeyPrefix
//
// DESCRIPTION:
//   Returns the key needed to associate a design time feed to a dataset. 
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - notes key prefix
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getNotesKeyPrefix = function()
{
  return this.dsKeyPrefix;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDesignTimeSchemaURI
//
// DESCRIPTION:
//	get design time schema uri
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   return the design time schema uri
//
// PATENT:
//	Adobe patent application tracking #B463, entitled Design Time Feed, inventors: Amit Kishnani, Jorge Taylor 
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.getDesignTimeSchemaURI = function()
{
	var designTimeSchemaURI = "";
	if (this.dsName)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = this.dsKeyPrefix + this.dsName;
				designTimeSchemaURI = MMNotes.get(filePtr,dsKey);
				MMNotes.close(filePtr);
			}
		}
	}
	return designTimeSchemaURI;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDesignTimeSchemaURI
//
// DESCRIPTION:
//	set design time schema uri
//
// ARGUMENTS:
//	 dsDesignTimeSchemaURI
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.setDesignTimeSchemaURI = function(dsDesignTimeSchemaURI)
{
	if (this.dsName && dsDesignTimeSchemaURI)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = this.dsKeyPrefix + this.dsName;
				MMNotes.set(filePtr, dsKey, dsDesignTimeSchemaURI);
				MMNotes.close(filePtr);
			}
		}
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   removeDesignTimeSchemaURI
//
// DESCRIPTION:
//	remove design time schema uri
//
// ARGUMENTS:
//  None
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.removeDesignTimeSchemaURI = function()
{
	if (this.dsName)
	{
		var aDOM = dw.getDocumentDOM();
		if (aDOM && aDOM.URL && aDOM.URL.length)
		{
			var filePtr = MMNotes.open(aDOM.URL, true, false); // force open, not read-only
			if (filePtr)
			{
				var dsKey = this.dsKeyPrefix + this.dsName;
				MMNotes.remove(filePtr,dsKey);
				MMNotes.close(filePtr);
			}
		}
	}
}


//************************** UTILITY METHODS *************************

//--------------------------------------------------------------------
// FUNCTION:
//   filterAndSortData
//
// DESCRIPTION:
//   This function calls the necessary private functions that will do tha actual 
//  filtering and sorting.  
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.filterAndSortData = function()
{
  // If the distinct flag was set, run through all the records in the recordset
  // and toss out any that are duplicates.

  // reset dataset data
  this.data = this.unfilteredData;
  this.dataHash = this.unfilteredDataHash;

  if (this.options.distinctOnLoad)
  {
    this._distinct();
  }

  // If sortOnLoad was set, sort the data based on the columns
  // specified in sortOnLoad.
  if (this.options.sortOnLoad)
  { 
    this._sort(this.options.sortOnLoad, this.options.sortOrderOnLoad);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   showMessageInPreviewCtrl
//
// DESCRIPTION:
//   This function display a message in the preview control.
//
// ARGUMENTS:
//   strMessage - (string) message that need to be displayed
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.showMessageInPreviewCtrl = function(strMessage)
{
  if (this.previewBrowserCtrl)
  {
    var newDOM = dw.getNewDocumentDOM();
    var previewTableContent = "";
    var headTags = newDOM.getElementsByTagName("HEAD");
    
    if (headTags && headTags[0])
    {
      headTags[0].innerHTML += this.strPreviewCSS;
    }
    
    previewTableContent += dwscripts.sprintf(this.strNotifyElement, Spry.DesignTime.DataSet.InfoImage, strMessage);
    newDOM.body.innerHTML = previewTableContent;
    
    this.previewBrowserCtrl.loadHTML(newDOM.documentElement.outerHTML);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   clearPreviewCtrl
//
// DESCRIPTION:
//   This function removes all the content from the preview control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.clearPreviewCtrl = function()
{
  if (this.previewBrowserCtrl && this.previewBrowserCtrl.openURL)
  {
    this.previewBrowserCtrl.loadHTML("");
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   highlightColumn
//
// DESCRIPTION:
//   This function use the helper object "SpyProxyObj", to highlight the column 
//  received as parameter.
//
//
// ARGUMENTS:
//   colIdx - (number) the column index that needs to be highlighted
//
// RETURNS:
//   nothing 
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.highlightColumn = function(colIdx)
{
  if (this.previewBrowserCtrl)
  {
    var browserWnd = this.previewBrowserCtrl.getWindowObj();
    if (browserWnd && browserWnd["SpyProxyObj"])
    {
      browserWnd["SpyProxyObj"].setDSPreviewColumn(colIdx);
      // force control to repaint itself
      browserWnd.focus(); 
    }    
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   normalizeValueForPreview
//
// DESCRIPTION:
//   This function replace all special characters with theirs entity values.
//
// ARGUMENTS:
//   value - (string) the value that needs to be updated 
//
// RETURNS:
//   (string) - changed value
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.normalizeValueForPreview = function(value)
{
  var retValue = new String(value);  

  if (retValue)
  {
    retValue = retValue.replace(/</g,"&lt;");
    retValue = retValue.replace(/>/g,"&gt;");
  }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   updateJSCode
//
// DESCRIPTION:
//   This function updates the JS code from page for the data set to which this object is 
//  associated.
//
// ARGUMENTS:
//   theDOM - (object) file source's document object
//   oldJSName - (string) js data set name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.updateJSCode = function(theDOM, oldJSName)
{
  var dsName = (oldJSName) ? oldJSName : this.dsName;
  if (theDOM)
  {
    var newJSCode = this.getGeneratedCode(true);
    var dsRegExpStr  =  "(?:var\\s*)?" + dsName + "\\s*=\\s*new\\s*Spry\\.Data\\.(XMLDataSet|HTMLDataSet)\\([\"']*.*?[\"']*\\s*,\\s*[\"'].*?[\"']\\s*(?:,\\s*\\{.*?\\})?\\)\\s*;?(?:\\s*" + oldJSName + "\\.setColumnType\\(\\s*['\"].*?['\"]\\s*,\\s*['\"].*?['\"]\\s*\\);)*";
    var dsRegExp = new RegExp(dsRegExpStr,"ig");
    var jsScriptBlocks = theDOM.getElementsByTagName("script");

    for (var i = 0; i < jsScriptBlocks.length; i++)
    {
      var aJSScriptBlock = jsScriptBlocks[i];
      if (aJSScriptBlock != null)
      {
        var jsCode = aJSScriptBlock.innerHTML;
        if ((jsCode != null) && (jsCode.length > 0))
        {
          var arr = null;
          if (jsCode.search(dsRegExp) != -1)
          {
            //replace the column signature if any
            var dsColTypeRegExpStr = this.dsName + "\\.setColumnType\\s*\\([\"']([\\w@\\:\\/]*)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);\\s*";
            var dsColTypeRegExp = new RegExp(dsColTypeRegExpStr,"ig");
            //replace the column types
            while (jsCode.search(dsColTypeRegExp) != -1)
            {
	            jsCode = jsCode.replace(dsColTypeRegExp,"");
            }

            //replace the matched constructor with "";
            jsCode = jsCode.replace(dsRegExp, newJSCode);

            //update the node 
            aJSScriptBlock.innerHTML = jsCode;
            break;
          }												
        }
      }
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   removeFromPage
//
// DESCRIPTION:
//   This function removes the JS code that corresponds to this data set object.   
//
// ARGUMENTS:
//   theDOM - (object) file source's document object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.removeFromPage = function(theDOM)
{
  var retValue = true;
  if (theDOM)
  {
    if (confirm(MM.MSG_Spry_Del_DataReferences) == true)
    {
      var dsRegExpStr  =  "(?:var\\s*)?" + this.dsName + "\\s*=\\s*new\\s*Spry\\.Data\\.(\\w+)\\([\"']*.*?[\"']*\\s*,\\s*[\"'].*?[\"']\\s*(?:,\\s*\\{.*?\\})?\\)\\s*;?\\s*";
      var dsRegExp = new RegExp(dsRegExpStr,"ig");
      var jsScriptBlocks = theDOM.getElementsByTagName("script");

      for (var i = 0; i < jsScriptBlocks.length; i++)
      {
        var aJSScriptBlock = jsScriptBlocks[i];
        if (aJSScriptBlock != null)
        {
          var jsCode = aJSScriptBlock.innerHTML;
          if ((jsCode != null) && (jsCode.length > 0))
          {
            var arr = null;
            if (jsCode.search(dsRegExp) != -1)
            {
              //replace the matched constructor with ""
              jsCode = jsCode.replace(dsRegExp,"");

              //replace the column signature if any
              var dsColTypeRegExpStr = this.dsName + "\\.setColumnType\\s*\\([\"']([\\w@\\:\\/]*)[\"'],\\s*[\"'](\\w*)[\"']\\s*\\);\\s*";
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
    else
    {
      retValue = false;
    }
    
  }
  
  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   mapColumnTypesToIdx
//
// DESCRIPTION:
//    The columns types are stored in the design-time objects by column indexes
//    but in the code they are generated using the columns names
//    this function will be used by the design-time object to map the column types
//    to column indexes
//
// ARGUMENTS:
//    none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype.mapColumnTypesToIdx = function()
{
  var newColTypesObj = new Object();
  var columnsNames = this.getColumnNames();

  if (this.columnTypes)
  {
    // the key variable will be the column name 
    for (var key in this.columnTypes)
    {
      var colIdx = dwscripts.findInArray(columnsNames, key);
      
      if (colIdx != -1)
      {
        newColTypesObj[colIdx] = this.columnTypes[key];
      }
    }
    this.columnTypes = newColTypesObj; 
  }
};

//****************************** PRIVATE METHODS *********************


//--------------------------------------------------------------------
// FUNCTION:
//   _getResolvedURI
//
// DESCRIPTION:
//   This function transforms received parameter paramURI into an absolute http/https URL
//
// ARGUMENTS:
//   paramURI - (string) the URI that needs to be resolved
//
// RETURNS:
//   (string) - resolved URI or null if there is an unsuported URL schema
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._getResolvedURI = function (paramURI, isDesignTimeFeed)
{
	var resolvedURI = paramURI;
	
	this.urlPointsToTestingServer = false;
	// we should always try to get the source of file through http/https
	// if we couldn't we should try to get the absolute file path and read the file directly
  if (!paramURI.match(/^(?:file|https?):\/\//i))
  {
    if (paramURI.match(/^[\w\w]+?:/i))
    {
      // this is an unsuported URL schema
      resolvedURI = null;
    }
    else
    {
      if (paramURI.indexOf("/") == 0)
      {
        // this is a site relative path
  			//check for site relative path and map them to absolute path
  			resolvedURI = site.siteRelativeToLocalPath(paramURI);										
  			resolvedURI = dwscripts.filePathToLocalURL(resolvedURI);
      }
      else
      {
        // this is document relative path
  			// doc relative to absolute
  			var currDocURL = dreamweaver.getDocumentPath("DOCUMENT");
  			var siteRootURL	= dreamweaver.getSiteRoot();
  			if ((currDocURL != null) && (currDocURL.length))
  			{
  				resolvedURI = dreamweaver.relativeToAbsoluteURL(currDocURL, siteRootURL, paramURI);
  			}
  			else
  			{
  				//append the site root folder if it exists
  				if ((siteRootURL != null) && (siteRootURL.length))
  				{
  					//append the uri to site root path
  					resolvedURI =  siteRootURL + paramURI;
  				}
  			}
      }
      if (!isDesignTimeFeed && !this._isStaticPage(resolvedURI))
      {
        // we've obtained the local url of the file
        // now we need to transform that url in to an absolute http url to the 
        // testing server or local server
        var relativePath = dwscripts.getSiteRelativePath(resolvedURI);
        
        if (site.getAppURLPrefixForSite() &&
              site.getAppURLPrefixForSite() != "http://" && 
              relativePath && 
              relativePath != dwscripts.localURLToFilePath(resolvedURI))
        {
          relativePath = relativePath.replace(/\\|:/g, "/");
          resolvedURI = site.getAppURLPrefixForSite() + relativePath;
          this.urlPointsToTestingServer = true;          
        }
      }
    }
  }
  
	return resolvedURI;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _isStaticPage
//
// DESCRIPTION:
//   This function determines if provided URI is the path for a static document (html or xml)
//
// ARGUMENTS:
//   paramURI - (string)
//
// RETURNS:
//   (string) - true if its a static page false if is a pa
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._isStaticPage = function (paramURI)
{
  var retValue = true;

  if (paramURI)
  {
    var fileExt = null;
  	//remove the query params
  	var idx = paramURI.indexOf("?");
  	if  (idx != -1)
  	{
  		paramURI = paramURI.substring(0, idx);
  	}
  
  	var dotIdx = paramURI.lastIndexOf(".");
  	if (dotIdx != -1)
  	{
      fileExt = paramURI.substring(dotIdx + 1);
  	}
  	
  	if (fileExt && dwscripts.findInArray(Spry.DesignTime.DataSet.StaticPagesExt, fileExt.toUpperCase()) == -1)
  	{
  	  // return false only if the file ext is not o our list
      retValue = false;
    }
  }
  
  return retValue;
}

//--------------------------------------------------------------------
// FUNCTION:
//   _feedIsFromTestingServer
//
// DESCRIPTION:
//   This function determines if provided URI is the path for a static document (html or xml)
//
// ARGUMENTS:
//   paramURI - (string)
//
// RETURNS:
//   (string) - true if its a static page false if is a pa
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._feedIsFromTestingServer = function()
{

};

//--------------------------------------------------------------------
// FUNCTION:
//   _distinct
//
// DESCRIPTION:
//   Removes all duplicated rows from the resulting data set. A row is considered duplicate
//  when all columns are identical. 
//
// ARGUMENTS:
//   columnNames - data set column names
//  
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._distinct = function(columnNames)
{
	if (this.data)
	{
		var oldData = this.data;
		this.data = [];
		this.dataHash = {};

		var alreadySeenHash = {};
		var i = 0;

		var keys = [];

		if (typeof columnNames == "string")
			keys = [columnNames];
		else if (columnNames)
			keys = columnNames;
		else
			for (var recField in oldData[0])
				keys[i++] = recField;

		for (var i = 0; i < oldData.length; i++)
		{
			var rec = oldData[i];
			var hashStr = "";
			for (var j=0; j < keys.length; j++)
			{
				recField = keys[j];
				if (recField != "ds_RowID")
				{
					if (hashStr)
						hashStr += ",";
					hashStr += recField + ":" + "\"" + rec[recField] + "\"";
				}
			}
			if (!alreadySeenHash[hashStr])
			{
				this.data.push(rec);
				this.dataHash[rec['ds_RowID']] = rec;
				alreadySeenHash[hashStr] = true;
			}
		}
	}
};

//--------------------------------------------------------------------
// FUNCTION:
//   _sort
//
// DESCRIPTION:
//   Sorts the resulting data set 
//
// ARGUMENTS:
//   columnNames - (string or array) can be either the name of a column to
//                    sort on, or an array of column names, but it can't be
//                    null/undefined.
//   sortOrder - (string) the sort direction; values that can be specified are "ascending" or "descending"
//  
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._sort = function(columnNames, sortOrder)
{

	if (!columnNames)
		return;

	// If only one column name was specified for sorting, do a
	// secondary sort on ds_RowID so we get a stable sort order.

	if (typeof columnNames == "string")
		columnNames = [ columnNames, "ds_RowID" ];
	else if (columnNames.length < 2 && columnNames[0] != "ds_RowID")
		columnNames.push("ds_RowID");

	if (!sortOrder)
		sortOrder = "ascending";

	var cname = columnNames[columnNames.length - 1];
	var sortfunc = this._getSortFunc(cname, this.getColumnType(cname), sortOrder);

	for (var i = columnNames.length - 2; i >= 0; i--)
	{
		cname = columnNames[i];
		sortfunc = this._buildSecondarySortFunc(this._getSortFunc(cname, this.getColumnType(cname), sortOrder), sortfunc);
	}

  this.data.sort(sortfunc);
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getSortFunc
//
// DESCRIPTION:
//  This function is copied as it is from the Spry framework HTMLDataSet class.     
//  Retrieves the sort function that will be used when sorting the data set array.   
//
// ARGUMENTS:
//   prop - (string) the column name for which the data set will sorted 
//   type - (string) the column data type (number, date, string)
//   order - (string) sort order
//
// RETURNS:
//   (function) - the function that specifies the sort order of the data
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._getSortFunc = function(prop, type, order)
{
	var sortfunc = null;
	if (type == "number")
	{
		if (order == "ascending")
			sortfunc = function(a, b)
			{
				a = a[prop]; b = b[prop];
				if (a == undefined || b == undefined)
					return (a == b) ? 0 : (a ? 1 : -1);
				return a-b;
			};
		else // order == "descending"
			sortfunc = function(a, b)
			{
				a = a[prop]; b = b[prop];
				if (a == undefined || b == undefined)
					return (a == b) ? 0 : (a ? -1 : 1);
				return b-a;
			};
	}
	else if (type == "date")
	{
		if (order == "ascending")
			sortfunc = function(a, b)
			{
				var dA = a[prop];
				var dB = b[prop];
				dA = dA ? (new Date(dA)) : 0;
				dB = dB ? (new Date(dB)) : 0;
				return dA - dB;
			};
		else // order == "descending"
			sortfunc = function(a, b)
			{
				var dA = a[prop];
				var dB = b[prop];
				dA = dA ? (new Date(dA)) : 0;
				dB = dB ? (new Date(dB)) : 0;
				return dB - dA;
			};
	}
	else // type == "string" || type == "html"
	{
		if (order == "ascending")
			sortfunc = function(a, b){
				a = a[prop];
				b = b[prop];
				if (a == undefined || b == undefined)
					return (a == b) ? 0 : (a ? 1 : -1);
				var tA = a.toString();
				var tB = b.toString();
				var tA_l = tA.toLowerCase();
				var tB_l = tB.toLowerCase();
				var min_len = tA.length > tB.length ? tB.length : tA.length;

				for (var i=0; i < min_len; i++)
				{
					var a_l_c = tA_l.charAt(i);
					var b_l_c = tB_l.charAt(i);
					var a_c = tA.charAt(i);
					var b_c = tB.charAt(i);
					if (a_l_c > b_l_c)
						return 1;
					else if (a_l_c < b_l_c)
						return -1;
					else if (a_c > b_c)
						return 1;
					else if (a_c < b_c)
						return -1;
				}
				if(tA.length == tB.length)
					return 0;
				else if (tA.length > tB.length)
					return 1;
				return -1;
			};
		else // order == "descending"
			sortfunc = function(a, b){
				a = a[prop];
				b = b[prop];
				if (a == undefined || b == undefined)
					return (a == b) ? 0 : (a ? -1 : 1);
				var tA = a.toString();
				var tB = b.toString();
				var tA_l = tA.toLowerCase();
				var tB_l = tB.toLowerCase();
				var min_len = tA.length > tB.length ? tB.length : tA.length;
				for (var i=0; i < min_len; i++)
				{
					var a_l_c = tA_l.charAt(i);
					var b_l_c = tB_l.charAt(i);
					var a_c = tA.charAt(i);
					var b_c = tB.charAt(i);
					if (a_l_c > b_l_c)
						return -1;
					else if (a_l_c < b_l_c)
						return 1;
					else if (a_c > b_c)
						return -1;
					else if (a_c < b_c)
						return 1;
				}
				if(tA.length == tB.length)
					return 0;
				else if (tA.length > tB.length)
					return -1;
				return 1;
			};
	}

	return sortfunc;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _buildSecondarySortFunc
//
// DESCRIPTION:
//   Return a secondary ordering function. 
//
// ARGUMENTS:
//   funcA - (function) first function that sort the data
//   funcB - (function) second function tha will do the sort in case the first function 
//                  does nothing (first function consider the parameters equals)
// RETURNS:
//   (function) - the function that specifies the sort order of the data
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._buildSecondarySortFunc = function(funcA, funcB)
{
	return function(a, b)
	{
		var ret = funcA(a, b);
		if (ret == 0)
			ret = funcB(a, b);
		return ret;
	};
}

//--------------------------------------------------------------------
// FUNCTION:
//   _convertToMultiline
//
// DESCRIPTION:
//	This function replace the \n characters from the localizable strings retrieved from the xml files 
//  with the same character, to solve the problem with alerts that needs to display
//  messages on multilines.
//
// ARGUMENTS:
//	 strParam - (string) string that needs to be converted
//
// RETURNS:
//   (string) - converted string
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._convertToMultiline = function(strParam)
{
  if (strParam)
  {
    return strParam.replace(/\\n/g, "\n");
  }
  
  return strParam;

};
//--------------------------------------------------------------------
// FUNCTION:
//   _attachDataPreviewEvents
//
// DESCRIPTION:
//   Helper function used to attach events to header columns in the data preview control.
//
// ARGUMENTS:
//   headerElement - (object) table cell element
//   columnIdx - (number) column index
//   proxyObj - (object) the object that is attached to the preview control window
//
// RETURNS:
//   (nothing)
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.prototype._attachDataPreviewEvents = function(headerElement, columnIdx, proxyObj)
{
  headerElement.addEventListener("click", function() { proxyObj.setDSPreviewColumn(columnIdx);}, true);
}

//////////////////////////////////////////////////////////////////////
//
//  CLASS:
//    SpryDataSetProxy
//
//  DESCRIPTION:
//	 Class used to intermediate communication between webkit control and the Data Set DesignTime object. 
//
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       SpryDataSetProxy(windowObj, pageDOM, imgMarker, imgMarkerSel)
//
//   Utils:     
//
//       selectElement(elementID, imgEl, divID)
//       unSelectElement()
//       highlightElement(divID)
//       unHighlightElement(divID)
//       setDSPreviewColumn(columnIdx)
//       updateColumnName(columnIdx, columnName)
//
//////////////////////////////////////////////////////////////////////

//--------------------------------------------------------------------
// FUNCTION:
//   SpryDataSetProxy
//
// DESCRIPTION:
//   Constructor function for the object that is passed to the webkit control. 
//
// ARGUMENTS:
//   windowObj - (object) the calling command window 
//   frameWindow - (object) the window object of the frame to which this object is attached
//   fileURL - (string) file URL of the frame to which this object is attached
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
SpryDataSetProxy = function(windowObj, frameWindow, fileURL)
{
  this.frameWindow = frameWindow;
  this.fileURL = fileURL;
  this.prevSelectedMaskID = null;
  this.timeOutId = null;
  this.showMarkesTimeId = null;
  this.containersHash = new Object();
  this.parentWindowObj = windowObj;
  this.markersMap = null; 
}

//--------------------------------------------------------------------
// FUNCTION:
//   setMarkersMap
//
// DESCRIPTION:
//   This function maps the markers and masks with the page elements. 
//
// ARGUMENTS:
//   markersArray -  (array) array of objects that holds the marker id along with mask id and page element id   
//
// RETURNS:
//   none
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.setMarkersMap = function (markersArray)
{
  this.markersMap = markersArray;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getMarkersMap
//
// DESCRIPTION:
//   This function return a cached maps of the markers, masks and page elements. 
//
// ARGUMENTS:
//   None   
//
// RETURNS:
//   (array) - map of markers, masks and selectable page elments
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.getMarkersMap = function ()
{
  return this.markersMap;
};

//--------------------------------------------------------------------
// FUNCTION:
//   selectElement
//
// DESCRIPTION:
//   This function shows as selected the element specified as parameter. 
//
// ARGUMENTS:
//   elementID -  (string) id of the element that needs to be shown as selected
//   imgEl - (object) the marker image element
//   divID - (string) the id of the element that needs to be selected
//
// RETURNS:
//   (boolean) - true if element was successfully selected, false otherwise
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.selectElement = function (elementID, imgEl, divID, dontNotify)
{
  var retValue = true;
  
  if (imgEl && divID)
  {
    var divEl = this.frameWindow.document.getElementById(divID);
    var containerEl = this.frameWindow.document.getElementById(elementID);
    
    if (divEl)
    {
      if (!this.prevSelectedMaskID || this.prevSelectedMaskID != divID)
      {
      	imgEl.src = Spry.DesignTime.HTMLDataSet.MarkerImageSel;
      	divEl.style.backgroundColor = "blue";
      	divEl.style.opacity = ".2";
      	divEl.style.border = "2px solid blue";
      	divEl.style.zIndex = "98";
        if (divEl.scrollIntoViewIfNeeded)
        {
          divEl.scrollIntoViewIfNeeded(false); 
        }
      	
      	// change tooltip text
        var tooltipEl = this.frameWindow.document.getElementById("spryDSTooltipElement");
        if (tooltipEl)
        {
          tooltipEl.innerHTML = Spry.DesignTime.HTMLDataSet.TooltipSelectedStr;
        }
        this.unSelectElement();
 
       	this.prevSelectedMaskID = divID;
        if (!dontNotify)
        {
         	this.parentWindowObj.updateUI("containerID", {frameWnd: this.frameWindow, fileURL: this.fileURL, containerID: elementID});
        }
       	retValue = true;
      }
      else
      {
        // unselect current element
      	imgEl.src = Spry.DesignTime.HTMLDataSet.MarkerImage;
      	divEl.style.backgroundColor = "";
      	divEl.style.opacity = "1";
       	divEl.style.zIndex = "-1";
      	this.prevSelectedMaskID = null;
      	

      	// change tooltip text
        var tooltipEl = this.frameWindow.document.getElementById("spryDSTooltipElement");
        if (tooltipEl)
        {
          tooltipEl.innerHTML = Spry.DesignTime.HTMLDataSet.TooltipDefaultStr;
        }
        if (!dontNotify)
        {
          this.parentWindowObj.updateUI("containerID", "");
        }
      }
    }
    else
    {
      retValue = false;
    }
  }
  else if (this.prevSelectedMaskID)
  {
    // unselect current selected element
    var prevDIVEl = this.frameWindow.document.getElementById(this.prevSelectedMaskID);
    
    if (prevDIVEl)
    {
      var prevImgEl = prevDIVEl.nextSibling;
      if (prevImgEl)
      { 
      	prevImgEl.src = Spry.DesignTime.HTMLDataSet.MarkerImage;
      	prevDIVEl.style.backgroundColor = "";
      	prevDIVEl.style.opacity = "1";
      	prevDIVEl.style.border = "0px";
      	prevDIVEl.style.zIndex = "-1";
      }
      this.prevSelectedMaskID = null;
      if (!dontNotify)
      {
       	this.parentWindowObj.updateUI("containerID", "");
      }
    }
  }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   unSelectElement
//
// DESCRIPTION:
//   This function unselect all selected elements from this frame. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.unSelectElement = function ()
{
  if(this.prevSelectedMaskID)
  {
    // unselect previous selected element
    var prevDIVEl = this.frameWindow.document.getElementById(this.prevSelectedMaskID);
    
    if (prevDIVEl)
    {
      var prevImgEl = prevDIVEl.nextSibling;
      if (prevImgEl)
      { 
      	prevImgEl.src = Spry.DesignTime.HTMLDataSet.MarkerImage;
      	prevDIVEl.style.backgroundColor = "";
      	prevDIVEl.style.opacity = "1";
      	prevDIVEl.style.border = "0px";
      	prevDIVEl.style.zIndex = "-1";
      }
    }
    this.prevSelectedMaskID = null;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   highlightElement
//
// DESCRIPTION:
//   This function highlights the specified element by placing a blue border arround it,
//   also it display a tooltip.
//
// ARGUMENTS:
//   divID -  (string) id of the element 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.highlightElement = function (divID)
{
  if (divID)
  {
    var divEl = this.frameWindow.document.getElementById(divID);
    var self = this;
    
    if (divEl)
    {
      // draw the border arround the selected element
    	divEl.style.border = "2px solid blue";
    	divEl.style.zIndex = "98";
    	this.timeOutId = this.parentWindowObj.setTimeout(function()
    	{
      	// show tooltip
      	// to show the tooltip we need to find the maker image and take his alt attribute value
        var markerEl = divEl.nextSibling;
        if (markerEl)
        {
          var tooltipStr;
          if (markerEl.src && markerEl.src.indexOf(Spry.DesignTime.HTMLDataSet.MarkerImageDis) != -1)
          {
            tooltipStr = Spry.DesignTime.HTMLDataSet.TooltipDisabledStr;
          }
          else
          {
            if (divID == self.prevSelectedMaskID)
            {
              tooltipStr = Spry.DesignTime.HTMLDataSet.TooltipSelectedStr;
            }
            else
            {
              tooltipStr = Spry.DesignTime.HTMLDataSet.TooltipDefaultStr;
            }
          }
          
          var tooltipEl = self.frameWindow.document.getElementById("spryDSTooltipElement");
          if (tooltipEl)
          {
            tooltipEl.innerHTML = tooltipStr;
            tooltipEl.style.display = "block";
            if (self.frameWindow.innerWidth < (markerEl.offsetLeft + tooltipEl.offsetWidth + 23) && markerEl.offsetLeft > tooltipEl.offsetWidth) 
            {
              tooltipEl.style.left = (markerEl.offsetLeft - tooltipEl.offsetWidth) + "px";
            }
            else
            {
              tooltipEl.style.left = (markerEl.offsetLeft + 23) + "px";
            }
            tooltipEl.style.top = (markerEl.offsetTop + 23) + "px";
          }
        }
       }, 500);
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   unHighlightElement
//
// DESCRIPTION:
//   This function unhighlights the specified elements.
//
//
// ARGUMENTS:
//   divID - (string) id of the element 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.unHighlightElement = function (divID)
{
  // clear timeout
  if (this.timeOutId)
  {
    this.parentWindowObj.clearTimeout(this.timeOutId);
    this.timeOutId = null;
  }
 
  if (divID && this.prevSelectedMaskID != divID)
  {
    var divEl = this.frameWindow.document.getElementById(divID);
    if (divEl)
    {
    	divEl.style.border = "0px";
    	divEl.style.zIndex = "1";
    }
  }
  // hide the tooltip element
  var tooltipEl = this.frameWindow.document.getElementById("spryDSTooltipElement");
  if (tooltipEl)
  {
    tooltipEl.style.display = "none";
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDSPreviewColumn
//
// DESCRIPTION:
//   This function highlights the entire specified column in the preview control. 
//
// ARGUMENTS:
//   columnIdx - (string) column index
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.setDSPreviewColumn = function (columnIdx)
{
  var rowsEl = this.frameWindow.document.getElementsByTagName("TR");
  var headerColEl = null;
  
  if (typeof(this.prevColumn) != "undefined")
  {
    for (var i = 0; i < rowsEl.length; i++)
    {
      var arrTHEls = rowsEl[i].getElementsByTagName("TH");
      if (arrTHEls[this.prevColumn])
      {
        arrTHEls[this.prevColumn].style.backgroundColor = "";
      }
      
      var arrTDEls = rowsEl[i].getElementsByTagName("TD");
      if (arrTDEls[this.prevColumn])
      {
        arrTDEls[this.prevColumn].style.backgroundColor = "";
      }
    }
  }
  for (var i = 0; i < rowsEl.length; i++)
  {
    var arrTHEls = rowsEl[i].getElementsByTagName("TH");
    if (arrTHEls[columnIdx])
    {
      arrTHEls[columnIdx].style.backgroundColor = "#CCFFFF";
      headerColEl = arrTHEls[columnIdx];       
    }
    
    var arrTDEls = rowsEl[i].getElementsByTagName("TD");
    if (arrTDEls[columnIdx])
    {
      arrTDEls[columnIdx].style.backgroundColor = "#CCFFFF";
    }
  }

  if (headerColEl && headerColEl.scrollIntoViewIfNeeded)
  {
    headerColEl.scrollIntoViewIfNeeded(false); 
  }
  this.prevColumn = columnIdx;
  this.parentWindowObj.updateUI("previewColumn", columnIdx);
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateColumnName
//
// DESCRIPTION:
//   Helper function which will update the value for the specified column.  
//
// ARGUMENTS:
//  columnIdx - (number) column index
//  columnName - (string) new column name
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.updateColumnName = function (columnIdx, columnName)
{
  var headersEls = this.frameWindow.document.getElementsByTagName("TH");
  
  if (headersEls.length && headersEls[columnIdx])
  {
    headersEls[columnIdx].firstChild.innerHTML = columnName;
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   domTreeModified
//
// DESCRIPTION:
//   This function is called when the dom is modified (nodes added or removed)  
//
// ARGUMENTS:
//  eventObj - (object) the event object 
//  designTimeObj - (object) the data set design time object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.domTreeModified = function (eventObj, designTimeObj)
{
  var self = this;
  if (this.showMarkesTimeId == null)
  {
    this.showMarkesTimeId = this.frameWindow.setTimeout(function()
    {
      designTimeObj.setMarkerPositions(self.frameWindow);
      self.frameWindow.clearTimeout(self.showMarkesTimeId);
      self.showMarkesTimeId = null;
    }, 100);
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   toogleErrorDetails
//
// DESCRIPTION:
//   This function shows/hides the detailed error message. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
SpryDataSetProxy.prototype.toogleErrorDetails = function ()
{
  var detailsContainerEl = this.frameWindow.document.getElementById("httpStatusDetailsContainer"); 
  var toggleMessageEl = this.frameWindow.document.getElementById("httpStatusToggleMessage");
	
  if (detailsContainerEl)
  {
    if (detailsContainerEl.style.display == "none")
    {
      detailsContainerEl.style.display = "block";
      toggleMessageEl.innerHTML = dw.loadString("spry/dataset/wizard/label/hideDetails");
    }
    else
    {
      detailsContainerEl.style.display = "none";
      toggleMessageEl.innerHTML = dw.loadString("spry/dataset/wizard/label/seeDetails");
    }
  }
}


//////////////////////////////////////////////////////////////////////
//
// END SpryDataSetProxy
//
//////////////////////////////////////////////////////////////////////


//****************************** CALLBACK METHODS *****************************//


//--------------------------------------------------------------------
// FUNCTION:
//   OnPreviewPageLoadedCallBack
//
// DESCRIPTION:
//   Callback function called when the generated page for preview of the dataset is loaded
//  in the preview control.
//
// ARGUMENTS:
//   designTimeObj - (object) Spry.DesginTime.HTMLDataSet object
//   headers  - (array) dataset column names
//   highlightedColumn - (number) index of initial highlighted column
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
OnPreviewPageLoadedCallBack = function(designTimeObj, headers, highlightedColumn)
{
  if (designTimeObj && designTimeObj.previewHighlight)
  {
    // add onclick events
    var browserWnd = designTimeObj.previewBrowserCtrl.getWindowObj();
    var previewCtrlDOM = browserWnd.document;
    var dsProxy = new SpryDataSetProxy(designTimeObj.parentWindowObj, browserWnd);
    
    if (typeof(highlightedColumn) != "undefined")
    {
      dsProxy.prevColumn = highlightedColumn;
    }
    
    browserWnd["SpyProxyObj"] = dsProxy;
    
    for (var i = 0; i < headers.length; i++)
    {
      var headerEl = previewCtrlDOM.getElementById(designTimeObj.previewColumnPrefix + i);
      if (headerEl)
      {
        designTimeObj._attachDataPreviewEvents(headerEl, i, dsProxy);
        if (highlightedColumn == i)
        {
          if (headerEl.scrollIntoViewIfNeeded)
          {
            headerEl.scrollIntoViewIfNeeded(false); 
          }
        }
      }
    }
  }
};

