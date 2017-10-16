import React, { Component } from 'react';
import T from 'prop-types';
import {Icon} from 'react-fa';
import './unit-viewer.css';

import {Link} from 'react-router-dom';

import LessonViewer from './lesson-viewer.js';

export default class UnitViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {lessonStarted: false};
    this.renderArrow = this.renderArrow.bind(this);
  }
  static propTypes = {
    unit: T.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.lessonIndex !== this.props.lessonIndex) {
      this.setState({lessonStarted: false});
    }
  }
  // by default, we go Forward, unless, of course, goBackward is true
  renderArrow(goBackward) {
    var allLessons = this.props.unit.lessons;
    var lessonIndex = this.props.lessonIndex;
    var nextIndex = goBackward ? (lessonIndex - 1) : (lessonIndex + 1);
    var vizClass = "";
    if (nextIndex < 0 || nextIndex >= allLessons.length) {
      // we don't want to render it but make the layout easy
      nextIndex = lessonIndex;
      vizClass = "transparent"; 
    }
    var dirClass = goBackward ? "left" : "right";
    var nextLesson = allLessons[nextIndex];
    var icon = goBackward ? "chevron-left" : "chevron-right";
    /* lessonNumber 1-indexed */
    var pathFromIdx = (lIdx) => (this.props.pathGenerator ?
        this.props.pathGenerator(this.props.unit.name, lIdx + 1) :
        ("/unit/" + this.props.unit.name + "/lesson/" + (lIdx + 1))
    );
    return(
      <div className={"arrow-block " + vizClass + " " + dirClass}>
        <Link to={{pathname: pathFromIdx(nextIndex)}} >
          <Icon name={icon} />
        </Link>
        <div className="next-lesson hidden-on-mobile hidden-on-phablet">
          Lesson {nextLesson.number}: <br/>
          {nextLesson.name}
        </div>
      </div>
    );
  }
  render() {
    var unit = this.props.unit;
    var lessonIndex = this.props.lessonIndex || 0;
    var lesson = unit.lessons[lessonIndex];
    return(
        <div className="unit">
          {this.state.lessonStarted ? "" : this.renderArrow(true)}
          <LessonViewer
            lesson={lesson}
            onLessonStarted={() => this.setState({lessonStarted: true})}
            onLessonReset={() => this.setState({lessonStarted: false})}/>
          {this.state.lessonStarted ? "" : this.renderArrow(false)}
        </div>
    );
  }
}
