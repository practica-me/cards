import React, { Component } from 'react';
import SoundSprite from './sound-sprite.js';
import SCRIPT_MODES from '../consts.js';
import conversations from '../data/short_replies.json';
import './script-viewer.css';

class SingleLine extends Component {
  render() {
    var cls = "line " + this.props.side;
    var {text} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    if (this.props.mode === SCRIPT_MODES.TEXT ||
        this.props.mode === SCRIPT_MODES.AUDIO_AND_TEXT) {
      return(
        <div className={"line " + this.props.side}>
          {text}
        </div>
      );
    } else if (this.props.mode === SCRIPT_MODES.AUDIO) {
      return(
        <div className={"audio line " + this.props.side}>
          {dotted}
        </div>
      );
    } else {
      console.error("MODE", this.props.mode, "not yet supported");
      return (<div/>);
    }
  }
}

class ConversationViewer extends Component {
  constructor(props) {
    super(props);
    var {conversation} = props.convoElement;
    this.state = {
      playing: false
    };
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.audioMode = this.audioMode.bind(this);
  }
  updateStartAndEnd(props) {
    var {mode, convoElement} = props;
    var {title, conversation} = convoElement;
    this.setState({
      audioStart: 1000 * conversation[0].audioStart,
      audioEnd: 1000 * conversation[conversation.length - 1].audioEnd
    })
  }
  componentWillReceiveProps(nextProps) {
    this.updateStartAndEnd(nextProps);
  }
  audioMode() {
    return (this.props.mode === SCRIPT_MODES.AUDIO ||
            this.props.mode === SCRIPT_MODES.AUDIO_AND_TEXT);
  }
  play() {
    this.setState({playing: true});
  }
  pause() {
    this.setState({playing: false});
  }
  render() {
    var _this = this;
    var {mode, convoElement} = this.props;
    var {title, conversation} = convoElement;
    /* Display lines */
    var lines = conversation.map(function(line, index) {
      var side = (index % 2) ? "right" : "left";
      return <SingleLine key={index} mode={mode} line={line} side={side} />
    });
    /* Audio Details */
    var onFinished = () => { this.pause(); this.props.onFinishedPlaying(); }
    var sound = (!this.audioMode()) ? <div/> :
      <SoundSprite
        audioStart ={this.state.audioStart}
        audioEnd={this.state.audioEnd}
        audio_url={this.props.audio_url}
        playing={this.state.playing}
        onFinishedPlaying={onFinished} />
    var playOrPause = this.state.playing ?
      <button onClick={this.pause}> Pause </button> :
      <button onClick={this.play}> Play </button>;
    return(
      <div className="single-conversation">
        <div className="conversation-title"> <h4> {title} </h4> </div>
        {lines}
        {sound}
        {this.audioMode() ? playOrPause : ""}
      </div>
    )
  }
}

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
    // If mode == AUDIO, change mode to AUDIO_AND_TEXT
    // If mode == AUDIO_AND_TEXT, change mode to AUDIO and changeConversation
    if (this.state.mode === SCRIPT_MODES.AUDIO) {
      this.setState({mode: SCRIPT_MODES.AUDIO_AND_TEXT});
    } else if (this.state.mode === SCRIPT_MODES.AUDIO_AND_TEXT) {
      this.setState({mode: SCRIPT_MODES.AUDIO});
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
