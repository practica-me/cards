import React, { Component } from 'react';
import { FullStory } from 'react-fullstory-component';
import unitData from './data/units_and_lessons.json';
import UnitRouter from './components/unit-router.js';
import './App.css';

const settings = {
    debug: false,
    host: 'www.fullstory.com',
    orgKey: '6GPQQ'
};
const data = {
    script: 'quick_questions'
};

class App extends Component {
  render() {
    var units = unitData.units;
    return(
      <div>
        <UnitRouter units={units} />
        <FullStory settings={settings} custom={data} />
      </div>
    );
  }
}
export default App;
