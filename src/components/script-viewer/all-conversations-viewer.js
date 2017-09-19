import React, { Component } from 'react';
import SCRIPT_MODES from './consts.js';
import T from 'prop-types';
import ConversationRecorder from './conversation-recorder.js';

/* AllConversationsViewer manages which conversation we are viewing,
 * and the MODE in which we are viewing each conversation. */
export default class AllConversationsViewer extends Component {
  static propTypes = {
    mode: T.oneOf(Object.keys(SCRIPT_MODES)).isRequired,
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
    // Cycle MODE from TITLE_AUDIO -> AUDIO -> AUDIO_AND_TEXT -> TITLE_AUDIO
    // When switching to another TITLE_AUDIO, advance to next conversation
    if (this.state.mode === SCRIPT_MODES.TITLE_AUDIO) {
      this.setState({mode: SCRIPT_MODES.AUDIO});
    } else if (this.state.mode === SCRIPT_MODES.AUDIO) {
      this.setState({mode: SCRIPT_MODES.AUDIO_AND_TEXT});
    } else if (this.state.mode === SCRIPT_MODES.AUDIO_AND_TEXT) {
      this.setState({mode: SCRIPT_MODES.TITLE_AUDIO});
      this.changeConversation(+1);
    } else {
      console.log("CATCH ALL MODE", this.state.mode);
      this.changeConversation(+1);
    }
  }
  render() {
    var clickfn = (fn) => (e) => {e.preventDefault(); fn();}
    var previous = () => this.changeConversation(-1);
    var next = () => this.changeConversation(+1);
    var idx = this.state.conversationIndex;
    var numConversations = this.props.conversations.length;
    var prevNext = (this.state.mode !== SCRIPT_MODES.TEXT) ? <div/> :
      <div className="controls">
        <button onClick={previous} > Prev </button>
        <button onClick={next} > Next </button>
      </div>;
    return(
      <div className="all-conversations">
        <div className="pagination">
          {idx > 0 ? <a href="#" onClick={clickfn(previous)}> {"<"} </a> : ""}
          # {this.state.conversationIndex + 1} / {numConversations}
          <a href="#" onClick={clickfn(next)}> {">"} </a>
        </div>
        <ConversationRecorder
          convoElement={this.getActiveConvo()}
          mode={this.state.mode} // MODE is controlled
          audio_url={this.props.audio_url}
          onFinishedPlaying={this.advance}
          />
        {prevNext}
      </div>
    )

  }
}
