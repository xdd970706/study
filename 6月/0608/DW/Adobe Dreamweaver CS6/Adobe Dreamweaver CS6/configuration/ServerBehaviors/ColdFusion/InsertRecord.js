// Copyright 2001-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.


// *************** GLOBALS VARS *****************

var HELP_DOC = MM.HELP_sbCFInsertRecord; 

var SB_NAME = dwscripts.getSBFileName();
var SB_FILE = dw.getConfigurationPath() + "/ServerBehaviors/ColdFusion/" + SB_NAME;

var _FormName = new TagMenu(SB_NAME, "form__tag", "form"); 
var _ConnectionName = new CFDataSourceMenu(SB_NAME, "ConnectionName");
var _UserName = new TextField(SB_NAME, "UserName");
var _Password = new TextField(SB_NAME, "Password");
var _TableName = new ConnectionTableMenu(SB_NAME, "TableName");

var _ColumnList = null;
var _SubmittedValueList = new FormFieldsMenu(SB_NAME, "SubmittedValueList", true,
                                             FormFieldsMenu.LABELS_MASK_FORMREF,
                                             [{prop: "type", value: "submit"}, 
                                              {prop: "name", value: "MM_InsertRecord"},
                                              {prop: "name", value: "MM_DeleteRecord"},
                                              {prop: "name", value: "MM_UpdateRecord"}]);
var _FieldColFormat = null;

var _RedirectURL = new TextField(SB_NAME, "RedirectURL");

var _includeQuery = null;

// Array constants to hold field format values and labels from the _FieldColFormat 
//   control.
var FieldColFormatValues = null;
var FieldColFormatLabels = null;

// Constants used to index into the above arrays.
INDEX_FORMAT_TEXT              = 0;
INDEX_FORMAT_NUMERIC           = 1;
INDEX_FORMAT_DATE              = 2;
INDEX_FORMAT_DATE_MSACCESS     = 3;
INDEX_FORMAT_CHECKBOX_YN       = 4;
INDEX_FORMAT_CHECKBOX_POS      = 5;
INDEX_FORMAT_CHECKBOX_NEG      = 6;
INDEX_FORMAT_CHECKBOX_MSACCESS = 7;

// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   initializeUI
//
// DESCRIPTION:
//   This function is called in the onLoad event.  It is responsible
//   for initializing the UI.  If we are inserting a recordset, this
//   is a matter of populating the connection drop down.
//
//   If we are modifying a recordset, this is a matter of inspecting
//   the recordset tag and setting all the form elements.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function initializeUI()
{
  // Get the UI elements
  _ConnectionName.initializeUI();
  _FormName.initializeUI(); 
  _UserName.initializeUI(); 
  _Password.initializeUI(); 
  _TableName.initializeUI();
  _ColumnList = new ListControl("ColumnList");
  _SubmittedValueList.initializeUI(_FormName);  
  _RedirectURL.initializeUI();
  _includeQuery = dwscripts.findDOMObject("includeQuery");
  
  // Load the labels and values from the html for _FieldColFormat. The store the
  //   loaded labels and values for later use.
  _FieldColFormat = new ListControl("FieldColFormat", null, true);

  // Remove Date MSAccess and Checkbox MSAccess
  FieldTypes.removeObsoleteSubmitAsOptions(_FieldColFormat);
  
  FieldColFormatValues = _FieldColFormat.getValue('all');
  FieldColFormatLabels = _FieldColFormat.get('all');
  
  // Retrieve the connection from last time if there's more
  // than one connection (if there's only one, it'll get selected
  // automatically).
  if (_ConnectionName.listControl.getLen() > 2)
  {
    var conn = dwscripts.retrieveExtensionData(SB_FILE,"lastConnection");
    if (conn)
      _ConnectionName.pickValue(conn);
  }

    // If a connection was picked automatically, act like the user
  // picked it and update the rest of the UI.
  if (_ConnectionName.listControl.getIndex() > 0)
    updateUI("ConnectionName", "onChange");
  else
    updateUI('ConnectionName');
  
  updateUI('FormName'); 
  
  setSubmitAsDisabledState();
}

//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   This function is called by the UI controls to handle UI updates
//
// ARGUMENTS:
//   control - string - the name of the control sending the event
//   event - string - the event which is being sent
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function updateUI(control, event)
{
  if (control == "FormName")
  {
    _SubmittedValueList.updateUI(_FormName, event); 
  }
  else if (control == "ConnectionName")
  {
    // check the connection, and get a username and password if needed
    _ConnectionName.ensureLogin("", "");

    if (event == "onChange")
    {
      // set the username and password for this data source
      _UserName.setValue(_ConnectionName.getUsername());
      _Password.setValue(_ConnectionName.getPassword());
    }
    
    // update the table
    _TableName.updateUI(_ConnectionName, event);
  }
  
  else if (control == "TableName")
  {
    // Update the ColumnList
    var columnInfo = dwscripts.getColumnValueList
      (_ConnectionName.getValue(), _TableName.getValue());
    var names = new Array();
    for (var i=0; i < columnInfo.length; i++)
    {
      // map the columns to matching form items
      setDefaultMapping(columnInfo[i], _SubmittedValueList.get('all'), 
                        _SubmittedValueList.getValue('all'));
      
      names.push(getDisplayString(columnInfo[i]));
    }
    _ColumnList.setAll(names, columnInfo);
    updateUI("ColumnList");
  }

  else if (control=="ColumnList")
  {
    var columnInfo = _ColumnList.getValue();

    if (columnInfo)
    {
      _SubmittedValueList.pick(columnInfo.getVariableName());
      _FieldColFormat.pickValue(columnInfo.getSubmitAs());
    }
          
    setSubmitAsDisabledState(); 
  }
  
  else if (control=="FieldColFormat")
  {
    var columnInfo = _ColumnList.getValue();
    
    columnInfo.setSubmitAs(_FieldColFormat.getValue());
    _ColumnList.set(getDisplayString(columnInfo));
    
    setSubmitAsDisabledState();
  }
  
  else if (control == "SubmittedValueList")
  {
    if (event == "onChange")
    {
      var columnInfo = _ColumnList.getValue();
      
      if (columnInfo)
      {      
        columnInfo.setVariableName(_SubmittedValueList.get());

        // Set the default SubmitAs value based on the new submitted value type.
        setDefaultSubmitAs(columnInfo, _SubmittedValueList.get('all'), 
                           _SubmittedValueList.getValue('all'));
        _FieldColFormat.pickValue(columnInfo.getSubmitAs());

        _ColumnList.set(getDisplayString(columnInfo));

        setSubmitAsDisabledState();
      }
    }
  }
  
  else if (control == "RedirectURL")
  {
    if (event == "onClick")
    {
      var theRedirectURL = dw.browseForFileURL("select", MM.LABEL_FileRedirect,0,0); 

      if (theRedirectURL.length > 0)
      {
        theRedirectURL = dwscripts.stripCFOutputTags(theRedirectURL);

        _RedirectURL.setValue(theRedirectURL);

        _includeQuery.checked = hasQueryString(theRedirectURL);
      }
    }
    else if (event == "onBlur")
    {
      _includeQuery.checked = hasQueryString(_RedirectURL.getValue());
    }
  }
  
  else if (control == "includeQuery")
  {
    var redirectURL = getRedirectURL(_RedirectURL.getValue(), _includeQuery.checked);
    
    _RedirectURL.setValue(redirectURL);
  }

  // default case - throw error message 
  else 
  {
    alert("The following control does not exist: " + control); 
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   findServerBehaviors
//
// DESCRIPTION:
//   Returns an array of ServerBehavior objects, each one representing
//   an instance of this Server Behavior on the page
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   JavaScript Array of ServerBehavior objects
//--------------------------------------------------------------------
function findServerBehaviors()
{
  var sbArray = new Array(); 

  sbArray = dwscripts.findSBs(MM.LABEL_TitleInsertRecord, SBInsertRecord);
  
  for (var i=0; i < sbArray.length; i++)
  {
    sbArray[i].postProcessFind();
  }

  return sbArray;
}


//--------------------------------------------------------------------
// FUNCTION:
//   canApplyServerBehavior
//
// DESCRIPTION:
//   Returns true if a Server Behavior can be applied to the current
//   document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   boolean - true if the behavior can be applied, false otherwise
//--------------------------------------------------------------------
function canApplyServerBehavior(sbObj)
{
  var success = true;
  var errMsgStr = ""; 
  
  if (findAllForms().length == 0) {  //if there are no forms
    errMsgStr += MM.MSG_NoForms;
    success = false; 
  }  

  if (success)
  {
    // If we can't retrieve any CF data sources, ask user to create one before
    //   using this behavior.
    var cfDSNList = MMDB.getColdFusionDsnList();
    if (cfDSNList == null || cfDSNList.length == 0)
    {
      errMsgStr = MM.MSG_SBCreateCFDataSource;
      success = false;
    }
  }

  if (errMsgStr) alert(errMsgStr); //popup error message
  
  return success;
}


//--------------------------------------------------------------------
// FUNCTION:
//   applyServerBehavior
//
// DESCRIPTION:
//   Collects values from the form elements in the dialog box and
//   adds the Server Behavior to the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   string - empty upon success, or an error message
//--------------------------------------------------------------------
function applyServerBehavior(sbObj)
{
  // Save the selected connection for next time if there's more
  // than one connection (if there's only one, it'll get selected
  // automatically; no need to save it).
  if (_ConnectionName.listControl.getLen() > 2)
  {
    dwscripts.saveExtensionData(SB_FILE,"lastConnection",_ConnectionName.getValue());
  }
  
  var newObj = null;
  var paramObj = "";
  
  if (sbObj)
  {
    newObj = sbObj.makeEditableCopy();
    paramObj = newObj.getParameters(false);
  }
  else
  {
    newObj = new SBInsertRecord();
    paramObj = newObj.getParameters(false);
  }
  
  var errStr = "";

  if (!errStr)
  {
    errStr = _ConnectionName.applyServerBehavior(sbObj, paramObj);
  } 

  if (!errStr)
  {
    errStr = _UserName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _Password.applyServerBehavior(sbObj, paramObj);
  }  

  if (!errStr)
  {
    errStr = _RedirectURL.applyServerBehavior(sbObj, paramObj);
    
    paramObj.ActionQueryString = (_includeQuery.checked) ? "?#CGI.QUERY_STRING#" : "";
  }

  if (!errStr)
  {
    errStr = _TableName.applyServerBehavior(sbObj, paramObj);
  }

  if (!errStr)
  {
    errStr = _FormName.applyServerBehavior(sbObj, paramObj);
    
    // If the form doesn't have a name, we must add one.
    var formName = dwscripts.getNameOrId(_FormName.getValue(),"name");
    if (!formName)
    {
      formName = dwscripts.getUniqueId("form");
    } 

    paramObj["FormName"] = formName; 
  }
  
  if (!errStr)
  {
	var columns = MMDB.getColumns(paramObj.ConnectionName, paramObj.TableName);
    paramObj["ColumnList"] = _ColumnList.getValue('all');
    
    // Before we apply, we need to mark all column value nodes as NOT a primary
    //   key.  This way, we'll generate SQL that provides alternative values (e.g.,
    //   null) for columns if the associated form field value is empty. If we leave
    //   any column value nodes as primary keys, we assume alternate values should
    //   not be used (which is important for Delete and Update where the primary key
    //   selects the record to update).
    // Note - if the apply fails due to an error, we end up losing the primary key
    //   information due to this operation. We could make a copy of the list from
    //   _ColumnList, but it doesn't seem like a big deal.
    for (var i = 0; paramObj["ColumnList"] && i < paramObj["ColumnList"].length; ++i)
    {
      paramObj["ColumnList"][i].setIsPrimaryKey(false);
      paramObj["ColumnList"][i].setColumnObjectFromArray(columns);
    }
    
    var oldParamsArray = new Array();
    if (sbObj && sbObj.getColumnList) {
      oldParamsArray = sbObj.getColumnList();
    }
    newObj.setSQLStatement(oldParamsArray);
  }
    
  if (!errStr)
  {
    if (!newObj.checkData())
    {
      errStr = newObj.getErrorMessage();
    }
  }
  
  if (!errStr)
  {
    if (sbObj == null)
    {
      // first time insert

      dwscripts.applySB(paramObj, null)
    }
    else
    {
      // edit the cfquery tag by hand
      
      newObj.queueDocEdits();      
      dwscripts.applyDocEdits();
    }
  }
  
  return errStr;
}


//--------------------------------------------------------------------
// FUNCTION:
//   inspectServerBehavior
//
// DESCRIPTION:
//   Sets the values of the form elements in the dialog box based
//   on the given ServerBehavior object
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function inspectServerBehavior(sbObj)
{
  // Note that the form name is updated automatically by our FormName control.
  //   We pick a value in the FormName control by sending it the form node. It updates
  //   the select list label with the form nodes actual name - not the previous name
  //   that we refer to in other parts of the code (the hidden and cfif). So, if
  //   the user changes the form name in the source, it still gets updated to the 
  //   correct value even though the FormName control is disabled on update.
  _FormName.inspectServerBehavior(sbObj);

  // Must update other ui elements based on form.
  updateUI("FormName", "onInspect");

  _ConnectionName.inspectServerBehavior(sbObj);
  _UserName.inspectServerBehavior(sbObj);
  _Password.inspectServerBehavior(sbObj);
  _TableName.inspectServerBehavior(sbObj);
  _RedirectURL.inspectServerBehavior(sbObj);
  
  _includeQuery.checked = hasQueryString(_RedirectURL.getValue());

  // Update the ColumnList
  var columns = MMDB.getColumns(sbObj.getParameter("ConnectionName"), sbObj.getParameter("TableName"));
  var columnInfo = sbObj.getColumnList();
  var names = new Array();
  var dbType;
  for (var i=0; i < columnInfo.length; i++)
  {
    dbType = FieldTypes.getFieldTypeFromArray(columns, columnInfo[i].columnName);
    if (columnInfo[i] && columnInfo[i].getSubmitAs && columnInfo[i].setSubmitAs) {
		if ((columnInfo[i].getSubmitAs() == "',none,NULL") && (dbType == "cf_sql_clob")) {
			columnInfo[i].setSubmitAs("',none,''");
		}

    	if (columnInfo[i].getSubmitAs() == "#,none,NULL") {
    		columnInfo[i].setSubmitAs("',none,NULL");
    	}
    	if (columnInfo[i].getSubmitAs() == "none,Yes,No") {
    		columnInfo[i].setSubmitAs("none,1,0");
    	}
    }
    names.push(getDisplayString(columnInfo[i]));
  }
  _ColumnList.setAll(names, columnInfo);
  
  updateUI("ColumnList", "onInspect");
}


//--------------------------------------------------------------------
// FUNCTION:
//   deleteServerBehavior
//
// DESCRIPTION:
//   Remove the specified Server Behavior from the user's document
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function deleteServerBehavior(sbObj)
{
  dwscripts.deleteSB(sbObj);
}


//--------------------------------------------------------------------
// FUNCTION:
//   analyzeServerBehavior
//
// DESCRIPTION:
//   Performs extra checks needed to determine if the Server Behavior
//   is complete
//
// ARGUMENTS:
//   sbObj - ServerBehavior object - one of the objects returned
//           from findServerBehaviors
//   allRecs - JavaScripts Array of ServerBehavior objects - all of the
//             ServerBehavior objects known to Dreamweaver
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------
function analyzeServerBehavior(sbObj, allRecs)
{
  sbObj.analyze(allRecs);
}


//--------------------------------------------------------------------
// FUNCTION:
//   displayHelp
//
// DESCRIPTION:
//   Displays the built-in Dreamweaver help.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function displayHelp()
{
  // Replace the following call if you are modifying this file for your own use.
  dwscripts.displayDWHelp(HELP_DOC);
}




// ***************** LOCAL FUNCTIONS  ******************

//--------------------------------------------------------------------
// FUNCTION:
//   findAllForms
//
// DESCRIPTION:
//   This function returns an array of all form nodes in the current DOM 
//
// ARGUMENTS:
//   none

//
// RETURNS:
//   array of <form> nodes
//--------------------------------------------------------------------

function findAllForms() 
{
  var retList = new Array();
  var dom = dw.getDocumentDOM();
  var forms = dom.getElementsByTagName("FORM");

  for (var i=0; i < forms.length; i++) 
  {
    var formName = dwscripts.getNameOrId(forms[i],"name");
    if (!formName)
      formName = MM.LABEL_Unnamed; 
    retList.push(formName);
  }
  return retList;
}


function setSubmitAsDisabledState()
{
  if ( _SubmittedValueList.get() == "")
  {
    _FieldColFormat.disable(); 
  }
  else 
  {
    _FieldColFormat.enable();   
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getDisplayString
//
// DESCRIPTION:
//   Retrieve the string to display in the column list for the given
//   columnValueNode.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//
// RETURNS:
//   string - display string.
//--------------------------------------------------------------------

function getDisplayString(columnValueNode)
{
  var retVal = "";
  var value = columnValueNode.getVariableName();
  var columnName = columnValueNode.getColumnName();
  var isPrimaryKey = columnValueNode.getIsPrimaryKey();
  
  if (value)
  {
    var submitName = "";
    
    var index = dwscripts.findInArray(FieldColFormatValues, columnValueNode.getSubmitAs());
    if (index >= 0)
    {
      submitName = FieldColFormatLabels[index];
    }
    else
    {
      submitName = FieldColFormatLabels[INDEX_FORMAT_TEXT];
    }
    
    retVal = dwscripts.sprintf(MM.LABEL_IsMappedMask, columnName, value, submitName);
  }
  else
  {
    var labelMask = MM.LABEL_IsNotMappedMask;
    if (isPrimaryKey)
    {
      labelMask = MM.LABEL_IsNotMappedKeyMask;
    }
    
    retVal = dwscripts.sprintf(labelMask, columnName);
  }
  
  return retVal;    
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultMapping
//
// DESCRIPTION:
//   This function maps columns to values and submit as types.  This
//   function should be called whenever the list of columns changes,
//   or the list of values changes.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultMapping(columnValueNode, valueList, nodeList)
{
  setDefaultValue(columnValueNode, valueList, nodeList);
  setDefaultSubmitAs(columnValueNode, valueList, nodeList);
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultValue
//
// DESCRIPTION:
//   This function sets a default value based on the column name, and
//   the list of values.
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultValue(columnValueNode, valueList, nodeList)
{
  var foundDefaultValue = false;
  var columnName = columnValueNode.getColumnName();
  for (var i = 0; !foundDefaultValue && i < nodeList.length; ++i)
  {
    var name = (nodeList[i] ? nodeList[i].getAttribute('NAME') : "");
    if (columnName.toUpperCase() == name.toUpperCase())
    {
      columnValueNode.setVariableName(valueList[i]);
      foundDefaultValue = true;
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   setDefaultSubmitAs
//
// DESCRIPTION:
//   This function sets a default submit as type, based on the column
//   type and the form control type. 
//
// ARGUMENTS:
//   columnValueNode - ColumnValueNode.
//   valueList - array of form element name references. The set of form element
//     references whose associated form elements are available to provide the 
//     value for the column. Parallel to nodeList.
//   nodeList - array of form element nodes. The set of form elements 
//     available to provide the value for the column. Parallel to valueList.
//
// RETURNS:
//   columnValueNode
//--------------------------------------------------------------------

function setDefaultSubmitAs(columnValueNode, valueList, nodeList)
{
  // only set submit as if we have a column and a value
  var value = columnValueNode.getVariableName();
  var columnType = columnValueNode.getColumnType();
  if (columnType && value)
  {
    var index = dwscripts.findInArray(valueList, value);
    var node = nodeList[index];
    var isCheckbox = (node && node.getAttribute('TYPE')
                      && node.getAttribute('TYPE').toUpperCase() == 'CHECKBOX');
    var submitAs = "";
    
    // map the column type and form element type to the correct submit as value
    if (dwscripts.isStringDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_YN];
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_TEXT];
      }
    }
    else if (dwscripts.isNumericDBColumnType(columnType))
    {
      if (isCheckbox)
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_POS];  
      }
      else
      {
        submitAs = FieldColFormatValues[INDEX_FORMAT_NUMERIC]; 
      }
    }
    else if (dwscripts.isDateDBColumnType(columnType))
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_DATE]; 
    }
    else if (dwscripts.isBinaryDBColumnType(columnType) || isCheckbox)
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_CHECKBOX_YN]; 
    }
    else
    {
      submitAs = FieldColFormatValues[INDEX_FORMAT_TEXT];       
    }
    
    columnValueNode.setSubmitAs(submitAs);
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   getRedirectURL
//
// DESCRIPTION:
//   Returns the given URL with a query string added or removed, based
//   on the includeQuery boolean
//
// ARGUMENTS:
//   origURL - string - the URL to update
//   includeQuery - boolean - true to add the query string, false to
//     remove it.
//
// RETURNS:
//   string
//--------------------------------------------------------------------

function getRedirectURL(origURL, includeQuery)
{
  var retVal = origURL;
  
  if (includeQuery)
  {
    if (!origURL)
    {
      retVal = "#CurrentPage#?#CGI.QUERY_STRING#";
    }
    else
    {
      if (origURL.indexOf("?") == -1)
      {
        retVal += "?#CGI.QUERY_STRING#";
      }
      else
      {
        retVal += "&#CGI.QUERY_STRING#";
      }
    }
  }
  else
  {
    var regExp = /[?&]#CGI\.QUERY_STRING#/i;
    var match = origURL.match(regExp);
    if (match && match.length > 0)
    {
      var endOffset = match.index + match[0].length;
      if (endOffset == origURL.length)
      {
        retVal = origURL.substring(0,match.index);
      }
      else
      {
        retVal = origURL.substring(0,match.index+1) + origURL.substring(match.index + match[0].length + 1);
      }
    }
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   hasQueryString
//
// DESCRIPTION:
//   Returns true if the given URL has the query string added
//
// ARGUMENTS:
//   redirectURL - string - the URL to check
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function hasQueryString(redirectURL)
{
  var retVal = false;
  
  var regExp = /[?&]#CGI\.QUERY_STRING#/i;
  
  retVal = (redirectURL.search(regExp) != -1);

  return retVal;
}


//--------------------------------------------------------------------
// CLASS:
//   SBInsertRecord
//
// DESCRIPTION:
//   This class is derived from the ServerBehaviorClass, and
//   represents a Insert Record Server Behvaior
//   
//   It handles CFQUERY tags with SQL statements of the form:
//
//     INSERT INTO Category (Foo, Bar, Ball) VALUES
//     ('#Form.Foo#', 
//      <CFIF Evaluate("Form.Bar") NEQ "">#Form.Bar#<CFELSE>NULL</CFIF>,
//      <CFIF IsDefined("Form.Bar")>'Y'<CFELSE>'N'</CFIF>
//     )
//
// PUBLIC PROPERTIES:
//   <property> - <type and description>
//
// PUBLIC FUNCTIONS:
//   <function name> - <description>
//--------------------------------------------------------------------

//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord
//
// DESCRIPTION:
//   Constructor
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   nothing
//--------------------------------------------------------------------

function SBInsertRecord(name, title, selectedNode)
{  
  // Use the init function for construction.
  this.initServerBehavior(name, title, selectedNode);
}

// Inherit from the ServerBehavior class.
SBInsertRecord.prototype.__proto__ = ServerBehavior.prototype;

//public methods
SBInsertRecord.prototype.postProcessFind = SBInsertRecord_postProcessFind;
SBInsertRecord.prototype.analyze = SBInsertRecord_analyze;
SBInsertRecord.prototype.queueDocEdits = SBInsertRecord_queueDocEdits;
SBInsertRecord.prototype.checkData = SBInsertRecord_checkData;
SBInsertRecord.prototype.getColumnList = SBInsertRecord_getColumnList;

SBInsertRecord.prototype.setSQLStatement = SBInsertRecord_setSQLStatement;

SBInsertRecord.prototype.getFormElementNames = SBInsertRecord_getFormElementNames;
SBInsertRecord.prototype.getColumnNameForFormElement = SBInsertRecord_getColumnNameForFormElement;


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.setSQLStatement
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_setSQLStatement(oldParamsArray)
{
  var sqlObj = new SQLStatement("");
  
  sqlObj.createInsertStatement(this.getParameter("TableName"), this.getParameter("ColumnList"), oldParamsArray);
    
  var sqlString = sqlObj.getStatement();
  
  // TODO: for debug, remove from final
  //alert(sqlString);
  
  this.setParameter("SQLStatement", sqlString);
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.postProcessFind
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_postProcessFind()
{
  var part = this.getNamedSBPart("InsertRecord_main");
  if (part)
  {
    var mainTag = new TagEdit(dwscripts.getOuterHTML(part.getNode()));
    
    var queryTag = null;
    var locationTag = null;
    
    // find the child nodes for cfquery and cflocation    
    var subTags = mainTag.getChildNodes();    
    for (var i=0; i < subTags.length; i++)
    {
      if (subTags[i].getTagName() == "CFQUERY")
      {
        queryTag = subTags[i];
      }
      else if (subTags[i].getTagName() == "CFLOCATION")
      {
        locationTag = subTags[i];
      }
    }
    
    // extract the cfquery tag parameters
    if (queryTag)
    {    
      this.setParameter("ConnectionName", queryTag.getAttribute("datasource"));
      this.setParameter("UserName", queryTag.getAttribute("username"));
      this.setParameter("Password", queryTag.getAttribute("password"));

      this.setParameter("SQLStatement", queryTag.getInnerHTML());
    }
    else
    {
      // ERROR: query tag not found
      this.deleted = true;
      return;
    }
    
    // extract the cflocation tag parameters
    if (locationTag)
    {
      this.setParameter("RedirectURL", locationTag.getAttribute("url"));
    }
    else
    {
      this.setParameter("RedirectURL", "");
    }
    
    //extract the SQL statement
    var sqlObj = new SQLStatement(this.getParameter("SQLStatement"));
  
    if (sqlObj.getType() == SQLStatement.STMT_TYPE_INSERT)
    {
      // set the table name
      var tables = sqlObj.getTableNames();
      this.setParameter("TableName", tables[0]);
      
      // Note: Hold off on setting the "ColumnList" parameter. That requires
      //   querying the database for the tables columns. Just call the
      //   SBInsertRecord_getColumnList function when it is needed (e.g., in
      //   inspectServerBehavior).
    }
    
    this.setTitle(MM.LABEL_TitleInsertRecord + " (" +
       this.getParameter("FormName") + ", " + 
       this.getParameter("ConnectionName") + ", " +
       this.getParameter("TableName") + ")");
    
  }
  else
  {
    // ERROR: main participant not found
    this.deleted = true;
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.analyze
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_analyze(allRecs)
{
  // Mark this sb as incomplete, if the user renamed the form and not the references
  //   to it.
  var formNameReference = this.getParameter("FormName");
  
  var formNode = this.getParameter("form__tag");
  var actualFormName = dwscripts.getNameOrId(formNode,"name");
  if (!actualFormName) actualFormName = "";
  
  if (actualFormName.toUpperCase() != formNameReference.toUpperCase())
  {
    this.setIsIncomplete(true);
  }

  // Check that the form nodes referenced in the sql are present in the bound form.
  var formElmNames = this.getFormElementNames();
  for (var i = 0; !this.getIsIncomplete() && i < formElmNames.length; ++i)
  {
    // Note: strip off "Form." reference if present.
    var elName = formElmNames[i].replace(/form\./i, "");
    var elRef = formNode + "." + elName;
    if (formElmNames[i] && !elRef)
    {
      this.setIsIncomplete(true);
    }
  }
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.queueDocEdits
//
// DESCRIPTION:
//   <description>
//
// ARGUMENTS:
//   <arg1> - <type and description>
//
// RETURNS:
//   <type and description>
//--------------------------------------------------------------------

function SBInsertRecord_queueDocEdits()
{
  var part = this.getNamedSBPart("InsertRecord_main");
  
  if (part)
  {
    var mainTag = new TagEdit(dwscripts.getOuterHTML(part.getNode()));
    
    var queryTag = null;
    var locationTag = null;
    
    // find the child nodes for cfquery and cflocation    
    var subTags = mainTag.getChildNodes();    
    for (var i=0; i < subTags.length; i++)
    {
      if (subTags[i].getTagName() == "CFQUERY")
      {
        queryTag = subTags[i];
      }
      else if (subTags[i].getTagName() == "CFLOCATION")
      {
        locationTag = subTags[i];
      }
    }
        
    var connectionName = this.getParameter("ConnectionName");
    if (connectionName != queryTag.getAttribute("datasource"))
    {
      queryTag.setAttribute("datasource", connectionName);
    }

    // The password and username attributes are optional. Remove them if their
    //   values are empty.
    var newPassword = this.getParameter("Password");
    var oldPassword = queryTag.getAttribute("password");
    if (newPassword != oldPassword)
    {
      if (newPassword == "" )
      {
        queryTag.removeAttribute("password");
      }
      else
      {
        queryTag.setAttribute("password", newPassword);
      }
    }

    var newUsername = this.getParameter("UserName");
    var oldUsername = queryTag.getAttribute("username");
    if (newUsername != oldUsername)
    {
      if (newUsername == "")
      {
        queryTag.removeAttribute("username");
        
        // It doesn't make sense to have the password attribute without the
        //   username. So, remove it.
        queryTag.removeAttribute("password");
      }
      else
      {
        queryTag.setAttribute("username", newUsername);
      }
    }
    
    queryTag.setInnerHTML(this.getParameter("SQLStatement"));
    
    // now update the cflocation tag
    var redirectUrl = this.getParameter("RedirectURL");
    if (redirectUrl)
    {
      if (locationTag)
      {
        // set the new value
        locationTag.setAttribute("url", redirectUrl);
      }
      else
      {
        // add a cflocation node
        var childNodes = mainTag.getChildNodes();
        childNodes.push(new TagEdit("<cflocation url=\""+redirectUrl+"\">"));
        mainTag.setChildNodes(childNodes);
      }
    }
    else  if (locationTag)
    {
      var childNodes = mainTag.getChildNodes();
      var index = dwscripts.findInArray(childNodes, locationTag);
      if (index >= 0)
      {
        childNodes.splice(index, 1); // remove the node
        mainTag.setChildNodes(childNodes);
      }
      
    }
    
    var newOuterHTML = mainTag.getOuterHTML();
    
    // If the form name was changed in the source, we need to update the hidden element
    //   and the cfif tag.
    if (this.bInEditMode)
    {  
      // Note that the new form name is updated automatically by our FormName control.
      //   We pick a value in the FormName control by sending it the form node. It updates
      //   the select list label with the form nodes actual name - not the previous name
      //   that we refer to in other parts of the code (the hidden and cfif). So, if
      //   the user changes the form name in the source, it still gets updated to the 
      //   correct value even though the FormName control is disabled on update.
      // Also note that the old form name is not extracted from the actual form node, but
      //   from our references to it in the code (the hidden and cfif). So, it will be
      //   different from the new name if the form name was changed manually in the source.
      var oldFormName = this.parameters["FormName"];
      var newFormName = this.applyParameters["FormName"];
      if (oldFormName.toUpperCase() != newFormName.toUpperCase())
      {
        // Just queue a doc edit to replace the hidden participant.
        extPart.queueDocEdits(this.getName(), "InsertRecord_hidden", 
                              this.getParameters(), this);

        // The cfif tag must be updated in the newOuterHTML returned from the tagEdit.
        newOuterHTML = newOuterHTML.replace(/FORM\.InsertRecord EQ "\w+"/, 
                                            "FORM.InsertRecord EQ \"" + newFormName + "\"");
      }
    }
  
    dwscripts.queueDocEdit(newOuterHTML, "replaceNode", part.getNode());

    // If the form name was deleted, add it back to the form tag.
    var formNode = this.getParameter("form__tag");
    if (formNode && !dwscripts.getNameOrId(formNode,"name"))
    {
      dwscripts.queueDocEdit(newFormName, "nodeAttribute+name", formNode);
    }
    
    // queue any doc edits for the action of the form
    extPart.queueDocEdits("InsertRecord", "EditOps_formAction",   this.getParameters(), this);
  }
  else
  {
    alert("INTERNAL ERROR: InsertRecord_main not found");
  }  
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.checkData
//
// DESCRIPTION:
//   Checks that the data supplied for the repeat region is complete
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   boolean
//--------------------------------------------------------------------

function SBInsertRecord_checkData()
{
  var isValid = true;
  
  // Clear out the error message.
  this.setErrorMessage("");

  // Declare function for dwscripts.findInArray that is called later.
  var compareElementNameToName = function(object, searchValue)
  {
    var objectName = (object.getAttribute("name")) ? String(object.getAttribute("name")).toUpperCase() : "";
    var searchName = String(searchValue).toUpperCase();
    return objectName == searchName;
  };
                                  
  // Get all form elements for the chosen form so we can check that mapped columns
  //   are mapped to an existing form element. We only do this check if this is a
  //   reedit and we already have the form node pointer.
  var formNode = this.getParameter("form__tag");
  var formElements = (formNode) ? formNode.elements : null;
  
  var columns = this.getParameter("ColumnList");
  var found = false;
  for (var i = 0; columns && i < columns.length; i++)
  {
    // Check that user has bound some columns to values. Also, make sure the columns are
    //   bound to existing form elements.
    if (columns[i].getVariableName())
    {
      found = true;
      var columnValue = columns[i].getVariableName();
      // Remove the 'FORM.' prefix.
      columnValue = columnValue.substr(5);
      if (   formElements
          && dwscripts.findInArray(formElements, columnValue, 
                                   compareElementNameToName) == -1
         )
      {
        isValid = false;
        this.appendErrorMessage(dwscripts.sprintf(MM.MSG_MapColumnToExistingElement, 
                                                  columns[i].getColumnName())
                               );
      }
    }
  }
  
  if (!found)
  {
    this.appendErrorMessage(MM.MSG_NoMappedColumns);
    isValid = false;
  }

  return isValid;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getColumnList
//
// DESCRIPTION:
//   Gets the column list parameter. Users should always call this function when
//   attempting to get the ColumnList parameter.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of ColumnVariableNodes - the parameter value for ColumnList.
//--------------------------------------------------------------------

function SBInsertRecord_getColumnList()
{
  //extract the SQL statement
  var sqlObj = new SQLStatement(this.getParameter("SQLStatement"));

  var columnList = dwscripts.getColumnValueList
     (dwscripts.getCFDataSourceName(this.getParameter("ConnectionName")), this.getParameter("TableName"));
  sqlObj.extractColumnInfo(columnList);
  this.setParameter("ColumnList", columnList);
  
  return columnList;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getFormElementNames
//
// DESCRIPTION:
//   Returns an array of the form element names that are bound to
//   columns in this insert SB.
//
// ARGUMENTS:
//   none
//
// RETURNS:
//   array of string - the names of the bound form elements
//--------------------------------------------------------------------

function SBInsertRecord_getFormElementNames()
{
  var retVal = new Array();
  
  var columnList = this.getParameter("ColumnList");
  if (!columnList || columnList.length == 0)
  {
    columnList = this.getColumnList();
  }
  
  for (var i=0; i < columnList.length; i++)
  {
    var varName = columnList[i].getVariableName();
    
    // If the varName is empty, it means the column is not
    // assigned to a form variable. Only assigned variables
    // should be listed, so don't add the empty string.
    if(varName != "")
		retVal.push(varName);
  }
  
  return retVal;
}


//--------------------------------------------------------------------
// FUNCTION:
//   SBInsertRecord.getColumnNameForFormElement
//
// DESCRIPTION:
//   Returns the column name which is associated with the given
//   form element name.  If the same form element is used for
//   multiple columns, then only the first one will be returned.
//
// ARGUMENTS:
//   formElementName - string - one of the form element names returned
//     from getFormElementNames above
//
// RETURNS:
//   array of string - the names of the bound form elements
//--------------------------------------------------------------------

function SBInsertRecord_getColumnNameForFormElement(formElementName)
{
  var retVal = "";
  
  var columnList = this.getParameter("ColumnList");
  if (!columnList || columnList.length == 0)
  {
    columnList = this.getColumnList();
  }
  
  for (var i=0; i < columnList.length; i++)
  {
    if (columnList[i].getVariableName() == formElementName)
    {
      retVal = columnList[i].getColumnName();
      break;
    }
  }
  
  return retVal;
}
