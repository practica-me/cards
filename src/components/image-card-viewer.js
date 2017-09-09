import React, { Component } from 'react';
import Dropdown from 'react-dropdown';
import './image-card-viewer.css';

const topics = [
  { value: 'ShortReplies', label: "Week 1: Short Replies" },
  { value: 'FollowUpQuestions', label: "Week 2: Follow Up Questions" },
  { value: 'Questions', label: "Week 3: Questions" },
  { value: 'Goodbyes', label: "Week 4: Goodbyes" },
  { value: 'Compliments', label: "Week 5: Compliments" }
];
const fallbackTopic = 'TopicCard';
const maxIndex = 17;

class ImageCardViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {topic: null, cardIndex: 1}
    this.cardChange = this.cardChange.bind(this);
  }
  // change cardIndex by adding inc; clamp between 1 and maxIndex
  cardChange(inc) {
    var newIndex = this.state.cardIndex + inc;
    if (newIndex <= 0) {
      newIndex = maxIndex;
    } else if (newIndex > maxIndex) {
      newIndex = 1;
    }
    this.setState({ cardIndex: newIndex });
  }
  componentWillReceiveProps(nextProps) {
    var newTopic = this.props.topic.value;
    if (newTopic !== this.state.topic) { // TOPIC CHANGED
      this.setState({cardIndex: 1});
    }
  }
  render() {
    var topic = this.props.topic.value || fallbackTopic;
    var prefix = './cards/';
    var img1 = prefix + topic + this.state.cardIndex + '.png';
    var img2 = prefix + topic + (this.state.cardIndex + 1) + '.png';
    console.log(img1);
    return (
        <div className="cards">
          <div className="cardBar">
            <img className="card" alt="" src={img2} />
          </div>
          <div className="buttonBar">
            <button onClick={() => this.cardChange(-2)} > Prev </button>
            <button onClick={() => this.cardChange(+2)} > Next </button>
          </div>
        </div>
    );
  }
}

class ImageCardApp extends Component {
  constructor(props) {
    super(props);
    this.state = {topic: topics[0]};
  }
  render() {
    return (
      <div className="ImageCardApp">
        <div className="header">
          <Dropdown name="topic"
                  options={topics}
                  value={this.state.topic}
                  onChange={(t) => this.setState({topic: t})} />
        </div>
        <ImageCardViewer topic={this.state.topic} />
      </div>
    );
  }
}

export default ImageCardApp;
