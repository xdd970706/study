//SHARE-IN-MEMORY=true
// Copyright 2000, 2001, 2002, 2003 Macromedia, Inc. All rights reserved.
// JavaScript and VBScript reserved words.

function IsReservedWord(inVal)
{
	var theVal = String(inVal).toLowerCase()
	if (inVal.length == 0)
	{
		return false
	}

	var a = new Array()

	// ASP specific words
	// If you add words here, add them
	// to the VBScript function below, too.

	a["session"] = 1
	a["request"] = 1
	a["application"] = 1
	a["response"] = 1
	a["server"] = 1


	// JavaScript keywords

	a["break"] = 1
	a["case"] = 1
	a["continue"] = 1
	a["default"] = 1
	a["delete"] = 1
	a["do"] = 1
	a["else"] = 1
	a["export"] = 1
	a["false"] = 1
	a["for"] = 1
	a["function"] = 1
	a["if"] = 1
	a["import"] = 1
	a["in"] = 1
	a["new"] = 1
	a["null"] = 1
	a["return"] = 1
	a["switch"] = 1
	a["this"] = 1
	a["true"] = 1
	a["typeof"] = 1
	a["var"] = 1
	a["void"] = 1
	a["while"] = 1
	a["with"] = 1
	a["catch"] = 1
	a["class"] = 1
	a["const"] = 1
	a["debugger"] = 1
	a["enum"] = 1
	a["extends"] = 1
	a["finally"] = 1
	a["super"] = 1
	a["throw"] = 1
	a["try"] = 1
	a["abstract"] = 1
	a["boolean"] = 1
	a["byte"] = 1
	a["char"] = 1
	a["double"] = 1
	a["final"] = 1
	a["float"] = 1
	a["goto"] = 1
	a["implements"] = 1
	a["instanceof"] = 1
	a["int"] = 1
	a["interface"] = 1
	a["long"] = 1
	a["native"] = 1
	a["package"] = 1
	a["private"] = 1
	a["protected"] = 1
	a["public"] = 1
	a["short"] = 1
	a["static"] = 1
	a["synchronized"] = 1
	a["throws"] = 1
	a["transient"] = 1
	a["alert"] = 1
	a["arguments"] = 1
	a["array"] = 1
	a["blur"] = 1
	a["boolean"] = 1
	a["callee"] = 1
	a["caller"] = 1
	a["captureevents"] = 1
	a["clearinterval"] = 1
	a["cleartimeout"] = 1
	a["close"] = 1
	a["closed"] = 1
	a["confirm"] = 1
	a["constructor"] = 1
	a["date"] = 1
	a["defaultstatus"] = 1
	a["document"] = 1
	a["escape"] = 1
	a["eval"] = 1
	a["find"] = 1
	a["focus"] = 1
	a["frames"] = 1
	a["function"] = 1
	a["history"] = 1
	a["home"] = 1
	a["infinity"] = 1
	a["innerheight"] = 1
	a["innerwidth"] = 1
	a["isfinite"] = 1
	a["isnan"] = 1
	a["java"] = 1
	a["length"] = 1
	a["location"] = 1
	a["locationbar"] = 1
	a["math"] = 1
	a["menubar"] = 1
	a["moveby"] = 1
	a["moveto"] = 1
	a["name"] = 1
	a["nan"] = 1
	a["netscape"] = 1
	a["number"] = 1
	a["object"] = 1
	a["open"] = 1
	a["opener"] = 1
	a["outerheight"] = 1
	a["outerwidth"] = 1
	a["packages"] = 1
	a["pagexoffsets"] = 1
	a["pageyoffsets"] = 1
	a["parent"] = 1
	a["parsefloat"] = 1
	a["parseint"] = 1
	a["personalbar"] = 1
	a["print"] = 1
	a["prompt"] = 1
	a["prototype"] = 1
	a["regexp"] = 1
	a["releaseevents"] = 1
	a["resizeby"] = 1
	a["resizeto"] = 1
	a["routeevent"] = 1
	a["scroll"] = 1
	a["scrollbars"] = 1
	a["scrollby"] = 1
	a["scrollto"] = 1
	a["self"] = 1
	a["setinterval"] = 1
	a["settimeout"] = 1
	a["status"] = 1
	a["statusbar"] = 1
	a["stop"] = 1
	a["string"] = 1
	a["toolbar"] = 1
	a["top"] = 1
	a["tostring"] = 1
	a["unescape"] = 1
	a["unwatch"] = 1
	a["valueof"] = 1
	a["watch"] = 1
	a["window"] = 1

	
	// VBScript Keywords
	a["currency"] = 1
	a["abs"] = 1
	a["and"] = 1
	a["array"] = 1
	a["asc"] = 1
	a["atn"] = 1
	a["call"] = 1
	a["cbool"] = 1
	a["cbyte"] = 1
	a["ccur"] = 1
	a["cdate"] = 1
	a["cdbl"] = 1
	a["chr"] = 1
	a["cint"] = 1
	a["class"] = 1
	a["clear"] = 1
	a["clng"] = 1
	a["color"] = 1
	a["comparison"] = 1
	a["const"] = 1
	a["cos"] = 1
	a["createobject"] = 1
	a["csng"] = 1
	a["cstr"] = 1
	a["date"] = 1
	a["time"] = 1
	a["dateadd"] = 1
	a["datediff"] = 1
	a["datepart"] = 1
	a["dateserial"] = 1
	a["datevalue"] = 1
	a["day"] = 1
	a["description"] = 1
	a["dictionary"] = 1
	a["dim"] = 1
	a["do"] = 1
	a["empty"] = 1
	a["eqv"] = 1
	a["erase"] = 1
	a["err"] = 1
	a["eval"] = 1
	a["execute"] = 1
	a["executeglobal"] = 1
	a["exit"] = 1
	a["exp"] = 1
	a["false"] = 1
	a["filesystem"] = 1
	a["filter"] = 1
	a["firstindex"] = 1
	a["fix"] = 1
	a["for"] = 1
	a["formatcurrency"] = 1
	a["formatdatetime"] = 1
	a["formatnumber"] = 1
	a["formatpercent"] = 1
	a["function"] = 1
	a["getlocale"] = 1
	a["getobject"] = 1
	a["getref"] = 1
	a["global"] = 1
	a["hex"] = 1
	a["helpcontext"] = 1
	a["helpfile"] = 1
	a["hour"] = 1
	a["if"] = 1
	a["then"] = 1
	a["else"] = 1
	a["ignorecase"] = 1
	a["imp"] = 1
	a["initialize"] = 1
	a["inputbox"] = 1
	a["instr"] = 1
	a["instrrev"] = 1
	a["int"] = 1
	a["is"] = 1
	a["isarray"] = 1
	a["isdate"] = 1
	a["isempty"] = 1
	a["isnull"] = 1
	a["isnumeric"] = 1
	a["isobject"] = 1
	a["join"] = 1
	a["lbound"] = 1
	a["lcase"] = 1
	a["left"] = 1
	a["len"] = 1
	a["length"] = 1
	a["loadpicture"] = 1
	a["log"] = 1
	a["ltrim"] = 1
	a["match"] = 1
	a["matches"] = 1
	a["mid"] = 1
	a["minute"] = 1
	a["mod"] = 1
	a["month"] = 1
	a["monthname"] = 1
	a["msgbox"] = 1
	a["not"] = 1
	a["now"] = 1
	a["nothing"] = 1
	a["null"] = 1
	a["number"] = 1
	a["oct"] = 1
	a["on"] = 1
	a["error"] = 1
	a["option"] = 1
	a["explicit"] = 1
	a["or"] = 1
	a["pattern"] = 1
	a["private"] = 1
	a["propertyget"] = 1
	a["propertylet"] = 1
	a["propertyset"] = 1
	a["public"] = 1
	a["raise"] = 1
	a["randomize"] = 1
	a["redim"] = 1
	a["regexp"] = 1
	a["ren"] = 1
	a["replace"] = 1
	a["rgb"] = 1
	a["right"] = 1
	a["rnd"] = 1
	a["round"] = 1
	a["rtrim"] = 1
	a["scriptengine"] = 1
	a["scriptenginebuildversion"] = 1
	a["scriptenginemajorversion"] = 1
	a["scriptengineminorversion"] = 1
	a["second"] = 1
	a["select"] = 1
	a["case"] = 1
	a["set"] = 1
	a["setlocale"] = 1
	a["sgn"] = 1
	a["sin"] = 1
	a["source"] = 1
	a["space"] = 1
	a["split"] = 1
	a["sqr"] = 1
	a["strcomp"] = 1
	a["string"] = 1
	a["strreverse"] = 1
	a["sub"] = 1
	a["tan"] = 1
	a["terminate"] = 1
	a["test"] = 1
	a["time"] = 1
	a["timer"] = 1
	a["timeserial"] = 1
	a["timevalue"] = 1
	a["trim"] = 1
	a["tristate"] = 1
	a["true"] = 1
	a["typename"] = 1
	a["ubound"] = 1
	a["ucase"] = 1
	a["value"] = 1
	a["vartype"] = 1
	a["weekday"] = 1
	a["weekdayname"] = 1
	a["while"] = 1
	a["wend"] = 1
	a["with"] = 1
	a["xor"] = 1
	a["year"] = 1
	a["call"] = 1
	a["const"] = 1
	a["dim"] = 1
	a["do"] = 1
	a["loop"] = 1
	a["erase"] = 1
	a["for"] = 1
	a["next"] = 1
	a["each"] = 1
	a["function"] = 1
	a["end"] = 1
	a["on"] = 1
	a["error"] = 1
	a["option"] = 1
	a["explicit"] = 1
	a["private"] = 1
	a["public"] = 1
	a["if"] = 1
	a["while"] = 1
	a["wend"] = 1
	a["else"] = 1
	a["then"] = 1
	a["randomize"] = 1
	a["redim"] = 1
	a["select"] = 1
	a["case"] = 1
	a["set"] = 1
	a["sub"] = 1



	if (a[theVal])
	{
		return true
	}
	else
	{
		return false
	}

}

function IsReservedJavaWord(inVal)
{
	var theVal = String(inVal).toLowerCase()
	if (inVal.length == 0)
	{
		return false
	}

	var a = new Array()

	// Java specific words

	a["abstract"] = 1;
	a["default"] = 1;
	a["if"] = 1;
	a["private"] = 1;
	a["this"] = 1;
	a["boolean"] = 1;
	a["do"] = 1;
	a["implements"] = 1;
	a["protected"] = 1;
	a["throw"] = 1;
	a["break"] = 1;
	a["double"] = 1;
	a["import"] = 1;
	a["public"] = 1;
	a["throws"] = 1;
	a["byte"] = 1;
	a["else"] = 1;
	a["instanceof"] = 1;
	a["return"] = 1;
	a["transient"] = 1;
	a["case"] = 1;
	a["extends"] = 1;
	a["int"] = 1;
	a["short"] = 1;
	a["try"] = 1;
	a["catch"] = 1;
	a["final"] = 1;
	a["interface"] = 1;
	a["static"] = 1;
	a["void"] = 1;
	a["char"] = 1;
	a["finally"] = 1;
	a["long"] = 1;
	a["strictfp"] = 1;
	a["volatile"] = 1;
	a["class"] = 1;
	a["float"] = 1;
	a["native"] = 1;
	a["super"] = 1;
	a["while"] = 1;
	a["const"] = 1;
	a["for"] = 1;
	a["new"] = 1;
	a["switch"] = 1;
	a["continue"] = 1;
	a["goto"] = 1;
	a["package"] = 1;
	a["synchronized"] = 1;

	if (a[theVal])
	{
		return true
	}
	else
	{
		return false
	}

}

