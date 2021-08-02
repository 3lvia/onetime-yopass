import { Route } from 'react-router-dom';

import CreateSecret from './createSecret/CreateSecret';
import DisplaySecret from './displaySecret/DisplaySecret';
import Upload from './createSecret/Upload';
import LoginCallback from './authentication/LoginCallback';
import LoginPage from './authentication/LoginPage';

export const Routes = () => {
  return (
    <div>
      {/* <Route path="/" exact={true} component={CreateSecret} /> */}
      <Route path="/" exact={true} component={LoginPage} />
      <Route path="/loginCallback" exact={true} component={LoginCallback} />
      <Route path="/loginPage" exact={true} component={LoginPage} />
      <Route path="/createSecret" exact={true} component={CreateSecret} />
      <Route path="/upload" exact={true} component={Upload} />
      <Route exact={true} path="/s/:key/:password" component={DisplaySecret} />
      <Route exact={true} path="/s/:key" component={DisplaySecret} />
      <Route exact={true} path="/f/:key/:password" component={DisplaySecret} />
      <Route exact={true} path="/f/:key" component={DisplaySecret} />
    </div>
  );
};
