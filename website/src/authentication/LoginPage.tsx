// import React from "react";
import React, { CSSProperties } from "react";
import userManager from "../services/userManager";
// import { oidcSelectors } from '../store/oidc'

// const accessToken = oidcSelectors.getAccessToken('') || ''

class LoginPage extends React.Component {
  onLoginButtonClick(event: { preventDefault: () => void; }) {
    event.preventDefault();
    userManager.signinRedirect();
  }

  render() {
    console.log("LoginPage!")

    return (
      <div style={styles.root}>
        <h3>Welcome!</h3>
        <p/>
        <p>Please log-in with ElvID to continue....</p>
        <p/>
        {/* <p>User: {accessToken}</p> */}
        <p/>
        <button onClick={this.onLoginButtonClick}>Log-in with ElvID</button>
      </div>
    );
  }
}

// https://stackoverflow.com/a/63086155
export interface StylesDictionary{
  [Key: string]: CSSProperties;
}

// https://stackoverflow.com/a/63086155
const styles: StylesDictionary = {
  root: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "center",
    flexShrink: 1
  }
}

export default LoginPage;
