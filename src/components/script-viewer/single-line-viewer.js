import React, { Component } from 'react';
import MODES from './consts.js';
import SoundSprite from '../../lib/sound-sprite.js';
import T from 'prop-types';

function audioMode(props) {
  return (props.mode === MODES.TitleMode ||
          props.mode === MODES.Recording ||
          props.mode === MODES.Reviewing ||
          props.mode === MODES.Listening);
}

/* Single Line component. Just renders ---- or real text depending on mode. */
export default class SingleLineViewer extends Component {
  static propTypes = {
    audioUrl: T.string.isRequired,
    mode: T.oneOf(Object.keys(MODES)).isRequired,
    line: T.shape({
      text: T.string.isRequired,
      audioStart: T.number.isRequired,
      audioEnd: T.number.isRequired
    }),
    index: T.number.isRequired,
    highlight: T.string, // paused, playing, or recording
    playing: T.bool,
    invisible: T.bool,
    onDone: T.func
  };
  render() {
    var {text, audioStart, audioEnd} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    var side = (this.props.index % 2) ? "right" : "left";
    var cls = ["line", side, this.props.highlight,
               (this.props.invisible ? "hidden" : ""),
               (audioMode(this.props) ? "audio" : "")].join(" ");
    var txt = this.props.mode === MODES.Listening ? dotted : text;
    /* If this.props.playing is used, that sets playing. Else, use active */
    var isPlaying = ("playing" in this.props ? this.props.playing : this.props.active);
    return (
        <div className={cls}>
          {txt}
          {/* NOTE: Rendering more than one SoundSprite is super buggy on Android\Chrome */}
          {this.props.playing ?
            <SoundSprite
              playing={isPlaying}
              hidePlayPause={true}
              audioStart={audioStart}
              audioEnd={audioEnd}
              audioUrl={this.props.audioUrl}
              onFinishedPlaying={this.props.onDone} /> :
            ""}
        </div>
    );
  }
}
