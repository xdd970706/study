/*

 ADOBE CONFIDENTIAL
 ___________________

 Copyright 2011 Adobe Systems Incorporated
 All Rights Reserved.

 NOTICE:  All information contained herein is, and remains
 the property of Adobe Systems Incorporated and its suppliers,
 if any.  The intellectual and technical concepts contained
 herein are proprietary to Adobe Systems Incorporated and its
 suppliers and are protected by trade secret or copyright law.
 Dissemination of this information or reproduction of this material
 is strictly forbidden unless prior written permission is obtained
 from Adobe Systems Incorporated.
 
*/

// See unit tests for usage examples: Configuration/JavascriptTests/TestFiles/Shared/Common/Scripts/StyleSheet_Test.htm

function StyleSheet(inDw) 
{	
	//	A styleSheet consists of one or more subSheets.  A subSheet is a group of consecutive 
	//	rules in a styleSheet that are either in the same media clause, or not in a media clause.

	var self = this;
	
	self.publicFunctions = [		
			'loadCss',
			'toString',
			'toStringNoComments',
			'appendRule',
			'getRule',
			'getProperty',
			'setProperty',
			'getSubSheets',
			'getTextAfterApplyingEdits'
		]
				
	self.refs = {
			dw:			inDw,
			subSheets:	[]		
		};
		
	self.data = {
			text:			'',
			textNoComments:	'',
			errorStr:		'',
			edits:			[]
		};
		
	self.getSubSheets = function()
		{
			return self.refs.subSheets;
		}

	self.loadCss = function(inText)
		// Loads and parses the css in the string inText and returns 'this', which is the StyleSheet object.
		{
			self.data.text = inText;
			self.parse();		
			return self;
		}
	
	self.appendRule = function(subSheet, newRuleText, saveEditRecOnly)	
		// Inserts the new rule (newRuleText) at the end of the given subSheet and formats it
		// by copying the formatting of the last rule that currently exists in the subSheet.				
		//
		// returns numCharsInserted
		{
			var rules = subSheet.rules;
			var numRules = rules.length;
			
			if (numRules > 0)
				var lastRule = subSheet.rules[numRules - 1];
			else			
				var lastRule = { text: '\ndiv {\n\tcolor: green;\n}\n' };			

			var newRuleText = self.copyRuleWhiteSpaceFromTo(lastRule.text, newRuleText);

			if (numRules > 0)			
				var insertOffset = lastRule.offset + lastRule.text.length;
			else
				var insertOffset = self.data.text.length;
						
			if (saveEditRecOnly == 'saveEditRecOnly') {
				var existingOffsets = self.findExistingOffsetsForIdSelector(subSheet, newRuleText);
				if (existingOffsets) {
					self.data.edits.push({start: existingOffsets.start, end: existingOffsets.end, text: newRuleText});
				} else {				
					self.data.edits.push({start: insertOffset, end: insertOffset, text: newRuleText});
				}
			} else {			
				self.insertText(newRuleText, insertOffset);
			}
			
			return newRuleText.length;
		}
		
	self.findExistingOffsetsForIdSelector = function(subSheet, ruleText) { 
		// If this is an ID rule (like '#LayoutDiv1') and a rule with that 
		// selector is already in the subSheet, return the offets, else return null.
		var pos = ruleText.indexOf('{');
		if (pos == -1) {
			return null;	
		}
		var selector = self.trim(ruleText.substring(0, pos));
		if (selector.charAt(0) != '#') {
			return null;	
		}
		var rule = self.getRule(subSheet, selector);
		if (rule == null) {
			return null;	
		}
		return { start: rule.offset, end: rule.offset + rule.text.length };
	}
		
	self.getTextAfterApplyingEdits = function() {
		self.data.edits.sort(function(a, b){ return a.start - b.start });		
		var pos = 0;  // Points to 'current position' in self.data.text.	
		var lines = [];
		for (var i = 0; i < self.data.edits.length; i++) {
			var edit = self.data.edits[i];
			lines.push(self.data.text.substring(pos, edit.start));
			lines.push(edit.text);
			pos = edit.end;
		}
		if (pos < self.data.text.length) {
			lines.push(self.data.text.substring(pos));  // Make sure to get the end of the string.		
		}
		return lines.join('');
	}	
			
	self.getRule = function(subSheet, selector)
		// Returns the first rule that has the selector.  You can then pass that rule into getProperty() and setProperty().
		{
			var rules = subSheet.rules;
			
			for (var i = 0; i < rules.length; i++)
			{
				var rule = rules[i];
				
				for (var j = 0; j < rule.selectors.length; j++)
				{
					if (rule.selectors[j].text == selector)
						return rule;
				}					
			}
			
			return null;
		}
		
	self.getProperty = function(rule, prop)
		{															
			var propVal = '';
			
			rule.declarations.forEach(function(decl){
					var items = decl.text.split(':');
					if (items.length != 2)
						return; // Something is wrong, ignore.
					items = items.map(function(item){return self.trim(item)});
					var propName = items[0];
					if (propName.toLowerCase() == prop.toLowerCase())
						propVal = items[1];
				});
			
			return propVal;							
		}
				
	self.setProperty = function(rule, inProperty, inValue)
		// Sets the property of the given rule to value.  If value is the empty string, the property is deleted.
		// If property doesn't currently exist in rule, it will be appended.  When appending, white space formatting is 
		// inferred from existing white space in the rule.
		{
			var decls = rule.declarations;
			var inProperty = inProperty.toLowerCase();
			var	newDecl = inProperty + ': ' + inValue;

			for (var i = 0; i < decls.length; i++)
			{
				var decl = decls[i];
				var property = self.trim(decl.text.split(':')[0]).toLowerCase();				
								
				if (property == inProperty)
				{
					var propPos = decl.text.toLowerCase().indexOf(inProperty); // Offset of first letter of prop name.
					var realLength = decl.text.length - propPos; // Shave off possible white space in beginning.
					var startOffset = decl.offset;
					var endOffset = startOffset + realLength;

					var propPos = decl.text.toLowerCase().indexOf(inProperty);
					
					if (inValue == '')
					{
						// Delete the existing property.
						newDecl = '';						
						if (self.data.text[endOffset] == ';')
							endOffset++;						
						startOffset = self.findStartOfDeclLine(startOffset);
						endOffset = self.findEndOfDeclLine(endOffset);						
					}
					
					self.replaceText(newDecl, startOffset, endOffset);
					return;					
				}
			}
			
			// If we get here, we couldn't find the property, so, if inValue isn't empty, append the property to the decl list.
			
			if (inValue != '')
			{
				var insertPos = self.findAppendDeclInsertPos(rule);
				newDecl += ';';
				var preDecl = self.getPreDeclAndPostOpenBraceWhiteSpace(rule.text).preDecl;
				var postDecl = self.getPostDeclAndPreCloseBraceWhiteSpace(rule.text).postDecl;
				self.insertText(preDecl + newDecl + postDecl, insertPos);
			}			
		}
		
	self.findAppendDeclInsertPos = function(rule)
		{
			if (rule.declarations.length > 0)
			{
				var lastDecl = rule.declarations[rule.declarations.length - 1];
				var realLength = self.trim(lastDecl.text).length; // Shave off possible white space in beginning.
				var insertPos = lastDecl.offset + realLength;
				if (self.data.text[insertPos] == ';')
					insertPos++;
				insertPos = self.findEndOfDeclLine(insertPos);
			}
			else
			{
				var endBracePos = rule.text.lastIndexOf('}');
				var insertPos = rule.offset + endBracePos;
			}
			return insertPos;
		}

	self.findStartOfDeclLine = function(startOffset)
		{
			var i = startOffset - 1;
			var str = self.data.textNoComments;
			// Go backward while there is whitespace to trim.
			while (str[i] == ' ' || str[i] == '\t') 
				i--;
			if (i == (startOffset - 1))
				return startOffset; // There was no space to trim.
			return i + 1;
		}
		
	self.findEndOfDeclLine = function(endOffset)
		{
			var i = endOffset;
			var str = self.data.textNoComments;
			// Go forward to next non-white.
			while (str[i] == ' ' || str[i] == '\t' || str[i] == '\r' || str[i] == '\n' ) 
				i++;
			if (i == endOffset)
				return endOffset; // There was no white space after this decl.
			var nextNonWhitePos = i;
			i--;
			// Go backward to EOL or endOffset that was passed in.			
			while ( i > endOffset && str[i] != '\r' && str[i] != '\n') 
				i--;
			if (i > endOffset)
				return i + 1; // We found the end of the line.
			return nextNonWhitePos; // There were no line breaks, just return start of next non-white.
		}
	
	self.stripWhiteSpaceFromRuleText = function(ruleText)
		{
			ruleText = String(ruleText);
			
			// Format selectors.
			
			var bracePos = ruleText.indexOf('{');
			
			var strSelectors = ruleText.substring(0, bracePos);
			
			var list = strSelectors.split(',');
			
			for (var i = 0; i < list.length; i++)
				list[i] = self.trim(list[i]);
			
			strSelectors = list.join(',')
			
			// Now strip white space out of declarations.
			
			ruleText = ruleText.substring(bracePos);
			
			var strOut = '';			
			var inValue = false;
			var expectingValue = false;
						
			for (var i = 0; i < ruleText.length; i++)
			{
				var c = ruleText[i];
				
				if (inValue)
				{
					if (c == ';' || c == '}')
					{
						inValue = false;
						
						var trailingWhiteSpace = self.getTrailingWhiteSpace(strOut);
						
						if (trailingWhiteSpace.length > 0)
						{
							strOut = strOut.substring(0, strOut.length - trailingWhiteSpace.length);
						}

						if (c == '}')
							strOut += ';' + c;
						else
							strOut += c;							
					}					
					else
						strOut += c;
				}
				else if (expectingValue)
				{
					if (c != ' ' && c != '\t' && c != '\r' && c != '\n')
					{
						inValue = true;
						expectingValue = false;
						strOut += c;
					}					
				}
				else if (c != ' ' && c != '\t' && c != '\r' && c != '\n')
				{
					// Not inValue and not expectingValue
					
					strOut += c;	
					
					if (c == ':')
						expectingValue = true;
				}											
			}
			
			return strSelectors + strOut;			
		}
	
	self.copyRuleWhiteSpaceFromTo = function(ruleText1, ruleText2)
		{			
			var ruleText1 = String(ruleText1);
			ruleText2 = self.stripWhiteSpaceFromRuleText(String(ruleText2));			
						
			var preSelector = self.getLeadingWhiteSpace(ruleText1);
			var postSelector = 	self.getPostSelectorWhiteSpace(ruleText1);			
			
			var rec = self.getPreDeclAndPostOpenBraceWhiteSpace(ruleText1);
			
			var postOpenBrace = rec.postOpenBrace;			
			var preDecl = rec.preDecl;
			
			var rec = self.getPostDeclAndPreCloseBraceWhiteSpace(ruleText1);
			
			var postDecl = rec.postDecl;
			var preCloseBrace = rec.preCloseBrace;			

			var postRule = self.getTrailingWhiteSpace(ruleText1);												
			
			// Now format the second rule based on the white space we have found.
					
			var sheet = new StyleSheet(self.refs.dw).loadCss(ruleText2);
			
			var rule = sheet.refs.subSheets[0].rules[0];
			
			var strOut = preSelector;
			
			for (var i = 0; i < rule.selectors.length; i++)			
			{
				if (i > 0)
					strOut += ', ';
					
				strOut += rule.selectors[i].text;
			}
			
			strOut += postSelector + '{' + postOpenBrace;
			
			for (var i = 0; i < rule.declarations.length; i++)			
			{
				var list = rule.declarations[i].text.split(':');
				
				var prop = list[0];
				var val = list[1];
				
				strOut += preDecl + prop + ': ' + val + ';' + postDecl;					
			}
			
			strOut += preCloseBrace + '}' + postRule;
			
			// We don't want to copy a bunch of line breaks before and after the rule, so trim them off.
			
			strOut = self.trimExtraLineBreaks(strOut);
							
			return strOut;			
		}
	
	self.getPostSelectorWhiteSpace = function(ruleText)
		{
			var curPos = ruleText.indexOf('{');			
			var endPostSelector = curPos;
			
			curPos--;
			
			while (ruleText[curPos] == ' ' || ruleText[curPos] == '\t' || ruleText[curPos] == '\r' || ruleText[curPos] == '\n')
				curPos--;	
							
			curPos++;
			
			return ruleText.substring(curPos, endPostSelector);	
		}
			
	self.getPreDeclAndPostOpenBraceWhiteSpace = function(ruleText)
		{					
			var curPos = ruleText.indexOf('{');
			curPos++;
			var startPostOpenBrace = curPos;
			
			while (ruleText[curPos] == ' ' || ruleText[curPos] == '\t' || ruleText[curPos] == '\r' || ruleText[curPos] == '\n')
				curPos++;
						
			var postOpenBrace = ruleText.substring(startPostOpenBrace, curPos);
			
			if (postOpenBrace.indexOf('\n') != -1 || postOpenBrace.indexOf('\r') != -1)
			{
				// There is a line break after { and before the first decl.  Split it up: post open brace gets up to and including line breaks.
				
				var endPreDecl = curPos;
				
				curPos--;
				
				while (ruleText[curPos] == ' ' || ruleText[curPos] == '\t')
					curPos--;
					
				curPos++;
				
				var preDecl = ruleText.substring(curPos, endPreDecl);
				
				postOpenBrace = ruleText.substring(startPostOpenBrace, curPos);
			}
			else
			{
				// Since there is no line break between { and the first decl, just give the white space to pre decl.
				
				preDecl = postOpenBrace;
				postOpenBrace = '';
				
			}
			
			return { preDecl: preDecl, postOpenBrace: postOpenBrace };
		}
		
	self.getPostDeclAndPreCloseBraceWhiteSpace = function(ruleText)
		{							
			curPos = ruleText.indexOf('}');
			
			var endPreCloseBrace = curPos;
			
			curPos--;
			
			while (ruleText[curPos] == ' ' || ruleText[curPos] == '\t' || ruleText[curPos] == '\r' || ruleText[curPos] == '\n')
				curPos--;
			
			curPos++;
			
			var startPreCloseBrace = curPos;
			
			var preCloseBrace = ruleText.substring(startPreCloseBrace, endPreCloseBrace);
									
			if (preCloseBrace.indexOf('\n') != -1 || preCloseBrace.indexOf('\r') != -1)
			{
				// There is a line break before } and after the last decl.  Split it up: post decl gets up to and including line breaks.
				
				curPos = endPreCloseBrace - 1;
								
				while (ruleText[curPos] != '\r' && ruleText[curPos] != '\n')
					curPos--;
							
				curPos++;
				
				var postDecl = ruleText.substring(startPreCloseBrace, curPos);
				
				preCloseBrace = ruleText.substring(curPos, endPreCloseBrace);
			}
			else
			{
				// Since there is no line break between } and the last decl, just give the white space to post decl.
				
				postDecl = preCloseBrace;
				preCloseBrace = '';				
			}
			
			if (postDecl.indexOf('\r') != -1 || postDecl.indexOf('\n') != -1)
			{
				// We don't want a bunch of spaces or tabs before the line break.
				
				curPos = 0;
				
				while (postDecl[curPos] == ' ' || postDecl[curPos] == '\t')
					curPos++;
				
				if (curPos > 0)
					postDecl = postDecl.substring(curPos);
			}
			
			return { postDecl: postDecl, preCloseBrace: preCloseBrace };
		}
		
			
	self.trimExtraLineBreaks = function(ruleText)
		{
			ruleText = String(ruleText);
			var curPos = 0;
			var strLen = ruleText.length;
			
			var hasCr = ruleText.indexOf('\r') != -1;
			var hasLf = ruleText.indexOf('\n') != -1;
			
			if (!hasCr && !hasLf)
				return ruleText;
			
			// First, find the offsets of the start and end of non-white chars.
			
			while	(	curPos < strLen - 1
						&&			
						(ruleText[curPos] == ' ' || ruleText[curPos] == '\t' || ruleText[curPos] == '\r' || ruleText[curPos] == '\n')
					)
				curPos++;
			
			if (curPos == strLen) // String was nothing but white space.
				return '';
				
			var startNonWhite = curPos;
			
			curPos = strLen - 1;
			
			while	(	curPos > 0
						&&			
						(ruleText[curPos] == ' ' || ruleText[curPos] == '\t' || ruleText[curPos] == '\r' || ruleText[curPos] == '\n')
					)
				curPos--;
				
			var endNonWhite = curPos + 1;
			
			// Now walk backwards from the first non-white char, and once we have gone past two line breaks, that's enough.
			
			curPos = startNonWhite;
			var numBreaks = 0;
			var newStart = 0;
			var lookFor = '\r';

			if (!hasCr && hasLf)
				lookFor = '\n';
			
			while (curPos > 0)
			{					
				if (ruleText[curPos] == lookFor)
				{					
					numBreaks++;	
					
					if (numBreaks == 1)
					{
						newStart = curPos;
						break;
					}
				}
				
				curPos--;				
			}
				
			// Now walk forwards from the last non-white char, and once we have gone past two line breaks, that's enough.
			
			curPos = endNonWhite;
			var numBreaks = 0;
			var newEnd = strLen;
			var lookFor = '\n';
			
			if (hasCr && !hasLf)
				lookFor = '\r';
			
			while (curPos < strLen - 1)
			{				
				if (ruleText[curPos] == lookFor)
				{
					numBreaks++;	
					if (numBreaks == 1)
					{
						newEnd = curPos + 1;
						break;
					}
				}
				
				curPos++;
			}
			
			// Now chop the ends off, if need be.
			
			if (newStart != 0 || newEnd != strLen)
				return ruleText.substring(newStart, newEnd);	
			
			return ruleText;		
		}
				 
	self.insertText = function(text, offset)
		{
			self.data.text = self.data.text.substring(0, offset) + text + self.data.text.substring(offset);	
			self.parse();
		}
				
	self.replaceText = function(text, startOffset, endOffset)
		{
			self.data.text = self.data.text.substring(0, startOffset) + text + self.data.text.substring(endOffset);	
			self.parse();
		}
		
	self.toString = function()
		// Returns a string representing the CSS text of the entire styleSheet. 
		{
			return self.data.text;	
		}

	self.toStringNoComments = function()
		// Returns a string representing the CSS text of the entire styleSheet where comments have
		// been replaced by spaces.
		{
			return self.data.textNoComments;	
		}

	self.blankOutComments = function()
		// Replaces comments with spaces.
		{
			var strOut = '';
			var inComment = false;
			var prevPrevChar = ''; // The char before the previous char.
			var prevChar = '';
			var char = '';
			var nextChar = '';
			var	lastCharOfComment = false;
			
			for (var i = 0; i < self.data.text.length; i++)
			{												
				if ((i - 2) >= 0)
					prevPrevChar = self.data.text[i - 2];
					
				if ((i - 1) >= 0)
					prevChar = self.data.text[i - 1];					
					
				char = self.data.text[i];				
				
				if ((i + 1) < self.data.text.length)
					nextChar = self.data.text[i + 1];
				else
					nextChar = '';
				
				if (char == '/' && nextChar == '*' && !inComment)
					inComment = true;
				else if (char == '/' && prevChar == '*' && prevPrevChar != '/' && inComment) 
					lastCharOfComment = true;
					
				if (inComment)
					strOut += ' ';
				else
					strOut += char;
				
				if (lastCharOfComment)
				{
					lastCharOfComment = false;
					inComment = false;	
				}									
			}
			
			return strOut;
		}	

	self.getLeadingWhiteSpace = function(str)
		{
			str = String(str);
			strOut = '';
			
			for (var i = 0; i < str.length; i++)
			{
				if (str[i] == ' ' || str[i] == '\t' || str[i] == '\r' || str[i] == '\n')
					strOut += str[i];
				else
					break;
			}
					
			return strOut;
		}

	self.getTrailingWhiteSpace = function(str)
		{
			str = String(str);
			strOut = '';
			
			for (var i = str.length - 1; i >= 0; i--)
			{
				if (str[i] == ' ' || str[i] == '\t' || str[i] == '\r' || str[i] == '\n')
					strOut = str[i] + strOut;
				else
					break;
			}
					
			return strOut;

		}
		
	self.parse = function()
		{	
			self.data.textNoComments = self.blankOutComments(self.data.text);			
			self.data.errorStr = '';		
			self.refs.subSheets = [];
		
			// Parse the style sheet.
			
			var json = self.refs.dw.styleSheetElementToJSONShallow('StyleSheet', self.data.textNoComments);
			var rawSheet = self.evalJson(json);
			
			// Find the importList and ruleList.
			
			for (var i in rawSheet.children)
			for (var i = 0; i < rawSheet.children.length; i++)			
			{
				var rec = rawSheet.children[i];
				
				if (rec.type == 'ImportList')
					var importList = rec.list;
				else
					var ruleList = rec.list;	
			}

			self.parseSubSheets(ruleList);
			
			self.parseRules();
		}

	self.parseSubSheets = function(ruleList)
		{
			// Organize the rules into subSheets.
			
			function SubSheet(styleSheet)
			{
				this.mediaQueryList = null;
				this.rules = [];	
			}
			
			var inMediaClause = false;
			var curSubSheet = new SubSheet();
			
			for (i in ruleList)
			{						
				var curRule = ruleList[i];
									
				if (curRule.mediaQueryListOffset != -1 && curRule.mediaQueryListOffset != 0)
				{					
					inMediaClause = true;
					
					if (curSubSheet.rules.length > 0)
					{
						self.refs.subSheets.push(curSubSheet);
						curSubSheet = new SubSheet();
					}
					
					curSubSheet.mediaQueryList = {offset: curRule.mediaQueryListOffset, text: curRule.mediaQueryListText};
				}
				else if (curRule.mediaQueryListOffset == -1)
				{
					if (inMediaClause)
					{
						inMediaClause = false;
		
						self.refs.subSheets.push(curSubSheet);				
						curSubSheet = new SubSheet();
					}
				}						
				
				delete curRule.type;
				delete curRule.mediaQueryListOffset;
				delete curRule.mediaQueryListText;
				
				// The API call returns an offset that points to the first char of the selector, but the 'rule text' includes
				// leading white space so we can duplicate it, if need be, so make the offset adjustment here.
				
				curRule.offset -= self.getLeadingWhiteSpace(curRule.text).length;  
				
				curSubSheet.rules.push(curRule);
			}
			
			self.refs.subSheets.push(curSubSheet);
		}

	self.parseRules = function()
		{
			// 	Parse the rules into selectors and declarations.
			
			for (var i = 0; i < self.refs.subSheets.length; i++)			
			{
				var subSheet = self.refs.subSheets[i];
				
				for (var j in subSheet.rules) //todo: Use incremental loop instead. Change elsewhere, too.
				{
					var rule = subSheet.rules[j];
					
					rule.selectors = [];
					rule.declarations = [];
		
					var json = self.refs.dw.styleSheetElementToJSONShallow('Rule', rule.text);
					var rawRule = self.evalJson(json);
					
					// Find the selectorList and declarationList.
					for (var k in rawRule.children)
					{
						var rec = rawRule.children[k];
						
						if (rec.type == 'SelectorList')
							var selectorList = rec.list;
						else
							var declarationList = rec.list;	
					}
					
					for (var k in selectorList)
					{
						var selector = selectorList[k];
						rule.selectors.push({offset: rule.offset + selector.offset, text: self.trim(selector.text)});	
					}
					
					for (var k in declarationList)
					{
						var declaration = declarationList[k];
						rule.declarations.push({offset: rule.offset + declaration.offset, text: declaration.text});
					}
				}
			}			
		}
		
	self.evalJson = function(json)
		{
			return eval('(' + json + ')');
		}
		
	self.trim = function(str)
		{
			str = String(str);	
			var curPos = 0;
			
			while	(	curPos < str.length 
						&&
						(str[curPos] == ' ' || str[curPos] == '\t' || str[curPos] == '\r' || str[curPos] == '\n')
					)
				curPos++;							
				
			if (curPos == str.length)
				return '';
			else
				var startNonWhite = curPos;
				
			curPos = str.length - 1;
			
			while	(	curPos > 0 
						&&
						(str[curPos] == ' ' || str[curPos] == '\t' || str[curPos] == '\r' || str[curPos] == '\n')
					)
				curPos--;
			
			var endNonWhite = curPos + 1;						
			
			return str.substring(startNonWhite, endNonWhite);										
		}
}










