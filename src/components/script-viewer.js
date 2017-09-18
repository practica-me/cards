import React, { Component } from 'react';
import SoundSprite from './sound-sprite.js';
import SCRIPT_MODES from '../consts.js';
import T from 'prop-types';
import './script-viewer.css';

function audioMode(props) {
  return (props.mode === SCRIPT_MODES.AUDIO ||
          props.mode === SCRIPT_MODES.TITLE_AUDIO ||
          props.mode === SCRIPT_MODES.AUDIO_AND_TEXT);
}

/* Single Line component. Just renders ---- or real text depending on mode. */
class SingleLine extends Component {
  static propTypes = {
    audio_url: T.string.isRequired,
    mode: T.oneOf(Object.keys(SCRIPT_MODES)).isRequired,
    line: T.shape({
      text: T.string.isRequired,
      audioStart: T.number.isRequired,
      audioEnd: T.number.isRequired
    }),
    index: T.number.isRequired,
    active: T.bool,
    playing: T.bool,
    onDone: T.func
  };
  render() {
    var {text, audioStart, audioEnd} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    var side = (this.props.index % 2) ? "right" : "left";
    var cls = ["line", side, (this.props.active ? "active" : ""),
               (audioMode(this.props) ? "audio" : "")].join(" ");
    var txt = (this.props.mode === SCRIPT_MODES.TEXT ||
      this.props.mode === SCRIPT_MODES.AUDIO_AND_TEXT) ? text :
      this.props.mode === SCRIPT_MODES.AUDIO ? dotted : "";
    return (
        <div className={cls}>
          {txt}
          <SoundSprite
              playing={this.props.active}
              hidePlayPause={true}
              audioStart={audioStart}
              audioEnd={audioEnd}
              audio_url={this.props.audio_url}
              onFinishedPlaying={this.props.onDone} />
        </div>
    );
  }
}

class ConversationViewerControl extends Component {
  static propTypes = {
    onPlay: T.func.isRequired,
    onReplay: T.func,
    onPause: T.func.isRequired,
    onNext: T.func.isRequired,
    playing: T.bool.isRequired,
    played: T.bool
  };
  render() {
    var btnGen = function (cls, onClk, txt) {
      return <button className={cls} onClick={onClk}> {txt} </button>;
    }
    var next = btnGen("next", this.props.onNext, "Next");
    var replayFn = this.props.onReplay ? this.props.onReplay : this.props.onPlay;
    var replay = btnGen("playpause replay", replayFn, "Replay");
    var pause = btnGen("playpause pause", this.props.onPause, "Pause");
    var play = btnGen("playpause play", this.props.onPlay, "Play");
    if (this.props.played) {
      return <div className="controls"> {next} {replay} </div>
    } else {
      return (
        <div className="controls">
          {this.props.playing ? pause : play }
        </div>
      );
    }
  }
}

/* ConversationViewer renders an SoundSprite to play audio from start to end,
 * which are mode dependent.
 * Also, keeps track of activeLineIndex based on audio position. */
class ConversationViewer extends Component {
  constructor(props) {
    super(props);
    var defaultIdx = (props.mode === SCRIPT_MODES.TITLE_AUDIO) ?
                      props.convoElement.title.lineIndexInConversation : 0;
    this.state = {activeLineIndex: defaultIdx, defaultLineIndex: defaultIdx,
                  playing: false, allPlayed: false};
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      var defaultIdx = (nextProps.mode === SCRIPT_MODES.TITLE_AUDIO) ?
                        nextProps.convoElement.title.lineIndexInConversation : 0;
      this.setState({defaultLineIndex: defaultIdx});
    }
  }
  render() {
    var _this = this;
    var {mode, convoElement, audio_url} = this.props;
    var {title, conversation} = convoElement;
    /* Audio Details */
    var onLinePlayed = () => {
      var activeLineIndex = _this.state.activeLineIndex;
      var conversation = _this.props.convoElement.conversation;
      if (this.props.mode === SCRIPT_MODES.TITLE_AUDIO) {
        _this.setState({playing: false, allPlayed: true});
      } else if (activeLineIndex >= 0 && activeLineIndex < conversation.length - 1) {
        _this.setState({activeLineIndex: activeLineIndex + 1, playing: false});
      } else {
        _this.setState({allPlayed: true, playing: false,
                        activeLineIndex: this.state.defaultLineIndex});
      }
    }
    /* Display lines */
    var activeLineIndex = this.state.activeLineIndex;
    var lines = conversation.map(function(line, index) {
      var active = _this.state.playing && (index === activeLineIndex);
      return <SingleLine
                  key={index} active={active} index={index}
                  mode={mode} audio_url={audio_url} line={line}
                  onDone={onLinePlayed} />
    });
    /* Next button */
    var onNext = () => {
      this.setState({activeLineIndex: 0, playing: false, allPlayed: false});
      this.props.onFinishedPlaying();
    }
    var play = () => this.setState({playing: true});
    var pause = () => this.setState({playing: false});
    var replay = () => this.setState({playing: true, allPlayed: false,
      activeLineIndex: this.state.defaultLineIndex});
    return(
      <div className={"single-conversation"}>
        <div className="conversation-title">
          <div className="bold"> {title.text} </div>
        </div>
        <div className="lines">
          {lines}
        </div>
        <ConversationViewerControl
          onPlay={play} onPause={pause} onReplay={replay} onNext={onNext}
          playing={this.state.playing} played={this.state.allPlayed} />
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
