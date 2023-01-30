import { IonButtons, IonIcon, IonItem, IonLabel, IonToggle, useIonToast } from '@ionic/react';
import { useEffect, useState } from 'react';
import { openOutline } from 'ionicons/icons'
import TaakSDK from 'taak-sdk'
import './WebPushToggle.css';
import { TaakResponse } from 'taak-sdk/dist/taak-response';
import WebPushSubscribeButton from './WebPushSubscribeButton';
import WebPushSubscriptionList from './WebPushSubscriptionList';

interface WebPushToggleProps { }

const WebPushToggle: React.FC<WebPushToggleProps> = () => {
  const taakSdkClient = new TaakSDK({ apiKey: process.env.REACT_APP_TAAK_API_KEY || '' })
  const [webPushEnabled, setWebPushEnabled] = useState(false)
  const [reload, setReload] = useState(false)

  const [presentToast] = useIonToast()

  const checkIfPermissionGiven = async () => {
    const res: TaakResponse = await taakSdkClient.checkIfPermissionGiven(true)
    if (res.status) {
      if (res.data === 'denied') {
        presentToast({
          message: `Permission denied, you need to unblock ${window.location.origin} in your browser to receive notifications.`,
          duration: 3000,
          color: 'danger'
        })
      } else {
        presentToast({ message: res.error, color: 'danger', duration: 3000 })
      }
      setWebPushEnabled(false)
    }
  }
  

  useEffect(() => {
    console.log('webPushEnabled', webPushEnabled)
    if (webPushEnabled) checkIfPermissionGiven()
  }, [webPushEnabled]) // eslint-disable-line

  return (
    <div className="container">
      <div>
        Web Push Notification example using 
        <strong><a target="_blank" rel="noopener noreferrer" href="https://github.com/taakcloud/taak-sdk-js">Taak-sdk-js
          <IonIcon icon={openOutline} />
        </a></strong>
      </div>
      <IonItem>
        <IonLabel>
          Enable Web Push
        </IonLabel>
        <IonToggle checked={webPushEnabled} onIonChange={(e) => setWebPushEnabled(e.detail.checked)} />
      </IonItem>
      {webPushEnabled && <>
        <IonItem>
          <IonButtons slot='end'>
            <WebPushSubscribeButton userId='user-001' onSuccess={() => setReload(!reload)} />
          </IonButtons>
        </IonItem>
        <WebPushSubscriptionList userId='user-001' reload={reload} />
      </>}
    </div>
  );
};

export default WebPushToggle;
