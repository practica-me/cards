import React, { Component } from 'react';
import conversations from '../data/short_replies.json';
import './script-viewer.css';

class SingleLine extends Component {
  render() {
    var cls = "line " + this.props.side;
    var line = this.props.line;
    if (this.props.mode == "text") {
      return(
        <div className={"line " + this.props.side}>
          {line.text}
        </div>
      );
    } else if (this.props.mode == "audio") {
      return(
        <div className={"audio line " + this.props.side}>
          Audio, {line.audioStart}, {line.audioEnd}, length: {line.audioEnd - line.audioStart}
        </div>
      );
    } else {
      console.error("MODE", this.props.mode, "not yet supported");
      return (<div/>);
    }
  }
}

class ConversationViewer extends Component {
  render() {
    var mode = this.props.mode;
    var lines = this.props.conversation.map(function(line, index) {
      var side = (index % 2) ? "right" : "left";
      return <SingleLine key={index} mode={mode} line={line} side={side} />
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
  changeConversation(delta) {
    var limit = this.props.conversations.length;
    var newIndex = (this.state.conversationIndex + delta) % limit;
    if (newIndex < 0) { newIndex = limit - 1; }
    this.setState({conversationIndex: newIndex});
  }
  render() {
    return(
      <div className="all-conversations">
        <div className="pagination">
          #{this.state.conversationIndex + 1} / {this.props.conversations.length}
        </div>
        <ConversationViewer
          conversation={this.getActiveConvo()}
          mode={this.props.mode}  />
        {(this.state.conversationIndex > 0) ?
          <button onClick={() => this.changeConversation(-1)} > Prev </button> : ""}
        {(this.state.conversationIndex < this.props.conversations.length) ?
          <button onClick={() => this.changeConversation(+1)} > Next </button> : ""}
      </div>
    )

  }
}

class ScriptViewer extends Component {
  render() {
    return(
      <div className="script-viewer">
      <h2> {this.props.script.title} </h2>
      <AllConversationsViewer
        conversations={this.props.script.conversations}
        mode={this.props.mode} />
      </div>
    );
  }
}

export default ScriptViewer;
