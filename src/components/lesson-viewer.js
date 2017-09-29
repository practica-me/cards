import React, { Component } from 'react';
import T from 'prop-types';

import ScriptViewer from './script-viewer/script-viewer.js';
import StoryPage from './script-viewer/story-page.js';

export default class LessonViewer extends Component {
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
    this.state = {script: null, started: false, description: ""};
    this.updateScript = this.updateScript.bind(this);
  }
  updateScript(optionalProps) {
    var props = optionalProps || this.props;
    var _this = this;
    var url = process.env.PUBLIC_URL + props.lesson.script_url;
    fetch(url, {method: 'get'})
      .then(function(response) {
        return response.json();
      })
      .then(function(script) {
        _this.setState({script: script,
                        description: script.description});
      })
      .catch(function(err) {
        console.error("Lesson fetching failed.");
      });
  }
  componentDidMount() {
    this.updateScript();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.lesson.name !== this.props.lesson.name) {
      this.updateScript(nextProps);
    }
  }
  render() {
    var lesson = this.props.lesson;
    return(
      <div className="lesson">
      {this.state.started ?
        <ScriptViewer script={this.state.script}
                      audioUrl={this.props.lesson.audio_url} /> :
        <StoryPage subheader={"Lesson " + lesson.number}
                   subheaderFirst={true}
                   header={lesson.name}
                   body={lesson.description || this.state.description}
                   buttonText="Get Started"
                   onAction={() => this.setState({started: true})} />}
      </div>
    );
  }
}
