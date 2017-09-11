import React, { Component } from 'react';
import ScriptViewer from './components/script-viewer.js';
import SCRIPT_MODES from './consts.js';

import script from './data/short_replies_annotated.json';

class App extends Component {
  render() {
    return(
      <ScriptViewer script={script} mode={SCRIPT_MODES.TITLE_AUDIO}/>
    );
  }
}

export default App;
