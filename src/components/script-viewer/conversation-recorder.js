import React, { Component } from 'react';
import SCRIPT_MODES from './consts.js';
import T from 'prop-types';
import SingleLineViewer from './single-line-viewer.js';
import SoundSprite from '../../lib/sound-sprite.js';

class ConversationRecorderControl extends Component {
  static propTypes = {
    onPlay: T.func.isRequired,
    onReplay: T.func,
    onPause: T.func.isRequired,
    onNext: T.func.isRequired,
    playing: T.bool.isRequired,
    waitingToPlay: T.bool,
    onContinue: T.func.isRequired,
    waitingToRecord: T.bool,
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
      return <div className="controls"> {replay} {next} </div>
    } else if (this.props.waitingToRecord) {
      return (
        <div className="controls">
          Your turn to speak!
          {btnGen("playpause continue", this.props.onContinue, "Continue")}
        </div>
        );
    } else {
      return (
        <div className="controls">
          {this.props.playing || this.props.waitingToPlay ? pause : play }
        </div>
      );
    }
  }
}

/* ConversationViewer renders an SoundSprite to play audio from start to end,
 * which are mode dependent.
 * Also, keeps track of activeLineIndex based on audio position. */
export default class ConversationRecorder extends Component {
  constructor(props) {
    super(props);
    this.state = {pauseLength: 1000,
                  activeLineIndex: this.defaultIndex(props),
                  waitingToRecord: this.recordMode(props),
                  playing: false,
                  allPlayed: false};
    this.defaultIndex = this.defaultIndex.bind(this);
    this.recordMode = this.recordMode.bind(this);
    this.onLinePlayed = this.onLinePlayed.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderBodyForTitleMode = this.renderBodyForTitleMode.bind(this);
  }
  /* DefaultIndex: special only if we are in title audio mode. */
  defaultIndex(optionalProps) {
    var props = optionalProps || this.props;
    return props.mode === SCRIPT_MODES.TITLE_AUDIO ?
           props.convoElement.title.lineIndexInConversation : 0;
  }
  /* recordMode: only when we are in recording mode. */
  recordMode(optionalProps) {
    var props = optionalProps || this.props;
    return props.mode === SCRIPT_MODES.AUDIO_AND_TEXT;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      this.setState({activeLineIndex: this.defaultIndex(nextProps),
                     waitingToRecord: this.recordMode(nextProps)});
    }
  }
  onLinePlayed() {
    var {conversation} = this.props.convoElement;
    var activeLineIndex = this.state.activeLineIndex;
    var isFinal = (activeLineIndex >= conversation.length - 1);
    switch (this.props.mode) {
      /* For audio mode, just reset to be ready to play again. */
      case SCRIPT_MODES.TITLE_AUDIO:
        this.setState({playing: false, allPlayed: true});
        return;
      /* For record mode, depends on whether user spoke, audio played, or we finished. */
      case SCRIPT_MODES.AUDIO_AND_TEXT:
        console.log(activeLineIndex, isFinal, this.state);
        if (isFinal) { // got to the end of the script, just display everything
          this.setState({activeLineIndex: this.defaultIndex(),
                         allPlayed: true, playing: false});
        } else if (this.state.waitingToRecord) { // user recorded something, play next line
          this.setState({activeLineIndex: activeLineIndex + 1,
                         playing: true, waitingToRecord: false});
        } else { // user just heard something, wait to record the next one
          this.setState({activeLineIndex: activeLineIndex + 1,
                         playing: false, waitingToRecord: true});
        }
        return;
      /* For audio mode, depends on whether a final or non-final line played. */
      case SCRIPT_MODES.AUDIO:
        if (!isFinal) {
          // wait for pauseLengthe, and play the next line
          this.setState({activeLineIndex: activeLineIndex + 1,
                         playing: false, waitingToPlay: true});
          setTimeout(() => {
            if (this.state.waitingToPlay)
              this.setState({playing: true, waitingToPlay: false});
          }, this.state.pauseLength);
        } else {
          // set allPlayed to true, reset activeLineIndex, not much else
          this.setState({allPlayed: true,
                         playing: false,
                         activeLineIndex: this.defaultIndex()});
        }
        return;
      default:
        console.error("UNSUPPORTED MODE!!!", this.props.mode);
    }
  }
  renderLines() {
    var _this = this;
    var {conversation} = this.props.convoElement;
    var lines = conversation.map(function(line, index) {
      var activeLineIndex = _this.state.activeLineIndex;
      var onCurrentLine = !_this.state.allPlayed && (index === activeLineIndex);
      var playing = _this.state.playing && onCurrentLine;
      var active = (_this.state.waitingToRecord || _this.state.playing) && onCurrentLine;
      /* In recording mode, before everything is played, all but activeLine is visible. */
      var invisible = false;
      if (_this.props.mode === SCRIPT_MODES.AUDIO_AND_TEXT &&
          !_this.state.allPlayed && !onCurrentLine) {
        invisible = true;
      }
      return <SingleLineViewer
                invisible={invisible}
                playing={playing}
                key={index}
                active={active}
                index={index}
                mode={_this.props.mode}
                audio_url={_this.props.audio_url}
                line={line}
                onDone={_this.onLinePlayed} />
    });
    return lines;
  }
  renderBodyForTitleMode() {
    var {title, usage} = this.props.convoElement;
    return (
        <div className="title-mode-body">
          <div className="usage"> {usage} </div>
          <SoundSprite
            playing={this.state.playing}
            hidePlayPause={true}
            audioStart={title.audioStart}
            audioEnd={title.audioEnd}
            audio_url={this.props.audio_url}
            onFinishedPlaying={this.onLinePlayed} />
        </div>
    );
  }
  render() {
    var _this = this;
    var {title} = this.props.convoElement;
    /* Next button */
    var onNext = () => {
      console.log("Next button clicked");
      // Note: not setting activeLineIndex here intentionally. See note "Bugfix"
      this.setState({playing: false,
                     allPlayed: false,
                     waitingToRecord: _this.recordMode()}, () => console.log(this.state));
      this.props.onFinishedPlaying();
    }
    var play = () => this.setState({playing: true, waitingToPlay: false});
    var pause = () => this.setState({playing: false, waitingToPlay: false});
    var replay = () => this.setState({
      playing: !this.recordMode(),
      waitingToPlay: false,
      waitingToRecord: this.recordMode(),
      allPlayed: false,
      activeLineIndex: this.defaultIndex()});
    return(
      <div className={"single-conversation"}>
        <div className="conversation-title">
          <div className="bold"> {title.text} </div>
        </div>
        <div className="lines">
        {this.props.mode === SCRIPT_MODES.TITLE_AUDIO ?
          this.renderBodyForTitleMode() :
          this.renderLines()}
        </div>
        <ConversationRecorderControl
          onPlay={play}
          onPause={pause}
          onReplay={replay}
          onNext={onNext}
          onContinue={this.onLinePlayed}
          waitingToRecord={this.state.waitingToRecord}
          playing={this.state.playing}
          waitingToPlay={this.state.waitingToPlay}
          played={this.state.allPlayed} />
      </div>
    )
  }
}
