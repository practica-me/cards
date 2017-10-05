import React, { Component } from 'react';
import T from 'prop-types';
import {Icon} from 'react-fa';

import LessonViewer from './lesson-viewer.js';

export default class UnitViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {lessonIndex: 0, lessonStarted: false};
    this.renderArrow = this.renderArrow.bind(this);
  }
  static propTypes = {
    unit: T.object.isRequired,
  }
  // by default, we go Forward, unless, of course, goBackward is true
  renderArrow(goBackward) {
    var allLessons = this.props.unit.lessons;
    var lessonIndex = this.state.lessonIndex;
    var nextIndex = goBackward ? (lessonIndex - 1) : (lessonIndex + 1);
    var vizClass = "";
    if (nextIndex < 0 || nextIndex >= allLessons.length) {
      nextIndex = lessonIndex;
      vizClass = "transparent"; // we don't want to render it but make the layout easy
    }
    var dirClass = goBackward ? "left" : "right";
    var nextLesson = allLessons[nextIndex];
    var icon = goBackward ? "chevron-left" : "chevron-right";
    var changeLesson = () => this.setState(
        {lessonIndex: nextIndex, lessonStarted: false});
    return(
      <div className={"arrow-block " + vizClass + " " + dirClass}>
        <button className="minimal arrow" onClick={changeLesson} >
          <Icon name={icon} />
        </button>
        <div className="next-lesson hidden-on-mobile hidden-on-phablet">
          Lesson {nextLesson.number}: <br/>
          {nextLesson.name}
        </div>
      </div>
    );
  }
  render() {
    var unit = this.props.unit;
    var lesson = unit.lessons[this.state.lessonIndex];
    return(
        <div className="unit">
          {this.state.lessonStarted ? "" : this.renderArrow(true)}
          <LessonViewer
            lesson={lesson}
            onLessonStarted={() => this.setState({lessonStarted: true})} />
          {this.state.lessonStarted ? "" : this.renderArrow(false)}
        </div>
    );
  }
}
