import React, { Component } from 'react';
import Sound from 'react-sound';

class SoundSprite extends Component {
  constructor(props) {
    super(props);
    /* TODO: Replace with PropTypes */
    var required_keys = ['audio_url', 'audioStart', 'audioEnd', 'onFinishedPlaying', 'playing'];
    required_keys.forEach((key) => {
      if(!key in this.props)
        console.error("Missing required key", key, 'in props', this.props);
    });
    this.state = {position: props.audioStart, playing: props.playing};
  }
  componentWillReceiveProps(nextProps) {
    // Allow state.playing to be change on propchange
    if (nextProps.playing != this.state.playing) {
      this.setState({playing: nextProps.playing});
    }
    // If a new audio Start comes in, reset the position
    if (nextProps.audioStart != this.props.audioStart) {
      this.setState({position: nextProps.audioStart});
    }
  }
  render() {
    var _this = this;
    var onPlaying = (obj) => {
      var {position} = obj;
      // If finished, reset position to the start of sprite, and pause playing
      if (position > _this.props.audioEnd) {
        this.setState({playing: false, position: this.props.audioStart});
        this.props.onFinishedPlaying();
      } else {
      // If not, update position; this is a controlled component
        this.setState({position: position});
      }
    }
    return(
      <Sound url={this.props.audio_url}
             autoLoad={true}
             playStatus={this.state.playing ? Sound.status.PLAYING : Sound.status.PAUSED}
             position={this.state.position}
             onPlaying={onPlaying} />
    );
  }
}
export default SoundSprite;
