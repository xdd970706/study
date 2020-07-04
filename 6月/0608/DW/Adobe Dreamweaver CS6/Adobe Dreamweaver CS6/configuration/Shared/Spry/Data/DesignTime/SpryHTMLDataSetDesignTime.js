// SpryHTMLDataSetDesignTime.js

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
//
//  CLASS:
//    Spry.DesginTime.HTMLDataSet
//
//  DESCRIPTION:
//    This class is a design-time representation of an Spry HTML Data Set
//    It is used by all commands and classes that are bound to Spry HTML Data Set.
//     
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       HTMLDataSet(dsName, dsURL, dsContainerID, optionsObj)
//
//
//   Getters and setters:
//
//       getType()
//       getSourceElement()
//       setSourceElement(sourceElement)
//       getSourceElementID()
//       getRootElement()
//       setSourceElementID(sourceElementID)
//       getColumnNames()
//       setColumnsNames(arrColNamesParam)
//       getColumnIndex(columnName)
//       getColumnType(column, byIndex)
//       setColumnType(columnIdx, colType)
//       getAllColumnsTypes()
//       setAllColumnsTypes(paramColumnsTypes)
//       getNoOfRows()
//       isCustomized()
//       getBrowserControl()
//       setBrowserControl(browserCtrl)
//       getGeneratedCode()
//       getAssetsFiles()
//       getSelectableElementsIds()
//       getLastErrorMessage()

//
//   Utils:     
//       copyDSOptions(dataSetObj)
//       switchFrameSource(frameWnd, frameURL)
//       fetchDataFromSourceFile()
//       loadURLInBrowser()
//       loadDataIntoDataSet(dontFilter)
//       constructDataSet(dontFilter)
//       filterAndSortData()
//       clearDataSetContent()
//       hasCustomColumnsNames()
//       hasCustomColumns()
//       hasSelectableElements()
//       updatePreviewCtrl(highlightedColumn)
//       updatePreviewColumnName(colIdx, columnName)
//       clearBrowserCtrl()
//       showHiddenDataContainers()
//       markAllSelectableElements(elNames)
//       setMarkerPositions()
//       clearMarkers()
//       selectDataContainer(containerID)
//       displayHttpStatusError(errStr)
//
// PRIVATE METHODS:
//
//       _getFileSourceString()
//       _setSourceElement()
//       _processHTTPResponse(responseObj)
//       _getDataFromSourceElement()
//       _findAllPageFrames(mainWindow, documentURL)
//       _getRelativeFrameURL(parentURL, frameURL)
//       _getDataFromHTMLTable()
//       _getDataFromNestedStructure()
//       _applySelector(collection, selector, root)
//       _evalSelector(node, root, selector)
//       _getNodesByFunc(root, func)
//       _getNextSibling(node)
//       _normalizeColumnName(colName)
//       _getRowsList(tableNode)
//       _getOptionsString()
//       _getMarkerPosition(elementObj, arrMarkersPositions)
//       _getAllHTMLDSNamesFromDoc(documentObj)
//       _attachMarkerEvents(elementID, markerElement, proxyObj, maskElementId)
//       _elementIsOrInsideSpryRegion (elementObj)
//
//////////////////////////////////////////////////////////////////////

var Spry;
if (!Spry) Spry = {};
if (!Spry.DesignTime) Spry.DesignTime = {};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesginTime.HTMLDataSet
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of an HTML Data Set object.
//
// ARGUMENTS:
//   dsName - string - The dataset name
//   dsURL - string - source file URL
//   dsContainerID - string - data container element id
//   optionsObj - object - dataset optional arguments.  
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet = function(dsName, dsURL, dsContainerID, optionsObj)
{
  Spry.DesignTime.DataSet.call(this, dsName, dsURL, optionsObj);
  
  this.type = Spry.DesignTime.DataSet.HTMLDataSetType;
  this.sourceDOM = null;             // the DOM of the source file
  this.sourceElement = null;         // The actual html element to be used as a data source
  this.previewBrowserCtrl = null;
  this.browserCtrl = null;
  this.data = null;
  this.dataHash = null;
  this.unfilteredDataHash = null;
  this.unfilteredData = null;
  this.fileSourceString = null;
  this.columnTypes = null;
  
  this.sourceElementID = (dsContainerID) ? dsContainerID : null;       // ID of the html element to be used as a data source
  this.originalColNames = null;
  this.dataColNames = null; // An array of the actual column names that were used to store data in each row.
  this.totalNoOfRows = 0; 
  this.dataSetURL = null;

  if (dsURL != null)
  {
    this.dataSetURL = dsURL;
  }
  else
  {
    var theDOM = dw.getDocumentDOM();
    if (theDOM)
    {
      this.dataSetURL = dwscripts.getFileName(theDOM.URL);  
    }
  }
  
  // initialize the options objects
  this.options = {};
  this.optionsDefaultValues = {};
  this.optionsDefaultValues.firstRowAsHeaders = true;
  this.optionsDefaultValues.useColumnsAsRows = false;
  this.optionsDefaultValues.useCache = true;
  this.optionsDefaultValues.loadInterval = null;
  this.optionsDefaultValues.distinctOnLoad = false;
  this.optionsDefaultValues.tableModeEnabled = true;
  this.optionsDefaultValues.removeUnbalancedRows = true;
  this.options.firstRowAsHeaders = this.optionsDefaultValues.firstRowAsHeaders;
  this.options.useColumnsAsRows = this.optionsDefaultValues.useColumnsAsRows;
  this.options.useCache = this.optionsDefaultValues.useCache;
  this.options.loadInterval = this.optionsDefaultValues.loadInterval;
  this.options.distinctOnLoad = this.optionsDefaultValues.distinctOnLoad;
  this.options.tableModeEnabled = this.optionsDefaultValues.tableModeEnabled;
  this.options.removeUnbalancedRows = this.optionsDefaultValues.removeUnbalancedRows;

  this.pageFrames = null;
  this.varName = "ds";
  this.dsKeyPrefix = "spry_html_ds_";
  this.defaultAsyncCallBack = "onReceiveResponseAsync";
  this.imgMarkerIDPrefix = "imgMarker";
  this.divMaskIDPrefix = "divMask";
  this.disabledMarkerPrefix = "spryUnselectableContainer";
  this.markersContainerID = "spryDSMarkersContainer";
  
  this.jsCodeTemplate = 'var @@dsName@@ = new Spry.Data.HTMLDataSet(@@dsFileSource@@, "@@dsContainerID@@"@@options@@);';
  this.jsColTypesTemplate = '@@dsName@@.setColumnType("@@colname@@", "@@coltype@@");';
  this.findRegExpStr = "(\\w*)\\s*=\\s*new\\s*Spry\\.Data\\.HTMLDataSet\\(\\s*(?:(null)|[\"']*(.*?)[\"']*)\\s*,\\s*[\"'](.*?)[\"']\\s*(?:,\\s*(\\{.*?\\}))?\\s*\\)";
  this.maskElementStr = '<div id="' + this.divMaskIDPrefix + '%s" style="position: absolute; \
                                                                         left: %spx; \
                                                                         top: %spx; \
                                                                         width: %spx; \
                                                                         height: %spx; \
                                                                         display: none; \
                                                                         z-index: -1 \
                        "></div>';
  this.markerImgElStr = '<img id="' + this.imgMarkerIDPrefix + '%s" src="%s" style="position: absolute; \
                                                                                    left: %spx; \
                                                                                    top: %spx; \
                                                                                    border: 0px; \
                                                                                    display: none; \
                                                                                    z-index: 99; \
                        " >';
  this.strTooltipElement = '<div id="spryDSTooltipElement" style="position: absolute; \
                                                                  display: none; \
                                                                  top: 0px; \
                                                                  left: 0px; \
                                                                  border: 1px solid black; \
                                                                  padding: 3px; \
                                                                  background-color: #FFFFE1; \
                                                                  z-index: 99; \
                                                                  white-space: nowrap; \
                                                                  text-aling: left \
                            "></div>';
  this.strBrowserNotifyElementID = "spryBrowserNotifyID";
  this.strBrowserShowURLSourceID = "spryBrowserShowSourceID";
  this.markerDim = 18;
  this.selectableElementsIds = new Array();
  this.lastErrorMsg = null;
  
  if (optionsObj)
  {
    this.setOptions(optionsObj);
  }
  this.setDataSetURL(this.dataSetURL);
}

// Spry.DesignTime.HTMLDataSet derives from our Spry.DesignTime.DataSet
// class, so create a Base object and use it as our prototype so we inherit all of its
// methods.

Spry.DesignTime.HTMLDataSet.prototype = new Spry.DesignTime.DataSet();

// Reset the constructor property back to HTMLDataSet for our newly created prototype
// object so callers know that our object was created with the HTMLDataSet constructor.

Spry.DesignTime.HTMLDataSet.prototype.constructor = Spry.DesignTime.HTMLDataSet;


//****************************** STATIC PROPERTIES **********************

Spry.DesignTime.HTMLDataSet.MarkerImage = "dw://configuration/Shared/MM/Images/marker.png";
Spry.DesignTime.HTMLDataSet.MarkerImageSel = "dw://configuration/Shared/MM/Images/marker_s.png";
Spry.DesignTime.HTMLDataSet.MarkerImageDis = "dw://configuration/Shared/MM/Images/marker_dis.png";
Spry.DesignTime.HTMLDataSet.WarningIcon = "dw://configuration/Shared/MM/Images/warningIcon.png";
Spry.DesignTime.HTMLDataSet.TooltipDefaultStr = dw.loadString("spry/dataset/designtime/message/enabledMarkerTooltip");
Spry.DesignTime.HTMLDataSet.TooltipSelectedStr = dw.loadString("spry/dataset/designtime/message/selectedMarkerTooltip");
Spry.DesignTime.HTMLDataSet.TooltipDisabledStr = dw.loadString("spry/dataset/designtime/message/disabledMarkerTooltip");

//****************************** PUBLIC METHODS **********************


//****************************** GETTERS/SETTERS  **********************

//--------------------------------------------------------------------
// FUNCTION:
//   getType
//
// DESCRIPTION:
//   This function ...
//
// ARGUMENTS:
//   none 
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getType = function()
{
  return this.type;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSourceElement
//
// DESCRIPTION:
//   Returns the data container element. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (object) - data container element
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getSourceElement = function() 
{ 
  return this.sourceElement; 
};

//--------------------------------------------------------------------
// FUNCTION:
//   setSourceElement
//
// DESCRIPTION:
//   Sets the data container element. 
//
// ARGUMENTS:
//   sourceElement - (object) data container element
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setSourceElement = function(sourceElement)
{
  this.sourceElement = sourceElement; 
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSourceElementID
//
// DESCRIPTION:
//   Returns the data container element id. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - data container element id
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getSourceElementID = function() 
{ 
  return this.sourceElementID; 
};

//--------------------------------------------------------------------
// FUNCTION:
//   getRootElement
//
// DESCRIPTION:
//   This function ...
//
// ARGUMENTS:
//   none 
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getRootElement = function()
{
  return this.sourceElementID;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setSourceElementID
//
// DESCRIPTION:
//   Sets the data container element id. 
//
// ARGUMENTS:
//   sourceElementID - (string) data container element id
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setSourceElementID = function(sourceElementID)
{
  this.sourceElementID = sourceElementID; 
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnNames
//
// DESCRIPTION:
//   This function returns the data set column names. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array) - list of column names
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getColumnNames = function()
{
  var columnNames = new Array();
  
  if (this.options.columnNames && this.options.columnNames.length)
    columnNames = columnNames.concat(this.options.columnNames);
  else if (this.data && this.data.length && this.dataColNames)
    columnNames = columnNames.concat(this.dataColNames);
  
  return columnNames;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setColumnsNames
//
// DESCRIPTION:
//   This function compare the list of columns received as parameter with the original
//  data set column names, if there are no differences the columns aliases array is set to null
//  else the arrColNamesParam are copied to the column aliases dataset member. 
//
// ARGUMENTS:
//   arrColNamesParam - (array) list of column names
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setColumnsNames = function(arrColNamesParam)
{
  if (!arrColNamesParam)
  {
    this.options.columnNames = null;
  }
  else
  {
    // see if there are any custom names defined
    // if so construct the aliases list
    // if there are no custom column names set the columnNames property to null
    if (this.data && this.data.length)
    {
      var arrColNames = [];
      if (this.dataColNames)
        arrColNames = this.dataColNames;

      var identical = true;
      for(var i = 0; i < arrColNames.length; i++)
      {
        if (arrColNames[i] != arrColNamesParam[i])
        {
          identical = false;
          break;
        }
      }
      if (identical)
      {
        // no custom column names
        this.options.columnNames = null;
      }
      else
      {
        this.options.columnNames = arrColNamesParam;
      }
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnIndex
//
// DESCRIPTION:
//   This function retrieves the index of the specified column from the dataset columns list.
//
// ARGUMENTS:
//   columnName - (string) column name
//
// RETURNS:
//   (number) - a number grater than -1 if the specified column is specified, -1 otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getColumnIndex = function(columnName)
{
  var retValue = -1;
  var colNames = this.getColumnNames();
  
  if (columnName && colNames && colNames.length)
  {
    retValue = dwscripts.findInArray(colNames, columnName);
  }
  
  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnType
//
// DESCRIPTION:
//   Returns the column type for the column index specified as parameter, if the column index is
//  not found in the columnTypes member variable it assumed that it's of type string.
//
// ARGUMENTS:
//   column - number - column name or column index
//   byIndex - boolean - determine if column argument is the column name (default) or is the column index
//
// RETURNS:
//   (string) - column type
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getColumnType = function(column, byIndex)
{
  var colIdx = column;
  if (!byIndex)
  {
    colIdx = dwscripts.findInArray(this.getColumnNames(), column);
  }
  
  if (this.columnTypes && this.columnTypes[colIdx])
  {
    return this.columnTypes[colIdx];
  }
  
  return "string";
};

//--------------------------------------------------------------------
// FUNCTION:
//   setColumnType
//
// DESCRIPTION:
//   Sets the column type for the specified column index. 
//
// ARGUMENTS:
//   columnIdx - (string) data set column name index
//   colType - (string) column type 
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setColumnType = function(columnIdx, colType)
{
  if (!this.columnTypes)
  {
    this.columnTypes = new Object(); 
  }

  this.columnTypes[columnIdx] = colType;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAllColumnsTypes
//
// DESCRIPTION:
//   Return a list of all column types, note that in general only columns 
//  that have the column type different than "string" will be stored in the columnTypes
//  member variable.
//
// ARGUMENTS:
//   none
//  
// RETURNS:
//   (object) - list of all column types by index
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getAllColumnsTypes = function()
{
  var retObj = new Object();

  if (this.columnTypes)
  {
    // the key variable will be the column name 
    for (var key in this.columnTypes)
    {
      retObj[key] = this.columnTypes[key];
    }
  }

  // return a copy of the columns types
  return retObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setAllColumnsTypes
//
// DESCRIPTION:
//   Sets the columnsTypes member variable. 
//
// ARGUMENTS:
//   paramColumnsTypes - (object) new columns types
//  
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setAllColumnsTypes = function(paramColumnsTypes)
{
  this.columnTypes = new Object();

  if (paramColumnsTypes)
  {
    for (var key in paramColumnsTypes)
    {
      this.columnTypes[key] = paramColumnsTypes[key];
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getNoOfRows
//
// DESCRIPTION:
//   Returns the number of the data set rows.  
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (number) - number of data set rows
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getNoOfRows = function()
{
  return (this.data) ? this.data.length : 0;
};

//--------------------------------------------------------------------
// FUNCTION:
//   isCustomized
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
Spry.DesignTime.HTMLDataSet.prototype.isCustomized = function()
{
  var retValue = false;

  if (this.sourceElementID)
  {
    retValue = true;
  } 

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getBrowserControl
//
// DESCRIPTION:
//   Gets the webkit browser control. 
//
// ARGUMENTS:
//   None 
//
// RETURNS:
//   (object) - browser control
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getBrowserControl = function()
{
    return this.browserCtrl;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setBrowserControl
//
// DESCRIPTION:
//   Sets the dialog control where the file source will be displayed. It will raise an error
//  if the parameter received is null.     
//
// ARGUMENTS:
//   browserCtrl - (object) webkit control 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setBrowserControl = function(browserCtrl)
{
  if (browserCtrl)
  {
    this.browserCtrl = browserCtrl;
  }
  else
  {
    throw "Browser control not found.";
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSelectableElementsIds
//
// DESCRIPTION:
//   Returns an array with the ids of all selectable elements.
//
// ARGUMENTS:
//   none
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getSelectableElementsIds = function()
{
  // return a copy
  return new Array().concat(this.selectableElementsIds);
};


//--------------------------------------------------------------------
// FUNCTION:
//   getLastErrorMessage
//
// DESCRIPTION:
//   This function returns the error message generated by last operation, if no error was 
//  generated this function returns null.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if no error was generated by last operation, error description otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getLastErrorMessage = function()
{
  return this.lastErrorMsg;
};

//--------------------------------------------------------------------
// FUNCTION:
//   copyDSOptions
//
// DESCRIPTION:
//   This function sets the dataset options to the received parameter.
//
// ARGUMENTS:
//   dataSetObj - (object) generally this is a design-time object, but can be any 
//                      object that has the necessary properties defined
//
// RETURNS:
//   none
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.copyDSOptions = function(dataSetObj)
{
  this.dsName = dataSetObj.dsName; 
  this.sourceElementID = dataSetObj.sourceElementID
  this.dataSetURL = dataSetObj.dataSetURL;
  this.realDataSetURL = dataSetObj.realDataSetURL;
  this.setOptions(dataSetObj.options);
  this.setAllColumnsTypes(dataSetObj.getAllColumnsTypes());
};

//--------------------------------------------------------------------
// FUNCTION:
//   switchFrameSource
//
// DESCRIPTION:
//   This function switch the data set source to provided frame source.
//
// ARGUMENTS:
//   frameWnd - (object) frame window object
//   frameURL - (string) path to the selected frame
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.switchFrameSource = function(frameWnd, frameURL)
{
  if (frameWnd && frameWnd.document)
  {
    // first deselect the elements from other frames
    for (var i = 0; i < this.pageFrames.length; i++)
    {
      if(frameWnd != this.pageFrames[i].windowObj && this.pageFrames[i].windowObj["SpyProxyObj"])
      {
        this.pageFrames[i].windowObj["SpyProxyObj"].unSelectElement();
      }
    } 
    this.fileSourceString = frameWnd.document.documentElement.outerHTML;
    this.sourceDOM = dw.getNewDocumentDOM();
    this.sourceDOM.documentElement.outerHTML = this.fileSourceString;
    this.dataSetURL = frameURL;
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   getGeneratedCode
//
// DESCRIPTION:
//   This function constructs the javascript code for the dataset constructor 
//  that needs to be inserted in page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - code that needs to be inserted in page
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getGeneratedCode = function()
{
  var jsCode = this.jsCodeTemplate;
  var jsCodeColTypes = this.jsColTypesTemplate;

  var fileSourceURL = this.getDataSetURL();
  var theDOM = dw.getDocumentDOM();
  
  if (fileSourceURL == dwscripts.getFileName(theDOM.URL))
  {
    fileSourceURL = null;
  }
  if(fileSourceURL)
  {
    fileSourceURL = '"' + fileSourceURL + '"';
  }

  jsCode = jsCode.replace(/@@dsName@@/ig, this.dsName);
  jsCode = jsCode.replace(/@@dsFileSource@@/ig, fileSourceURL);
  jsCode = jsCode.replace(/@@dsContainerID@@/ig, this.getSourceElementID());
  jsCode = jsCode.replace(/@@options@@/ig, this._getOptionsString());

  //for each col . set the corresponding data type
  var colNames = this.getColumnNames();
  if (colNames)
  {
    for(var i = 0; i < colNames.length; i++)
    {
      var colType = this.getColumnType(i, true);
      if (colType && colType != "string")
      {
        jsCode += "\n";        
        var js_strColType = jsCodeColTypes;
        js_strColType = js_strColType.replace(/@@dsName@@/ig, this.dsName);
        js_strColType = js_strColType.replace(/@@colname@@/ig, dwscripts.escQuotes(colNames[i]));
        js_strColType = js_strColType.replace(/@@coltype@@/ig, colType);
        jsCode += js_strColType;
      }
    } 
  }
  return jsCode;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getAssetsFiles
//
// DESCRIPTION:
//   This function returns the assets that needs to be inserted in page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array)  - assets objects
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getAssetsFiles = function()
{
  var includeFileList = new Array();

  //add spryData.js
  var spryDataFileInfo = new AssetInfo("Shared/Spry/Data/SpryData.js", "SpryData.js", "javascript");
  spryDataFileInfo.isShared = true;
  includeFileList.push(spryDataFileInfo);

  //add SpryHTMLDataSet.js
  var spryHTMLDataSetFileInfo = new AssetInfo("Shared/Spry/Data/SpryHTMLDataSet.js","SpryHTMLDataSet.js", "javascript");
  spryHTMLDataSetFileInfo.isShared = false;
  includeFileList.push(spryHTMLDataSetFileInfo);  

  return includeFileList;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getBrowserCtrlSource
//
// DESCRIPTION:
//   This function returns the source of the page that is currently loaded in the 
//   browser control.
//
// ARGUMENTS:
//  none
//
// RETURNS:
//   (string) - source of the loaded page
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getBrowserCtrlSource = function()
{
  if (this.browserCtrl)
  {
    return this.browserCtrl.getSource();
  }
  
  return null;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSourceElementTagName
//
// DESCRIPTION:
//   This function retrieves the source element tag name.
//
// ARGUMENTS:
//  none
//
// RETURNS:
//   (string) - source element tag name
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.getSourceElementTagName = function()
{
  var retValue = null;
  
  if (!this._setSourceElement()){
    // no error occurred
    if (this.sourceElement && this.sourceElement.tagName)
    {
      retValue = this.sourceElement.tagName;
    }
  }  
  
  return retValue;
};


//************************** UTILITY METHODS *************************

//--------------------------------------------------------------------
// FUNCTION:
//   fetchDataFromSourceFile
//
// DESCRIPTION:
//   This function gets the data from the source file and constructs a new 
//   document DOM object which will be stored in a private member. 
//
// ARGUMENTS:
//  none
//
// RETURNS:
//   (string) - null in case the data was retrieved successfully or an error description
//              if an error occurred
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.fetchDataFromSourceFile = function()
{
  var errStr = this.setDataSetURL(this.realDataSetURL);
  
  if (!errStr)
  {
    errStr = this._getFileSourceString();
  }
  this.lastErrorMsg = errStr;

  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   loadURLInBrowser
//
// DESCRIPTION:
//   This function loads specified URL in the webkit browser control.
//
// ARGUMENTS:
//  none
//
// RETURNS:
//   (string) - the description of the error if an error occurred null otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.loadURLInBrowser = function()
{
  var errStr = this.setDataSetURL(this.realDataSetURL);
  if (!errStr && this.browserCtrl)
  {
    var browserWnd;
    var self = this; 
    
    // remove previously attached events 
    this.browserCtrl.removeEventListener("BrowserControlBeforeNavigation", function(e){ e.preventDefault(); }, true);
    
    // attach on load event to browser control
    this.browserCtrl.addEventListener("BrowserControlLoad", function(e){ ReceivedResponseCallBack(null, e); } , true);
    // load URL   
    this.browserCtrl.openURL(this.fileDataSetURL);
    // pas "this" object to the command window     
    this.parentWindowObj["SpryDSDesignTimeObject"] = self;
  }
  
  this.lastErrorMsg = errStr;

  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   loadDataIntoDataSet
//
// DESCRIPTION:
//   This function calls the necessary private methods to construct the data set
//   data object.
//
// ARGUMENTS:
//   dontFilter - (boolean) decide if the actual data will also be filtered and sorted
//
// RETURNS:
//   (string) - if an error occurs it returns a description of the error, null otherwise 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.loadDataIntoDataSet = function(dontFilter)
{
  var lookForDuplicateColNames = dontFilter ? false : true;
  // reset the error message
  this.lastErrorMsg = null;
  // we should always reset the source element when we reparse data
  this.lastErrorMsg = this._setSourceElement();

  if (this.sourceElement)
  {
    try
    {
      var parsedStructure = this._getDataFromSourceElement(lookForDuplicateColNames);

      if (parsedStructure) 
      {
        this.dataHash = parsedStructure.dataHash;
        this.data = parsedStructure.data;
        this.unfilteredDataHash = this.dataHash;
        this.unfilteredData = this.data; 
        this.originalColNames = parsedStructure.originalColNames;
        if (!dontFilter)
        {
         this.filterAndSortData();
        }
      }
      else
      {
        this.lastErrorMsg = dw.loadString("spry/dataset/designtime/alert/cantParseStructure");
      }
    }
    catch(e)
    {
      this.lastErrorMsg = e.description;
    }
  }

  if (!this.lastErrorMsg)
  {
    this.isDataLoaded = true;
  }

  return this.lastErrorMsg;
};

//--------------------------------------------------------------------
// FUNCTION:
//   constructDataSet
//
// DESCRIPTION:
//   This function fetch the data from the source file synchronously and parse the 
//    source element to construct the data set array and hash 
//
// ARGUMENTS:
//   dontFilter - (boolean) decide if the data should be filtered and sorted,
//                 this is useful when the dataset is loaded in the bindings panel;
//                 we will remove in this way the overhead for this 2 operations  
//                    
// RETURNS:
//   (string) - null in case the data set was constructed successfully or 
//              a description of the error that occurred
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.constructDataSet = function(dontFilter)
{
  var errStr = null;
  
  if (!errStr)
  {
    // fetch data synchronously
    errStr = this.fetchDataFromSourceFile();
  }
  if (!errStr)
  {
    // parse the structure and make the dataset array
    errStr = this.loadDataIntoDataSet(dontFilter);  
  }
  this.lastErrorMsg = errStr;
  
  return  errStr;
};

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
Spry.DesignTime.HTMLDataSet.prototype.filterAndSortData = function()
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
//   clearDataSetContent
//
// DESCRIPTION:
//   This function will reset all private members except the fileSourceString and
//  sourceDOM variables. This is useful to reconstruct the data set without the need
//  to retrieve the data again from the source file which can be very expensive 
//  when the file is somewhere in the internet. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.clearDataSetContent = function()
{
  this.data = null;
  this.dataHash = null;
  this.sourceElement = null;
  this.sourceElementID = null;
  this.options.columnNames = null;
  this.originalColNames = null;
  this.dataColNames = null;
  this.options.rowSelector = null;
  this.options.dataSelector = null;
  this.columnTypes = null;
  this.isDataLoaded = false;
  this.selectableElementsIds = new Array();  
};

//--------------------------------------------------------------------
// FUNCTION:
//   hasCustomColumnsNames
//
// DESCRIPTION:
//   This function determines if there are any columns aliases defined.
//
// ARGUMENTS:
//   none
// RETURNS:
//   (boolean) - true if there are customized columns, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.hasCustomColumnsNames = function()
{
  var retValue = false;
  
  // see if there are any custom names defined
  if (this.data && this.data.length)
  {
    if (this.options.columnNames)
    {
      for(var i = 0; i < this.originalColNames.length; i++)
      {
        if (this.originalColNames[i] != this.options.columnNames[i])
        {
          retValue = true;
          break;
        }
      }
    }
  }
  
  return retValue;
};


//--------------------------------------------------------------------
// FUNCTION:
//   hasCustomColumns
//
// DESCRIPTION:
//   This function determines if there are any columns aliases defined or if 
//  there are columns that have the type other than string.  
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (boolean) - true if there are customized columns, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.hasCustomColumns = function()
{
  var retValue = false;
  // see if there are any custom names defined
  if (this.data && this.data.length)
  {
    var identical = true;
    if (this.options.columnNames)
    {
      for(var i = 0; i < this.originalColNames.length; i++)
      {
        if (this.originalColNames[i] != this.options.columnNames[i])
        {
          identical = false;
          break;
        }
      }
    }
    if (identical)
    {
      // see if there are customized column types
      if (this.columnTypes)
      {
        for (var key in this.columnTypes)
        {
          if (this.columnTypes[key] != "string")
          {
            retValue = true;
            break;
          }
        }
      }
      
    }
    else
    {
      retValue = true;
    }
  }
  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   hasSelectableElements
//
// DESCRIPTION:
//   This function returns the number of selectable html elements from file source.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (number) - the number of selectable elements
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.hasSelectableElements = function()
{
  return this.selectableElementsIds.length;
};


//--------------------------------------------------------------------
// FUNCTION:
//   updatePreviewCtrl
//
// DESCRIPTION:
//   This function populate the preview control with the current data from the dataset.
//  If there are no rows found, then an info message it's displayed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.updatePreviewCtrl = function(highlightedColumn)
{
  var newDOM = dw.getNewDocumentDOM();
  var headers = this.getColumnNames();
  var previewTableContent = "";
  var headTags = newDOM.getElementsByTagName("HEAD");
  
  if (headTags && headTags[0])
  {
    headTags[0].innerHTML += this.strPreviewCSS;
  }
  
  previewTableContent += '<table cellspacing="0" cellpadding="0" width="100%">';
  // first we need to generate the columns names
  if (headers.length)
  {
    previewTableContent += '<tr>';
    for(var i = 0; i < headers.length; i++)
    {
    
      var classStr = (!i)? ' class="first"' : "";
      var strHighlighted = "";
      var columnHeaderContent = "";
      
      if (this.previewHighlight)
      {
        if (this.previewHighlight && i == highlightedColumn)
      {
        strHighlighted = ' style="background-color: #CCFFFF"'
      }
        columnHeaderContent = '<a href="#" id="' + this.previewColumnPrefix + i + '">' + this._normalizeColumnName(headers[i]) + '</a>';        
      }
      else
      {
        columnHeaderContent = this._normalizeColumnName(headers[i]);        
      }
      previewTableContent += '<th' + classStr + strHighlighted + '>' + columnHeaderContent + '</th>';
    }
    previewTableContent += '</tr>';
  }

  // second we need to generate the actual content of the grid 
  // put in the new nodes
  if (this.data && this.data.length)
  {
    for (var i = 0; i < this.data.length && i < 20; i++)
    {
      var idx = 0;
      previewTableContent += '<tr>';
      for (var key in this.data[i])
      {
        if (key != "ds_RowID")
        {
          var classStr = (!idx)? ' class="first"' : "";
          var strHighlighted = ""; 
          if (this.previewHighlight && idx == highlightedColumn)
          {
            strHighlighted = ' style="background-color: #CCFFFF"'
          }
          previewTableContent += '<td' + classStr + strHighlighted + '><div> ' + this.normalizeValueForPreview(this.data[i][key]) + '</div></td>';
          idx++;
        }
      }
      previewTableContent += '</tr>';
    }
    previewTableContent += '<tr>';
    previewTableContent += '<td colspan="' + headers.length + '" class="lastRow"></td>';
    previewTableContent += '</tr>';

    if (this.sourceDOM)
    {
      // set the correct encoding
      newDOM.setCharSet(this.sourceDOM.getCharSet());
    }
  }
  else if (this.sourceElementID)
  {
    // don't show this messages unless the data container is set
    // set encoding to utf-8
    newDOM.setCharSet("utf-8");
    var strMessage = "";
    if (!this.totalNoOfRows)
    {
      strMessage = dw.loadString("spry/dataset/designtime/message/dsHasNoData");
    }
    else
    {
      strMessage = dw.loadString("spry/dataset/designtime/message/dsHasNoData");
      strMessage += "<br />"; 
      strMessage += dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/uncheckFirstRowOption"), dw.loadString("Commands/SpryDataSetWizard/text/Use"));
    }
    this.showMessageInPreviewCtrl(strMessage);
    return;
  }
  
  newDOM.body.innerHTML = previewTableContent;
  
  var self = this;
  // attach on load event to the preview control
  this.previewBrowserCtrl.addEventListener("BrowserControlLoad", 
          function(e){ 
              OnPreviewPageLoadedCallBack(self, headers, highlightedColumn); 
          } , 
          true);
  
  this.previewBrowserCtrl.loadHTML(newDOM.documentElement.outerHTML);
};


//--------------------------------------------------------------------
// FUNCTION:
//   updatePreviewColumnName
//
// DESCRIPTION:
//   This function updates just the column name from the header of the preview table. 
//
// ARGUMENTS:
//   colIdx - (number) column index
//   columnName - (string) the new column name 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.updatePreviewColumnName = function(colIdx, columnName)
{
  if (this.previewBrowserCtrl)
  {
    var browserWnd = this.previewBrowserCtrl.getWindowObj();
    if (browserWnd && browserWnd["SpyProxyObj"])
    {
      browserWnd["SpyProxyObj"].updateColumnName(colIdx, columnName);
      // force control to repaint itself
      //browserWnd.focus(); 
    }    
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   clearBrowserCtrl
//
// DESCRIPTION:
//   This function reset the content of the browser control.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.clearBrowserCtrl = function()
{
  if (this.browserCtrl && this.browserCtrl.openURL)
  {
    // remove events
    this.browserCtrl.removeEventListener("BrowserControlLoad", function(e){ ReceivedResponseCallBack(null, e); } , true);
    // don't allow navigation
    this.browserCtrl.removeEventListener("BrowserControlBeforeNavigation", function(e){ e.preventDefault(); }, true);
  
    this.browserCtrl.loadHTML("");
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   showHiddenDataContainers
//
// DESCRIPTION:
//   This function show hidden data containers form the page loaded in the webkit control. 
//  
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.showHiddenDataContainers = function()
{
   if (this.browserCtrl && this.pageFrames)
   {
      for (var i = 0; i< this.pageFrames.length; i++)
      {
        var frameWnd = this.pageFrames[i].windowObj;
        var arrDSNames = this._getAllHTMLDSNamesFromDoc(frameWnd.document);
        
        if (arrDSNames && arrDSNames.length)
        {
          for (var j = 0; j < arrDSNames.length; j++)
          {
            if (frameWnd[arrDSNames[j]] && !frameWnd[arrDSNames[j]].url)
            {
              // set the hideDataSourceElement member to false 
              // if the source file is the current file
              frameWnd[arrDSNames[j]].hideDataSourceElement = false;
            }
          }
        }
      }
   }
};

//--------------------------------------------------------------------
// FUNCTION:
//   markAllSelectableElements
//
// DESCRIPTION:
//   This function asynchronously attach markers to all selectable elements from data set file source.
//  It also attach "disabled" markers to the tables or lists html elements that don't have the id attribute specified.
//  After the operation finishes it calls the "onAttachMarkersFinished" function from 
//  the command that called this function. 
//  
// ARGUMENTS:
//   elName - (array) html element names
//
// RETURNS:
//   nothing 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.markAllSelectableElements = function(elNames)
{
  var self = this; 
  this.selectableElementsIds = new Array();

  if (this.browserCtrl && this.fileSourceString)
  {
    var browserWnd;
    var dsProxy;

    browserWnd = this.browserCtrl.getWindowObj();
    
    if (browserWnd)
    {
      var markerImgIDs = new Array();

      // add markers
      
      this.pageFrames = this._findAllPageFrames(this.browserCtrl.getWindowObj(), this.dataSetURL);
      
      if (this.pageFrames.length)
      {
        var selElementsCount = 0;
        for (var wndIdx = 0; wndIdx < this.pageFrames.length; wndIdx++)
        {
          var pageDOM = this.pageFrames[wndIdx].windowObj.document;
          var allSelElements = new Array();
          
          // get all elements from page
          for (var i = 0; i < elNames.length; i++)
          {
            var selElements = pageDOM.getElementsByTagName(elNames[i]);
            if (selElements && selElements.length)
            {
              // for some reason the concat method is not working correctly
              // so I will iterate through all found elements and push them in the
              // array that will holds all selectable elements 
              for (var j = 0; j < selElements.length; j++)
              {
                var elementName = selElements[j].tagName;
                
                // add all table or list elements and other elements that have an id
                if (elementName && (selElements[j].id || elementName.toLowerCase() == "ul" ||
                        elementName.toLowerCase() == "ol" || elementName.toLowerCase() == "table")
                    )
                {
                  // add element only if it's not a spry region and it's contained in a spry region
                  if (!this._elementIsOrInsideSpryRegion(selElements[j]))
                  {
                    allSelElements.push(selElements[j]);
                  }
                }
              }  
            }
          }

          if (allSelElements.length)
          {
            dsProxy = new SpryDataSetProxy(this.parentWindowObj, this.pageFrames[wndIdx].windowObj, this.pageFrames[wndIdx].fileURL);
            // attach the proxy to the browser window
            this.pageFrames[wndIdx].windowObj["SpyProxyObj"] = dsProxy;  
    
            var arrEventParams = new Array();
            var arrMarkerPositions = new Array();
            var markerElementsStr = "";
            
            for (var i = 0; i < allSelElements.length; i++)
            {
              var maskElWidth = allSelElements[i].offsetWidth;
              var maskElHeight = allSelElements[i].offsetHeight;
              var imgLeft;
              var objEl = allSelElements[i];

              // allow only valid elements
              if (maskElWidth > 20 && maskElHeight > 10)
              {
                // display a disabled marker if the current element does not have an id
                var markerImage;
                if (!allSelElements[i].id || allSelElements[i].id.indexOf(this.disabledMarkerPrefix) == 0)
                {
                  markerImage = Spry.DesignTime.HTMLDataSet.MarkerImageDis;
                }
                else
                {
                  markerImage = Spry.DesignTime.HTMLDataSet.MarkerImage;
	              selElementsCount++;
                }
                // just add the markers; we will position them after the page is fully loaded  
                markerElementsStr += dwscripts.sprintf(this.maskElementStr, i, 0, 0, (maskElWidth - 4), (maskElHeight - 4));
                markerElementsStr += dwscripts.sprintf(this.markerImgElStr, i, markerImage, 0, 0);
                
                var eParam = new Object();
                if (allSelElements[i].id)
                {
                  eParam.elementID = allSelElements[i].id;
                  if (eParam.elementID.indexOf(this.disabledMarkerPrefix) == -1)
                  {
                    this.selectableElementsIds.push(eParam.elementID);
                  }
                }
                else
                {
                  // set an id for this element; 
                  // we will recognize this marker as disabled by its corresponding element id value
                  allSelElements[i].id = this.disabledMarkerPrefix + i; 
                  eParam.elementID = allSelElements[i].id;
                }
                eParam.maskID = this.divMaskIDPrefix + i;
                eParam.markerID = this.imgMarkerIDPrefix + i;
                arrEventParams.push(eParam);
              }
            }
            
            dsProxy.setMarkersMap(arrEventParams);
            markerElementsStr += this.strTooltipElement;
            
            // append markers elements to the body tag
            var markersContainerEl = pageDOM.createElement("DIV");
            markersContainerEl.id = this.markersContainerID;
            markersContainerEl.innerHTML = markerElementsStr;
            pageDOM.body.appendChild(markersContainerEl);
            
            if (arrEventParams.length)
            {
              for (var i = 0; i < arrEventParams.length; i++)
              {
                // attach events to marker image; skip disabled markers
                var imgEl = pageDOM.getElementById(arrEventParams[i].markerID);
                if (imgEl)
                {
                  this._attachMarkerEvents(arrEventParams[i].elementID, imgEl, dsProxy, arrEventParams[i].maskID);
                }
              }
            }
            // attach the DOMSubtreeModified event
            pageDOM.body.addEventListener("DOMSubtreeModified", function(e){ dsProxy.domTreeModified(e, self); }, true);
          }
          this.pageFrames[wndIdx].windowObj.scrollTo(0, 0);
        }
        if (browserWnd.document && browserWnd.document.body)
        {
          // display a little notification in the left-upper corner
          // we will display it in an iframe control to be sure that the message is displayed
          // using the UTF-8 characterset
          if (!selElementsCount)
          {
            this.displayMessageInBrowser(this.strBrowserNotifyElementID, dw.loadString("spry/dataset/designtime/message/noSelectableElements"), Spry.DesignTime.DataSet.InfoImage, false);
          }
          else
          {
            this.displayMessageInBrowser(this.strBrowserNotifyElementID, null, null, true);
          }
          // position the markers and masks
          this.setMarkerPositions();
        }
      }
      if (this.urlPointsToTestingServer || this.getDesignTimeSchemaURI())
      {
        var strMessage = dwscripts.sprintf(dw.loadString("spry/dataset/wizard/message/realFeedURL"), this.fileDataSetURL); 
        this.displayMessageInBrowser(this.strBrowserShowURLSourceID, strMessage, Spry.DesignTime.DataSet.InfoImage, false);
      }
      else
      {
        this.displayMessageInBrowser(this.strBrowserShowURLSourceID, null, null, true);
      }      
    }
    
    // there is a special case that needs to be handled:
    // when a dataset and the selected container are in the same page
    // the data container element will be hidden when the page is loaded
    // so we will parse the loaded page to find if there are html data sets that 
    // have as source file parameter the "null" value
    this.showHiddenDataContainers();
    this.parentWindowObj.onAttachMarkersFinished();
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   setMarkerPositions
//
// DESCRIPTION:
//   This function displays the markers next to the selectable elements
//
// ARGUMENTS:
//   windowObj - (object) optional; browser window object 
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.setMarkerPositions = function(windowObj)
{
  var browserFrames = new Array();
  
  if (windowObj)
  {
    var wndObj = new Object();
    wndObj.windowObj = windowObj;
    // recalculate the marker positions only for the specified frame
    browserFrames.push(wndObj);
  }
  else
  {
    if (!this.pageFrames || !this.pageFrames.length)
    {
      this.pageFrames = this._findAllPageFrames(this.browserCtrl.getWindowObj(), this.dataSetURL);
    }
    if (this.pageFrames && this.pageFrames.length)
    {
      browserFrames = browserFrames.concat(this.pageFrames);
    }
  }
  
  if (browserFrames.length)
  {
    for (var wndIdx = 0; wndIdx < browserFrames.length; wndIdx++)
    {
      var pageDOM = browserFrames[wndIdx].windowObj.document;
      
      if (browserFrames[wndIdx].windowObj["SpyProxyObj"])
      {
        var markersMapArray = browserFrames[wndIdx].windowObj["SpyProxyObj"].getMarkersMap();
        if (markersMapArray && markersMapArray.length)
        {
          var arrMarkerPositions = new Array();
          for (var i = 0; i < markersMapArray.length; i++)
          {
            if (markersMapArray[i].elementID)
            {
              var pageEl = pageDOM.getElementById(markersMapArray[i].elementID);
              // allow only valid elements
              if (pageEl)
              {
                if (pageEl.offsetWidth > 20 && pageEl.offsetHeight > 10)
                {
                  var markerPosObj = this._getMarkerPosition(pageEl, arrMarkerPositions);
                  if (markerPosObj)
                  {
                    var maskEl = pageDOM.getElementById(markersMapArray[i].maskID);
                    if (maskEl)
                    {
                      maskEl.style.left = markerPosObj.maskLeft + "px";
                      maskEl.style.top = markerPosObj.maskTop + "px";
                      maskEl.style.display = "block";
                      
                      var markerEl = pageDOM.getElementById(markersMapArray[i].markerID);
                      if (markerEl)
                      {
                        markerEl.style.left = markerPosObj.markerLeft + "px";
                        markerEl.style.top = markerPosObj.markerTop + "px";
                        markerEl.style.display = "block";
                      }
                    }
                  }
                }
                else
                {
                  //  just hide the mask and the marker
                  var maskEl = pageDOM.getElementById(markersMapArray[i].maskID);
                  if (maskEl)
                  {
                    maskEl.style.display = "none";
                    
                    var markerEl = pageDOM.getElementById(markersMapArray[i].markerID);
                    if (markerEl)
                    {
                      markerEl.style.display = "none";
                    }
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

//--------------------------------------------------------------------
// FUNCTION:
//   clearMarkers
//
// DESCRIPTION:
//   This function removes all elements added to each frame for displaying 
//   markers, masks, tooltips and notify message.
//  
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.clearMarkers = function()
{
  if (this.browserCtrl)
  {
    var browserWnd = this.browserCtrl.getWindowObj();
    
    if (browserWnd)
    {
      // remove notify element
      var notifyEl = browserWnd.document.getElementById(this.strNotifyElementID);
      if (notifyEl && notifyEl.parentNode)
      {
        notifyEl.parentNode.removeChild(notifyEl);
      }
      // remove markers and masks elements
      if (this.pageFrames && this.pageFrames.length)
      {
        for (var wndIdx = 0; wndIdx < this.pageFrames.length; wndIdx++)
        {
          var pageDOM = this.pageFrames[wndIdx].windowObj.document;
          this.pageFrames[wndIdx].windowObj["SpyProxyObj"] = null;          
          if(pageDOM)
          {
            var markersContainerEl = pageDOM.getElementById(this.markersContainerID);
            if (markersContainerEl && markersContainerEl.parentNode)
            {
              markersContainerEl.parentNode.removeChild(markersContainerEl);
            }
          } 
        }
      }
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   selectDataContainer
//
// DESCRIPTION:
//   This function use the helper object "SpyProxyObj", which is attached to the 
//  browser control window, to marks as selected the html element specified as parameter.
//
// ARGUMENTS:
//   containerID - (string) html element id
//
// RETURNS:
//   (boolean) - true if the element was found and was successfully marked as selected, false otherwise 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.selectDataContainer = function(containerID, dontNotify)
{
  var retValue = false;
  
  if (this.browserCtrl)
  {
    var browserWnd = this.browserCtrl.getWindowObj();
    
    if (browserWnd && browserWnd["SpyProxyObj"])
    {
      if (containerID)
      {
        var maskID = browserWnd["SpyProxyObj"].containersHash[containerID];
        if (maskID)
        {
          var maskElement = browserWnd.document.getElementById(maskID);
          
          if (maskElement)
          {
            var markerElement = maskElement.nextSibling;
            if (markerElement)
            {
              retValue = browserWnd["SpyProxyObj"].selectElement(containerID, markerElement, maskID, dontNotify);
            }
          }
        }
      }
      else
      {
        // unselect current selected element
        retValue = browserWnd["SpyProxyObj"].selectElement(null, null, null, dontNotify);
      }    
    }
  }
  
  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   displayMessageInBrowser
//
// DESCRIPTION:
//   This function displays a message in a iframe at top of any page in browser. 
//
// ARGUMENTS:
//   strMessage - (string) message that needs to be displayed
//   icon - (string) path to the icon that will be displayed next to the message
//   hide - (boolen) hide or show the message
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.displayMessageInBrowser = function(containerID, strMessage, icon, hide)
{
  if (this.browserCtrl)
  {
    var browserWnd = this.browserCtrl.getWindowObj();
    if (browserWnd)
    { 
      var iframeEl = browserWnd.document.getElementById(containerID);
      var filePath = dw.getTempFolderPath() + "/" + Spry.DesignTime.DataSet.BrowserNotifyFrameSrc + "_" + containerID + ".html";
      var frameDOM = dw.getDocumentDOM(dw.getConfigurationPath() + "/Templates/Default.html");
      
      if (!iframeEl && !hide)
      {
        
        if (frameDOM)
        {
          // set the document encoding to UTF-8 
          frameDOM.documentElement.outerHTML = frameDOM.documentElement.outerHTML.replace(/charset=[^"]*/g, "charset=utf-8");
          frameDOM.body.innerHTML = dwscripts.sprintf(this.strNotifyElement, icon, strMessage);
          if (DWfile.write(filePath, frameDOM.documentElement.outerHTML))
          {
            iframeEl = browserWnd.document.createElement("IFRAME");
            iframeEl.setAttribute("id", containerID);
            iframeEl.setAttribute("frameborder", "0");
            iframeEl.setAttribute("noresize", "noresize");
            iframeEl.setAttribute("marginwidth", "0");
            iframeEl.setAttribute("marginwidth", "0");
            iframeEl.setAttribute("marginheight", "0");
            iframeEl.setAttribute("vspace", "0");
            iframeEl.setAttribute("hspace", "0");
            iframeEl.setAttribute("scrolling", "auto");
            iframeEl.setAttribute("style", "width: 100%; height: 30px; z-index: 97;");
            iframeEl.setAttribute("src", "dw://configuration/Temp/" + Spry.DesignTime.DataSet.BrowserNotifyFrameSrc + "_" + containerID + ".html");  
            browserWnd.document.body.insertBefore(iframeEl, browserWnd.document.body.firstChild);
          }
        }
      }
      else if (iframeEl && hide)
      {
        iframeEl.style.display = "none";
      }
      else if(iframeEl && !hide)
      {
        if (frameDOM)
        {
          // set the document encoding to UTF-8 
          frameDOM.documentElement.outerHTML = frameDOM.documentElement.outerHTML.replace(/charset=[^"]*/g, "charset=utf-8");
          frameDOM.body.innerHTML = dwscripts.sprintf(this.strNotifyElement, icon, strMessage);
          if (DWfile.write(filePath, frameDOM.documentElement.outerHTML))
          {
            iframeEl.setAttribute("src", "dw://configuration/Temp/" + Spry.DesignTime.DataSet.BrowserNotifyFrameSrc + "_" + containerID + ".html");  
          }
          iframeEl.style.display = "block";
        }
      }
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   displayHttpStatusError
//
// DESCRIPTION:
//   This function displays the http error message. 
//
// ARGUMENTS:
//   None 
//
// RETURNS:
//   Nothing
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype.displayHttpStatusError = function()
{

  if (this.browserCtrl)
  {
    var brwCtrlWindow = this.browserCtrl.getWindowObj();
    var realFileURL = this.fileDataSetURL;
    var errorStr = dwscripts.sprintf(dw.loadString("spry/dataset/wizard/message/fileNotFoundNotification"), realFileURL);
    var errorDetails = "<div>" + dw.loadString("spry/dataset/wizard/message/fileNotFoundDetailsHeader");
    
    // check to see if the testing server is defined. Note that
    // getAppURLPrefixForSite() will return "http://" in the case
    // where no testing server is defined, so we need to check
    // for that specific case. 
    var testingServerUrl = String(site.getAppURLPrefixForSite());
    
    if (testingServerUrl && testingServerUrl != "http://" && !realFileURL.indexOf(testingServerUrl))
    {
      errorDetails += ":";
      errorDetails += "<ul>";
      errorDetails += "<li>" + dw.loadString("spry/dataset/wizard/message/fileNotFoundErrorTyping") + "</li>";    
      errorDetails += "<li>" + dw.loadString("spry/dataset/wizard/message/fileNotFoundServerIsRunning") + "</li>";
      errorDetails += "<li>" + dw.loadString("spry/dataset/wizard/message/fileNotFoundFileIsUploaded") + "</li>";
      errorDetails += "</ul>";
    }
    else
    {
      errorDetails += " ";
      if (this.fileDataSetURL.match(/^file:\/\//i))
      {
        errorDetails += dw.loadString("spry/dataset/wizard/message/fileNotFoundStatus");
      }
      else
      {
        errorDetails += dw.loadString("spry/dataset/wizard/message/fileNotFoundErrorTyping");    
      }
      errorDetails += "<br /><br />";
    }
    
    if (!this.getDesignTimeSchemaURI())
    {
      // show this message only if the design time feed is not specified
      errorDetails +=  dw.loadString("spry/dataset/wizard/message/fileNotFoundDesignTimeFeed");
    }
    errorDetails +=  "</div>";

    if (brwCtrlWindow)
    {
      var dsProxy = new SpryDataSetProxy(this.parentWindowObj, brwCtrlWindow);
      // attach the proxy to the browser window
      brwCtrlWindow["SpyProxyObj"] = dsProxy;
    
      var errorHtmlStr = '<div style="position:absolute; width: 100%; left: 0px; top: 0px; margin: 0px; padding: 0px;">';
          errorHtmlStr += '<div id="htppStatusErrorContainer" style="background-color: #ffff99; margin: 0px; padding: 0px; border: 1px solid #999999;">';
          errorHtmlStr += '<div style="padding: 5px;">';
          errorHtmlStr += '<table cellpadding="0" cellspacing="0" border="0">';          
          errorHtmlStr += '<tr>';
          errorHtmlStr += '<td><img src="' + Spry.DesignTime.HTMLDataSet.WarningIcon + '" />&nbsp;</td>';
          errorHtmlStr += '<td style="color: #000000">' + errorStr;
          errorHtmlStr += '[<a href="#" style="text-decoration: none;" id="httpStatusDetailsToogler">';
          errorHtmlStr += '<span id="httpStatusToggleMessage">' + dw.loadString("spry/dataset/wizard/label/seeDetails") + '</a>]';
          errorHtmlStr += '</td></tr></table></div>';
          errorHtmlStr += '<div id="httpStatusDetailsContainer" style ="display: none; padding-top: 15px; padding-bottom: 15px; padding-left: 30px; border-top: 1px solid #AAAA44; color: #000000">';
          errorHtmlStr += errorDetails;
          errorHtmlStr += '</div></div></div>';
      brwCtrlWindow.document.body.innerHTML += errorHtmlStr;
      var togglerEl = brwCtrlWindow.document.getElementById("httpStatusDetailsToogler");
      
      if (togglerEl)
      {
        togglerEl.addEventListener("click", function(e){ dsProxy.toogleErrorDetails(); }, true);
      }       
    }
  }
};


//****************************** PRIVATE METHODS *********************


//--------------------------------------------------------------------
// FUNCTION:
//   _getFileSourceString
//
// DESCRIPTION:
//  This function gets the content of the data set file source.    
//
// ARGUMENTS:
//
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getFileSourceString = function()
{
  var errStr = null;
  
  if (this.fileDataSetURL)
  {
    this.isDataLoaded = false;
    var responseObj = new Object();
    if (this.fileDataSetURL.match(/^file:\/\//i))
    {
      if (DWfile.exists(this.fileDataSetURL))
      {
        responseObj.statusCode = "200";
        responseObj.data = DWfile.read(this.fileDataSetURL);
      }
      else
      {
        responseObj.statusCode = "-1";
        responseObj.data = null;
      }
    }
    else if (this.fileDataSetURL.match(/^https?:\/\//i))
    {
      responseObj = MMHttp.getText(this.fileDataSetURL); 
    }
    else
    {
      responseObj.statusCode = "-2";
      responseObj.data = null;
    }

    errStr = this._processHTTPResponse(responseObj);
  }
  
  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _setSourceElement
//
// DESCRIPTION:
//   This function finds the DOM object that corresponds to internal element ID
//
// ARGUMENTS:
//   none
// RETURNS:
//   (string) -  null if the element was not found
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._setSourceElement = function ()
{
  var errStr = null;
  
  // reset the source element
  this.sourceElement = null;
  
  if (this.sourceElementID) 
  {
    // find element
    if (this.sourceDOM)
    {
      this.sourceElement = this.sourceDOM.getElementById(this.sourceElementID);
    }
  }
  else
  {
     // reset current element
    this.sourceElement = null;
  }

  if (!this.sourceElement) 
  {
    errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/alert/containerElementNotFound"), this.sourceElementID, this.dataSetURL);
  }
  
  return errStr;
};



//--------------------------------------------------------------------
// FUNCTION:
//   _processHTTPResponse
//
// DESCRIPTION:
//   This function process the response received from the previously made http 
//  request and set some private member variables.   
//
// ARGUMENTS:
//   responseObj - (object) response object
//
// RETURNS:
//   (string) - null if the request was made successfully, an error description otherwise 
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._processHTTPResponse = function(responseObj)
{
  var errStr = null;
  var statusCode = String(responseObj.statusCode);
  
  // first reset the member variables
  this.fileSourceString = null;
  this.sourceDOM = "";

  if (statusCode == "200")
  {
    this.fileSourceString = responseObj.data;
    this.sourceDOM = dw.getNewDocumentDOM();
    this.sourceDOM.documentElement.outerHTML = this.fileSourceString;
  }
  else
  {
    switch(statusCode)
    {
        case "-1":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/fileNotFound"), this.dataSetURL);
            break;
        case "-2":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/invalidURLSchema"));
            break;
        case "400":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpServerErrorResponse"), this.dataSetURL, dw.loadString('Startup/MMinit/MM.MSG_HTTP400'));
            break;
        case "403":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpRestrictedAccess"), this.dataSetURL);
            break;
        case "404":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/fileNotFound"), this.dataSetURL);
            break;
        case "405":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpServerErrorResponse"), this.dataSetURL, dw.loadString('Startup/MMinit/MM.MSG_HTTP405'));
            break;
        case "503":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpServerErrorResponse"), this.dataSetURL, dw.loadString('Startup/MMinit/MM.MSG_HTTP503'));
            break;
        case "12007":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpServerErrorResponse"), this.dataSetURL, dw.loadString('spry/dataset/designtime/message/http_12007'));
            break;
        case "12029":
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpServerErrorResponse"), this.dataSetURL, dw.loadString('spry/dataset/designtime/message/http_12029'));
            break;
        default:
            errStr = dwscripts.sprintf(dw.loadString("spry/dataset/designtime/message/httpUnknowServerErrorResponse"), this.dataSetURL);
            break;
    }
  }
  this.lastErrorMsg = this._convertToMultiline(errStr);
   
  return this.lastErrorMsg;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getDataFromSourceElement
//
// DESCRIPTION:
//   This function calls the right function that parse the html structure, construct 
//  an object with the resulting data and sets the actual column names
//  using the first row of the resulting data if no column aliases are specified 
//  or use the column aliases as column names if those are specified.
//
// ARGUMENTS:
//   lookForDuplicatedColumns - (boolean) generate error if there are duplicate column names
//
// RETURNS:
//   (object) - resulting data object
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getDataFromSourceElement = function(lookForDuplicatedColumns) 
{
  if (!this.sourceElement) 
    return null;

  var extractedData;
  var usesTable = (this.options.tableModeEnabled && this.sourceElement.nodeName.toLowerCase() == "table");
  this.dataColNames = null;
  this.totalNoOfRows = 0;
  if (usesTable)
  {
    extractedData = this._getDataFromHTMLTable();
  }
  else
  {
    extractedData = this._getDataFromNestedStructure();
  }
  
  if (!extractedData)
     return null;
  // Flip Columns / Rows
  if (this.options.useColumnsAsRows) 
  {
     var flipedData = new Array;
     // Get columns and put them as rows 
     for (var rowIdx = 0; rowIdx < extractedData.length; rowIdx++)
     {
       var row = extractedData[rowIdx];
       for (var colIdx = 0; colIdx < row.length; colIdx++) 
       {
         if (!flipedData[colIdx]) flipedData[colIdx] = new Array;
         flipedData[colIdx][rowIdx]= row[colIdx];
       }
     }
     extractedData = flipedData;
  }

  // Build the data structure for the DataSet
  var parsedStructure = new Object();
  parsedStructure.dataHash = new Object;
  parsedStructure.data = new Array;
  
  if (extractedData.length == 0)
     return parsedStructure;
     
  this.totalNoOfRows = extractedData.length;

  // Find the max number of columns. We have to look at each
  // row because some rows may have a varying number of columns.

  var maxColumnCount = 0;

  for (var i = 0; i < extractedData.length; i++)
  {
    var len = extractedData[i].length;
    if (maxColumnCount < len)
      maxColumnCount = len;
  }

  // Get the column names
  // this.options.firstRowAsHeaders is used only if the source of data is a TABLE
  var columnNames = new Array;
  var firstRowOfData = extractedData[0];

  for (var colIdx = 0; colIdx < maxColumnCount; colIdx++)
  {
    if (usesTable && this.options.firstRowAsHeaders)
      columnNames[colIdx] = this._normalizeColumnName(firstRowOfData[colIdx]);
    if (!columnNames[colIdx])
      columnNames[colIdx] = "column" + colIdx;
  }

  parsedStructure.originalColNames = new Array().concat(columnNames);
  
  // Check if column names are being overwritten using the optional columnNames parameter
  if (this.options.columnNames && this.options.columnNames.length) 
  {
    if (this.options.columnNames.length != columnNames.length)
      this.lastErrorMsg = this._convertToMultiline(dw.loadString("spry/dataset/designtime/alert/incorectNoOfAliases"));

    var numCols = (maxColumnCount < this.options.columnNames.length) ? maxColumnCount : this.options.columnNames.length;
    for (var i = 0; i < numCols; i++)
    {
      if (this.options.columnNames[i])
        columnNames[i] = this.options.columnNames[i];
    }
  }

  if (lookForDuplicatedColumns)
  {
    var duplicateNames = false;
    var tmpColumnNames = new Array();
    // verify if we have duplicate column names
    for (var i = 0; i < columnNames.length; i++)
    {
      if (dwscripts.findInArray(tmpColumnNames, columnNames[i]) != -1)
      {
        // duplicate column name
        var idx = i;
        var newColName = "column" + idx;
        while (dwscripts.findInArray(columnNames, newColName) != -1)
        {
          idx++;
          newColName = "column" + idx;
        }
        columnNames[i] = newColName;
        duplicateNames = true;
      }
      tmpColumnNames[i] = columnNames[i]; 
    }
    if (duplicateNames)
    {
      this.options.columnNames = new Array().concat(tmpColumnNames);
      columnNames = new Array().concat(tmpColumnNames);
      this.lastErrorMsg = dw.loadString("spry/dataset/wizard/message/duplicateColumnNames");
    }
  }

  // Place the extracted data into a dataset kind of structure
  var nextID = 0;
  var firstDataRowIndex = (usesTable && this.options.firstRowAsHeaders) ? 1: 0;

  for (var rowIdx = firstDataRowIndex; rowIdx < extractedData.length; rowIdx++)
  {
    var row = extractedData[rowIdx];
    if (this.options.removeUnbalancedRows && columnNames.length != row.length)
    {
      continue;
    }

    var rowObj = {};
    for (var colIdx = 0; colIdx < row.length; colIdx++)
    {
      var colValue = row[colIdx];
      rowObj[columnNames[colIdx]] = (typeof colValue == "undefined") ? "" : colValue;
    }

    rowObj['ds_RowID'] = nextID++;
    parsedStructure.dataHash[rowObj['ds_RowID']] = rowObj;
    parsedStructure.data.push(rowObj);
  }

  this.dataColNames = columnNames;

  return parsedStructure;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _findAllPageFrames
//
// DESCRIPTION:
//   This is a recursive function which constructs a linear array with all frames from opened page. 
//
// ARGUMENTS:
//   mainWindow - (object) parent window
//   documentURL - (string) current document path relative to opened document
//  
// RETURNS:
//   (array) - frames objects
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._findAllPageFrames = function(mainWindow, documentURL)
{
  var arrPageFrames = new Array();

  if (mainWindow && mainWindow.document)
  {
    // get the frames and iframes by tag name, that's because the IFRAMEs generated at run time
    // are not found when using the window.frames collection 
    var docFrames = mainWindow.document.getElementsByTagName("FRAME");
    var docIframes = mainWindow.document.getElementsByTagName("IFRAME");
    
    var arrDOCFrames = new Array();
    
    // make an array whit all frames and iframes
    for (var i = 0; i < docFrames.length; i++)
    {
      arrDOCFrames.push(docFrames[i]);
    }
    for (var i = 0; i < docIframes.length; i++)
    {
      if (docIframes[i].id != this.strBrowserNotifyElementID && docIframes[i].id != this.strBrowserShowURLSourceID)
      {
        arrDOCFrames.push(docIframes[i]);
      }
    }
      
    for(var i = 0; i < arrDOCFrames.length; i++)
    {
      if (arrDOCFrames[i].getAttribute("src"))
      {
        // don't allow resize of frames
        arrDOCFrames[i].noResize = true;
        var framesArray = this._findAllPageFrames(arrDOCFrames[i].contentWindow, this._getRelativeFrameURL(documentURL, arrDOCFrames[i].getAttribute("src")));
        arrPageFrames = arrPageFrames.concat(framesArray);
      }
    }
    // it's important to add the parent window before the contained frames
    // because, for iframes when attaching the markers, the content of the contained
    // iframe is refreshed
    arrPageFrames.unshift({windowObj: mainWindow, fileURL: documentURL});
  }
  
  return arrPageFrames;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getRelativeFrameURL
//
// DESCRIPTION:
//   Calculates the relative path to the same document as the parentURL.   
//
// ARGUMENTS:
//   parentURL - (string) parent document URL
//   frameURL - (string) frame URL
//  
// RETURNS:
//   (string) - the relative path to document to which the parentURL is relative to  
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getRelativeFrameURL = function(parentURL, frameURL)
{
  var retURL = frameURL;

  if (retURL && !retURL.match(/^(?:\w+:\/\/|\/)/g))
  {
    // frameURL is a document relative path
    var theDOM = dw.getDocumentDOM();
    var parentABSURL;
    
    if (parentURL && parentURL.match(/^\//g))
    {
      // parentURL is a site relative path
      // transform it to an absolute path
      parentABSURL = site.siteRelativeToLocalPath(parentURL);                    
      parentABSURL = dwscripts.filePathToLocalURL(parentABSURL);
    }
    else if(parentURL)
    {
      parentABSURL = dwscripts.getAbsoluteURL(parentURL, theDOM.URL);
    }
    
    var retURL = dwscripts.getAbsoluteURL(frameURL, parentABSURL);
    
    if (retURL && retURL != frameURL)
    {
      //calculate the relative path to the opened document
      
      // first find the common path
      var frameCommonPath = retURL;
      var docABSPath = theDOM.URL;
      
      while(frameCommonPath != dwscripts.ABSOLUTE_FILE_PREFIX)
      {
        frameCommonPath = dwscripts.getParentURL(frameCommonPath);
        if (docABSPath.indexOf(frameCommonPath) == 0)
        {
          break;
        }
      }
      
      // if no common path was found return the original path
      // else calculate the relative path
      if (frameCommonPath != dwscripts.ABSOLUTE_FILE_PREFIX)
      {
        var frameRelPath = retURL.substring(frameCommonPath.length + dwscripts.FILE_SEP.length);
        var docRelPath =  theDOM.URL.substring(frameCommonPath.length + dwscripts.FILE_SEP.length);
        
        while(docRelPath && docRelPath.indexOf(dwscripts.FILE_SEP) != -1)
        {
          frameRelPath = ".." + dwscripts.FILE_SEP + frameRelPath;
          docRelPath = docRelPath.substring(docRelPath.indexOf(dwscripts.FILE_SEP) + dwscripts.FILE_SEP.length);
        }
        
        retURL = frameRelPath;
      }
    }
  }

  return retURL;
};


//--------------------------------------------------------------------
// FUNCTION:
//   _getDataFromHTMLTable
//
// DESCRIPTION:
//  This method extracts data from a TABLE structure
//  It knows how to handle both colspan and rowspan
//
// ARGUMENTS:
//   none
//  
// RETURNS:
//   (array) - bidimensional array with the resulting data
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getDataFromHTMLTable = function()
{
  var arrTmp;
  var extractedData = new Array;
  var rows = this._getRowsList(this.sourceElement);
  
  if (this.options.rowSelector) rows = this._applySelector(rows, this.options.rowSelector);

  for (var rowIdx = 0; rowIdx < rows.length; rowIdx++)
  {
     var row = rows[rowIdx];
     
     var dataRow;
     if (extractedData[rowIdx]) dataRow = extractedData[rowIdx];
     else dataRow = new Array
     
     var offset = 0;
     var cells = row.childNodes;
     if (this.options.dataSelector) cells = this._applySelector(cells, this.options.dataSelector);
     for (var cellIdx=0; cellIdx < cells.length; cellIdx++)
     {
       var cell = cells[cellIdx];
       
       if (cell.innerHTML && cell.outerHTML && cell.innerHTML == cell.outerHTML)
       {
          // skip this cell. When the table contain a thead or tbody section
          // with only one row defined but without the tr tags, the close 
          // tag </tbody> or </thead> is treated as child of the "row" object
          // we can detect that by testing the innerHTML and outerHTML properties   
          // see bug 231543
          continue;
       }
       var nextCellIndex = cellIdx + offset;
       
       // Find the next available position
       while (dataRow[nextCellIndex])
       {
          offset ++;
          nextCellIndex ++;
       }
      
       var cellValue = cell.innerHTML;
       dataRow[nextCellIndex] = cellValue;
       
       // Handle colspan
       var colspan = cell.colSpan;
       if (!colspan) colspan = 1;
       var startOffset = offset;
       for (var offIdx = 1; offIdx < colspan; offIdx++)
       {
         offset ++;
         nextCellIndex = cellIdx + offset;
         dataRow[nextCellIndex] = cellValue;
       }
       
       // Handle rowspan
       var rowspan = cell.rowSpan;
       if (!rowspan) rowspan = 1;
       for (var rowOffIdx = 1; rowOffIdx < rowspan; rowOffIdx++)
       {
         nextRowIndex = rowIdx + rowOffIdx;
         var nextDataRow;
         if (extractedData[nextRowIndex]) nextDataRow = extractedData[nextRowIndex];
         else nextDataRow = new Array;

         var rowSpanCellOffset = startOffset;
         for (var offIdx = 0; offIdx < colspan; offIdx++)
         {
           nextCellIndex = cellIdx + rowSpanCellOffset;
           nextDataRow[nextCellIndex] = cellValue;
           rowSpanCellOffset ++;
         }
         extractedData[nextRowIndex] = nextDataRow;
       }
      }
     extractedData[rowIdx] = dataRow;
  }
  
  return extractedData;
};


//--------------------------------------------------------------------
// FUNCTION:
//   _getDataFromNestedStructure
//
// DESCRIPTION:
//   This method extracts data from any HTML structure
//   It uses rowSelector and dataSelector in order to build a three level nested structure - 
//   Either one: rowSelector or dataSelector can miss
//
// ARGUMENTS:
//   none
//  
// RETURNS:
//   (array) - bidimensional array with the resulting data
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getDataFromNestedStructure = function()
{
  var extractedData = new Array;
  
  if (this.sourceElementID && !this.options.rowSelector && !this.options.dataSelector) 
  {
     // The whole sourceElementID is a single row, single cell structure;
     extractedData[0] = [this.sourceElement.innerHTML];
     return extractedData;
  }
  
  var self = this;
  // Get the rows
  var rows = [];

  if (!this.options.rowSelector)
     // If no rowSelector, there will be only one row
     rows = [this.sourceElement];
  else
     rows = this._getNodesByFunc(this.sourceElement, function(node) {
            return self._evalSelector(node, self.sourceElement, self.options.rowSelector);
           });

  // Get the data columns
  for (var rowIdx = 0; rowIdx < rows.length; rowIdx++)
  {
    var row = rows[rowIdx];
    // Get the cells that actually hold the data for each row
    var cells = [];
    if (!this.options.dataSelector)
      // If no dataSelector, the whole row is extracted as one cell row.
      cells = [row];
    else
      cells = this._getNodesByFunc(row, function(node) { 
               return self._evalSelector(node, row, self.options.dataSelector); 
              });
    
    extractedData[rowIdx] = new Array;
    for (var cellIdx = 0; cellIdx < cells.length; cellIdx ++)
      extractedData[rowIdx][cellIdx] = cells[cellIdx].innerHTML;
  }
  
  return extractedData;
};


//--------------------------------------------------------------------
// FUNCTION:
//   _applySelector
//
// DESCRIPTION:
//  This method applies a css selector on a collection and returns the resulting elements
//
// ARGUMENTS:
//   collection - (array) list of initial elements
//   selector - (string) selector value
//   root - (object) parent element of nodes to which the specified selector will be applied
//
// RETURNS:
//   (array) - list of resulting elements  
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._applySelector = function(collection, selector, root)
{
   var newCollection = [];
   for (var idx = 0; idx < collection.length; idx++)
   {
     var node = collection[idx];
     if (this._evalSelector(node, root ? root : node.parentNode, selector))
        newCollection.push(node);
   }
   return newCollection;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _evalSelector
//
// DESCRIPTION:
//  This method checks if a specified node matches the specified css selector
//
// ARGUMENTS:
//   node - (object) dom element that needs to be verified
//   root - (object) parent element of the "node" parameter
//   selector - (string) css selector
//
// RETURNS:
//   (boolean) - true if specified node matches the specified css selector, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._evalSelector = function (node, root, selector)
{
  if (node.nodeType != Node.ELEMENT_NODE)
     return false;
   if (node == root)
     return false;
     
   // Comma delimited selectors can be passed in
   // The node is selected if it matches one of the selectors
   // #myID1, div#myID2, #myID3
  var selectors = selector.split(",");

  for (var idx = 0; idx < selectors.length; idx ++)
  {
    var currentSelector = selectors[idx].replace(/^\s+/, "").replace(/\s+$/, "");
     var tagName = null;
     var className = null;
     var id = null;
     
     // Accepted values for the selector:
     // DIV.myClass | DIV | .myClass | *.myClass
     // DIV#myID | #myID
     // > DIV.myClass : > points to the direct descendents
     
     var selected = true;
     if (currentSelector.substring(0,1) == ">") 
     {
        // Looking for direct descendants only
        if (node.parentNode != root) 
          selected = false;
        else
          currentSelector = currentSelector.substring(1).replace(/^\s+/, "");
     }
     if (selected) 
     {
       tagName = currentSelector.toLowerCase();
       if (currentSelector.indexOf(".") != -1)
       {
         var parts = currentSelector.split(".");
         tagName = parts[0];
         className = parts[1];
       }
       else if (currentSelector.indexOf("#") != -1)
       {
         var parts = currentSelector.split("#");
         tagName = parts[0];
         id = parts[1];
       }
     }
     
     if (selected && tagName != '' && tagName != '*')
         if (node.tagName.toLowerCase() != tagName) 
            selected = false;
     if (selected && id && node.id != id)
         selected = false;
     var classAttr = node.getAttribute("class");
    if (selected && className && (!classAttr || (classAttr && classAttr.search(new RegExp('\\b' + className + '\\b', 'i')) == -1)))
    { 
       selected = false;
     }

     if (selected)
      return true;
  }
  return false;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getNodesByFunc
//
// DESCRIPTION:
//  This method calls the specified function for each node in the sub-tree with the given root.
//
// ARGUMENTS:
//   root - (object) the dom element in which the specified nodes will be searched
//   func - (function) the function that decides which elements are selected
//
//
// RETURNS:
//   (array) - list of nodes that match the specified selectors
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getNodesByFunc = function(root, func)
{
  var nodeStack = new Array;
  var resultArr = new Array;
  var node = root;

  while (node)
  {
    if (func(node))
      resultArr.push(node);

    if (node.hasChildNodes())
    {
      nodeStack.push(node);
      node = node.childNodes[0];
    }
    else
    {
      if (node == root)
        node = null;
      else
        try { node = this._getNextSibling(node); } catch (e) { node = null; };
    }
    
    while (!node && nodeStack.length > 0)
    {
      node = nodeStack.pop();
      if (node == root)
        node = null;
      else
        try { node = this._getNextSibling(node); } catch (e) { node = null; }
    }
  }
  
  return resultArr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getNextSibling
//
// DESCRIPTION:
//  This method returns the element immediately after the one passed as parameter.
//
// ARGUMENTS:
//  node - (object) dom element 
//
// RETURNS:
//   (object) - the element immediately after the one passed as parameter, or null 
//              if "node" is not found or the parent node does not have other elements after it
//--------------------------------------------------------------------

Spry.DesignTime.HTMLDataSet.prototype._getNextSibling = function(node)
{
  var retEl = null;
  if (node && node.parentNode)
  {
    var childrenLen = node.parentNode.childNodes.length;
    if (childrenLen > 1)
    {
      // we will loop until the element before last element
      for (var i = 0; i < (childrenLen - 1); i++)
      {
        if (node.parentNode.childNodes[i] == node)
        {
          retEl = node.parentNode.childNodes[i + 1];
          break;
        }
      }
    }
  }
  return retEl;
}

//--------------------------------------------------------------------
// FUNCTION:
//   _normalizeColumnName
//
// DESCRIPTION:
//   This function removes all special characters from the column name.
//
// ARGUMENTS:
//   colName - (string) the raw column name
//
// RETURNS:
//   (string) - new column name
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._normalizeColumnName = function(colName) 
{
  if (colName)
  {
  // Removes the tags from column names values
  // Replaces spaces with underscore
  colName = colName.replace(/(?:^[\s\t]+|[\s\t]+$)/gi, "");
  colName = colName.replace(/<\/?([a-z]+)([^>]*)>/gi, "");
  colName = colName.replace(/&nbsp;/gi, " ");
  colName = colName.replace(/[\s\t]+/gi, "_");
  }

  return colName;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getRowsList
//
// DESCRIPTION:
//   Creates list of all the TR child nodes of the specified table node.
//   Note that tr nodes that are included in the tfoot section are not included 
//   in the list, this is a limitation/feature of the HDS framework implementation.
//    
//
// ARGUMENTS:
//   tableNode - dom object - the table node
//
// RETURNS:
//   object - array of tr nodes
//--------------------------------------------------------------------

Spry.DesignTime.HTMLDataSet.prototype._getRowsList = function(tableNode)
{
  var retList = new Array();
  var currNode;

  if (tableNode && tableNode.hasChildNodes())
  {
    var tableChildNodes = tableNode.childNodes; 
    for (var i = 0; i < tableChildNodes.length; i++)
    {
      if (tableChildNodes[i].nodeType == Node.ELEMENT_NODE)
      {
        if (tableChildNodes[i].tagName && tableChildNodes[i].tagName.toLowerCase() == "tr")
        {
          retList.push(tableChildNodes[i]);
        }
        else if (tableChildNodes[i].tagName && tableChildNodes[i].tagName.match(/tbody|thead/i))
        {
          if (tableChildNodes[i].hasChildNodes())
          {
            var tmpChildNodes = tableChildNodes[i].childNodes; 
            for (var j = 0; j < tmpChildNodes.length; j++)
            {
              if (tmpChildNodes[j].nodeType == Node.ELEMENT_NODE && tmpChildNodes[j].tagName.toLowerCase() == "tr")
              {
                retList.push(tmpChildNodes[j]);
              }
            }
          }
        }
      } 
    }
  }
  
  return retList;
}

//--------------------------------------------------------------------
// FUNCTION:
//   _getOptionsString
//
// DESCRIPTION:
//   This function constructs the optional parameters string for the javascript 
//  constructor that will be inserted in page.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - the optional parameters string
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getOptionsString = function()
{
  var optionsString = "";
  
  for (var key in this.options)
  {
      if(key == "columnNames")
      {
        if(typeof(this.options[key]) == "object" && this.options[key] != null)
        {
          var strColumnAliases = "";
          for (var i = 0; i < this.options[key].length; i++)
          {
            strColumnAliases += "'" + dwscripts.escQuotes(this.options[key][i]) + "', ";
          }
          if (strColumnAliases)
          {
            strColumnAliases =  strColumnAliases.replace(/, $/, "");
            optionsString += "columnNames: [" + strColumnAliases + "], ";
          }
        }
      }
      else if (key == "rowSelector" || key == "dataSelector")
      {
        if (this.options[key])
        {
          optionsString += key + ': "' + dwscripts.escQuotes(this.options[key]) + '", ';
        }  
      }
      else
      {
        if (this.options[key] != null && this.options[key] != this.optionsDefaultValues[key])
        {
          var quotes = '';
          if (typeof (this.optionsDefaultValues[key]) == "undefined")
          {
            quotes = '"';
          }
          optionsString += key + ': ' + quotes + this.options[key] + quotes + ', ';  
        }      
      }  
  }
  
  if (optionsString.length)
  {
    optionsString = optionsString.replace(/, $/, "");
    optionsString = ", {" + optionsString + "}";
  }

  return optionsString;
}

//--------------------------------------------------------------------
// FUNCTION:
//   _getMarkerPosition
//
// DESCRIPTION:
//   Helper function used to calculate marker positions in page. 
//
// ARGUMENTS:
//   elementObj - (object) the dom element to which this marker will be attached 
//   arrMarkersPositions - (object) array of marker positions in a specified frame
//
// RETURNS:
//   (object) - position object for marker
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getMarkerPosition = function (elementObj, arrMarkersPositions)
{
  var positionObj = {markerLeft: 0, markerTop: 0, maskLeft: 0, maskTop: 0};
  var overlaps = true;
  var overlapLeft = this.markerDim - 6;
  var overlapTop = this.markerDim - 7;
  
  // calculate the absolute position of this element 
  while (elementObj) {
    positionObj.markerLeft += elementObj.offsetLeft;
    positionObj.markerTop += elementObj.offsetTop;
    elementObj = elementObj.offsetParent;                
  }
  
  // we need to move only the markers if they are overlapping
  positionObj.maskLeft = positionObj.markerLeft;
  positionObj.maskTop = positionObj.markerTop;
  if (positionObj.markerLeft >= this.markerDim)
  {
    positionObj.markerLeft -= this.markerDim;
  }

  while (overlaps)
  {
    overlaps = false;
    // see if current marker position overlaps the position of another marker
    for (var i = 0; i < arrMarkersPositions.length; i++)
    {
      if (positionObj.markerLeft >= arrMarkersPositions[i].markerLeft &&
          positionObj.markerLeft < (arrMarkersPositions[i].markerLeft + overlapLeft) &&
          positionObj.markerTop >= arrMarkersPositions[i].markerTop &&
          positionObj.markerTop < (arrMarkersPositions[i].markerTop + overlapTop))
      {
        positionObj.markerLeft = arrMarkersPositions[i].markerLeft + overlapLeft;
        positionObj.markerTop = arrMarkersPositions[i].markerTop + overlapTop;
        overlaps = true;
        break;    
      }
    }
  }
  arrMarkersPositions.push(positionObj);
  
  return positionObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _getAllHTMLDSNamesFromDoc
//
// DESCRIPTION:
//   Helper function used to find all HTML Data Sets from a specified document. 
//
// ARGUMENTS:
//   documentObj - (object) the document object in which we will find the DS objects 
//
// RETURNS:
//   (array) - found HTML Data Set Names
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._getAllHTMLDSNamesFromDoc = function (documentObj)
{
	var ajaxDataSetNames = new Array();
  var regExp = new RegExp(this.findRegExpStr, "ig");
  
	if (documentObj != null)
	{
		var jsScriptBlocks = documentObj.getElementsByTagName("script");
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
          while (arr = regExp.exec(jsCode) != null)
          {
          	ajaxDataSetNames.push(RegExp.$1);						
          }
				}
			}
		}
	}
	
	return ajaxDataSetNames;
}

//--------------------------------------------------------------------
// FUNCTION:
//   _attachMarkerEvents
//
// DESCRIPTION:
//   Helper function used to attach events to marker elements. 
//
// ARGUMENTS:
//   elementID - (string) the id of the element to which the marker it's attached
//   markerElement - (object) marker dom element
//   proxyObj - (object) the object that is attached to the browser control window
//   maskElementId - (string) the id of the dom element that will be placed over the selected element
//
// RETURNS:
//   (nothing)
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._attachMarkerEvents = function (elementID, markerElement, proxyObj, maskElementId)
{
  if (elementID && elementID.indexOf(this.disabledMarkerPrefix) == -1)
  {
    // attach the onclick event only if the element has an ID
    markerElement.addEventListener("click", function() { proxyObj.selectElement(elementID, markerElement, maskElementId);}, true);
    // make a relation between the data container and the marker and mask elements
    proxyObj.containersHash[elementID] = maskElementId; 
  }
  markerElement.addEventListener("mouseover", function() { proxyObj.highlightElement(maskElementId);}, true);
  markerElement.addEventListener("mouseout", function() { proxyObj.unHighlightElement(maskElementId);}, true);
}

//--------------------------------------------------------------------
// FUNCTION:
//   _elementIsOrInsideSpryRegion
//
// DESCRIPTION:
//   Helper function used to detect if specified elements are or are contained inside a spry region. 
//
// ARGUMENTS:
//   elementObj - (object) dom element
//
// RETURNS:
//   (boolean) - true if the element is inside a spry region or is a spry region; false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.HTMLDataSet.prototype._elementIsOrInsideSpryRegion = function (elementObj)
{
  var retValue = false;
  var parentElement = elementObj;
  
  while (parentElement && parentElement.tagName != "BODY")
  {
    if (parentElement && 
        (parentElement.getAttribute("spry:region") || parentElement.getAttribute("spry:detailregion") ||
          (parentElement.getAttribute("id") && !parentElement.getAttribute("id").indexOf("spryregion"))
         ) 
       )
    {
      retValue = true;
      break;
    }
    parentElement = parentElement.parentNode;
  }
  
  return retValue;
}

//****************************** CALLBACK METHODS *****************************//

//--------------------------------------------------------------------
// FUNCTION:
//   ReceivedResponseCallBack
//
// DESCRIPTION:
//   This is callback function used for asynchronous http requests. 
//
// ARGUMENTS:
//   requestID -  (string) id of the request when using the MMHttp to get the data, or null when
//                        webkit control is used
//   respObjParam - (object) response object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
ReceivedResponseCallBack = function(requestID, respObjParam)
{
  var errStr = null;
  var responseObj = respObjParam;
  
  if (requestID == null)
  {
    // this call was made from the webkit control
    // and right now it will not return anything about the status of the request
    // so we will construct here the responseObj
    var browserCtrl = window["SpryDSDesignTimeObject"].getBrowserControl();

    responseObj = new Object();
    responseObj.statusCode = "404";
    responseObj.data = "";
    if (browserCtrl)
    {
      responseObj.statusCode = respObjParam.httpStatus;
      // when the file is retrieved using the file:// schema the httpStatus
      // is allways set as incomplete, to avoid this we should set the correct status if the
      // file is not found
      if (respObjParam.currentBrowserLocation && respObjParam.currentBrowserLocation.match(/^file:\/\//i))
      {
        if (DWfile.exists(respObjParam.currentBrowserLocation))
        {
          responseObj.statusCode = "200";
        }
        else
        {
          responseObj.statusCode = "404";
        }
      }
      responseObj.data = browserCtrl.getSource();
      // don't allow navigation
      browserCtrl.addEventListener("BrowserControlBeforeNavigation", function(e){ e.preventDefault(); }, true);
    }
  }
  window["SpryDSDesignTimeObject"].dataWasLoaded = true;
  
  errStr = window["SpryDSDesignTimeObject"]._processHTTPResponse(responseObj);

  window[window["SpryDSDesignTimeObject"].defaultAsyncCallBack](errStr);
};

