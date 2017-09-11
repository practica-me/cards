

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
         console.log("ERROR: didn't find the following line:");
         console.log(line);
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
           console.log("ERROR: start or end word not found for line:");
           console.log(line, lineStartOffset, lineEndOffset);
           console.log("startWord", startWord, "endWord", endWord);
         }
         return {
           text: line,
           audioStart: startWord.start,
           audioEnd: endWord.end
         };
       }
     });
     // Now find the line that matches with the title, and get audioStart & audioEnd in the title
     convoElement.conversation.forEach(function(line) {
       var normalize = (s) => { return s.replace(/[^\w]/ig, '').toLowerCase() };
       if (normalize(line.text) === normalize(convoElement.title)) {
         convoElement.titleAudioStart = line.audioStart;
         convoElement.titleAudioEnd = line.audioEnd;
       }
     });
     console.log(JSON.stringify(practicaJSON));
   })

}

export default destructivelyAlignScript;
