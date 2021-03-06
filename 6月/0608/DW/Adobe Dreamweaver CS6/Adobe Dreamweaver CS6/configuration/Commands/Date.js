
//
// Copyright 2000, 2001, 2002, 2003, 2004, 2005 Macromedia, Inc. All rights reserved. 
//
// ----------------------------------------------------
//
// Date.js
//
//This object inserts the current date and optionally time
//and day at the current insertion point. An Update Automatically
//On Save Option will update the date when the document is saved.
//
//
//Localization Note:
//Read the comments in the initGlobals function for instructions
//on controlling the order of the date formats in the Date Format list,
//as well as specifying that certain date formats should not appear
//in a localized language.
 


//*********************GLOBAL VARIABLES***********************

//see initGlobals for info on global vars

var helpDoc = MM.HELP_objDate;

//global arrays
var GarrDateFormats; 
var GarrDayFormats;
var GarrTimeFormats;

//form element objects
var GlistDateFormats;
var GselDayFormats;
var GselTimeFormats;
var GcbUpdate;

//global strings needed for accessor functions
var GstrFullDate;
var GstrHTMLFullDate;
var GstrDateID;

function initGlobals(){

	//The GarrDateFormats array controls the order the date formats are shown in the UI
	//The list of formats is in Date.htm
    GarrDateFormats = LIST_DateFormats;

	//The GarrDateFormats array controls the order the day formats are shown in the UI
	//The list of formats is in Date.htm
	GarrDayFormats  =  LIST_DayFormats;

	//The GarrTimeFormats array controls the order of the time formats.
	//The list of formats is in Date.htm
	GarrTimeFormats =  LIST_TimeFormats;


 
   //-----------------------------------------------------------------------------
   
   //initialize global form elements
   theForm = document.forms[0]; 
   GlistDateFormats = theForm.DateFormats;
   GselDayFormats   = theForm.DayFormats;
   GselTimeFormats  = theForm.TimeFormats;
   GcbUpdate        = theForm.Update;
}

function charToEntity(thechar,charCode)
{
	switch(thechar) {
		case '\x80' : 		return "&euro;";
		case '\xA1' : 		return "&iexcl;";
		case '\xA2' : 		return "&cent;";
		case '\xA3' : 		return "&pound;";
		case '\xA4' : 		return "&curren;";
		case '\xA5' : 		return "&yen;";
		case '\xA6' : 		return "&brvbar;";
		case '\xA7' : 		return "&sect;";
		case '\xA8' : 		return "&uml;";
		case '\xA9' : 		return "&copy;";
		case '\xAA' : 		return "&ordf;";
		case '\xAB' : 		return "&laquo;";
		case '\xAC' : 		return "&not;";
		case '\xAD' : 		return "&shy;";
		case '\xAE' : 		return "&reg;";
		case '\xAF' : 		return "&macr;";
		case '\xB0' : 		return "&deg;";
		case '\xB1' : 		return "&plusmn;";
		case '\xB2' : 		return "&sup2;";
		case '\xB3' : 		return "&sup3;";
		case '\xB4' : 		return "&acute;";
		case '\xB5' : 		return "&micro;";
		case '\xB6' : 		return "&para;";
		case '\xB7' : 		return "&middot;";
		case '\xB8' : 		return "&cedil;";
		case '\xB9' : 		return "&sup1;";
		case '\xBA' : 		return "&ordm;";
		case '\xBB' : 		return "&raquo;";
		case '\xBC' : 		return "&frac14;";
		case '\xBD' : 		return "&frac12;";
		case '\xBE' : 		return "&frac34;";
		case '\xBF' : 		return "&iquest;";
		case '\xD7' : 		return "&times;";
		case '\xF7' : 		return "&divide;";
		case '\xC6' : 		return "&AElig;";
		case '\xC1' : 		return "&Aacute;";
		case '\xC2' : 		return "&Acirc;";
		case '\xC0' : 		return "&Agrave;";
		case '\xC5' : 		return "&Aring;";
		case '\xC3' : 		return "&Atilde;";
		case '\xC4' : 		return "&Auml;";
		case '\xC7' : 		return "&Ccedil;";
		case '\xD0' : 		return "&ETH;";
		case '\xC9' : 		return "&Eacute;";
		case '\xCA' : 		return "&Ecirc;";
		case '\xC8' : 		return "&Egrave;";
		case '\xCB' : 		return "&Euml;";
		case '\xCD' : 		return "&Iacute;";
		case '\xCE' : 		return "&Icirc;";
		case '\xCC' : 		return "&Igrave;";
		case '\xCF' : 		return "&Iuml;";
		case '\xD1' : 		return "&Ntilde;";
		case '\xD3' : 		return "&Oacute;";
		case '\xD4' : 		return "&Ocirc;";
		case '\xD2' : 		return "&Ograve;";
		case '\xD8' : 		return "&Oslash;";
		case '\xD5' : 		return "&Otilde;";
		case '\xD6' : 		return "&Ouml;";
		case '\xDE' : 		return "&THORN;";
		case '\xDA' : 		return "&Uacute;";
		case '\xDB' : 		return "&Ucirc;";
		case '\xD9' : 		return "&Ugrave;";
		case '\xDC' : 		return "&Uuml;";
		case '\xDD' : 		return "&Yacute;";
		case '\xE1' : 		return "&aacute;";
		case '\xE2' : 		return "&acirc;";
		case '\xE6' : 		return "&aelig;";
		case '\xE0' : 		return "&agrave;";
		case '\xE5' : 		return "&aring;";
		case '\xE3' : 		return "&atilde;";
		case '\xE4' : 		return "&auml;";
		case '\xE7' : 		return "&ccedil;";
		case '\xE9' : 		return "&eacute;";
		case '\xEA' : 		return "&ecirc;";
		case '\xE8' : 		return "&egrave;";
		case '\xF0' : 		return "&eth;";
		case '\xEB' : 		return "&euml;";
		case '\xED' : 		return "&iacute;";
		case '\xEE' : 		return "&icirc;";
		case '\xEC' : 		return "&igrave;";
		case '\xEF' : 		return "&iuml;";
		case '\xF1' : 		return "&ntilde;";
		case '\xF3' : 		return "&oacute;";
		case '\xF4' : 		return "&ocirc;";
		case '\xF2' : 		return "&ograve;";
		case '\xF8' : 		return "&oslash;";
		case '\xF5' : 		return "&otilde;";
		case '\xF6' : 		return "&ouml;";
		case '\xDF' : 		return "&szlig;";
		case '\xFE' : 		return "&thorn;";
		case '\xFA' : 		return "&uacute;";
		case '\xFB' : 		return "&ucirc;";
		case '\xF9' : 		return "&ugrave;";
		case '\xFC' : 		return "&uuml;";
		case '\xFD' : 		return "&yacute;";
		case '\xFF' : 		return "&yuml;";

	}
	if (charCode > 128)
		return('&#' + parseInt(charCode) + ';');
	else
		return(thechar);
}


function entityNameEncode(string)
{
	returnString = new String();
	for (i=0;i<string.length;i++) {
		returnString += charToEntity(string.charAt(i),string.charCodeAt(i));
	}
	return(returnString);
}

//*********************** API ***********************

function isDOMRequired() { 
	// Return false, indicating that this command is available in code view.
	return false;
}

//function: commandButtons
//description: generic API function, returns string to be inserted at IP

function commandButtons(){
   return new Array(MM.BTN_OK,         "setDateStr();window.close()",
                    MM.BTN_Cancel,     "window.close()",
                    MM.BTN_Help,       "displayHelp()"    );


}

//***********************ACCESSOR FUNCTIONS***********************

function getDateStr(){
   return GstrFullDate;
}

function getDateID(){
   return GstrDateID;
}

function getHTMLDateStr(){
   return GstrHTMLFullDate;
}

//***********************LOCAL FUNCTIONS***********************

//function: setDateStr
//description: called from OK button of dialog,
//sets the global GstrFullDate variable

function setDateStr(){
    var dateStr = "";
    var dateStrHTML = "";
	var dateID = "";
    var dd = dw.getSystemDateTime(dd);  // to get the correct date
    var newnow = new Array();
	newnow = (dd.split(","));
    var newdate = new Date(newnow[3],newnow[2]-1,newnow[0],newnow[4],newnow[5],0,0); // creating new Date object with the correct date as returned by the wrapper function 
	var dayFormat  = getSelectedOptionAttr(GselDayFormats,"value");
	var dateFormat = getSelectedOptionAttr(GlistDateFormats,"value");
	var timeFormat = getSelectedOptionAttr(GselTimeFormats,"value");		
	
	//create the date that is inserted
	//if selected a Japanese date format in J version of Dreamweaver, concatenate in order of
	//date, day, time
	if ((dateFormat.indexOf("Japan") == 0 || dateFormat.indexOf("Korean") == 0 || dateFormat.indexOf("Chinese") == 0) && (dreamweaver.appVersion.indexOf('ja') != -1 || dreamweaver.appVersion.indexOf('ko') != -1 || dreamweaver.appVersion.indexOf('zh') != -1)) {
		dateStr += createDateStr(newdate,dateFormat,true);
		dateStr += " " + createDayStr(newdate,dayFormat,dateFormat,false,true);
		// we don't want a comma at the end of Western days if it appears within an Asian date format
		if ((dateStr.substring(dateStr.length-1, dateStr.length) != ")") && (dayFormat == "WestFullDayComma" || dayFormat == "WestAbbrDayComma" || dayFormat == "FullDayComma" || dayFormat == "AbbrDayComma"))
			dateStr = dateStr.substring(0, dateStr.length-2);
		dateStr += createTimeStr(newdate,timeFormat);
		dateStrHTML += createDateStr(newdate,dateFormat,true);
		dateStrHTML += " " + createDayStr(newdate,dayFormat,dateFormat,false,true);
		// we don't want a comma at the end of Western days if it appears within an Asian date format
		if ((dateStrHTML.substring(dateStrHTML.length-1, dateStrHTML.length) != ")") && (dayFormat == "WestFullDayComma" || dayFormat == "WestAbbrDayComma" || dayFormat == "FullDayComma" || dayFormat == "AbbrDayComma"))
			dateStrHTML = dateStrHTML.substring(0, dateStrHTML.length-2);
		dateStrHTML += createTimeStr(newdate,timeFormat);
	}
	else
	{
		dateStr += createDayStr(newdate,dayFormat,dateFormat,false,true);
		dateStr += createDateStr(newdate,dateFormat,true);
		dateStr += createTimeStr(newdate,timeFormat);
		// we don't want to encode for J or K or C day formats
		if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('ja') != -1 || dreamweaver.appVersion.indexOf('ko') != -1 || dreamweaver.appVersion.indexOf('zh') != -1) )
			dateStrHTML += createDayStr(newdate,dayFormat,dateFormat,false,true);
		else
			dateStrHTML += createDayStr(newdate,dayFormat,dateFormat,false,false);
		dateStrHTML += createDateStr(newdate,dateFormat,false);
		dateStrHTML += createTimeStr(newdate,timeFormat);
	}
	
	//dateID is inserted into the format attribute of the lock
	//and also placed in the opening comment
	dateID = createDateID(dayFormat,dateFormat,timeFormat);
	
	//if Update Automatically On Save is visible and checked,
	//add locks around the date
	if (GcbUpdate!=null && GcbUpdate.checked){
	   dateStr = addLockMarkup(dateStr,dateID);  
	   dateStrHTML = addLockMarkup(dateStrHTML,dateID);   
    }
	
	//assign to global variables accessed by accessor functions
	GstrFullDate = dateStr;
	GstrHTMLFullDate = dateStrHTML;
	GstrDateID = dateID;  
}



//function: addLockMarkup
//description: adds correct lock markup to the date that is 
//inserted

function  addLockMarkup(dateStr,dateID){

   var openBracket = "%3C";
   var closeBracket = "%3E";
   var quote = "%22";

   var openComment = openBracket + '!-- #BeginDate ' +
                     'format:' + dateID + ' --' + closeBracket;
   var closeComment = openBracket + '!-- #EndDate --' + closeBracket;
   var origAttr = openComment + dateStr + closeComment;
   
   var openLock = '<MM:BeginLock type="mmdate" format="' + dateID + 
                  '" orig="' + origAttr + '">';
   var closeLock =  '<MM:EndLock>';
   
   return openLock +  dateStr + closeLock;
}



//function: initializeUI
//description: initializes the global variables, and populates
//the UI with date format examples.

function initializeUI(){
   //return if already initialized
   //(this happens if command is called from PI)
   if (GarrDateFormats){
      GlistDateFormats.focus();
      return;
   }
	  
   initGlobals(); //initialize global variables
   populateUI();  //populate UI
}



//function: populateUI
//description: populate the UI with date format examples

function populateUI(){
   var dateFormatsArr = GarrDateFormats;  //shorter names easier to work with
   var dayFormatsArr  = GarrDayFormats;
   var timeFormatsArr = GarrTimeFormats;
   
   var nDateFormats = dateFormatsArr.length;
   var nDayFormats  = dayFormatsArr.length;
   var nTimeFormats = timeFormatsArr.length;
   
   var dateObj = new Date("74","2","7","22","18");  //examples are for March 7, 1974
   var dateStr = "",timeStr="",dayStr=""; 
   
    //populate day format list in UI
   //the first line creates an array of formatted dayes
   //(the createDayStr function is overloaded to return one item
   //or an array, therefore, unfortunately the function name isn't 
   //always entirely accurate)
   dayFormatsArr = createDayStr(dateObj,dayFormatsArr,dateFormatsArr,true,true);
   var counter = 0;
   for (i in dayFormatsArr){
      if (!dayFormatsArr[i].prototype){ 
		 // Val 13-aug-99 use temporary for speedier UI loading
		 var curr = new Option(dayFormatsArr[i]);
		 curr.value = i;
		 GselDayFormats.options[ counter++ ] = curr;
	  }
   }
   
   //populate date format list in UI
   //the first line creates an array of formatted dates
   //(the createDateStr function is overloaded to return one item
   //or an array, therefore, unfortunately, the function name isn't 
   ///always entirely accurate)
   dateFormatsArr  = createDateStr(dateObj,dateFormatsArr,true);
   counter = 0;
   for (i in dateFormatsArr){
      if (!dateFormatsArr[i].prototype){
		 // Val 13-aug-99: use a temporary to make initialization faster,
		 // and only assign to the formats array once.
	  	 var currObj = new Option(dateFormatsArr[i]);
		 currObj.value = i;
		 GlistDateFormats.options[ counter++ ] = currObj;
	  }
   }
   
   //populate time format list
   for (i=0;i<nTimeFormats;i++){
      timeStr = createTimeStr(dateObj, timeFormatsArr[i], true);
	  GselTimeFormats.options[ i ] = new Option(timeStr);
	  GselTimeFormats.options[ i ].value = timeFormatsArr[i];
   }
  
   
   //select first option of each menu
   GselDayFormats.selectedIndex = 0;
   GlistDateFormats.selectedIndex = 0;
   GselTimeFormats.selectedIndex = 0;
   
   //put focus in date formats field
   GlistDateFormats.focus();
}



//function: lead
//description: given a one or two digit number,
//adds a leading 0 if a 1 digit number

function lead(num){
   if (num.toString().length == "1")
      return "0" + num;
   return ( num );
}


//function: createDateStr
//description: given a date obj and a date format or formats
//returns an array with the correctly formatted date strings
//overloaded: dateFormat can be one item or an array
//if it is one item, returns one item
//if it is an array, returns an array

function createDateStr(dateObj,dateFormat,highAscii){
   var date = dateObj.getDate();
   var day = dateObj.getDay();
   var month = dateObj.getMonth();
   var year = dateObj.getYear();
   var abbrYear = (year<100)? year : year.toString().substring(1);
   var fullYear = (year<100)? "19" + year : year + 1900;
   
   var retVal; //return value;
   
   var abbrMonth;
   var westabbrMonth;
   var fullMonth;
   var westfullMonth;

   if (highAscii || isDoubleByteVersion()) { //highAscii is true when date format is one of double-byte ones. but we also want to use this for western date format on double-byte versions.
	   westabbrMonth = ARR_WestAbbrMonths[ month ];
	   abbrMonth = ARR_AbbrMonths[ month ];
	   westfullMonth = ARR_WestFullMonths[ month ];
	   fullMonth = ARR_FullMonths[ month++ ];

   } else {
  	   abbrMonth = entityNameEncode(ARR_AbbrMonths[ month ]);
	   westabbrMonth = abbrMonth;
	   fullMonth = entityNameEncode(ARR_FullMonths[ month++ ]); 
	   westfullMonth = fullMonth;


   }
   //the dateFormat argument is overloaded so that it
   //can be either a string or an array. Handle accordingly.
   if (typeof dateFormat == "string"){
	  if (useEnglishDate(dateFormat)) 
		fullMonth = westfullMonth;
        retVal = createCorrectDateFormat(dateFormat,date,day,month,abbrMonth,westabbrMonth,fullMonth,westfullMonth,
	                                   year,abbrYear,fullYear);
   } else { //dateFormat is an array
        retVal = new Array();
	    dateFormats = dateFormat; //rename
		var nFormats = dateFormats.length;

		
		for (var i=0;i<nFormats;i++){
		   retVal[dateFormats[i]] = createCorrectDateFormat(dateFormat[i],date,day,month,abbrMonth,westabbrMonth,
		                                       fullMonth,westfullMonth,year,abbrYear,fullYear);
			
		}
   }    
   
   return retVal;
}


//function: createCorrectDateFormat
//description: returns a correclty formatted date string

function createCorrectDateFormat(dateFormat,date,day,month,abbrMonth,westabbrMonth,fullMonth,westfullMonth,
                                 year,abbrYear,fullYear,time){

    var dateStr = "";
   
	switch (dateFormat){
	
	   case "American1":  // Thursday, March 7, 1974
	      dateStr += fullMonth + " " + date + ", " + fullYear;
		  break;
		  
	   case "American2":  // 3/7/74
	      dateStr += month + "/" + date + "/" + abbrYear;
		  break;
		  
	   case "American3":  // 03/07/1974
	      dateStr += lead(month) + "/" + lead(date) + "/" + fullYear;
		  break;

	   case "ISO8601":  // 1974-03-07
	      dateStr += fullYear + "-" + lead(month) + "-" + lead(date);
		  break;
		  
	   case "English1":  // 7-mar-74
	      dateStr += date + "-" + westabbrMonth + "-" + abbrYear;
		  break;
	  
	   case "English2":  // 07-Mar-1974
	      westabbrMonth = westabbrMonth.charAt(0).toUpperCase()+westabbrMonth.substring(1);
	      dateStr += lead(date) + "-" + westabbrMonth + "-" + fullYear;
		  break;
		  
	   case "Spanish1":  // 7/3/74 
	      dateStr += date + "/" + month + "/" + abbrYear;
		  break;
		  
	   case "French1":  //  7/03/74
	      dateStr += date + "/" + lead(month) + "/" + abbrYear;
		  break;
		  
	   case "Italian1":  // 7-03-1974
	      dateStr += date + "-" + lead(month) + "-" + fullYear;
		  break;
		  
	   case "Brazilian1":  // 07.03.74
	      dateStr += lead(date) + "." + lead(month) + "." + abbrYear;
		  break;
		  
	   case "German1":  // 07.03.1974
	      dateStr += lead(date) + "." + lead(month) + "." + fullYear;
		  break;
		  
	   case "Japanese1":  // 74/03/07
	      dateStr += abbrYear + "/" + lead(month) + "/" + lead(date) ;
		  break;

	   case "Japanese2":  // 1974 (yearJapanese) 3(month) 7(dayJapanese)
	      dateStr += fullYear + yearJapanese + fullMonth + date + dayJapanese;
		  break;

	   case "Japanese3":  // 1974(yearJapanese)03(month) 07(dayJapanese)
	      dateStr += fullYear + yearJapanese + lead(month) + monthJapanese + lead(date) + dayJapanese;
		  break;
		            
	   case "Swedish1":  //  7 March, 1974
	      dateStr +=  date + " " + fullMonth + ", " + fullYear;
		  break;
		  
	   case "Korean1":  //  1974(korean year) 3(korean month) 7(korean day)
	      dateStr +=  fullYear + yearKorean + fullMonth + " " + date + dayKorean;
		  break;
		  
	   case "Korean2":  //  1974.3.7
	      dateStr +=  fullYear + "." + month + "." + date;
		  break;

	   case "Korean3":  //  3.7.1974
	      dateStr +=  month + "." + date + "." + fullYear;
		  break;

       case "Korean4":  //  March 7,1974
	      dateStr += westfullMonth + " " + date + ", " + fullYear;
		  break;

	   case "Korean5":  //  74.03.07
	      dateStr += abbrYear + "." + lead(month) + "." + lead(date);
		  break;

	   case "Korean6":  // 3/7/ 1974
	      dateStr +=  abbrMonth + "/" + lead(date) + " " + fullYear;
		  break;

       case "Korean7":  //  74-03-07
	      dateStr += abbrYear + "-" + lead(month) + "-" + lead(date);
		  break;

	   case "Chinese1":  // 74/3/7
	      dateStr += abbrYear + "/" + month + "/" + date ;
		  break;

	   case "Chinese2":  // 1974 (yearChinese) 3(monthChinese) 7(dayChinese)
	      dateStr += fullYear + yearChinese + fullMonth + date + dayChinese;
		  break;

	   default:
	      break;
   }
   
   return dateStr;

}



//function: createDayStr
//description: see createDateStr notes. Except of course this function
//returns a correctly formatted day (or days) instead of a date

function createDayStr(dateObj,dayFormat,dateFormat,bPreview,highAscii){
   var	day = dateObj.getDay();
   var	WestFullDay = ARR_WestFullDays[day];
   var	WestAbbrDay = ARR_WestAbbrDays[day];
   var	fullDay;
   var	abbrDay;

   if (highAscii || isDoubleByteVersion()) { //highAscii is true when data format is one of double-byte ones. but we also want to use this for western data format on double-byte versions.
     fullDay = ARR_FullDays[day];
     abbrDay = ARR_AbbrDays[day];
   } else {
      fullDay = entityNameEncode(ARR_FullDays[day]);
      abbrDay = entityNameEncode(ARR_AbbrDays[day]);
   }

   if (typeof dayFormat == "string"){
	  dayFormat = useEnglishDayFormat(dayFormat, dateFormat);
	  retVal = createCorrectDayFormat(dayFormat,fullDay,abbrDay,WestFullDay,WestAbbrDay,bPreview);
   } else { //dayFormat is an array
        retVal = new Array();
	    dayFormats = dayFormat; //rename for clarity
		var nFormats = dayFormats.length;

		for (var i=0;i<nFormats;i++){
		   retVal[dayFormats[i]] = createCorrectDayFormat(dayFormat[i],fullDay,abbrDay,WestFullDay,WestAbbrDay,bPreview);
		}
   }    
   return retVal;
}



//function: createCorrectDayFormat
//description: returns the correctly formatted day format

function createCorrectDayFormat(dayFormat,fullDay,abbrDay,WestFullDay,WestAbbrDay,bPreview){

   var dayStr = "";
   switch (dayFormat){
   
      case "NoDay":
	     if (bPreview)
		    dayStr = "[" + OPTION_NoDay + "]";
	     break;
		  
	  case "FullDayComma":
	     dayStr = CHAR_PreDay + fullDay + CHAR_PostDay;
		 break;
		 
	  case "FullDay":
	     dayStr = fullDay + " ";
		 break;
		 
	  case "AbbrDayComma":
	     dayStr = CHAR_PreDay + abbrDay + CHAR_PostDay;
		 break;
		 
	  case "AbbrDay":
	     dayStr = abbrDay + " ";
		 break;
		 
	  case "LowAbbrDayComma":
	     dayStr = abbrDay.toLowerCase() + ", ";
		 break;
		 
	  case "LowAbbrDay":
	     dayStr = abbrDay.toLowerCase() + " ";
		 break;

	  case "WestFullDayComma":
		 dayStr = WestFullDay + westSeparator;
		 break;
	
	  case "WestAbbrDayComma":
	     dayStr = WestAbbrDay + westSeparator; 
        break;

	  default:
	     break;
   
   }

   return dayStr;

}



//function: createTimeStr
//description: given a dateObj and a time format,
//returns the correctly formatted time string
//The time format argument is "a" for AM/PM,
//"m" for military time, and "" for no time

function createTimeStr(dateObj,timeFormat,bPreview){
   var hours = dateObj.getHours();
   var minutes = lead(dateObj.getMinutes());
   var timeStr = "";  //return value
   
   switch (timeFormat){
      case "NoTime":
	     if (bPreview)
		    timeStr = "[" + OPTION_NoTime + "]";
		 break;
		 
	   case "AMPMTime":
			 timeStr += (hours>=12) ? ((hours-12==0)?hours:hours-12) + ":" + minutes + " " + PM :
                  hours + ":" + minutes + " " + AM;
		   timeStr = " " + timeStr;
		   break;
		  
	  case "MilitaryTime":
	     timeStr += " " + hours + ":" + minutes;
		   timeStr = " " + timeStr;
		   break;
		 
	  default:
	     break;
   }
	     
   return timeStr;
}

// Check if user is running localized DW
function isDoubleByteVersion(){
	if (dreamweaver.appVersion && (dreamweaver.appVersion.indexOf('ja') != -1 || dreamweaver.appVersion.indexOf('ko') != -1 || dreamweaver.appVersion.indexOf('zh') != -1) )
		return true;
	else
		return false;
}

// Return true if selected date format is not localized specific one (i.e. Japanese1).
// For example, 
// -If user selected "American1" date format on Japanese DW, this function returns true.
// -If user selected "Japanese1" date format on Japanese DW, this function returns false.
function useEnglishDate(format) {
	if ((dreamweaver.appVersion && dreamweaver.appVersion.indexOf('ja') != -1) && format.indexOf("Japan") != 0)
		return true;
	else if ((dreamweaver.appVersion && dreamweaver.appVersion.indexOf('ko') != -1) && format.indexOf("Korean") != 0) 
		return true;
	else if ((dreamweaver.appVersion && dreamweaver.appVersion.indexOf('zh') != -1) && format.indexOf("Chinese") != 0) 
		return true;
	else
		return false;
}

// if selected date was not localized specific one (i.e. Japanese1), force to use Western day formats.
function useEnglishDayFormat(dayFormat, dateFormat) {
	var rtnDayFormat = dayFormat;
	if (useEnglishDate(dateFormat)) {
		if (dayFormat == "FullDayComma" || dayFormat == "FullDay" || dayFormat == "WestFullDayComma")
			rtnDayFormat = "WestFullDayComma";
		else if (dayFormat != "NoDay")
			rtnDayFormat = "WestAbbrDayComma";
	}
	return rtnDayFormat;
}
