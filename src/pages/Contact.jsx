import {useState, useEffect } from 'react'
import {useParams, useSearchParams } from 'react-router-dom'
import {doc, getDoc} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'

function Contact() {
    const [message, setMessage] = useState('')
    const [landlord, setLandlord] = useState(null)
    const [searchParams, setSearchParams] = useSearchParams()

    const params = useParams()

    useEffect(() => {
        const getLandlord = async () => {
            const docRef = doc(db, 'users', params.landlordId)
            const docSnap = await getDoc(docRef)

            if(docSnap.exists()){
                setLandlord(docSnap.data())
            } else {
                toast.error('Couldn´t get landlord data')
            }
        }
        getLandlord()

    }, [params.landlordId])

  return (
    <div className='pageContainer'>
    <header>
        <p className="pageHeader">Contact Landlord</p>
    </header>

    </div>
  )
}

export default Contact