import React, { Component } from 'react';
import MODES from './consts.js';
import T from 'prop-types';
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
  };
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
    this.renderBodyForTitleMode = this.renderBodyForTitleMode.bind(this);
    this.renderLines = this.renderLines.bind(this);
    this.renderControls = this.renderControls.bind(this);
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.mode !== this.props.mode) {
      this.setState({activeLineIndex: this.defaultIndex(nextProps),
                     waitingToRecord: this.recordMode(nextProps)});
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
      case MODES.Listening:
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
      var active = (_this.state.waitingToRecord || _this.state.playing) && onCurrentLine;
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
                active={active}
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
    var onPlay = () => this.setState({playing: true, waitingToPlay: false});
    var onPause = () => this.setState({playing: false, waitingToPlay: false});
    /* Replay: playing or waitingToRecord depending on mode,
     * allPlayed set to false and activeLineIndex is reset */
    var onReplay = () => this.setState({
      playing: !this.recordMode(), waitingToRecord: this.recordMode(),
      allPlayed: false, activeLineIndex: this.defaultIndex()});
    /* Next button: reset allPlayed, waitingToRecord if in recording mode. */
    var onNext = () => {
      this.setState({allPlayed: false, waitingToRecord: this.recordMode()});
      this.props.onFinishedPlaying();
    }
    /* Define all the buttons */
    var btnGen = function (cls, onClk, txt) {
      return <button className={cls} onClick={onClk}> {txt} </button>;
    }
    var play = btnGen("playpause play", onPlay, "Play");
    var pause = btnGen("playpause pause", onPause, "Pause");
    var replay = btnGen("playpause replay", onReplay, "Replay");
    var next = btnGen("next", onNext, "Next");
    var cont = btnGen("playpause continue", this.onLinePlayed, "Continue");
    if (this.state.allPlayed) {
      return <div className="controls"> {replay} {next} </div>
    } else if (this.state.waitingToRecord) {
      return (
        <div className="controls">
          Your turn to speak! {cont}
        </div>
      );
    } else {
      return (
        <div className="controls">
          {this.state.playing || this.state.waitingToPlay ? pause : play }
        </div>
      );
    }
  }
  render() {
    var {title} = this.props.convoElement;
    var cardTitle =
      (this.props.mode === MODES.TitleMode) ? "Explanation" :
      (this.props.mode === MODES.Listening) ? "Listening Practice" :
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
