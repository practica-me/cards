import React, { Component } from 'react';
import ScriptViewer from './script-viewer/script-viewer.js';
import T from 'prop-types';
require('fetch');

class LessonViewer extends Component {
  static propTypes = {
    lesson: T.shape({
      number: T.number.isRequired,
      name: T.string.isRequired,
      script_url: T.string.isRequired,
      audio_url: T.string.isRequired
    })
  }
  constructor(props) {
    super(props);
    this.state = {lesson: null};
  }
  componentDidMount() {
    var _this = this;
    console.log(process.env);
    var url = process.env.PUBLIC_URL + this.props.lesson.script_url;
    console.log(url);
    fetch(url, {method: 'get'})
      .then(function(response) {
        return response.json();
      })
      .then(function(script) {
        _this.setState({script: script});
      })
      .catch(function(err) {
        console.error("Lesson fetching failed.");
      });
  }
  render() {
    return(
        <div>
        {JSON.stringify(this.props.lesson)}
        {JSON.stringify(this.state.script)}
        </div>
    );
  }
}

export default class UnitViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {lessonIndex: 0};
  }
  static propTypes = {
    unit: T.object.isRequired,
  }
  render() {
    var unit = this.props.unit;
    var lesson = unit.lessons[this.state.lessonIndex];
    return(
        <div>
          <LessonViewer lesson={lesson} />
        </div>
    );
  }
}
