import React, { Component } from 'react';
import T from 'prop-types';
import './script-viewer.css';

import MODES from './consts.js';
import AllConversationsViewer from './all-conversations-viewer.js';

/* ScriptViewer manages which set of conversations (eg. short replies)
 * we are viewing.
 * Currently a pass-through, because only short replies are thought of so far. */
export default class ScriptViewer extends Component {
  static propTypes = {
    script: T.object.isRequired,
    audioUrl: T.string.isRequired,
    mode: T.oneOf(Object.keys(MODES)),
    onExit: T.func,
  };
  render() {
    var mode = this.props.mode || MODES.TitleMode;
    return(
      <div className="conversation">
        <AllConversationsViewer
          onExit={this.props.onExit}
          conversations={this.props.script.conversations}
          title={this.props.script.title}
          audioUrl={this.props.audioUrl}
          mode={mode} />
      </div>
    );
  }
}

