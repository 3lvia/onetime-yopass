import { Route, Routes as ReactRoutes } from 'react-router-dom';

import CreateSecret from './createSecret/CreateSecret';
import DisplaySecret from './displaySecret/DisplaySecret';
import Upload from './createSecret/Upload';
import Blank from './blank/Blank';
import { AuthProvider } from 'oidc-react';
import { OidcConfiguration } from './oidc/OidcConfiguration';

export const Routes = () => {
  return (
    <ReactRoutes>
      <Route
        path="/"
        element={
          <AuthProvider {...OidcConfiguration}>
            <CreateSecret />
          </AuthProvider>
        }
      />
      <Route path="/blank" element={<Blank />} />
      <Route
        path="/create"
        element={
          <AuthProvider {...OidcConfiguration}>
            <CreateSecret />
          </AuthProvider>
        }
      />
      <Route
        path="/upload"
        element={
          <AuthProvider {...OidcConfiguration}>
            <Upload />
          </AuthProvider>
        }
      />
      <Route path="/:format/:key/:password" element={<DisplaySecret />} />
      <Route path="/:format/:key" element={<DisplaySecret />} />
    </ReactRoutes>
  );
};
