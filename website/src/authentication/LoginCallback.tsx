import { navigate } from 'gatsby'
import { FC } from 'react'
import { CallbackComponent } from 'redux-oidc'
import userManager from "../utils/userManager";

const LoginCallback: FC = () => {
  return (
    <CallbackComponent
      userManager={userManager}
      successCallback={() => {
        navigate('/createSecret')
      }}
      errorCallback={() => {
        navigate('/loginPage')
      }}
    >
    </CallbackComponent>
  )
}

export default LoginCallback
