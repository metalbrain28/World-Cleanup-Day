import React from 'react';
import { BrowserRouter, Route , Switch} from 'react-router-dom';

import Root from './Root';

export default () =>
  (<BrowserRouter >
    <div style={{ flex: 1, display: 'flex' }}>
        <Switch>
            <Route path="/rutamea" component={Event} />
            <Route path="/" component={Root} />

        </Switch>
        </div>
  </BrowserRouter>);
