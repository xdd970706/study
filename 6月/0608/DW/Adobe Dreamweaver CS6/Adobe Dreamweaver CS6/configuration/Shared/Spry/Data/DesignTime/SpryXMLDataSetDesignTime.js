// SpryXMLDataSetDesignTime.js

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

/////////////////////////////////////////////////////////////////////
//
//  CLASS:
//    Spry.DesginTime.XMLDataSet
//
//  DESCRIPTION:
//    This class is a design-time represantation of an Spry XML Data Set
//    It is used by all commands and classes that are bound to Spry XML Data Set.
//     
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       XMLDataSet(dsName,dataSetURL, dataSetPath)
//
//   Getters and setters:
//       getType()
//       setColumnList(colList)
//       getColumnList()
//       getColumnNames()
//       getColumnIndex(columnName)
//       getColumnType(column, byIndex)
//       setColumnType(colIdx, colType)
//       getColType(colName)
//       getAllColumnsTypes()
//       setAllColumnsTypes(paramColumnsTypes)
//       getNoOfRows()
//       getJSVarName()
//       getDataSetURL()
//       getDataSetPath()
//       getRootElement()
//       setDataSetPath(dsXPath)
//       IsError()
//       getLastErrorMessage()
//       getOptions()
//       setXmlSchemaTree(controlObj)
//       getFileDataSetURL()
//       getDesignTimeFeed()
//       getSchemaString(bRefresh)
//       getAssetsFiles()
//       getSchemaArray(bRefresh)
//       getDataSetNode(aNode, dataSetPath)
//       setPreviewCtrl(previewCtrl, higlightColumns)
//
//   Utils:     
//       copyDSOptions(dataSetObj)
//       IsValidSchemaString(schemaString)
//       isCustomized()
//       loadDataIntoDataSet(dontFilter)
//       constructDataSet()
//       clearDataSetContent()
//       buildOptionsString()
//       getGeneratedCode()
//       buildXMLTreeContents(aParentTreeNode, xpath)
//       updatePreviewCtrl(highlightedColumn)
//       displayFeedSourceNotification(containerObj)
//
// PRIVATE METHODS:
//       _addPrefixToXPathComponents
//       _generateDataObject()
//       _generateXSLTSource(schemaNameArray, selfReferenceNode, namespaceDeclarations)
//
//////////////////////////////////////////////////////////////////////

var Spry;
if (!Spry) Spry = {};
if (!Spry.DesignTime) Spry.DesignTime = {};

//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DesginTime.XMLDataSet
//
// DESCRIPTION:
//   Constructor function for the design-time object that manages the state of an HTML Data Set object.
//
// ARGUMENTS:
//   dsName - string - The dataset name
//   dataSetURL - string - source file URL
//   dataSetPath - string - data container element id
//   optionsObj - object - dataset optional arguments.  
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet = function(dsName, dataSetURL, dataSetPath, optionsObj)
{
  Spry.DesignTime.DataSet.call(this, dsName, dataSetURL);

  this.type = Spry.DesignTime.DataSet.XMLDataSetType;
	this.dsName = dsName;
	this.dataSetURL = dataSetURL;
	this.dataSetPath = dataSetPath;
	this.loadingError = false;
	//the resolved file url path
	this.fileDataSetURL = null;
	//col list
	this.colList = new Array();
	this.columnNames = null;
	this.columnTypes = null;
	// options
	this.options = new Array();
	this.options["sortOnLoad"] = "";
	this.options["sortOrderOnLoad"] = "";
	this.options["distinctOnLoad"] = false;
	// true by default for useCache	
	this.options["useCache"] = true;
	this.options["loadInterval"] = -1;
	// internal, private variable
	this._createdSelfReferenceNode = null;
  this.xmlSchemaTreeContent = "";
  this.xmlSchemaTreeContent = "";

  this.dsKeyPrefix = "spry_ds_";
  this.jsCodeTemplate = 'var @@dsName@@ = new Spry.Data.XMLDataSet(@@dsFileSource@@, "@@dsXPath@@"@@options@@);';
  this.jsColTypesTemplate = '@@dsName@@.setColumnType("@@colname@@", "@@coltype@@");';
  this.findRegExpStr = "(\\w*)\\s*=\\s*new\\s*Spry\\.Data\\.XMLDataSet\\(\\s*(?:(null)|[\"']*(.*?)[\"']*)\\s*,\\s*[\"'](.*?)[\"']\\s*(?:,\\s*(\\{.*?\\}))?\\s*\\)";

  if (optionsObj)
	{
    this.setOptions(optionsObj);
  }
  if (dataSetURL)
  {
    this.setDataSetURL(dataSetURL);
  }
  
}

// Spry.DesignTime.XMLDataSet derives from Spry.DesignTime.DataSet base class

Spry.DesignTime.XMLDataSet.prototype = new Spry.DesignTime.DataSet();

// Reset the constructor property back to XMLDataSet for our newly created prototype
// object so callers know that our object was created with the XMLDataSet constructor.

Spry.DesignTime.XMLDataSet.prototype.constructor = Spry.DesignTime.XMLDataSet;


//****************************** PUBLIC METHODS **********************


//****************************** GETTERS/SETTERS  **********************

//--------------------------------------------------------------------
// FUNCTION:
//   getType
//
// DESCRIPTION:
//   This function retrieves the of the object.
//
// ARGUMENTS:
//   none 
//
// RETURNS:
//   (string) - the value "XMLDataset"
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getType = function()
{
	return this.type;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setColumnList
//
// DESCRIPTION:
//   This function sets the internal array of column objects.
//
// ARGUMENTS:
//   colList - array - array of ajaxDSColNode objects
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.setColumnList = function(colList)
{
	this.colList = colList;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnList
//
// DESCRIPTION:
//   Returns the data set columns list.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (array) - array of ajaxDSColNode objects
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getColumnList = function()
{
		return this.colList;
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
Spry.DesignTime.XMLDataSet.prototype.getColumnNames = function()
{
  if (this.columnNames)
  {
    return new Array().concat(this.columnNames);
  }
  
  return null;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColumnIndex
//
// DESCRIPTION:
//   This function retrieves the index of the specified column from the data set columns list.
//
// ARGUMENTS:
//   columnName - (string) column name
//
// RETURNS:
//   (number) - a number greater than -1 if the specified column is specified, -1 otherwise
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getColumnIndex = function(columnName)
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
//   Returns the column type for the column index specified as parameter.
//
// ARGUMENTS:
//  none
//  
// RETURNS:
//   (string) - column type
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getColumnType = function(column, byIndex)
{
  var colIdx = column;
  
  if (!byIndex)
  {
    if (column == "ds_RowID")
    {
      return "number";
    }
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
//   none
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.setColumnType = function(colIdx, colType)
{
  if (!this.columnTypes)
  {
    this.columnTypes = new Object(); 
  }

  this.columnTypes[colIdx] = colType;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getColType
//
// DESCRIPTION:
//   This function returns the data type of the specified column.
//
// ARGUMENTS:
//   colName - (string) data set's column name
//
// RETURNS:
//   (string) - column type if column name was found, null otherwise
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getColType = function(colName)
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
Spry.DesignTime.XMLDataSet.prototype.getAllColumnsTypes = function()
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
Spry.DesignTime.XMLDataSet.prototype.setAllColumnsTypes = function(paramColumnsTypes)
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
//   Returns the number of data set rows.  
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (number) - number of data set rows
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getNoOfRows = function()
{
  return (this.data) ? this.data.length : 0;
};


//--------------------------------------------------------------------
// FUNCTION:
//   getJSVarName
//
// DESCRIPTION:
//   This function returns the data set name.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - data set name
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getJSVarName = function()
{
  return this.dsName;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetURL
//
// DESCRIPTION:
//   This function returns the data set URL
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - the data set URL
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getDataSetURL = function()
{
  return this.dataSetURL;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetPath
//
// DESCRIPTION:
//   This function returns the XPath expression of the data set. 
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - XPath expression
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getDataSetPath = function()
{
  return this.dataSetPath;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getRootElement
//
// DESCRIPTION:
//   This function is used for compatibility with the HTML data set. It also returns 
//   the XPath expression
//
// ARGUMENTS:
//   none 
//
// RETURNS:
//   (string) - XPath expression
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getRootElement = function()
{
  return this.dataSetPath;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDataSetPath
//
// DESCRIPTION:
//   This function updates the XPath expression of the data set.
//
// ARGUMENTS:
//   dsXPath - (string) XPath expression
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.setDataSetPath = function(dsXPath)
{
  this.dataSetPath = dsXPath;
};

//--------------------------------------------------------------------
// FUNCTION:
//   IsError
//
// DESCRIPTION:
//   This function returns true if an error occurred when the data set content was loaded.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (boolean) - true if an error occurred false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.IsError = function()
{
  return this.loadingError;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getLastErrorMessage
//
// DESCRIPTION:
//   This function is called by the "generateDynamicSourceBindings" API function
//  when the bindings needs to be generated. It only returns a general error message.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if no error occurred, general error message otherwise
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getLastErrorMessage = function()
{
  if (this.loadingError)
  {
    return dw.loadString("spry/dataset/designtime/alert/cannotDisplayDataSetBindings");
  }
  return null;
};


//--------------------------------------------------------------------
// FUNCTION:
//   setXmlSchemaTree
//
// DESCRIPTION:
//   This function attach the tree control that display the XML schema to this object.
//
// ARGUMENTS:
//   controlObj - (object) document element
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.setXmlSchemaTree = function(controlObj)
{
  this.xmlSchemaTree = controlObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getFileDataSetURL
//
// DESCRIPTION:
//   This function transform the relative URL received in to an absolute URL which include the schema protocol (file:///, http(s)://). 
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - data set absolute URL
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getFileDataSetURL = function()
{
  if (this.fileDataSetURL == null)
  {
  	this.fileDataSetURL = this._getResolvedURI(this.dataSetURL);
  }
  return this.fileDataSetURL;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDesignTimeFeed
//
// DESCRIPTION:
//   This function sets the design-time feed for specified data set.
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (string) - associated design-time feed URL or empty string if the data set 
//            has no feed associated
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getDesignTimeFeed = function()
{
	// PATENT:
	// Adobe patent application tracking #B463, entitled Design Time Feed, inventors: Amit Kishnani, Jorge Taylor 

	var designTimeSchemaURI = ajaxUtils.getDesignTimeSchemaURI(this.dsName);
	if (designTimeSchemaURI && designTimeSchemaURI.length)
	{
		designTimeSchemaURI = this._getResolvedURI(designTimeSchemaURI, true);
	}
  
	return designTimeSchemaURI;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSchemaString
//
// DESCRIPTION:
//   This function gets the XML Schema for the supplied XML file and returns
//  an array with all XML tags or attributes found if no error occurred or an array of errors.
//
// ARGUMENTS:
//   bRefresh - (boolean) force a refresh of the schema
//
// RETURNS:
//   (array) - array of XML tags and attributes, or an array of errors
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getSchemaString = function(bRefresh)
{
  var retElements = null;
	var xmlSchemaString = "";

	this.loadingError = false;
 
  // reset the content of the schema tree
  this.xmlSchemaTreeContent = "";
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
  
  if (xmlSchemaString != null && xmlSchemaString.length)
  {
  	var newDOM = dw.getNewDocumentDOM(); 
  	newDOM.documentElement.outerHTML = xmlSchemaString; 	
  	var elementNodes = newDOM.getElementsByTagName("ELEMENT");
  	if ((elementNodes != null) && (elementNodes.length))
  	{
      retElements = elementNodes; 
    }
    else
    {
      retElements = newDOM.getElementsByTagName("ERROR");
    	this.loadingError = true;
    }	
  }
  else
  {
   	this.loadingError = true;
  }
  
	
	return retElements;
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
Spry.DesignTime.XMLDataSet.prototype.getAssetsFiles = function()
{
  var includeFileList = new Array();

  //add xpath.js
  var xPathIncludeFileInfo = new AssetInfo("Shared/Spry/Data/xpath.js","xpath.js", "javascript");
  xPathIncludeFileInfo.isShared = false;
  includeFileList.push(xPathIncludeFileInfo);

  //add spryData.js
  var spryDataFileInfo = new AssetInfo("Shared/Spry/Data/SpryData.js","SpryData.js", "javascript");
  spryDataFileInfo.isShared = true;
  includeFileList.push(spryDataFileInfo);	

  return includeFileList;
};

//--------------------------------------------------------------------
// FUNCTION:
//   IsValidSchemaString
//
// DESCRIPTION:
//   This function determines if there are any errors in the response received from the 
//   MMXSLT.getXMLSchema API function.
//
// ARGUMENTS:
//   schemaString - (string) the schema string
//
// RETURNS:
//   (boolean) - true if no error detect, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.IsValidSchemaString = function(schemaString)
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
};

//--------------------------------------------------------------------
// FUNCTION:
//   getSchemaArray
//
// DESCRIPTION:
//   This function gets the XML schema, extracts all "ELEMENT" and "ATTRIBUTE"
//  nodes and constructs and return an array of "ajaxDSSchemaNode" objects.
//
// ARGUMENTS:
//   bRefresh - (boolean) force a refresh of the XML schema

//
// RETURNS:
//   (array) - an array of "ajaxDSSchemaNode" objects
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getSchemaArray = function(bRefresh)
{
	//get xml string
	var schemaArr = new Array();
	this.getFileDataSetURL();
	//get the file contents
	var elementNodes = this.getSchemaString(bRefresh);
	if ((elementNodes != null) && (elementNodes.length) && !this.IsError())
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
			else
			{
				//clear any previously set reference node
				this._createdSelfReferenceNode = null;					
			}
		}
	}
	
	return schemaArr;
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
//   (boolean) - true if the design time object is customized
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.isCustomized = function()
{
  var retValue = false;

  // is enough to test the XPath member variable
  if (this.dataSetPath)
  {
    retValue = true;
  }
  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDataSetNode
//
// DESCRIPTION:
//   This function selects the node from the schema elements according to the 
//   supplied XPath parameter (dataSetPath) 
//
// ARGUMENTS:
//   aNode  - (object) the root node in which we will search the specified node 
//   dataSetPath - (string) the XPath expression which identify the desired node
//
// RETURNS:
//   (object) - the specified node or null if the node was not found 
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.getDataSetNode = function(aNode, dataSetPath)
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
				//remove it for comparition purpose
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
Spry.DesignTime.XMLDataSet.prototype.setPreviewCtrl = function(previewCtrl, higlightColumns)
{
  if (previewCtrl)
  {
    this.previewBrowserCtrl = previewCtrl;
    this.previewHighlight = higlightColumns;
    
    // load the css from file
    var cssFilePath = dw.getConfigurationPath() + this.previewCtrlCSSFile;
    if (DWfile.exists(cssFilePath))
    {
      var strFileContent = DWfile.read(cssFilePath);
      this.strPreviewCSS = "<style type='text/css'>" + strFileContent + "</style>";
    }
  }
};

//--------------------------------------------------------------------
// FUNCTION:
//   XMLDataSet
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
Spry.DesignTime.XMLDataSet.prototype.getGeneratedCode = function()
{
  var jsCode = this.jsCodeTemplate;
  var jsCodeColTypes = this.jsColTypesTemplate;

  var fileSourceURL = this.getDataSetURL();
  var theDOM = dw.getDocumentDOM();
  
  if(fileSourceURL)
  {
    fileSourceURL = '"' + fileSourceURL + '"';
    var optionsString = this.buildOptionsString();
    
    if (optionsString && optionsString.length)
    {
      optionsString = ", " + optionsString;
    }
  	jsCode = jsCode.replace(/@@dsName@@/ig, this.dsName);
  	jsCode = jsCode.replace(/@@dsFileSource@@/ig, fileSourceURL);
  	jsCode = jsCode.replace(/@@dsXPath@@/ig, this.getDataSetPath());
  	jsCode = jsCode.replace(/@@options@@/ig, optionsString);
  
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
	}
	
	return jsCode;
}


//************************** UTILITY METHODS *************************

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
Spry.DesignTime.XMLDataSet.prototype.loadDataIntoDataSet = function(dontFilter)
{
  var schemaArray = this.getSchemaArray();

  this.columnNames = new Array();
  this.colList = new Array();

  // get columns names
  for (var i = 0; i < schemaArray.length; i++)
  {
    var colName = schemaArray[i].getFullNodeName();
    if (colName)
    {
      // construct the column names array
      this.columnNames.push(colName);
      this.colList.push(new ajaxDSColNode(colName,"string"));
    }
  }

  var parsedStructure = this._generateDataObject();
  if (parsedStructure)
  {
    this.data = parsedStructure.data;
    this.dataHash = parsedStructure.dataHash;
    this.unfilteredDataHash = this.dataHash;
    this.unfilteredData = this.data; 
  }
  if (!dontFilter)
  {
    this.filterAndSortData();
  }
  this.isDataLoaded = true;
};

//--------------------------------------------------------------------
// FUNCTION:
//   constructDataSet
//
// DESCRIPTION:
//   This function gets the source file and constructs the column names array.
//
// ARGUMENTS:
//  none
//                    
// RETURNS:
//   (string) - null in case the data set was constructed successfully or 
//              a description of the error that occurred
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.constructDataSet = function()
{
	var schemaArray = this.getSchemaArray();
	
  this.columnNames = new Array();
  this.colList = new Array();
  
  // get columns names
	for (var i = 0; i < schemaArray.length; i++)
	{
    var colName = schemaArray[i].getFullNodeName();
    if (colName)
    {
  	  // construct the column names array
  		this.columnNames.push(colName);
    }
	}
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
Spry.DesignTime.XMLDataSet.prototype.copyDSOptions = function(dataSetObj)
{
  this.dsName = dataSetObj.dsName; 
  this.dataSetURL = dataSetObj.dataSetURL;
  this.dataSetPath = dataSetObj.dataSetPath;
  this.setOptions(dataSetObj.options);
  this.setAllColumnsTypes(dataSetObj.getAllColumnsTypes());
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
Spry.DesignTime.XMLDataSet.prototype.clearDataSetContent = function()
{
  this.data = null;
  this.dataHash = null;
  this.colList = null;
  this.columnNames = null;
  this.columnTypes = null;
  this.dataSetPath = null;  
  this.isDataLoaded = false;
};

//--------------------------------------------------------------------
// FUNCTION:
//   buildOptionsString
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
Spry.DesignTime.XMLDataSet.prototype.buildOptionsString = function()
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
			((optKey == "loadInterval") && (optVal != null) && (optVal != -1))) 
		{
				if (optionsString.length)
				{
					optionsString += ", ";
				}
				//add the option key
				optionsString += optKey;
				//for string parameter
				optionsString += ": ";
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
};

//--------------------------------------------------------------------
// FUNCTION:
//   buildXMLTreeContents
//
// DESCRIPTION:
//   This function constructs the HTML code needed to display the XML schema in the 
//    tree control.
//
// ARGUMENTS:
//   aParentTreeNode - (object) the selected node from the XML schema
//   xpath - (string) the XPath of node that will appear as selected in the tree
//
// RETURNS:
//   (string) - the html code needed to display the XML schema  
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.buildXMLTreeContents = function(aParentTreeNode, xpath)
{
	if (aParentTreeNode && ((aParentTreeNode.tagName == "ELEMENT") || (aParentTreeNode.tagName == "ATTRIBUTE")))
	{
		var xmlNodeName = "";
		var xmlNSName = aParentTreeNode.getAttribute("ns");
		if (xmlNSName.length)
		{
			xmlNodeName += xmlNSName;
			xmlNodeName += ":";
		}

    xmlNodeName += aParentTreeNode.getAttribute("localName");
		var nodeXPath = "";
		
		var selected = "";
		if (xpath.length == 0)
		{
			nodeXPath = xmlNodeName;
			selected = " selected"; //select the root node by default
		}
		else
		{
			var attrPrefix = "";
			if (aParentTreeNode.tagName == "ATTRIBUTE")
			{
				//append the "@" 
	    		attrPrefix = "@";
			}
			nodeXPath = xpath + "/" + attrPrefix + xmlNodeName;
		}

		var iconVal = "tag";		
		var maxOccurs = aParentTreeNode.getAttribute("maxOccurs");
		if (maxOccurs == "unbounded")
		{
			iconVal = "tag-repeat";
		}		
		else if (aParentTreeNode.tagName == "ATTRIBUTE")
		{
			iconVal = "tag-attr";
		}
		this.xmlSchemaTreeContent += '<MM:TREENODE state="expanded" xpath="' +  nodeXPath +  '" icon="' + iconVal  + '" value="' + xmlNodeName +  '"' + selected +'>';  
		//loop over its children
		if (aParentTreeNode.hasChildNodes())
		{
			for (var i=0; i < aParentTreeNode.childNodes.length ; i++)
			{
				this.buildXMLTreeContents(aParentTreeNode.childNodes[i],nodeXPath);
			}
		}
		this.xmlSchemaTreeContent += '</MM:TREENODE>'
	}
	return this.xmlSchemaTreeContent;
};

//--------------------------------------------------------------------
// FUNCTION:
//   updatePreviewCtrl
//
// DESCRIPTION:
//   This function populate the preview control with the current data from the dataset.
//  If there are no rows found, then an info message is displayed.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.updatePreviewCtrl = function(highlightedColumn)
{
  var newDOM = dw.getNewDocumentDOM();
  var openedDOM = dw.getDocumentDOM();
  var headers = this.getColumnNames();
  var previewTableContent = "";
  var headTags = newDOM.getElementsByTagName("HEAD");
  
  if (headTags && headTags[0])
  {
    headTags[0].innerHTML += this.strPreviewCSS;
  }
  
  // set the charset for the preview to the one of the current document  
  newDOM.setCharSet(openedDOM.getCharSet());
  previewTableContent += '<table cellspacing="0" cellpadding="0"  width="100%">';

  // first we need to generate the columns names
  if (this.columnNames && this.columnNames.length)
  {
    previewTableContent += '<tr>';
    for(var i = 0; i < this.columnNames.length; i++)
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
        columnHeaderContent = '<a href="#" id="' + this.previewColumnPrefix + i + '">' + this.columnNames[i] + '</a>';        
      }
      else
      {
        columnHeaderContent = this.columnNames[i];        
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
      for (var j = 0; j < this.columnNames.length; j++)
      {
        var classStr = (!j)? ' class="first"' : "";
        var strHighlighted = ""; 
        if (this.previewHighlight && j == highlightedColumn)
        {
          strHighlighted = ' style="background-color: #CCFFFF"'
        }
        previewTableContent += '<td' + classStr + strHighlighted + '><div> ' + this.normalizeValueForPreview(this.data[i][this.columnNames[j]]) + '</div></td>';
      }
      previewTableContent += '</tr>';
    }
    previewTableContent += '<tr>';
    previewTableContent += '<td colspan="' + this.columnNames.length + '" class="lastRow"></td>';
    previewTableContent += '</tr>';
  }
  
  previewTableContent += '</table>'
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
//   displayFeedSourceNotification
//
// DESCRIPTION:
//   This function show a notification in the interface when the source file is a dynamic
//  document that use a testing server, or when a design time feed is specified. 
//
// ARGUMENTS:
//   containerObj - (object) element that will hold the message
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype.displayFeedSourceNotification = function(containerObj)
{
  if (containerObj)
  {
    if (this.urlPointsToTestingServer || this.getDesignTimeSchemaURI())
    {
      var fileURL = this.fileDataSetURL;
      if (this.getDesignTimeSchemaURI())
      {
        fileURL = this.getDesignTimeFeed();
      }
      containerObj.innerHTML = dwscripts.sprintf(dw.loadString("spry/dataset/wizard/message/realFeedURL"), fileURL);      
    }
    else
    {
      containerObj.innerHTML = "";
    }
  }
};


//****************************** PRIVATE METHODS *********************


//--------------------------------------------------------------------
// FUNCTION:
//   _generateDataObject
//
// DESCRIPTION:
//   This function get the XML file content and construct an object with the data and dataHash matrices. 
//
// ARGUMENTS:
//   None
//
// RETURNS:
//   (object) - object with the data contained by the data set
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype._generateDataObject = function()
{
	var retObj = null;

	//get the filedataseturl
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

		var schemaArray = this.getSchemaArray();
		var schemaNameArray = new Array();
    
    for (var i = 0; i < schemaArray.length; i++)
		{
			schemaNameArray.push(schemaArray[i].getFullNodeName());
		}

        // check if the xml source contains any namespace declarations.
        // we'll need to declare them within the xsl we generate so we
        // an properly transform the xml.
        var nsDecls = [];
        if (xmlSource)
        {
            var match;
            var regExp = /\s(xmlns(\:[^=]+)?=["'][^"']+["'])/gm;
            while ((match = regExp.exec(xmlSource)) != null)
                nsDecls.push(match[1]);
        }

		var xsltSource = this._generateXSLTSource(schemaNameArray, this._createdSelfReferenceNode, nsDecls);

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
		
		var jsStr = XSLT.transform(xmlSource, xsltSource, null);
		
		if (jsStr)
		{
		  try
      {
        eval(jsStr);
        if (typeof parsedStructure != "undefined")
        {
          // the parsedStructure will result from the xsl transformation 
          retObj = parsedStructure;
        }
      }
      catch(e)
      {
        // an error occurred set the return object to null
        // no data will be retrieved
        retObj = null; 
      }
    }
	}
  
	return retObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _addPrefixToXPathComponents
//
// DESCRIPTION:
//   This function adds the specified namespace prefix to each of the path components
//   within the specified path.
//
// ARGUMENTS:
//   prefix - (string) the the namespace prefix including the trailing ':' character
//   path - (string) the XPath to modify
//
// RETURNS:
//   (string) - the modified XPath
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype._addPrefixToXPathComponents = function(prefix, path)
{
  var result = "";
  if (path)
  {
    if (prefix)
    {
      var pathComponents = path.split(/\//);
      for (var i = 0; i < pathComponents.length; i++)
      {
        var pc = pathComponents[i];
        if (i > 0)
          result += "/";
        if (pc.charAt(0) != '@' && pc.indexOf(":") == -1)
          result += prefix;
        result += pc;
      }
    }
    else
      result = path;
  }
  return result;
};

//--------------------------------------------------------------------
// FUNCTION:
//   _generateXSLTSource
//
// DESCRIPTION:
//   This function constructs the XSL code nedeed to extract the data set data from the source xml.
//
// ARGUMENTS:
//   schemaNameArray - (object) the data set XML schema
//   selfReferenceNode - (string) the XPath to the data set root node
//   namespaceDeclarations = (array of strings) name space attributes to declare within our XSL source
//
// RETURNS:
//   (string) - the xslt source code
//--------------------------------------------------------------------
Spry.DesignTime.XMLDataSet.prototype._generateXSLTSource = function(schemaNameArray, selfReferenceNode, namespaceDeclarations)
{
  // If any namespace declarations were supplied, run through the
  // list and convert any default namespace declaration to a prefixed
  // declaration.

  var defaultNSPrefix = "";
  var nsDecls = [];

  for (var i = 0; i < namespaceDeclarations.length; i++)
  {
    var nsd = namespaceDeclarations[i];
    if (nsd.search(/^xmlns\=/) != -1)
    {
      defaultNSPrefix = 'xdsdns:';
      nsDecls[i] = 'xmlns:xdsdns="' + nsd.replace(/^xmlns\=["']|["'][^"']*$/g, "") + '"';
    }
    else
      nsDecls[i] = namespaceDeclarations[i];
  }
    
  var xsltSource = "";
  var openedDOM = dw.getDocumentDOM();
  var xsltBeginCode = '<?xml version="1.0"?>';
  xsltBeginCode += '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"';
  // Add any additional namespace declarations.
  for (var i = 0; i < nsDecls.length; i++)
    xsltBeginCode += " " + nsDecls[i];
  xsltBeginCode += '>';
  xsltBeginCode += '<xsl:output method="text"/>';
  xsltBeginCode += '<xsl:template match="/">';
  // replace special characters
  xsltBeginCode += '<xsl:variable name="newLine" select="\'&#xa;\'" />';
  xsltBeginCode += '<xsl:variable name="newLineReplaceString" select="\'&#x20;\'" />';
  xsltBeginCode += '<xsl:variable name="quotes" select="\'&#x22;\'" />';
  xsltBeginCode += '<xsl:variable name="quotesReplaceString" select="\'&#x26;quot;\'" />';
  
  // XSL template for replacing characters
  var replaceCharsTemplateStr = " <xsl:template name=\"replaceCharacters\">";
  replaceCharsTemplateStr += "  <xsl:param name=\"inText\"/>";
  replaceCharsTemplateStr += "  <xsl:param name=\"searchString\"/>";
  replaceCharsTemplateStr += "  <xsl:param name=\"replaceString\"/>";
  replaceCharsTemplateStr += "  <xsl:choose>";
  replaceCharsTemplateStr += "  <xsl:when test=\"contains($inText, $searchString)\">";
  replaceCharsTemplateStr += "  <xsl:variable name=\"pre\" select=\"substring-before($inText,$searchString)\"/>";
  replaceCharsTemplateStr += "  <xsl:variable name=\"post\">";
  replaceCharsTemplateStr += "  <xsl:call-template name=\"replaceCharacters\">";
  replaceCharsTemplateStr += "  <xsl:with-param name=\"inText\" select=\"substring-after($inText,concat($pre,$searchString))\"/>";
  replaceCharsTemplateStr += "  <xsl:with-param name=\"searchString\" select=\"$searchString\"/>";
  replaceCharsTemplateStr += "  <xsl:with-param name=\"replaceString\" select=\"$replaceString\"/>";
  replaceCharsTemplateStr += "  </xsl:call-template>";
  replaceCharsTemplateStr += "  </xsl:variable>";
  replaceCharsTemplateStr += "  <xsl:value-of select=\"concat($pre,$replaceString,$post)\" />";
  replaceCharsTemplateStr += "  </xsl:when>";
  replaceCharsTemplateStr += "  <xsl:otherwise>";
  replaceCharsTemplateStr += "  <xsl:value-of select=\"$inText\" />";
  replaceCharsTemplateStr += "  </xsl:otherwise>";
  replaceCharsTemplateStr += "  </xsl:choose>";
  replaceCharsTemplateStr += "  </xsl:template>";
  
  xsltSource = xsltBeginCode;

  // define js variables  
  xsltSource += "var parsedStructure = new Object();\n";
  xsltSource += "var rowObj = new Array();\n";
  xsltSource += "var rowID = 0;\n";
  xsltSource += "parsedStructure.data = new Array();\n";
  xsltSource += "parsedStructure.dataHash = new Array();\n";

  //add the xsl:for-each
  xsltSource += '<xsl:for-each select="' + this._addPrefixToXPathComponents(defaultNSPrefix, this.dataSetPath) + '">';
  
  xsltSource += "rowObj = new Array();\n";
  for (var i=0; i < schemaNameArray.length ; i++)
  {
    xsltSource += 'rowObj["' + schemaNameArray[i] + '"] = "';
    xsltSource += '<xsl:call-template name = "replaceCharacters">';
    // remove new lines
    xsltSource += ' <xsl:with-param name = "searchString" select="$newLine" />';
    xsltSource += ' <xsl:with-param name = "replaceString" select="$newLineReplaceString" />';
    xsltSource += ' <xsl:with-param name = "inText">';
    xsltSource += '<xsl:call-template name = "replaceCharacters">';
    xsltSource += ' <xsl:with-param name = "searchString" select="$quotes" />';
    xsltSource += ' <xsl:with-param name = "replaceString" select="$quotesReplaceString" />';
    xsltSource += ' <xsl:with-param name = "inText" select="';
    if (selfReferenceNode && (selfReferenceNode.getFullNodeName() == schemaNameArray[i]))
    {
      xsltSource += ".";
    }
    else
    {
      xsltSource += this._addPrefixToXPathComponents(defaultNSPrefix, schemaNameArray[i]);
    }
    xsltSource += '" />';
    xsltSource += '</xsl:call-template>';
    xsltSource += '</xsl:with-param>';
    xsltSource += '</xsl:call-template>';
    xsltSource += '";\n';
  }
  xsltSource += 'rowObj["ds_RowID"] = rowID++;\n';
  xsltSource += "parsedStructure.data.push(rowObj);\n";
  xsltSource += 'parsedStructure.dataHash[rowObj["ds_RowID"]] = rowObj;\n';
  xsltSource += "</xsl:for-each>";

  //end of xslt code
  xsltSource += '</xsl:template>' + replaceCharsTemplateStr + '</xsl:stylesheet>';

  return xsltSource;
};
