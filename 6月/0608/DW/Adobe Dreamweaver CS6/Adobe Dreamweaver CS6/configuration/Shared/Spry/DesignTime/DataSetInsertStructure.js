// DataSetInsertStructure.js

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

//--------------------------------------------------------------------
// CLASS:
//   Spry.DesignTime.DataSet.InsertStructure
//
// DESCRIPTION:
//   This class is used by the Spry Data Set Wizard command to insert predefined 
//  HTML structures bound to newly created datasets. 
//
// PUBLIC METHODS:
//
//   Constructor:
//
//       InsertStructure(structureType)
//    
//   Getters and setters:
//       getStructureType()
//       getDatasetURL()
//       setDatasetURL(dsURL)
//       getRootElement()
//       setRootElement(rootElementStr)
//       getDatasetColumnsNames()
//       setDatasetColumnsNames(dsColumnNames)
//       setDatasetColumnsTypes(dsColumnTypesHash)
//       getOptions()
//       setOptions(optObj)
//
//   Utils:
//       getArrayDifference(referenceArray, baseArray) - static
//       DatasetOptionsDiffer(dsDesignTimeObj)
//       setDefaultsOptions()
//       getInsertString(datasetName)
//       getAssetsFiles()
//       updateColumnNames()
//
//   Static constants:
//       DefaultContainerElement
//       DefaultContainerElementLabel
//
//     Insert types:      
//       SpryTable
//       MasterDetail
//       StackedContainers
//       SpotlightColumn
//       InsertNone
//  
// PRIVATE METHODS:
//       _getInsertMasterDetailString(datasetName)
//       _setDefaultsMasterDetail()
//
//
//--------------------------------------------------------------------

if( typeof Spry == 'undefined' ) Spry = {};
if( typeof Spry.DesignTime == 'undefined' ) Spry.DesignTime = {};
if( typeof Spry.DesignTime.DataSet == 'undefined' ) Spry.DesignTime.DataSet = {};


//--------------------------------------------------------------------
// FUNCTION:
//   Spry.DataSet.InsertStructure
//
// DESCRIPTION:
//   Constructor function for the insert option object. 
//
// ARGUMENTS:
//   structureType - (string) the type of the structure that will be inserted in page
//                        allowed values are: "insertSpryTable", "insertMasterDetail", "insertStacked", "insertSpotlight", "insertNone"
//
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

Spry.DesignTime.DataSet.InsertStructure = function(structureType)
{
  this.structureType = structureType;
  // this data set properties are saved in the insert option object
  // to be able to detect if there are changes in the initial data set to which this 
  //  object was attached
  this.dsURL = null;
  this.rootElementStr = null;
  this.dsColumnNames = null;
  this.dsColumnTypes = null;
  // this object will hold any options that are specific for each type of insert object
  this.options = null;
  
  // master-detail css classes
  this.mdContainerClass = "MasterDetail";
  this.mdMasterContainerClass = "MasterContainer";
  this.mdMasterColumnClass = "MasterColumn";
  this.mdMasterColumnHoverClass = "MasterColumnHover";  
  this.mdMasterColumnSelectedClass = "MasterColumnSelected";
  this.mdDetailContainerClass = "DetailContainer";
  this.mdDetailColumnClass = "DetailColumn";
      
  // stacked containers css classes
  this.scContainerClass = "StackedContainers";  
  this.scRowContainerClass = "RowContainer";
  this.scRowColumnClass = "RowColumn";

  // spotlight containers css classes
  this.spotlightContainerClass = "SpotlightAndStacked";
  this.spotlightRowClass = "SpotlightAndStackedRow";
  this.spotlightColumnsContainerClass = "SpotlightContainer";
  this.spotlightColumnClass = "SpotlightColumn";
  this.stackedContainerClass = "StackedContainer";
  this.stackedColumnClass = "StackedColumn";
};

//****************************** STATIC MEMBERS AND METHODS*********************

Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElement = "DIV";
Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElementLabel = "<DIV>";
// Insert Option types
Spry.DesignTime.DataSet.InsertStructure.SpryTable = "insertSpryTable";
Spry.DesignTime.DataSet.InsertStructure.MasterDetail = "insertMasterDetail";
Spry.DesignTime.DataSet.InsertStructure.StackedContainers = "insertStacked";
Spry.DesignTime.DataSet.InsertStructure.SpotlightColumn = "insertSpotlight";
Spry.DesignTime.DataSet.InsertStructure.InsertNone = "insertNone";

//--------------------------------------------------------------------
// FUNCTION:
//   getArrayDifference
//
// DESCRIPTION:
//   This function return a new array which will hold all values that exists in the 
// baseArray parameter and doesn't exists in the referenceArray parameter.
//
// ARGUMENTS:
//   referenceArray - array  
//   baseArray - array  
//
// RETURNS:
//   (array) - array of values that exists in baseArray but doesn't exists in the baseArray
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.getArrayDifference = function (referenceArray, baseArray)
{
  var retArray = new Array();
  
  if (baseArray.length && referenceArray.length)
  {
    for (var i = 0; i < baseArray.length; i++)
    {
      var found = false;
      for(var j = 0; j < referenceArray.length; j++)
      {
        if (baseArray[i] == referenceArray[j])
        {
          found = true;
          break;
        }
      }
      if (!found)
      {
        retArray.push(baseArray[i]);
      }
    }
  }
  else if (!baseArray.length)
  {
    retArray = referenceArray;
  }
  
  return retArray;
};

//****************************** GETTERS AND SETTERS *********************

//--------------------------------------------------------------------
// FUNCTION:
//   getStructureType
//
// DESCRIPTION:
//   Returns the type of the structure for which this object was created.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - object type
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getStructureType = function()
{
  return this.structureType;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDatasetURL
//
// DESCRIPTION:
//   This function returns the file source URL of the data set to which this object is attached. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - data set URL
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getDatasetURL = function()
{
  return this.dsURL;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDatasetURL
//
// DESCRIPTION:
//   Save the URL for the data source to which this object is attached.
//
// ARGUMENTS:
//   dsURL - (string) the data set URL
//
// RETURNS:
//   (nothing)
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setDatasetURL = function(dsURL)
{
  this.dsURL = dsURL;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getRootElement
//
// DESCRIPTION:
//   Returns the container element ID (for HTML data sets) or the XPath member (for XML datsets)
//   of the data set to which this object is attached.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - the dataset container id
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getRootElement = function()
{
  return this.rootElementStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setRootElement
//
// DESCRIPTION:
//   Saves the container element ID (for HTML data sets) or the XPath member (for XML datsets)
//   of the data set to which this object is attached.
//
// ARGUMENTS:
//   rootElementStr - (string) data set container ID  or XPath member
//
// RETURNS:
//   N/A
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setRootElement = function(rootElementStr)
{
  this.rootElementStr = rootElementStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getDatasetColumnsNames
//
// DESCRIPTION:
//   Returns the column names of the data set to which this object is attached. 
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (array) - the dataset column names
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getDatasetColumnsNames = function()
{
  return this.dsColumnNames;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDatasetColumnsNames
//
// DESCRIPTION:
//   Saves the column names of the data set to which this object is attached. 
//
// ARGUMENTS:
//   none
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setDatasetColumnsNames = function(dsColumnNames)
{
  this.dsColumnNames = dsColumnNames;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDatasetColumnsTypes
//
// DESCRIPTION:
//   Saves the column types of the data set to which this object is attached. 
//
// ARGUMENTS:
//   dsColumnTypesHash - (object) associative array (columnName => columnType) 
//   
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setDatasetColumnsTypes = function(dsColumnTypesHash)
{
  this.dsColumnTypes = dsColumnTypesHash;
};


//--------------------------------------------------------------------
// FUNCTION:
//   getOptions
//
// DESCRIPTION:
//   This function return the options for the Insert Option object.   
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (object) - the options for the insert object
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getOptions = function()
{
  return this.options;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setOptions
//
// DESCRIPTION:
//   This function saves the options for the insert object. 
//
// ARGUMENTS:
//   optObj - (object) options of the insert object
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setOptions = function(optObj)
{
  this.options = optObj;
};

//--------------------------------------------------------------------
// FUNCTION:
//   DatasetOptionsDiffer
//
// DESCRIPTION:
//   This function checks to see if there are any changes between the initial data set
//  to which this object was attached and the actual data set object. 
//
// ARGUMENTS:
//   dsDesignTimeObj - (Spry.DesignTime.HTMLDataSet) data set design time object
//
// RETURNS:
//   (boolean) - true if the dsURL, rootElementStr and dsColumns names are not the same, false otherwise
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.DatasetOptionsDiffer = function(dsDesignTimeObj)
{
  var retValue = false;
  
  if (this.dsURL != dsDesignTimeObj.getDataSetURL() || this.rootElementStr != dsDesignTimeObj.getRootElement())
  {
    retValue = true;
  }
  
  if (!retValue)
  {
    // update options column names in case they were changed without calling the corresponding set up command
    this.updateColumnNames(dsDesignTimeObj);
    
    if (dwscripts.findNewItemInArray(this.dsColumnNames, dsDesignTimeObj.getColumnNames()) != -1)
    {
      retValue = true;
    }
  }

  return retValue;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultsOptions
//
// DESCRIPTION:
//   This function sets predefined options for the insert object.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if operation completed successfully, the error description otherwise
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.setDefaultsOptions = function()
{
  var errStr = null;

  switch(this.structureType)
  {
    case Spry.DesignTime.DataSet.InsertStructure.SpryTable:
          errStr = this._setDefaultsTable();          
          break;
    case Spry.DesignTime.DataSet.InsertStructure.MasterDetail:
          errStr = this._setDefaultsMasterDetail();
          break;
    case Spry.DesignTime.DataSet.InsertStructure.StackedContainers:
          errStr = this._setDefaultsStackedContainers();          
          break;
    case Spry.DesignTime.DataSet.InsertStructure.SpotlightColumn:
          errStr = this._setDefaultsSpotlightColumn();          
          break;
  }
  
  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getInsertString
//
// DESCRIPTION:
//   This function calls the getInsertString of each insert object type. 
//
// ARGUMENTS:
//   datasetName - (string) the data set name
//
// RETURNS:
//   (string) - the markup for the generated structure, or null if an error occurred
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype.getInsertString = function(datasetName)
{
  var insertStr = null;
  switch(this.structureType)
  {
    case Spry.DesignTime.DataSet.InsertStructure.MasterDetail:
          insertStr = this._getInsertMasterDetailString(datasetName);
          break;
    case Spry.DesignTime.DataSet.InsertStructure.SpryTable:
          if (this.options && this.options.ajaxDataTable)
          {
            this.options.ajaxDataTable.setDataSetName(datasetName);
      			insertStr = ajaxUtils.getAjaxDataTableCode(this.options.ajaxDataTable);
            insertStr = ajaxUtils.wrapWithSpryRegion(insertStr, datasetName);
          }    			
          break;
    case Spry.DesignTime.DataSet.InsertStructure.StackedContainers:
          insertStr = this._getInsertStackedContainersString(datasetName);
          break;
    case Spry.DesignTime.DataSet.InsertStructure.SpotlightColumn:
          insertStr = this._getInsertSpotlightColumnString(datasetName);
          break;
  }
  return insertStr;
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
Spry.DesignTime.DataSet.InsertStructure.prototype.getAssetsFiles = function()
{
  var arrRetValue = new Array();
  
  switch(this.structureType)
  {
    case Spry.DesignTime.DataSet.InsertStructure.SpryTable:
          // no assets are needed for the spry table
          break;
    case Spry.DesignTime.DataSet.InsertStructure.MasterDetail:
        	var assetInfo = new AssetInfo("Shared/Spry/Data/SpryMasterDetail.css", "SpryMasterDetail.css", "link");
        	arrRetValue.push(assetInfo);
          break;
    case Spry.DesignTime.DataSet.InsertStructure.StackedContainers:
        	var assetInfo = new AssetInfo("Shared/Spry/Data/SpryStackedContainers.css", "SpryStackedContainers.css", "link");
        	arrRetValue.push(assetInfo);
          break;
    case Spry.DesignTime.DataSet.InsertStructure.SpotlightColumn:
        	var assetInfo = new AssetInfo("Shared/Spry/Data/SprySpotlightColumn.css", "SprySpotlightColumn.css", "link");
        	arrRetValue.push(assetInfo);
          break;
          
  }
  
  return arrRetValue; 
};

//--------------------------------------------------------------------
// FUNCTION:
//   updateColumnNames
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
Spry.DesignTime.DataSet.InsertStructure.prototype.updateColumnNames = function(dsDesignTimeObj)
{
  var dsColNames = dsDesignTimeObj.getColumnNames();
  
  if (this.dsColumnNames && dsColNames.length && this.dsColumnNames.length && dsColNames.length == this.dsColumnNames.length)
  {
    this.dsColumnNames = dsColNames;
    switch(this.structureType)
    {
      case Spry.DesignTime.DataSet.InsertStructure.SpryTable:
            if (this.options.ajaxDataTable && this.options.ajaxDataTable.colList && this.options.ajaxDataTable.colList.length)
            {
                for (var i = 0; i < this.options.ajaxDataTable.colList.length; i++)
                {
                  this.options.ajaxDataTable.colList[i].colLabel = this.dsColumnNames[this.options.ajaxDataTable.colList[i].colIdx]
                }
            }
            break;
      case Spry.DesignTime.DataSet.InsertStructure.MasterDetail:
            if (this.options.masterColumns && this.options.masterColumns.length)
            {
                for (var i = 0; i < this.options.masterColumns.length; i++)
                {
                  this.options.masterColumns[i].columnName = this.dsColumnNames[this.options.masterColumns[i].columnIdx];
                }
            }
            if (this.options.detailColumns && this.options.detailColumns.length)
            {
                for (var i = 0; i < this.options.detailColumns.length; i++)
                {
                  this.options.detailColumns[i].columnName = this.dsColumnNames[this.options.detailColumns[i].columnIdx];
                }
            }
            break;
      case Spry.DesignTime.DataSet.InsertStructure.StackedContainers:
            if (this.options.datasetColumns && this.options.datasetColumns.length)
            {
                for (var i = 0; i < this.options.datasetColumns.length; i++)
                {
                  this.options.datasetColumns[i].columnName = this.dsColumnNames[this.options.datasetColumns[i].columnIdx];
                }
            }
            break;
      case Spry.DesignTime.DataSet.InsertStructure.SpotlightColumn:
            if (this.options.spotlightColumns && this.options.spotlightColumns.length)
            {
                for (var i = 0; i < this.options.spotlightColumns.length; i++)
                {
                  this.options.spotlightColumns[i].columnName = this.dsColumnNames[this.options.spotlightColumns[i].columnIdx];
                }
            }
            if (this.options.stackedColumns && this.options.stackedColumns.length)
            {
                for (var i = 0; i < this.options.stackedColumns.length; i++)
                {
                  this.options.stackedColumns[i].columnName = this.dsColumnNames[this.options.stackedColumns[i].columnIdx];
                }
            }
            break;
    }            
  }
};

//****************************** PRIVATE METHODS *********************

//--------------------------------------------------------------------
// FUNCTION:
//   getInsertMasterDetailString
//
// DESCRIPTION:
//   This function return the markup for the Master/Detail structure.
//
// ARGUMENTS:
//   datasetName - (string) the data set name
//
// RETURNS:
//   (string) - the markup for the Master/Detail structure
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._getInsertMasterDetailString = function(datasetName)
{
  var insertString = '<div class="' + this.mdContainerClass + '">\n';
  
  insertString += '<div spry:region="' + datasetName + '" class="' + this.mdMasterContainerClass + '">\n';
  if (this.options && this.options.masterColumns && this.options.masterColumns.length)
  {
    insertString += '<div class="' + this.mdMasterColumnClass + '" spry:repeat="' + datasetName;
    insertString += '" spry:setrow="' + datasetName + '" spry:hover="' + this.mdMasterColumnHoverClass + '" spry:select="' + this.mdMasterColumnSelectedClass + '">';
    for (var i = 0; i < this.options.masterColumns.length; i++)
    {
      insertString += '{' + this.options.masterColumns[i].columnName + '}';
      if (i < (this.options.masterColumns.length - 1))
      {
        insertString += '<br />\n';
      }
    }
   insertString += '</div>\n';
  }
  insertString += '</div>\n';
  insertString += '<div spry:detailregion="' + datasetName + '" class="' + this.mdDetailContainerClass + '">\n';
  if (this.options && this.options.detailColumns && this.options.detailColumns.length)
  {
    for (var i = 0; i < this.options.detailColumns.length; i++)
    {
      var containerTag = this.options.detailColumns[i].containerElement.toLowerCase();
      insertString += '<' + containerTag + ' class="' + this.mdDetailColumnClass + '">{' + this.options.detailColumns[i].columnName +'}</' + containerTag + '>\n';
    }
  }
  insertString += '</div>\n';
  insertString += '<br style="clear:both" />\n';
  insertString += '</div>';  
  
  return insertString;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultsMasterDetail
//
// DESCRIPTION:
//   This function sets the default options for the master-detail insert object type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if the operation succeeded, or the error description
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._setDefaultsMasterDetail = function()
{
  var errStr = null;
  if (this.dsColumnNames && this.dsColumnNames.length > 1)
  {
    this.options = new Object();
    this.options.masterColumns = new Array();
    this.options.masterColumns.push({columnName: this.dsColumnNames[0], columnIdx: 0});
    this.options.detailColumns = new Array();
    for (var i = 1; i < this.dsColumnNames.length; i++)
    {
      this.options.detailColumns.push({columnName: this.dsColumnNames[i], columnIdx: i, containerElement: Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElement});
    } 
  }
  else
  {
    errStr = dw.loadString("spry/dataset/insert master-detail/alert/notEnoughColumns");
  }
  
  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultsTable
//
// DESCRIPTION:
//   This function sets the default options for the table object type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if the operation succeeded, or the error description
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._setDefaultsTable = function()
{
  var errStr = null;

  if (this.dsColumnNames && this.dsColumnNames.length)
  {
    this.options = new Object();
    var colList = new Array();
    this.options.ajaxDataTable = new ajaxDataTable("","","","","","");

    for (var i = 0; i < this.dsColumnNames.length; i++)
    {
      var columnType = this.dsColumnTypes[this.dsColumnNames[i]] ? this.dsColumnTypes[this.dsColumnNames[i]] : "string"; 
      //set the data table columns list, just ignore the column index
      colList.push(new ajaxDataTableColumn(this.dsColumnNames[i], true, "", columnType));
    }
    
  	this.options.ajaxDataTable.setColumnList(colList);
  }
  else
  {
    errStr = dw.loadString("spry/dataset/insert table/alert/notEnoughColumns");
  }

  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getInsertStackedContainersString
//
// DESCRIPTION:
//   This function return the markup for the Stacked Containers structure.
//
// ARGUMENTS:
//   datasetName - (string) the data set name
//
// RETURNS:
//   (string) - the markup for the Stacked Containers structure
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._getInsertStackedContainersString = function(datasetName)
{
  var insertString = '<div spry:region="' + datasetName + '" class="' + this.scContainerClass + '">\n';
  insertString += '<div spry:repeat="' + datasetName + '" class="' + this.scRowContainerClass + '">\n';

  if (this.options && this.options.datasetColumns && this.options.datasetColumns.length)
  {
    for (var i = 0; i < this.options.datasetColumns.length; i++)
    {
      var containerTag = this.options.datasetColumns[i].containerElement.toLowerCase();
      insertString += '<' + containerTag + ' class="' + this.scRowColumnClass + '">{' + this.options.datasetColumns[i].columnName + '}</' + containerTag + '>\n';
    }
  }
  insertString += '</div>\n';
  insertString += '</div>\n';
  
  return insertString;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultsStackedContainers
//
// DESCRIPTION:
//   This function sets the default options for the stacked containers insert object type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if the operation succeeded, or the error description
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._setDefaultsStackedContainers = function()
{
  var errStr = null;
  if (this.dsColumnNames && this.dsColumnNames.length)
  {
    this.options = new Object();
    this.options.datasetColumns = new Array();
    for (var i = 0; i < this.dsColumnNames.length; i++)
    {
      this.options.datasetColumns.push({columnName: this.dsColumnNames[i], columnIdx: i, containerElement: Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElement});
    } 
  }
  else
  {
    errStr = dw.loadString("spry/dataset/insert stacked containers/alert/notEnoughColumns");
  }
  
  return errStr;
};

//--------------------------------------------------------------------
// FUNCTION:
//   getInsertSpotlightColumnString
//
// DESCRIPTION:
//   This function return the markup for the Spotlight Column structure.
//
// ARGUMENTS:
//   datasetName - (string) the data set name
//
// RETURNS:
//   (string) - the markup for the Spotlight Column structure
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._getInsertSpotlightColumnString = function(datasetName)
{
  var insertString = '<div spry:region="' + datasetName + '" class="' + this.spotlightContainerClass + '">\n';
  insertString += '<div spry:repeat="' + datasetName + '" class="' + this.spotlightRowClass + '">\n';
  insertString += '<div class="' + this.spotlightColumnsContainerClass + '">\n';
  
  if (this.options && this.options.spotlightColumns && this.options.spotlightColumns.length)
  {
    for (var i = 0; i < this.options.spotlightColumns.length; i++)
    {
      insertString += '<' + this.options.spotlightColumns[i].containerElement.toLowerCase() + ' class="' + this.spotlightColumnClass + '">\n';
      insertString += '{' + this.options.spotlightColumns[i].columnName + '}';
      insertString += '</' + this.options.spotlightColumns[i].containerElement.toLowerCase() + '>\n';
    }
  }
  insertString += '</div>\n';
  insertString += '<div class="' + this.stackedContainerClass + '">\n';
  if (this.options && this.options.stackedColumns && this.options.stackedColumns.length)
  {
    for (var i = 0; i < this.options.stackedColumns.length; i++)
    {
      insertString += '<' + this.options.stackedColumns[i].containerElement.toLowerCase() + ' class="' + this.stackedColumnClass + '">\n';
      insertString += '{' + this.options.stackedColumns[i].columnName + '}';
      insertString += '</' + this.options.stackedColumns[i].containerElement.toLowerCase() + '>\n';
    }
  }
  insertString += '</div>';
  insertString += '<br style="clear:both; line-height: 0px" />\n';
  insertString += '</div>\n';
  insertString += '</div>\n';
  
  return insertString;
};

//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultsSpotlightColumn
//
// DESCRIPTION:
//   This function sets the default options for the spotlight column insert object type.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   (string) - null if the operation succeeded, or the error description
//--------------------------------------------------------------------
Spry.DesignTime.DataSet.InsertStructure.prototype._setDefaultsSpotlightColumn = function()
{
  var errStr = null;
  if (this.dsColumnNames && this.dsColumnNames.length > 1)
  {
    this.options = new Object();
    this.options.spotlightColumns = new Array();
    this.options.spotlightColumns.push({columnName: this.dsColumnNames[0], columnIdx: 0, containerElement: Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElement});
    this.options.stackedColumns = new Array();
    for (var i = 1; i < this.dsColumnNames.length; i++)
    {
      this.options.stackedColumns.push({columnName: this.dsColumnNames[i], columnIdx: i, containerElement: Spry.DesignTime.DataSet.InsertStructure.DefaultContainerElement});
    } 
  }
  else
  {
    errStr = dw.loadString("spry/dataset/insert spotlight column/alert/notEnoughColumns");
  }
  
  return errStr;
};
