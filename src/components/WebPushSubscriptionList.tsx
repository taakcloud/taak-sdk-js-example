import { IonButton, IonButtons, IonChip, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonSpinner, useIonToast } from "@ionic/react"
import { send, trashBin } from "ionicons/icons"
import { FC, useEffect, useState } from "react"
import TaakSDK from "taak-sdk"
import { TaakResponse } from "taak-sdk/dist/taak-response"
import { WebPushDTO, WebPushSendCommand } from "taak-sdk/dist/web-push/types"

interface WebPushSubscriptionListProps {
  userId: string
  reload?: boolean
}
const WebPushSubscriptionList: FC<WebPushSubscriptionListProps> = ({ userId, reload }) => {
  const taakSdkClient = new TaakSDK({ apiKey: process.env.REACT_APP_TAAK_API_KEY || ''})
  const [items, setItems] = useState<WebPushDTO[]>([])
  const [inprogress, setInprogress] = useState(false)
  const [presentToast] = useIonToast()
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchItems = async () => {
    setInprogress(true)
    const res: TaakResponse = await taakSdkClient.getWebPushesByUserId(userId)
    if (res.status === 200)
      setItems(res.data)
    setInprogress(false)
  }

  const sendTest = async (item: WebPushDTO) => {
    setSending(true)
    const cmd: WebPushSendCommand = {
      payload: 'Hello World',
      publicId: item.publicId,
    }
    const res: TaakResponse = await taakSdkClient.sendWebPush(cmd)
    presentToast({ message: `Success sending push with status ${res.status}`, duration: 3000 })
    setSending(false)
  }

  const deleteItem = async (item: WebPushDTO) => {
    setDeleting(true)
    const res: TaakResponse = await taakSdkClient.deleteWebPush(item.publicId)
    if (res.status === 204) {
      presentToast({ message: 'Success deleting subscription', duration: 3000 })
      await fetchItems()
    }
    setDeleting(false)
  }

  useEffect(() => {
    fetchItems()
  }, [reload]) // eslint-disable-line

  return (
    <IonList>
      <IonListHeader>
        Subscriptions
      </IonListHeader>
      {items.map((itm: WebPushDTO) => (
        <IonItem key={itm.publicId}>
          <IonButtons slot='start'>
            <IonButton color={'success'} onClick={() => sendTest(itm)} disabled={sending}>
              <IonIcon icon={send} slot='icon-only' />
            </IonButton>
          </IonButtons>
          <IonLabel>
              {itm.deviceId?.split('::')?.map((di: string) => (
                <IonChip key={di}>{di}</IonChip>
              ))}
            <p>{itm.createdAt}</p>
          </IonLabel>
          <IonButtons slot='end'>
            <IonButton color='danger' onClick={() => deleteItem(itm)} disabled={deleting}>
              <IonIcon icon={trashBin} slot='icon-only' />
            </IonButton>
          </IonButtons>
        </IonItem>
      ))}
      {inprogress && <div className="ion-text-center">
        <IonSpinner />
      </div>}
    </IonList>
  )

}

export default WebPushSubscriptionList