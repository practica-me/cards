import React, { Component } from 'react';
import ScriptViewer from './components/script-viewer/script-viewer.js';
import MODES from './components/script-viewer/consts.js';

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
        <ScriptViewer script={script} mode={MODES.TitleMode}/>
        <FullStory settings={settings} custom={data} />
      </div>
    );
  }
}
export default App;