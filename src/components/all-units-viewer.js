import React, { Component } from 'react';
import UnitViewer from './unit-viewer.js';
import T from 'prop-types';
import './all-units-viewer.css';
import { Route, Redirect } from 'react-router-dom'

const DEFAULT_UNIT_PATH = '/unit/casual-interactions/';

export default class AllUnitsViewer extends Component {
  constructor(props) {
    super(props);
    this.renderUnitFromMatch = this.renderUnitFromMatch.bind(this);
  }
  static propTypes = {
    units: T.array.isRequired
  }
  renderUnitFromMatch ({ match }) {
    var normalize = (s) => s && s.toLowerCase().replace(/[^a-z0-9]/gi,'');
    var unit = this.props.units.find(function(unit) {
      return normalize(unit.name) === normalize(match.params.name);
    });
    if (unit) {
      return <UnitViewer unit={unit} />
    } else {
      return <RedirectToDefaultUnit />
    }
  }
  render() {
    return(
      <div className="all-units">
        <Route path="/" component={RedirectToDefaultUnit} exact={true} />
        <Route path="/unit/:name" render={this.renderUnitFromMatch} />
      </div>
    );
  }
}

const RedirectToDefaultUnit = ({match}) => (
  <Redirect to={{pathname: DEFAULT_UNIT_PATH}} />
);