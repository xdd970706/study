// Copyright 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
/* loc_strings.js
*
* strings.js and loc_strings.js contain arrays for populating select lists 
* in tag dialogs. Both files use the naming convention arrayNameCap for the
* option labels (i.e., text that will be shown to the user) and arrayNameVal
* for the option values(i.e., the code that will be inserted into the document).
* 
* for obvious reasons, loc_strings.js mainly contains the Cap arrays, and
* strings.js mainly contains the Val arrays. only loc_strings.js should be
* localized.  
*
* note: where the labels should not be localized, select lists are intialized
* using the Val array for both the labels and the values.
* 
*/

//--------------- LOCALIZEABLE GLOBALS---------------

var thePluginTypesCap= new Array(dw.loadString('TagLibraries/JSP/loc_strings/thePluginTypesCap'),dw.loadString('TagLibraries/JSP/loc_strings/thePluginTypesCap_1'));
var theAlignmentsCap= new Array(dw.loadString('TagLibraries/JSP/loc_strings/theAlignmentsCap'),dw.loadString('TagLibraries/JSP/loc_strings/theAlignmentsCap_1'),dw.loadString('TagLibraries/JSP/loc_strings/theAlignmentsCap_2'),dw.loadString('TagLibraries/JSP/loc_strings/theAlignmentsCap_3'),dw.loadString('TagLibraries/JSP/loc_strings/theAlignmentsCap_4'));
var theBeanTypesCap= new Array(dw.loadString('TagLibraries/JSP/loc_strings/theBeanTypesCap'),dw.loadString('TagLibraries/JSP/loc_strings/theBeanTypesCap_1'),dw.loadString('TagLibraries/JSP/loc_strings/theBeanTypesCap_2'),dw.loadString('TagLibraries/JSP/loc_strings/theBeanTypesCap_3'));

//--------------- END LOCALIZEABLE   ---------------
