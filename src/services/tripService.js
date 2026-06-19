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
    arrayUnion,
    arrayRemove,
    deleteField,
    addDoc
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

export const joinTrip = async (tripId, userId, role = 'viewer', profile = null) => {
    const docRef = doc(db, 'trips', tripId)
    await updateDoc(docRef, {
        members: arrayUnion(userId),
        [`permissions.${userId}`]: role,
        [`memberProfiles.${userId}`]: {
            displayName: profile?.displayName || null,
            photoURL: profile?.photoURL || null
        }
    })
}

export const updateMemberRole = async (tripId, userId, newRole) => {
    const docRef = doc(db, 'trips', tripId)
    await updateDoc(docRef, {
        [`permissions.${userId}`]: newRole
    })
}

export const removeMember = async (tripId, userId) => {
    const docRef = doc(db, 'trips', tripId)
    await updateDoc(docRef, {
        members: arrayRemove(userId),
        [`permissions.${userId}`]: deleteField()
    })
}

export const createTrip = async (tripData) => {
    const docRef = await addDoc(collection(db, 'trips'), tripData)
    return docRef.id
}
