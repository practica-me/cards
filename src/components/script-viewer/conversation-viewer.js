import React, { Component } from 'react';
import SCRIPT_MODES from './consts.js';
import T from 'prop-types';
import SingleLineViewer from './single-line-viewer.js'

class ConversationViewerControl extends Component {
  static propTypes = {
    onPlay: T.func.isRequired,
    onReplay: T.func,
    onPause: T.func.isRequired,
    onNext: T.func.isRequired,
    playing: T.bool.isRequired,
    waitingToPlay: T.bool,
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
export default class ConversationViewer extends Component {
  constructor(props) {
    super(props);
    var defaultIdx = (props.mode === SCRIPT_MODES.TITLE_AUDIO) ?
                      props.convoElement.title.lineIndexInConversation : 0;
    this.state = {activeLineIndex: defaultIdx,
                  defaultLineIndex: defaultIdx,
                  pauseLength: 1000,
                  playing: false,
                  allPlayed: false};
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
    /* What should you do when each line is played? */
    var onLinePlayed = () => {
      var activeLineIndex = _this.state.activeLineIndex;
      var {conversation, title} = _this.props.convoElement;
      /* If this is the title audio, each line is the whole thing. */
      if (_this.props.mode === SCRIPT_MODES.TITLE_AUDIO) {
        if (activeLineIndex !== title.lineIndexInConversation) {
          _this.setState({activeLineIndex: _this.state.defaultLineIndex});
        } else {
          _this.setState({playing: false, allPlayed: true});
        }
      /* Otherwise, we played something before the last line: add a Pause and keep playing. */
      } else if (activeLineIndex >= 0 && activeLineIndex < conversation.length - 1) {
        _this.setState({activeLineIndex: activeLineIndex + 1,
                        playing: false,
                        waitingToPlay: true,});
        setTimeout(() => {
          if (_this.state.waitingToPlay)
            _this.setState({playing: true, waitingToPlay: false})
        }, this.state.pauseLength);
      /* We played the last line: allPlayed is true */
      } else {
        _this.setState({allPlayed: true, playing: false,
                        activeLineIndex: _this.state.defaultLineIndex});
      }
    }
    /* Display lines */
    var activeLineIndex = this.state.activeLineIndex;
    var lines = conversation.map(function(line, index) {
      var active = _this.state.playing && (index === activeLineIndex);
      return <SingleLineViewer
                  key={index} active={active} index={index}
                  mode={mode} audio_url={audio_url} line={line}
                  onDone={onLinePlayed} />
    });
    /* Next button */
    var onNext = () => {
      this.setState({activeLineIndex: this.state.defaultLineIndex,
                     playing: false,
                     allPlayed: false});
      this.props.onFinishedPlaying();
    }
    var play = () => this.setState({playing: true, waitingToPlay: false});
    var pause = () => this.setState({playing: false, waitingToPlay: false});
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
          onPlay={play}
          onPause={pause}
          onReplay={replay}
          onNext={onNext}
          playing={this.state.playing}
          waitingToPlay={this.state.waitingToPlay}
          played={this.state.allPlayed} />
      </div>
    )
  }
}
