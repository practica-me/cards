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
    var mode = this.props.mode || MODES.TitleMode;
    return(
      <div className="phone-view">
      {this.state.pastTheTitle ?
        <AllConversationsViewer
          conversations={this.props.script.conversations}
          audioUrl={this.props.audioUrl}
          mode={mode} />
        : this.renderTitleScreen()}
      </div>
    );
  }
}

