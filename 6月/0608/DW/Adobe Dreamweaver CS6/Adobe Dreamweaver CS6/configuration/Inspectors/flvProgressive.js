//Copyright 2000-2006 Adobe Macromedia Software LLC and its licensors. All rights reserved.

// *********** GLOBAL VARS *****************************
var HELP_DOC = MM.HELP_FlashVideo_PI;
var flvType = "progressive"; 

// js object for FLV loader
var FLVLoader = dwscripts.findDOMObject("MM_FLVLoader");

// UI elements
var VIDEO_URL;

function displayHelp()
{
  dwscripts.displayDWHelp(HELP_DOC); 
}

// ******************** API ****************************
function canInspectSelection()
{
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();
  
  if (!theObj) 
    return false;
  
  var children = theObj.childNodes;
  var i = children.length ? children.length - 1 : -1;
  
  while (i >= 0)
  {
    var currentChild = children.item(i);
    
    if (currentChild.nodeType == Node.ELEMENT_NODE && 
        currentChild.tagName=="PARAM" &&
        currentChild.getAttribute("name") == "FlashVars")
    {
        var flashVars = currentChild.getAttribute("value");
        return (flashVars.indexOf("&streamName") != -1 && flashVars.indexOf("&serverName") == -1);
    }
    else if (currentChild.nodeType == Node.ELEMENT_NODE && 
        currentChild.tagName=="OBJECT")
    {
        // Start over the loop with all the children of the inner object tag
        children = currentChild.childNodes;
        i = children.length ? children.length - 1 : -1;
        continue;
    }
    i--;
  }

  return false;
}


function initializeUI() 
{
  // Store references to form elements in global variables.
  //initialize the common controls
  initializeUICommon();
  //initialize the fileURL
  VIDEO_URL = new URLTextField("", "videoURL");	
  VIDEO_URL.initializeUI(); 
}


function inspectSelection()
{
  // Call initializeUI() here; it's how the global variables get
  // initialized. The onLoad event on the body tag is never triggered
  // in inspectors.
  initializeUI();

  //get the original code
  var dom = dw.getDocumentDOM();
  var theObj = dom.getSelectedNode();

  if (!dom || !theObj) 
    return;
    
  var objectCode = theObj.outerHTML;

  objectCode = objectCode.replace(/\&amp;/g, "&");
  
  //setValues for common controls
  setValuesForCommonControls(objectCode);
  //set the file URL
  VIDEO_URL.setValue(getFLVAttrs(objectCode,"streamName") + ".flv");
}


//--------------------------------------------------------------------
// FUNCTION:
//   updateUI
//
// DESCRIPTION:
//   update the attribute name
//
// ARGUMENTS:
//	 the name of the attribute which changed
//
// RETURNS:
//   void
//--------------------------------------------------------------------
function updateUI(attrName)
{
  if (attrName) 
  {
    switch (attrName)
    {
      //set the videoId
      case "videoID":
      {
        var videoPlayerID = VIDEO_PLAYER_ID.value;
        applyFlashAttr("id",videoPlayerID);
      }
      break;
      //set the videoWidth
      case "videoWidth":
      {
        //apply the videoWidth function
        applyVideoWidth(true);
      }
      break;			
      //set the videoHeight
      case "videoHeight":
      {
        //apply the videoHeight function
        applyVideoHeight(true);
      }
      break;			
      case "videoURL":
      {
        videoURL = VIDEO_URL.getValue();
        if(!videoURL || !trimString(videoURL))
        {        
          VIDEO_URL.setValue("");
          alert(MSG_EnterValidURL);
          return;
        }
        videoURL = trimString(videoURL);
        if (/^(\.flv)/i.test(videoURL) || !(/(\.flv)$/i.test(videoURL)))
        {
          alert(MSG_SelectFLVFile);        
          return;
        }
        var index = -1;
        if((videoURL.indexOf("*") != -1) || (videoURL.indexOf("?") != -1) || 
          (videoURL.indexOf("<") != -1) || (videoURL.indexOf(">") != -1) || 
          ((index = videoURL.lastIndexOf("|")) != -1 && videoURL.indexOf("file:///") == -1 && index > 9) || 
          (videoURL.indexOf("\"") != -1) || (videoURL.indexOf(" ") != -1))
        {
          alert(MSG_SelectValidFile);
          return;
        }      
        if(/\\/g.test(videoURL))
          videoURL = videoURL.replace(/\\/g,"/");
        
        if(/\.flv$/i.test(videoURL))
          videoStreamName = trimString(videoURL.replace(/\.flv$/i,""));
        else
          videoStreamName = trimString(videoURL);
      
        //URL encode parameters
        videoStreamName = escape(videoStreamName);
        videoStreamName = encodeURL(videoStreamName);
    
        detectCodecIDForProgressive();
      } 
      break;
      case "videoSkinName":
      {
        //apply the video skin name
        var videoSkinName = VIDEO_SKIN_NAMES.getValue();
        //copy the skin
        copyVideoControl(videoSkinName);
        applySkinName(videoSkinName);
      }
      break;
      case "videoAutoPlay":
      {
        var videoAutoPlay = VIDEO_AUTO_PLAY.getCheckedState() ? "true" : "false";
        applyFLVAttr("autoPlay",videoAutoPlay);
      }
      break;
      case "videoAutoRewind":
      {
        var videoAutoRewind = VIDEO_AUTO_REWIND.getCheckedState() ? "true" : "false";
        applyFLVAttr("autoRewind",videoAutoRewind);
      }
      break;
    }		
  }
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectSizeForProgressive()
//
// DESCRIPTION:
//   detect the size for .flv (file , http) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (file or http)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectSizeForProgressive()
{
	var videoURL = VIDEO_URL.getValue();
	if((videoURL != null) && (videoURL.length > 0))
	{
		videoURL = trimString(videoURL);
		if (isFileURL(videoURL))
		{
			//form a file:///url if not http
			videoURL = getFullURL(videoURL);
		}
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds

		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		MM.setBusyCursor();
		
		VIDEO_SIZE_BTN.setAttribute("disabled","true");
		VIDEO_TOTAL.innerHTML = MSG_Detecting;
		
		//first call back
		var funCallBack = "isDetectSizeDone()";
		timerID = setTimeout(funCallBack,500);
	}
}

//--------------------------------------------------------------------
// FUNCTION:
//   detectCodecIDForProgressive()
//
// DESCRIPTION:
//   detect the size for .flv (file , http) and initialize the width and height
//
//
// ARGUMENTS:
//   the url (file or http)
//
// RETURNS:
//   nothing.
//             
//--------------------------------------------------------------------
function detectCodecIDForProgressive()
{
	var dom = dw.getDocumentDOM();
	videoObj = dom.getSelectedNode();
	
	var videoURL = VIDEO_URL.getValue();
	if (videoURL && videoURL.length > 0)
	{
		videoURL = trimString(videoURL);
		if (isFileURL(videoURL))
		{
			//form a file:///url if not http
			videoURL = getFullURL(videoURL);
			
			// if the flv file does not exists, we won't detect codec ID. 
			// Instead we will just go ahead and update the stream name and flash player version.
			if (!DWfile.exists(videoURL))
			{
				applyStreamNameAndPlayerVersion(-1);
				return;
			}
		}
		//load the video URL to get the auto detect the video dimension
		loadVideo(videoURL);
		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds

		//start the detect poll
		//we need the below flag to track when the auto detect from
		//swfloader extension is completed.
		//we loop 30 times x 500ms (1/2 second)15 seconds
		MM._LOOPCOUNTER = 0;
		VIDEO_SIZE_BTN.setAttribute("disabled","true");

		//first call back
		var funCallBack = "isDetectCodecIDDone()";
		timerID = setTimeout(funCallBack,500);
	}
}

function browseFLVFile()
{
	var fileTypeDescription = dw.loadString("flashvideo/file type");
	var filter = new Array(fileTypeDescription + " (*.flv)|*.flv|");
	var selectedFile = dw.browseForFileURL("select",  dw.loadString("flashvideo/title"), false, false, filter);
	if (selectedFile)
	    VIDEO_URL.setValue(selectedFile);
}
