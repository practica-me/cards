import React, { Component } from 'react';
import MODES from './consts.js';
import T from 'prop-types';
import {Icon} from 'react-fa';
import SingleLineViewer from './single-line-viewer.js';
import SoundSprite from '../../lib/sound-sprite.js';

/* ConversationViewer renders an SoundSprite to play audio from start to end,
 * which are mode dependent.
 * Also, keeps track of activeLineIndex based on audio position. */
export default class ConversationRecorder extends Component {
  static propTypes = {
    mode: T.oneOf(Object.keys(MODES)).isRequired,
    audio_url: T.string.isRequired,
    convoElement: T.shape({
      title: T.object.isRequired,
      conversation: T.array.isRequired
    }).isRequired,
    next: T.func,
    prev: T.func
  };
  constructor(props) {
    super(props);
    this.state = this.defaultState(props);
    /* props -> state data convertors */
    this.defaultState = this.defaultState.bind(this);
    this.defaultIndex = this.defaultIndex.bind(this);
    this.recordMode = this.recordMode.bind(this);
    /* Monster logic, called on line change */
    this.onLinePlayed = this.onLinePlayed.bind(this);
    /* Sub-part of the component that depend heavily on state */
    this.renderBodyForTitleMode = this.renderBodyForTitleMode.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderControls = this.renderControls.bind(this);
  }
  /* ResetState: What the state should be at the beginning. */
  defaultState(optionalProps) {
    var props = optionalProps || this.props;
    return {
      // How long to pause between each speaker
      pauseLength: 1000,
      // Which line in conversation is active
      activeLineIndex: this.defaultIndex(props),
      // In recordMode, recording siganls either recording or pretending to record,
      // depending on whether browser actually supports recording
      recording: false,
      // Controls whether audio (corresponding to activeLineIndex) is playing.
      playing: false, // Controls
      // allPlayed is once all the lines for one conversation have been played
      allPlayed: false,
      // startedPlaying is off in the very beginning, before any of the lines are played
      startedPlaying: false,
      // waitingToPlay is on in between lines, on a short timer
      waitingToPlay: false,
    }
  }
  /* DefaultIndex: special only if we are in title audio mode. */
  defaultIndex(optionalProps) {
    var props = optionalProps || this.props;
    return props.mode === MODES.TitleMode ?
           props.convoElement.title.lineIndexInConversation : 0;
  }
  /* recordMode: only when we are in recording mode. */
  recordMode(optionalProps) {
    var props = optionalProps || this.props;
    return props.mode === MODES.Recording;
  }
  /* onRecordingLine: are we actively on a line that should be user-spoken? */
  onRecordingLine(optionalProps) {
    var props = optionalProps || this.props;
    return this.recordMode(props) && ((this.state.activeLineIndex %2) === 0);
  }
  componentWillReceiveProps(nextProps) {
    // If mode or conversation is changed, completely reset the state
    if (nextProps.mode !== this.props.mode ||
        nextProps.convoElement.title.text !== this.props.convoElement.title.text) {
      this.setState(this.defaultState(nextProps));
    }
  }
  /* The big callback to be called everytime a line gets "played"
   * or someone hits continue (which is treated as the equivalent). */
  onLinePlayed() {
    var {conversation} = this.props.convoElement;
    var activeLineIndex = this.state.activeLineIndex;
    var isFinal = (activeLineIndex >= conversation.length - 1);
    switch (this.props.mode) {
      /* For audio mode, just reset to be ready to play again. */
      case MODES.TitleMode:
        this.setState({playing: false, allPlayed: true});
        return;
      /* For record mode, depends on whether user spoke, audio played, or we finished. */
      case MODES.Recording:
        if (activeLineIndex === 0) {
          this.setState({startedPlaying: true});
        }
        if (isFinal) { // got to the end of the script, just display everything
          this.setState({activeLineIndex: this.defaultIndex(),
                         allPlayed: true, playing: false});
        } else if (this.state.recording) { // user recorded something, play next line
          this.setState({activeLineIndex: activeLineIndex + 1,
                         playing: true, recording: false});
        } else { // user just heard something, wait to record the next one
          this.setState({activeLineIndex: activeLineIndex + 1,
                         playing: false, recording: false});
        }
        return;
      /* For audio mode, depends on whether a final or non-final line played. */
      case MODES.Listening:
      case MODES.Reviewing:
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
  /* Render the script lines. SingleLineViewer takes care of rendering the sound object. */
  renderLines() {
    var _this = this;
    var {conversation} = this.props.convoElement;
    var lines = conversation.map(function(line, index) {
      var activeLineIndex = _this.state.activeLineIndex;
      var onCurrentLine = !_this.state.allPlayed && (index === activeLineIndex);
      var playing = _this.state.playing && onCurrentLine;
      var highlight = !onCurrentLine ? "" :
        (_this.state.recording ? "recording" :
          _this.state.allPlayed ? "" :
          (_this.state.playing || _this.state.waitingToPlay) ? "playing" : "paused");
      /* In recording mode, before everything is played, all but activeLine is visible. */
      var invisible = false;
      if (_this.props.mode === MODES.Recording &&
          !_this.state.allPlayed && !onCurrentLine) {
        invisible = true;
      }
      return <SingleLineViewer
                invisible={invisible}
                playing={playing}
                key={index}
                highlight={highlight}
                index={index}
                mode={_this.props.mode}
                audio_url={_this.props.audio_url}
                line={line}
                onDone={_this.onLinePlayed} />
    });
    return lines;
  }
  /* Render the body for title mode, which doesn't really display the lines. */
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
  renderControls() {
    /* play and pause overwrite waitingToPlay; user action overrides timer wait. */
    var onPlay = () => this.setState({playing: true, waitingToPlay: false,
                                      startedPlaying: true});
    var onPause = () => this.setState({playing: false, waitingToPlay: false});
    /* Replay: playing or recording depending on mode,
     * allPlayed set to false and activeLineIndex is reset */
    var onReplay = () => this.setState({
      playing: !this.recordMode(), recording: false,
      allPlayed: false, activeLineIndex: this.defaultIndex()});
    /* On Speak pressed: turn _recording on. */
    var onSpeak = () => {
      this.setState({recording: true});
    }
    /* Define all the buttons */
    var btnGen = function (cls, onClk, txt, icon) {
      return <button className={cls} onClick={onClk}>
                {icon ? <Icon name={icon} /> : ""} {txt}
             </button>;
    }
    var play = btnGen("play primary", onPlay, "Play", "play");
    var pause = btnGen("pause", onPause, "Pause", "pause");
    var replayText = (this.recordMode() ? "Redo" : "Replay");
    var replay = btnGen("replay", onReplay, replayText, "repeat");
    var next = this.props.next ?
      btnGen("next primary", this.props.next, "Next", "step-forward") : "";
    var stop = btnGen("recording", this.onLinePlayed, "Stop");
    var speak = btnGen("record", onSpeak, "Speak", "comment");
    var skip = (this.props.next && !this.state.startedPlaying) ?
      btnGen("minimal skip", this.props.next, "", "step-forward") :
      btnGen("minimal invisible", () => {}, "", "step-forward");
    var back = (this.props.prev && !this.state.startedPlaying) ?
      btnGen("minimal skip", this.props.prev, "", "step-backward") :
      btnGen("minimal invisible", () => {}, "", "step-backward");
    if (this.state.allPlayed) {
      return <div className="controls"> {replay} {next} </div>
    } else if (this.onRecordingLine()) {
      if (this.state.recording) {
        return <div className="controls"> {stop} </div>;
      } else {
        return <div className="controls"> {back} {speak} {skip} </div>;
      }
    } else {
      return (
        <div className="controls">
          {/* waitingToPlay is a minimal wait working off of the timer;
            * showing a play on that state causes flickering */}
          {back} {this.state.playing || this.state.waitingToPlay ? pause : play } {skip}
        </div>
      );
    }
  }
  render() {
    var {title} = this.props.convoElement;
    var cardTitle =
      (this.props.mode === MODES.TitleMode) ? "Explanation" :
      (this.props.mode === MODES.Listening) ? "Listening Practice" :
      (this.props.mode === MODES.Reviewing) ? "Review" :
      (this.props.mode === MODES.Recording) ? "Speaking Practice" : "";
    return(
      <div className={"single-conversation"}>
        <div className="conversation-title">
          <div className="subheader"> {cardTitle} </div>
          <div className="header"> {title.text} </div>
        </div>
        <div className="lines">
        {this.props.mode === MODES.TitleMode ?
          this.renderBodyForTitleMode() :
          this.renderLines()}
        </div>
        {this.renderControls()}
      </div>
    )
  }
}
