import React, { Component } from 'react';
import Sound from './react-sound-plus.js';
import T from 'prop-types';
import {Icon} from 'react-fa';

class SoundSprite extends Component {
  static propTypes = {
    audioUrl: T.string.isRequired,
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
    // if audioUrl changes reset everything
    if (nextProps.audioUrl !== this.props.audioUrl) {
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
    var onLoad = (obj) => {
      if (obj.readyState < 3) { // soundmanager-2: readyState = 3 => loaded
        var loading = <Icon name="spinner" pulse={true} />
        var msgs = [<div className="error"> "Sound unitialized :( Please let your coach know!" </div>,
                    <div className="warning"> {loading} "Loading ..." </div>,
                    <div className="error"> "Sound loading ERROR :( Please let your coach know!" </div>]
        this.setState({errorMsg: msgs[obj.readyState], loaded: false})
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
    var playOrPause =
     this.state.playing ?
      <button className="playpause pause" onClick={this.pause}>
        {this.props.pauseText || "Pause"} </button> :
      <button className={"playpause " + rePlay} onClick={this.play}>
        {this.props.playText || rePlay} </button>;
    return(
      <div className="sound-sprite">
        {this.state.errorMsg}
        {this.props.hidePlayPause ? "" :
          (!this.state.loaded) ? "Loading audio..." : playOrPause}
        <Sound url={this.props.audioUrl}
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
