import React, { Component } from 'react';
import T from 'prop-types';
import './script-viewer.css';

import MODES from './consts.js';
import AllConversationsViewer from './all-conversations-viewer.js';

/* ScriptViewer manages which set of conversations (eg. short replies)
 * we are viewing.
 * Currently a pass-through, because only short replies are thought of so far. */
class ScriptViewer extends Component {
  static propTypes = {
    script: T.object.isRequired,
    mode: T.oneOf(Object.keys(MODES)).isRequired,
    skipTitle: T.bool
  };
  constructor(props) {
    super(props);
    this.state = { pastTheTitle: this.props.skipTitle };
    this.renderTitleScreen = this.renderTitleScreen.bind(this);
  }
  renderTitleScreen() {
    var {title, description} = this.props.script;
    var movePastTitle = ()=> this.setState({ pastTheTitle: true});
    return(
        <div className="title-screen">
          <div className="script-title">
            <div className="header"> {title} </div>
          </div>
          <div className="script-description"> {description} </div>
          <div className="controls">
            <button className={"primary start"} onClick={movePastTitle}> Start </button>
          </div>
        </div>
    );
  }
  render() {
    return(
      <div className="phone-view">
      {this.state.pastTheTitle ?
        <AllConversationsViewer
          conversations={this.props.script.conversations}
          mode={this.props.mode}
          audio_url={this.props.script.audio_url} />
        : this.renderTitleScreen()}
      </div>
    );
  }
}

export default ScriptViewer;
