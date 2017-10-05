import React, { Component } from 'react';
import UnitViewer from './unit-viewer.js';
import T from 'prop-types';
import './all-units-viewer.css';

export default class AllUnitsViewer extends Component {
  static propTypes = {
    units: T.array.isRequired
  }
  render() {
    /* For now, just render the first unit. */
    return(
      <div className="all-units">
        <UnitViewer unit={this.props.units[0]} />
      </div>
    );
  }
}
