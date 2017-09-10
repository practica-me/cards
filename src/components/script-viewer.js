import React, { Component } from 'react';
import conversations from '../data/short_replies.json';
import './script-viewer.css';


class SingleLine extends Component {
  render() {
    var cls = this.props.odd ? "line left" : "line right";
    return(
      <div className={cls}> {this.props.line.text} </div>
    )
  }
}

class ConversationViewer extends Component {
  render() {
    var lines = this.props.conversation.map(function(line, index) {
      var isOdd = (index % 2);
      return <SingleLine key={index} line={line} odd={isOdd} />
    })
    return(
      <div className="single-conversation"> {lines} </div>
    )
  }
}

class AllConversationsViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversationIndex: 0
    }
    this.getActiveConvo = this.getActiveConvo.bind(this);
  }
  getActiveConvo() {
    var convoElement = this.props.conversations[this.state.conversationIndex];
    return convoElement.conversation;
  }
  render() {
    return(
      <div className="all-conversations">
        <div className="pagination">
          #{this.state.conversationIndex + 1} / {this.props.conversations.length}
        </div>
        <ConversationViewer conversation={this.getActiveConvo()} />
      </div>
    )

  }
}

class ScriptViewer extends Component {
  render() {
    return(
      <div className="script-viewer">
      <h2> {this.props.script.title} </h2>
      <AllConversationsViewer conversations={this.props.script.conversations} />
      </div>
    );
  }
}

export default ScriptViewer;
