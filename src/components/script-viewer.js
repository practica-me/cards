import React, { Component } from 'react';
import SoundSprite from './sound-sprite.js';
import SCRIPT_MODES from '../consts.js';
import './script-viewer.css';

function audioMode(props) {
  return (props.mode === SCRIPT_MODES.AUDIO ||
          props.mode === SCRIPT_MODES.TITLE_AUDIO ||
          props.mode === SCRIPT_MODES.AUDIO_AND_TEXT);
}

/* Single Line component. Just renders ---- or real text depending on mode. */
class SingleLine extends Component {
  render() {
    var {text} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    var cls = ["line", this.props.side, (this.props.active ? "active" : ""),
               (audioMode(this.props) ? "audio" : "")].join(" ");
    if (this.props.mode === SCRIPT_MODES.TEXT ||
        this.props.mode === SCRIPT_MODES.AUDIO_AND_TEXT) {
      return <div className={cls}> {text} </div>;
    } else if (this.props.mode === SCRIPT_MODES.AUDIO) {
      return <div className={cls}>{dotted}</div>;
    } else if (this.props.mode === SCRIPT_MODES.TITLE_AUDIO) {
      return <div/>;
    } else {
      console.error("MODE", this.props.mode, "not yet supported");
      return <div/>;
    }
  }
}

/* ConversationViewer renders an SoundSprite to play audio from start to end,
 * which are mode dependent.
 * Also, keeps track of activeLineIndex based on audio position. */
class ConversationViewer extends Component {
  constructor(props) {
    super(props);
    this.state = Object.assign({renderNext: false}, this.audioStartEnd(this.props));
    this.onAudioPosition = this.onAudioPosition.bind(this);
  }
  audioStartEnd(props) {
    var {convoElement} = props;
    if (props.mode === SCRIPT_MODES.TITLE_AUDIO) {
      return {audioStart: 1000 * convoElement.titleAudioStart,
              audioEnd: 1000 * convoElement.titleAudioEnd};
    } else {
      var {conversation} = convoElement;
      return {audioStart: 1000 * conversation[0].audioStart,
              audioEnd: 1000 * conversation[conversation.length - 1].audioEnd};
    }
  }
  componentWillReceiveProps(nextProps) {
    this.setState(this.audioStartEnd(nextProps));
  }
  onAudioPosition(position) {
    var conversation = this.props.convoElement.conversation;
    // Special case: if we are at very end or beginning; we aren't active.
    if (position <= (1000 * conversation[0].audioStart) ||
        position >= (1000 * conversation[conversation.length-1].audioEnd)) {
      this.setState({ activeLineIndex: undefined });
      return;
    }
    // We are active, find which line is active.
    for(var i=0; i < conversation.length; i++) {
      // start searching forward from current activeLineIndex
      var searchIdx = (i + (this.state.activeLineIndex || 0)) % conversation.length;
      var line = conversation[searchIdx];
      var start = 1000 * line.audioStart;
      var end = 1000 * line.audioEnd;
      // If the position is between linestart and lineend, set activeLineIndex
      if (position <= end & position >= start) {
        this.setState({ activeLineIndex: searchIdx });
        return;
      }
    }
    // We couldn't find the audio position, which means its in between lines.
    // if (i == conversation.length) { //NO ACTION, leave activeLineIndex be}
  }
  render() {
    var {mode, convoElement} = this.props;
    var {title, conversation} = convoElement;
    /* Display lines */
    var activeLineIndex = this.state.activeLineIndex;
    var lines = conversation.map(function(line, index) {
      var side = (index % 2) ? "right" : "left";
      var active = (index === activeLineIndex) ? "active" : ""
      return <SingleLine key={index} active={active}
                         mode={mode} line={line} side={side} />
    });
    /* Audio Details */
    var onFinished = () => { this.setState({renderNext: true}); };
    var sound = (!audioMode(this.props)) ? <div/> :
      <SoundSprite
        hidePlayPause={this.state.renderNext}
        audioStart ={this.state.audioStart}
        audioEnd={this.state.audioEnd}
        audio_url={this.props.audio_url}
        onPlaying={this.onAudioPosition}
        onFinishedPlaying={onFinished} />
    /* Next button */
    var onNext = () => {
      this.setState({renderNext: false});
      this.props.onFinishedPlaying();
    }
    var next = this.state.renderNext ?
      <button className="next" onClick={onNext}> Next </button> : "";
    return(
      <div className="single-conversation">
        <div className="conversation-title"> <h4> {title} </h4> </div>
        {lines}
        {sound}
        {next}
      </div>
    )
  }
}

/* AllConversationsViewer manages which conversation we are viewing,
 * and the MODE in which we are viewing each conversation. */
class AllConversationsViewer extends Component {
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
    var numConversations = this.props.conversations.length;
    var prevNext = (this.state.mode !== SCRIPT_MODES.TEXT) ? <div/> :
      <div className="controls">
        <button onClick={() => this.changeConversation(-1)} > Prev </button>
        <button onClick={() => this.changeConversation(+1)} > Next </button>
      </div>;
    return(
      <div className="all-conversations">
        <div className="pagination">
          #{this.state.conversationIndex + 1} / {numConversations}
        </div>
        <ConversationViewer
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
