import React, { Component } from 'react';
import MODES from './consts.js';
import T from 'prop-types';
import ConversationRecorder from './conversation-recorder.js';

/* AllConversationsViewer manages which conversation we are viewing,
 * and the MODE in which we are viewing each conversation. */
export default class AllConversationsViewer extends Component {
  static propTypes = {
    mode: T.oneOf(Object.keys(MODES)).isRequired,
    audio_url: T.string.isRequired,
    conversations: T.array.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      conversationIndex: 0,
      mode: this.props.mode // WE WILL CONTROL THE MODE
    }
    this.getActiveConvo = this.getActiveConvo.bind(this);
    this.changeConversation = this.changeConversation.bind(this);
    this.advance = this.advance.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      this.setState({mode: nextProps.mode});
    }
  }
  getActiveConvo() {
    var convoElement = this.props.conversations[this.state.conversationIndex];
    return convoElement;
  }
  changeConversation(delta) {
    var limit = this.props.conversations.length;
    var newIndex = (this.state.conversationIndex + delta) % limit;
    if (newIndex < 0) { newIndex = limit - 1; }
    this.setState({conversationIndex: newIndex});
  }
  advance() {
    // Cycle MODEs: Title_Mode -> Listening -> Reviewing -> Recording
    var modeCycle = [MODES.TitleMode, MODES.Listening, MODES.Reviewing, MODES.Recording];
    var curModeIndex = modeCycle.indexOf(this.state.mode);
    var numModes = modeCycle.length;
    // When switching past the end, advance to next conversation
    if (curModeIndex < -1 || curModeIndex >= numModes - 1) {
      this.changeConversation(+1);
    }
    this.setState({mode: modeCycle[(curModeIndex + 1) % numModes]});
  }
  render() {
    /* Pagination: creating too much trouble for now.
    var previous = () => this.changeConversation(-1);
    var next = () => this.changeConversation(+1);
    var idx = this.state.conversationIndex;
    var pagination =
      <div className="pagination">
        (idx > 0 ?  <button className="minimal" onclick={previous}> {"<"} </button> : "")
        # {idx + 1} / {numConversations}
        <button className="minimal" onClick={next}> {">"} </button>
      </div>;
    */
    var numConversations = this.props.conversations.length;
    return(
      <div className="all-conversations">
        <ConversationRecorder
          convoElement={this.getActiveConvo()}
          mode={this.state.mode} // MODE is controlled
          audio_url={this.props.audio_url}
          onFinishedPlaying={this.advance}
          />
        <div className="pagination">
        # {this.state.conversationIndex + 1} / {numConversations}
        </div>
      </div>
    )

  }
}