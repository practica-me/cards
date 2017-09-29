
/* Function to take a script format (practicaJSON) and align format (gentleJSON)
 * and give us a combo that is more useful to work with. */
function destructivelyAlignScript(practicaJSON, gentleJSON) {
   var transcriptTxt = gentleJSON.transcript;
   var words = gentleJSON.words;
   /* Make words accessible by startOffset */
   var wordsByStart = {};
   var wordsByEnd = {};
   words.forEach(function(word) {
     wordsByStart[word.startOffset] = word;
     wordsByEnd[word.endOffset] = word;
   });
   /* Iterate through each conversation line, find it in the transcript,
    * find the corresponding starting word and ending word object,
    * and add the start and end offset in the audio for each of those. */
   practicaJSON.conversations.forEach(function(convoElement) {
     convoElement.conversation = convoElement.conversation.map(function(line) {
       var lineStartOffset = transcriptTxt.indexOf(line);
       if (lineStartOffset < 0) {
         console.error("ERROR: didn't find the following line:");
         console.error(line);
         return {
           text: line,
           audioStart: undefined,
           audioEnd: undefined
         };
       } else {
         var lineExcludingEndPunctuation = line.replace(/[?.,!]+$/, '');
         var lineEndOffset = lineStartOffset + lineExcludingEndPunctuation.length;
         var startWord = wordsByStart[lineStartOffset];
         var endWord = wordsByEnd[lineEndOffset];
         if (!startWord || !endWord) {
           console.error("ERROR: start or end word not found for line:");
           console.error(line, lineStartOffset, lineEndOffset);
           console.error("startWord", startWord, "endWord", endWord);
         }
         return {
           text: line,
           audioStart: 1000 * startWord.start, // convert from s to ms
           audioEnd: 1000 * endWord.end // convert from s to ms
         };
       }
     });
     // Now find the line that matches with the title, and get audioStart & audioEnd in the title
     var titleFound = false;
     convoElement.conversation.forEach(function(line, index) {
       var normalize = (s) => {
         return (typeof s !== "string") ? s : s.replace(/[^\w]/ig, '').toLowerCase();
       }
       if (normalize(line.text).indexOf(normalize(convoElement.title)) > -1) {
         convoElement.title = Object.assign({lineIndexInConversation: index}, line);
         titleFound = true;
       }
     });
     if (!titleFound) {
       console.error("Title not found: ", convoElement.title);
     }
   });
   return practicaJSON;
}

var USAGE = "\nExample usage:\n\t" +
  "node script-aligner.js short_replies.json short_replies_aligned.json > short_replies_annotated.json"
if(process.argv.length < 4) {
  console.log(USAGE);
  throw "script-alinger requires path to json data";
} else {
  var practicaJSON = require('./' + process.argv[2]);
  var alignedJSON = require('./' + process.argv[3]);
  console.log(
    JSON.stringify(
      destructivelyAlignScript(practicaJSON, alignedJSON),
      null,
      ' '
    ));
}


//export default destructivelyAlignScript;
