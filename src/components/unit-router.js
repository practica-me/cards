import React, { Component } from 'react';
import UnitViewer from './unit-viewer.js';
import T from 'prop-types';

import { Route, Redirect } from 'react-router-dom'

const DEFAULT_UNIT = 'casual-interactions';
const DEFAULT_LESSON = '1';

const normalizeString = (s, replacer) => (
  s && s.toLowerCase().replace(/[^a-z0-9]/gi, (replacer || ''))
);

const unitLessonPath = (optionalUnitName, optionalLessonNumber) => ( '/unit/' + (normalizeString(optionalUnitName, '-') || DEFAULT_UNIT) + '/lesson/' + (optionalLessonNumber || DEFAULT_LESSON));

const RedirectToDefaultPath = ({match}) => (
  <Redirect to={{pathname: unitLessonPath()}} />
);

export default class UnitRouter extends Component {
  constructor(props) {
    super(props);
    this.renderUnitFromMatch = this.renderUnitFromMatch.bind(this);
  }
  static propTypes = {
    units: T.array.isRequired
  }
  renderUnitFromMatch ({ match }) {
    var unit = this.props.units.find(function(unit) {
      return normalizeString(unit.name) === normalizeString(match.params.unit_name);
    });
    var lNum = parseInt(match.params.lesson_number, 10);
    /* lessonNumber 1-indexed */
    var lessonNumber = (isNaN(lNum) || lNum < 0 || 
                     lNum > unit.lessons.length) ?
        undefined : (lNum);
    if (unit && lessonNumber) {
      return <UnitViewer unit={unit} 
                         lessonIndex={lessonNumber - 1}
                         pathGenerator={unitLessonPath} />
    } else {
      var path = unitLessonPath(unit && unit.name);
      return <Redirect to={{pathname: path}} />;
    }
  }
  render() {
    return(
      <div className="all-units">
        <Route path="/" component={RedirectToDefaultPath} exact={true} />
        <Route path="/unit/:unit_name/lesson/:lesson_number" render={this.renderUnitFromMatch} />
      </div>
    );
  }
}
