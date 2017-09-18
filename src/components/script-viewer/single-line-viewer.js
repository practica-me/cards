import React, { Component } from 'react';
import SCRIPT_MODES from './consts.js';
import SoundSprite from '../../lib/sound-sprite.js';
import T from 'prop-types';

function audioMode(props) {
  return (props.mode === SCRIPT_MODES.AUDIO ||
          props.mode === SCRIPT_MODES.TITLE_AUDIO ||
          props.mode === SCRIPT_MODES.AUDIO_AND_TEXT);
}

/* Single Line component. Just renders ---- or real text depending on mode. */
export default class SingleLineViewer extends Component {
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
