import React from 'react';

import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { Button, Welcome } from '@storybook/react/demo';

import ScriptViewer from '../components/script-viewer/script-viewer.js'
import MODES from '../components/script-viewer/consts.js';

import script from '../data/short_replies_annotated.json';

storiesOf('Welcome', module).add('to Storybook', () => <Welcome showApp={linkTo('Button')} />);

storiesOf('Button', module)
  .add('with text', () => <Button onClick={action('clicked')}>Hello Button</Button>)
  .add('with some emoji', () => <Button onClick={action('clicked')}>😀 😎 👍 💯</Button>);

storiesOf('ScriptViewer', module)
  .add('title mode', () => <ScriptViewer script={script} mode={MODES.TitleMode}/>)
  .add('text mode', () => <ScriptViewer script={script} mode={MODES.TextMode}/>)
  .add('audio mode', () => <ScriptViewer script={script} mode={MODES.Listening}/>)
  .add('both', () => <ScriptViewer script={script} mode={MODES.Recording}/>);
