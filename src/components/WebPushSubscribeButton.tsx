import { IonButton, IonIcon, useIonToast } from "@ionic/react"
import { add } from "ionicons/icons"
import { FC, useState } from "react"
import { osName, browserName, browserVersion } from 'react-device-detect'
import TaakSDK from "taak-sdk"
import { TaakResponse } from "taak-sdk/dist/taak-response"
import { WebPushSubscribeCommand } from "taak-sdk/dist/web-push/types"

interface WebPushSubscribeButtonProps {
  userId: string
  onSuccess: Function
}
const WebPushSubscribeButton: FC<WebPushSubscribeButtonProps> = ({ userId, onSuccess }) => {
  const taakSdkClient = new TaakSDK({ apiKey: process.env.REACT_APP_TAAK_API_KEY || '' })
  const [inprogress, setInprogress] = useState(false)
  const [presentToast] = useIonToast()

  const checkIfSubscribed = async () => {
    setInprogress(true)
    const res: TaakResponse = await taakSdkClient.checkIfSubscribed(true)
    if (res.status) {
      presentToast({ message: res.error, color: 'danger', duration: 3000 })
    } else {
      await subscribe(res.data)
    }
    setInprogress(false)
  }

  const subscribe = async (subscription: PushSubscription) => {
    const subscriptionObject = JSON.parse(JSON.stringify(subscription))
    const cmd: WebPushSubscribeCommand = {
      userId,
      deviceId: `${osName}::${browserName}::${browserVersion}`,
      endpoint: subscription.endpoint,
      key: subscriptionObject.keys.p256dh,
      auth: subscriptionObject.keys.auth,
    }
    const res: TaakResponse = await taakSdkClient.subscribeWebPush(cmd)
    if (res.status) {
      presentToast({ message: 'Success subscription', color: 'success', duration: 3000 })
      onSuccess(res.data)
    }
    else
      presentToast({ message: 'Error subscribing ' + res.status, color: 'danger', duration: 3000 })
  }

  return (
    <IonButton onClick={checkIfSubscribed} disabled={inprogress}>
      <IonIcon icon={add} slot='start' />
      Subscribe
    </IonButton>
  )

}

export default WebPushSubscribeButton