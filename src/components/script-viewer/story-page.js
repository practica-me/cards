import React, { Component } from 'react';
import T from 'prop-types';
import './script-viewer.css';

export default class StoryPage extends Component {
  static propTypes = {
    header: T.string.isRequired,
    subheader: T.string,
    subheaderFirst: T.bool,
    body: T.string.isRequired,
    bodyObj: T.object,
    buttonText: T.string.isRequired,
    buttonClasses: T.string,
    onAction: T.func.isRequired
  };
  render() {
    var header = <div className="header"> {this.props.header} </div>;
    var above = this.props.subheaderFirst ? "above" : "";
    var subheader = <div className={"subheader " + above}> {this.props.subheader} </div>;
    var buttonClasses = (this.props.buttonClasses || "") + " story-screen";
    return(
      <div className="phone-view inverse">
        <div className="story-screen">
          <div className="headers">
            {this.props.subheaderFirst ? subheader : header}
            {this.props.subheaderFirst ? header : subheader}
          </div>
          <div className="body">
            {this.props.bodyObj || this.props.body}
          </div>
          <div className="controls">
            <button onClick={this.props.onAction}
                    className={buttonClasses}>
              {this.props.buttonText}
            </button>
          </div>
        </div>
      </div>
    );
  }
}


