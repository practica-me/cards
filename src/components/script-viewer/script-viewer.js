import React, { Component } from 'react';
import T from 'prop-types';
import './script-viewer.css';

import SCRIPT_MODES from './consts.js';
import SoundSprite from '../../lib/sound-sprite.js';
import AllConversationsViewer from './all-conversations-viewer.js';

function audioMode(props) {
  return (props.mode === SCRIPT_MODES.AUDIO ||
          props.mode === SCRIPT_MODES.TITLE_AUDIO ||
          props.mode === SCRIPT_MODES.AUDIO_AND_TEXT);
}

/* ScriptViewer manages which set of conversations (eg. short replies)
 * we are viewing.
 * Currently a pass-through, because only short replies are thought of so far. */
class ScriptViewer extends Component {
  render() {
    return(
      <div className="script-viewer">
      <div className="script-title"> {this.props.script.title} </div>
      <AllConversationsViewer
        conversations={this.props.script.conversations}
        mode={this.props.mode}
        audio_url={this.props.script.audio_url} />
      </div>
    );
  }
}

export default ScriptViewer;
