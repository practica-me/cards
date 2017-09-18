import React, { Component } from 'react';
import Sound from './react-sound-plus.js';
import T from 'prop-types';

class SoundSprite extends Component {
  static propTypes = {
    audio_url: T.string.isRequired,
    allowPausing: T.bool,
    audioStart: T.number.isRequired,
    audioEnd: T.number.isRequired,
    onFinishedPlaying: T.func.isRequired,
    playing: T.bool,
    resetPosition: T.bool
  };
  constructor(props) {
    super(props);
    this.state = {position: props.audioStart, playing: props.playing,
                  loaded: false, played: false, errorMsg: undefined};
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    // if audio_url changes reset everything
    if (nextProps.audio_url !== this.props.audio_url) {
      this.setState({position: nextProps.audioStart, playing: nextProps.playing,
                    loaded: false, played: false, errorMsg: undefined});
    }
    // If a new audioStart comes in, its new audio: reset position + played
    if (nextProps.audioStart !== this.props.audioStart) {
      this.setState({position: nextProps.audioStart, played: false});
    }
    // Allow state.playing to be changed if prop changes from above
    if ('playing' in nextProps && nextProps.playing !== this.state.playing) {
      if (this.props.allowPausing) {
        this.setState({playing: nextProps.playing});
      } else {
        this.setState({playing: nextProps.playing, position: this.props.audioStart});
      }
    }
  }
  play() {
    if (this.props.allowPausing) {
      this.setState({playing: true});
    } else {
      this.setState({playing: true, position: this.props.audioStart});
    }
  }
  pause() {
    this.setState({playing: false})
  }
  render() {
    var _this = this;
    var onLoad = (obj) => {
      if (obj.readyState < 3) { // soundmanager-2: readyState = 3 => loaded
        this.setState({errorMsg: "Sound not loaded :( :(", loaded: false})
      } else {
        this.setState({loaded: true, errorMsg: ''})
      }
      console.log("Sound loaded!")
    }
    var onEnd = (pos) => {
      var newPosition = (this.props.resetPosition ? {position: this.props.audioStart} : {});
      this.setState(Object.assign({playing: false, played: true}, newPosition));
      this.props.onFinishedPlaying();
    }
    var onPlaying = (o) => {
      this.setState({position: o.position});
      if (this.props.onPlaying) this.props.onPlaying(o.position);
    }
    var onPause = (o) => { this.setState({position: o.position}); };
    var rePlay = (this.state.played) ? "replay" : "play";
    var playOrPause = this.props.hidePlayPause ? "" : (this.state.playing ?
     <button className="playpause pause" onClick={this.pause}>
      {this.props.pauseText || "Pause"} </button> :
     <button className={"playpause " + rePlay} onClick={this.play}>
      {this.props.playText || rePlay} </button>);
    return(
      <div className="sound-sprite">
        {this.state.errorMsg}
        {(this.state.loaded ? playOrPause : "Loading audio...")}
        <Sound url={this.props.audio_url}
               autoLoad={true}
               playStatus={this.state.playing ? Sound.status.PLAYING : Sound.status.PAUSED}
               onLoad={onLoad}
               onPosition={this.props.audioEnd}
               onPositionCallBack={onEnd}
               onPause={onPause}
               onPlaying={onPlaying}
               position={this.state.position} />
      </div>
    );
  }
}
export default SoundSprite;
