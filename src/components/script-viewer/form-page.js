import React, { Component } from 'react';
import T from 'prop-types';
import StoryPage from './story-page.js';

const FIELD_TYPES = ['text', 'number'];

export default class FormPage extends Component {
  static propTypes = {
    fields: T.arrayOf(T.shape({
      question: T.string.isRequired,
      type: T.oneOf(FIELD_TYPES),
      hint: T.string
    }))
  };

  render() {
    var bodyElements = this.props.fields.map((field, idx) => {
      var {question, type, hint} = field;
      type = type || "text";
      var qstn = question.toLowerCase().replace(/\W/ig, "-");
      return (
        <div className="form-group" key={idx}>
          <label for={qstn}> {question} </label>
          <input type={type} name={qstn} />
          <div className="input-hint"> {hint} </div>
        </div>
      );
    });
    var props = this.props;
    var {fields, body, header, subheader, subheaderFirst,
         buttonText, buttonClasses, onAction} = this.props;
    return(
      <StoryPage
        {...props}
        bodyObj={<div className="form">
                  {bodyElements}
                 </div>} />
    );
  }
}


