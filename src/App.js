import React, { Component } from 'react';
import ScriptViewer from './components/script-viewer.js';

import script from './data/short_replies.json';
import transcript from './data/short_replies_aligned.json';
import destructivelyAlignScript from './data/script-aligner.js';

class App extends Component {
  render() {
    destructivelyAlignScript(script, transcript);
    return(
      <ScriptViewer script={script} mode={'text'}/>
    );
  }
}

export default App;
