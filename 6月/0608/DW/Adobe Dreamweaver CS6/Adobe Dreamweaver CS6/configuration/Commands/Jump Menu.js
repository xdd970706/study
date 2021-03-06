
// Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

//////

//*************************GLOBAL VARS********************

var helpDoc = MM.HELP_objJumpMenu;

//form objects
var GlistOptions;
var GtfLabel;
var GtfURL;
var GtfMenuId;
var GselTarget; 
var GcbRestore
var GcbGo;


var GarrMenuOptions;  //global array storing menu option text and URLs
                     

//function: initGlobals
//description: initialize global variables

function initGlobals(){

   var theForm = document.forms[0];
   GlistOptions = theForm.MenuOptions;
   GtfURL = theForm.fileURL;
   GtfLabel = theForm.Label;
   GtfMenuId = theForm.menuId;
   GselTarget = theForm.Target;
   GcbRestore = theForm.Restore;
   GcbGo = theForm.Go; 
   
   GarrMenuOptions = new Array();
   GarrMenuOptions[0] = new Array();
   GarrMenuOptions[0][0] = getUniqueLabel();
   GarrMenuOptions[0][1] = "";
}

//***************************API FUNCTIONS*****************************

function isDOMRequired() { 
	// Return false, indicating that this object is available in code view.
	return false;
}

function commandButtons(){
   return new Array(MM.BTN_OK,        "okClicked()",
                    MM.BTN_Cancel,    "cancelClicked()",          
                    MM.BTN_Help,      "displayHelp()"  );

}

//***************************LOCAL FUNCTIONS*****************************

//function: okClicked
//description: creates the jump menu that is inserted into the document

function okClicked(){ 
   
   var target = escQuotes(GselTarget.options[GselTarget.selectedIndex].value);
   var bRestore = (GcbRestore.checked)?1:0;
   var bInsideForm = IPIsInsideOfForm();
   var nOptions = GarrMenuOptions.length,i,attrPos;
   var optionStr="",formObjArr,uniqueFormId;
   var menuStr = "";
   
   //create inner options string, i.e.:<option value="foo">label</option> 
   for (i=0;i<nOptions;i++){
      if (GarrMenuOptions[i][0] || GarrMenuOptions[i][1]){
         optionStr = (GarrMenuOptions[i][1])?'<option value="' + GarrMenuOptions[i][1] + '">':
	                                         '<option>';                   
	     optionStr += GarrMenuOptions[i][0] + '</option>\n';
	     menuStr += optionStr;
	  }
   }
   menuStr += '</select>';
   var menuId = GtfMenuId.value;   
   //if the "Insert a Go Button" is checked, then add a Go button
   if (GcbGo.checked){
     // Add the opening select tag, but do not add an onChange event. The
     // Go button will handle the menu action.
     menuStr = '<SELECT name="' + menuId + '" id="' + menuId + '">\n' + menuStr + createGoBtnStr(target,bRestore);
   }
   else
   {
     // No Go button, so add the onChange event to the opening select
     // tag. This event will handle the menu action.
     menuStr = '<SELECT name="' + menuId + '" id="' + menuId + '" ' +
              'onChange="MM_jumpMenu(\'' + target + '\',this,' + bRestore + ')">\n' + menuStr;
   }
   
   //add a form to the document if one is not there already	 
   if ( !bInsideForm  ){ //if there isn't a form, add one
      uniqueFormId = dwscripts.getUniqueId("form");
	  menuStr = '<form name="' + uniqueFormId + '" id="' + uniqueFormId + '">' + menuStr + '\n</form>'; 	
   }  
   MM.commandReturnValue = menuStr;
   window.close();
}    



function cancelClicked() {
  MM.commandReturnValue = "";
  window.close();
}


//function: createGoBtnStr
//description: creates the text string for the go button

function createGoBtnStr(target,bRestore){

   var btnStr="";
   
   //get the select menu name
   var objId = GtfMenuId.value;
   
   //create unique button id
   var btnId = dwscripts.getUniqueId("go_button");

   //piece together button string 
   btnStr += '<INPUT type="button" name="' + btnId + '" id= "'+ btnId + '" value="' + BTN_Go + '" ' +
              'onClick="MM_jumpMenuGo(\'' + objId + '\',\'' + target + '\',' + bRestore + ')">';
			 	 
   return ( btnStr );

}

//function: initializeUI
//description: initializes the UI, attached to body onload
function initializeUI(){
   initGlobals();
   
   //initial state of dialog is that "Option Label" appears in Lable field,
   //"Option URL" appears in URL field, and the lable field selected
   populateMenuOptions(0);
   GlistOptions.selectedIndex = 0; 
   GtfLabel.value = GarrMenuOptions[0][0];
   GtfURL.value = GarrMenuOptions[0][1];
   GtfLabel.focus();
   GtfLabel.select();
   
   //populate frame target menu
   populateFrameTargetMenu(GselTarget);
   
   //create a unique name for this menu
   GtfMenuId.value = dwscripts.getUniqueId("jumpMenu");
}

//function: popuplateFrameTargetMenu
//description: populates the frame target menu with either:
//"Main Window" - if there are no frames
//"Main Window" plus named frames, if there are frames

function populateFrameTargetMenu(selectObj){
   var counter = 0;
   var frameList;
   
   selectObj.options[counter] = new Option(MM.TYPE_MainWindow);
   selectObj.options[counter++].value = 'parent';
   
   frameList=getObjectRefs("NS 4.0","parent","frame"); //get list of frames
   if (frameList && frameList.length>0) { //if frames
   //if the frame has a name, add name to target picklist
      for (i=0; i<frameList.length; i++) {
         if (frameList[i].indexOf('unnamed')==-1){ //if the frame has a name
            frameName=extrapolateFrameName(frameList[i]);
            selectObj.options[counter] = new Option(MM.TYPE_Frame + ' "' + frameName + '"');
		    selectObj.options[counter++].value = frameList[i];
		 }
      }
	}
   
    //select the "Main Window" item
	selectObj.selectedIndex = 0;
}

//function: extrapolateFrameName
//description: given a frame reference, extrapolates the frame's name

function extrapolateFrameName(frameRef){
   return frameRef.substring(frameRef.indexOf("['")+2,frameRef.indexOf("']"));
}
