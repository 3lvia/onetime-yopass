import { FC } from 'react'
import { useHistory } from "react-router-dom"
import { CallbackComponent } from 'redux-oidc'
import userManager from "../services/userManager";


const LoginCallback: FC = () => {
  const history = useHistory();

  return (
    <CallbackComponent
      userManager={userManager}
      successCallback={() => {
        history.push("/createSecret");
      }}
      errorCallback={() => {
        history.push("/loginPage");
      }}
    >
    </CallbackComponent>
  )
}

export default LoginCallback
