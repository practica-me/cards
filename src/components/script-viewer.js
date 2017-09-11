import React, { Component } from 'react';
import Sound from 'react-sound';

import conversations from '../data/short_replies.json';
import './script-viewer.css';
import SCRIPT_MODES from '../consts.js';

class SingleLine extends Component {
  render() {
    var cls = "line " + this.props.side;
    var {text} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    if (this.props.mode === SCRIPT_MODES.TEXT) {
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
      playing: false,
      audioStart: 1000 * conversation[0].audioStart ,
      audioEnd: 1000 * conversation[conversation.length - 1].audioEnd
    };
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    var {conversation} = nextProps.convoElement;
    this.setState({
      audioStart: 1000 * conversation[0].audioStart ,
      audioEnd: 1000 * conversation[conversation.length - 1].audioEnd
    });
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
    var lines = conversation.map(function(line, index) {
      var side = (index % 2) ? "right" : "left";
      return <SingleLine key={index} mode={mode} line={line} side={side} />
    });
    var sound = <div/>;
    if (this.props.audio_url && this.props.mode === SCRIPT_MODES.AUDIO) {
      var onPlaying = (obj) => {
        var {position} = obj;
        if (position > _this.state.audioEnd) _this.pause();
      };
      sound = <Sound
                url={this.props.audio_url}
                autoLoad={true}
                playStatus={this.state.playing ? Sound.status.PLAYING : Sound.status.PAUSED}
                playFromPosition={this.state.audioStart}
                onPlaying={onPlaying}
              />
    }
    var playOrPause = this.state.playing ?
      <button onClick={this.pause}> Pause </button> :
      <button onClick={this.play}> Play </button>;
    return(
      <div className="single-conversation">
        <div className="conversation-title"> <h4> {title} </h4> </div>
        {lines}
        {sound}
        {this.props.mode === SCRIPT_MODES.AUDIO ? playOrPause : ""}
      </div>
    )
  }
}

class AllConversationsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversationIndex: 0
    }
    this.getActiveConvo = this.getActiveConvo.bind(this);
    this.changeConversation = this.changeConversation.bind(this);
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
  render() {
    var numConversations = this.props.conversations.length;
    return(
      <div className="all-conversations">
        <div className="pagination">
          #{this.state.conversationIndex + 1} / {numConversations}
        </div>
        <ConversationViewer
          convoElement={this.getActiveConvo()}
          mode={this.props.mode}
          audio_url={this.props.audio_url} />
        {(this.state.conversationIndex > 0) ?
          <button onClick={() => this.changeConversation(-1)} > Prev </button> : ""}
        {(this.state.conversationIndex < numConversations) ?
          <button onClick={() => this.changeConversation(+1)} > Next </button> : ""}
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
