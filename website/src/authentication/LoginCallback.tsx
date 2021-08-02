import { FC } from 'react'
import { useHistory } from "react-router-dom"
import { CallbackComponent } from 'redux-oidc'
import userManager from "../services/userManager";


const LoginCallback: FC = () => {
  const history = useHistory();
  console.log("LoginCallback!")
  return (
    <CallbackComponent
      userManager={userManager}
      successCallback={() => {
        console.log("successCallback");
        history.push("/createSecret");
      }}
      errorCallback={() => {
        console.log("errorCallback");
        history.push("/loginPage");
      }}
    >
    </CallbackComponent>
  )
}

export default LoginCallback
