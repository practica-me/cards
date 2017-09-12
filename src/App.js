import React, { Component } from 'react';
import ScriptViewer from './components/script-viewer.js';
import SCRIPT_MODES from './consts.js';

import script from './data/short_replies_annotated.json';
import { FullStory } from 'react-fullstory-component';

const settings = {
    debug: false,
    host: 'www.fullstory.com',
    orgKey: '6GPQQ'
};
const data = {
    script: 'short_replies'
};

class App extends Component {
  render() {
    return(
      <div>
        <ScriptViewer script={script} mode={SCRIPT_MODES.TITLE_AUDIO}/>
        <FullStory settings={settings} custom={data} />
      </div>
    );
  }
}
export default App;
