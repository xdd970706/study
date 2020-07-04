// Copyright 2001, 2002, 2003, 2004 Macromedia, Inc. All rights reserved.
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

var theAlignmentsLRCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsLRCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsLRCap_1'));
var theAlignmentsImgCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_4'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_5'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_6'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_7'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_8'),dw.loadString('TagLibraries/ASPNet/loc_strings/theAlignmentsImgCap_9'));
var theStandardAlignsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardAlignsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardAlignsCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardAlignsCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardAlignsCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardAlignsCap_4'));
var theStandardFourAlignsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardFourAlignsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardFourAlignsCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardFourAlignsCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardFourAlignsCap_3'));
var theStandardValignsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardValignsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardValignsCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardValignsCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardValignsCap_3'));
var theStandardGridlinesCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardGridlinesCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardGridlinesCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardGridlinesCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStandardGridlinesCap_3'));

var theDirectionsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theDirectionsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theDirectionsCap_1'));

var theDisplaysCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplaysCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplaysCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplaysCap_2'));
var theDisplayModesVSCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplayModesVSCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplayModesVSCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theDisplayModesVSCap_2'));

var theLayoutsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theLayoutsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theLayoutsCap_1'));

var theOperatorsCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_4'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_5'),dw.loadString('TagLibraries/ASPNet/loc_strings/theOperatorsCap_6'));

var theRepeatDirRBLCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatDirRBLCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatDirRBLCap_1'));
var theRepeatLayRBLCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatLayRBLCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatLayRBLCap_1'));

var theSelectionsLBCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theSelectionsLBCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theSelectionsLBCap_1'));
var theStylesCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_4'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_5'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_6'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_7'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_8'),dw.loadString('TagLibraries/ASPNet/loc_strings/theStylesCap_9'));

var theTextModesCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theTextModesCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTextModesCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTextModesCap_2'));
var theTypesCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theTypesCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTypesCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTypesCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTypesCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTypesCap_4'));

var theTargetVal= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theTargetVal'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTargetVal_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTargetVal_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theTargetVal_3'));
var theRepeatDirectionListCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatDirectionListCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatDirectionListCap_1'));
var theRepeatLayoutListCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatLayoutListCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theRepeatLayoutListCap_1'));

var theCalendarDayNameFormatCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarDayNameFormatCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarDayNameFormatCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarDayNameFormatCap_2'));
var theCalendarNextPrevFormatCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarNextPrevFormatCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarNextPrevFormatCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarNextPrevFormatCap_2'));
var theCalendarSelectionModeCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarSelectionModeCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarSelectionModeCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarSelectionModeCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarSelectionModeCap_3'));
var theCalendarTitleFormatCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarTitleFormatCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarTitleFormatCap_1'));
var theCalendarFirstDayOfWeekCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_4'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_5'),dw.loadString('TagLibraries/ASPNet/loc_strings/theCalendarFirstDayOfWeekCap_6'));

// custom MM tags
var theParameterTypeCap= new Array(dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_1'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_2'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_3'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_4'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_5'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_6'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_7'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_8'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_9'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_10'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_11'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_12'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_13'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_14'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_15'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_16'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_17'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_18'),dw.loadString('TagLibraries/ASPNet/loc_strings/theParameterTypeCap_19'));

//--------------- END LOCALIZEABLE   ---------------
