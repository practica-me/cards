import React, { Component } from 'react';
import conversations from '../data/short_replies.json';
import './script-viewer.css';

class SingleLine extends Component {
  render() {
    var cls = "line " + this.props.side;
    var {text} = this.props.line;
    var dotted = text.replace(/[\w,'.!?]/ig, "-");
    if (this.props.mode == "text") {
      return(
        <div className={"line " + this.props.side}>
          {text}
        </div>
      );
    } else if (this.props.mode == "audio") {
      return(
        <div className={"audio line " + this.props.side}>
          {dotted}
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
    var {mode, convoElement} = this.props;
    var {title, conversation} = convoElement;
    var lines = conversation.map(function(line, index) {
      var side = (index % 2) ? "right" : "left";
      return <SingleLine key={index} mode={mode} line={line} side={side} />
    });
    return(
      <div className="single-conversation">
        <div className="conversation-title"> <h4> {title} </h4> </div>
        {lines}
      </div>
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
    this.changeConversation = this.changeConversation.bind(this);
  }
  getActiveConvo() {
    var convoElement = this.props.conversations[this.state.conversationIndex];
    return convoElement;
  }
  changeConversation(delta) {
    var limit = this.props.conversations.length;
    var newIndex = (this.state.conversationIndex + delta) % limit;
    if (newIndex < 0) { newIndex = limit - 1; }
    this.setState({conversationIndex: newIndex});
  }
  render() {
    var numConversations = this.props.conversations.length;
    return(
      <div className="all-conversations">
        <div className="pagination">
          #{this.state.conversationIndex + 1} / {numConversations}
        </div>
        <ConversationViewer
          convoElement={this.getActiveConvo()}
          mode={this.props.mode}  />
        {(this.state.conversationIndex > 0) ?
          <button onClick={() => this.changeConversation(-1)} > Prev </button> : ""}
        {(this.state.conversationIndex < numConversations) ?
          <button onClick={() => this.changeConversation(+1)} > Next </button> : ""}
      </div>
    )

  }
}

class ScriptViewer extends Component {
  render() {
    return(
      <div className="script-viewer">
      <div className="script-title"> {this.props.script.title} </div>
      <AllConversationsViewer
        conversations={this.props.script.conversations}
        mode={this.props.mode} />
      </div>
    );
  }
}

export default ScriptViewer;
