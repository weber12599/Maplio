import { db } from '../firebase'
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    updateDoc,
    arrayUnion
} from 'firebase/firestore'

export const subscribeTrips = (userId, callback) => {
    const q = query(
        collection(db, 'trips'),
        where('members', 'array-contains', userId),
        orderBy('createdAt', 'desc')
    )
    return onSnapshot(
        q,
        (snap) => {
            callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        },
        (error) => {
            console.error('[tripService] Firestore onSnapshot error:', error)
        }
    )
}

export const saveTripData = async (tripId, data) => {
    await setDoc(doc(db, 'trips', tripId), data, { merge: true })
}

export const deleteTripDoc = async (tripId) => {
    await deleteDoc(doc(db, 'trips', tripId))
}

export const getTripDoc = async (tripId) => {
    const docRef = doc(db, 'trips', tripId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
}

export const joinTrip = async (tripId, userId) => {
    const docRef = doc(db, 'trips', tripId)
    await updateDoc(docRef, {
        members: arrayUnion(userId)
    })
}
