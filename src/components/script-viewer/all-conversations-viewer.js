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
    this.onPrevOnNextGenerator = this.onPrevOnNextGenerator.bind(this);
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
  /* Generator for onPrev or onNext function. prevOrNext is 'prev' or 'next'.
   * If we're at a bound and can't go previous or next, return null */
  onPrevOnNextGenerator(prevOrNext) {
    if (prevOrNext !== 'prev' && prevOrNext !== 'next') console.log('PrevNext error');

    // Cycle MODEs: Title_Mode -> Listening -> Reviewing -> Recording
    var modeCycle = [MODES.TitleMode, MODES.Listening, MODES.Reviewing, MODES.Recording];
    var curModeIndex = modeCycle.indexOf(this.state.mode);
    if (curModeIndex < -1) console.error("Unsupported mode");
    var numModes = modeCycle.length;
    var newModeIndex = (prevOrNext === 'next') ?
      (curModeIndex + 1) % numModes :
      (curModeIndex - 1 + numModes) % numModes;

    // When switching past the end, advance to next conversation
    var numConvos = this.props.conversations.length;
    var convoDelta  = 0;
    if (prevOrNext === 'next' && curModeIndex === numModes - 1) { // end of modes: advance convo
      if (this.state.conversationIndex === numConvos - 1) return null; // can't go further
      convoDelta = +1;
    } else if (prevOrNext === 'prev' && curModeIndex === 0) { // beginning of modes: roll back convo
      if (this.state.conversationIndex === 0) return null; // can't go further back.
      convoDelta = -1;
    }
    // Remember, this is a callback generator
    return () => {
      this.changeConversation(convoDelta);
      this.setState({mode: modeCycle[newModeIndex]});
    }
  }
  render() {
    var numConversations = this.props.conversations.length;
    return(
      <div className="all-conversations">
        <ConversationRecorder
          convoElement={this.getActiveConvo()}
          mode={this.state.mode} // MODE is controlled
          audio_url={this.props.audio_url}
          next={this.onPrevOnNextGenerator('next')}
          prev={this.onPrevOnNextGenerator('prev')} />
        <div className="pagination">
        # {this.state.conversationIndex + 1} / {numConversations}
        </div>
      </div>
    )

  }
}
