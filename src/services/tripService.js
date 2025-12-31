import { db } from '../firebase'
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc
} from 'firebase/firestore'

export const subscribeTrips = (userId, callback) => {
    const q = query(
        collection(db, 'trips'),
        where('members', 'array-contains', userId),
        orderBy('createdAt', 'desc')
    )
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
}

export const saveTripData = async (tripId, data) => {
    await setDoc(doc(db, 'trips', tripId), data)
}

export const deleteTripDoc = async (tripId) => {
    await deleteDoc(doc(db, 'trips', tripId))
}
