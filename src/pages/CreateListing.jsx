import { useState, useRef, useEffect } from 'react'
import { toast } from 'react-toastify'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import Spinner from '../components/Spinner'
import { db } from '../firebase.config'

function CreateListing() {
  const [loading, setLoading] = useState(false)
  //eslint-disable-next-line react-hooks/exhaustive-deps
  const [geoLocationEnabled, setGeoLocationEnabled] = useState(false)
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  })

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData

  const auth = getAuth()
  const navigate = useNavigate()
  const isMounted = useRef(true)

  //sets userRef
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid })
        } else {
          navigate('sign-in')
        }
      })
    }
    return () => {
      isMounted.current = false
    }
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  const onSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    if (discountedPrice >= regularPrice) {
      setLoading(false)
      toast.error('Discounted price should be less than regular price.')
      return
    }

    if (images.lenght > 6) {
      setLoading(false)
      toast.error('Max 6 images')
    }
    let geoLocation = {}
    let location

    if (geoLocationEnabled) {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`
      )
      const data = await res.json()

      geoLocation.lat = data.results[0]?.geometry.location.lat ?? 0
      geoLocation.lng = data.results[0]?.geometry.location.lng ?? 0

      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address

      console.log(location)

      if (location === undefined || location.includes('undefined')) {
        setLoading(false)
        toast.error('Please enter a correct address')
        return
      }
    } else {
      geoLocation.lat = latitude
      geoLocation.lng = longitude
    }

    //Store images in firebase
    const storeImage = async (image) => {
      console.log(image);
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'image/' + fileName)
        console.log('storageRef: ' + storageRef)
        const uploadTask = uploadBytesResumable(storageRef, image)

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            console.log(error)
            reject(error)
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
              console.log('File available at', downloadURL)
            })
          }
        )
      })
    }

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Failed to upload image.')
      return
    })

    console.log(imgUrls);

    const formDataCopy = {
      ...formData,
      imgUrls,
      geoLocation,
      timestamp: serverTimestamp(),
    }

    formDataCopy.location = address
    delete formDataCopy.images
    delete formDataCopy.address
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    //create listing
    const docRef = await addDoc(collection(db, 'listings'), formDataCopy)
    setLoading(false)
    toast.success('Listing created')
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  }

  const onMutate = (e) => {
    let boolean = null

    if (e.target.value === 'true') {
      boolean = true
    }
    if (e.target.value === 'false') {
      boolean = false
    }
    //Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }))
    }

    //Text/Booleans/NUmbers
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        //if the value on the left is null use the one on the right
        [e.target.id]: boolean ?? e.target.value,
      }))
    }
  }

  if (loading) {
    return <Spinner />
  }
  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Create a Listing</p>
      </header>
      <main>
        <form action='' onSubmit={onSubmit}>
          <label className='formLabel'> Sell / Rent</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={onMutate}
            >
              Rent
            </button>
          </div>

          <label className='formLabel'>Name</label>
          <input
            type='text'
            className='formInputName'
            id='name'
            value={name}
            onChange={onMutate}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Bedrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bedrooms'
                value={bedrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Bathrooms</label>
              <input
                type='number'
                className='formInputSmall'
                id='bathrooms'
                value={bathrooms}
                onChange={onMutate}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking Spot</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={onMutate}
              min='1'
              max='50'
            >
              Yes
            </button>
            <button
              type='button'
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              id='parking'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label className='formLabel'>Furnished</label>
          <div className='formButtons'>
            <button
              type='button'
              className={furnished ? 'formButtonActive' : 'formButton'}
              id='furnished'
              value={true}
              onClick={onMutate}
              required
            >
              Yes
            </button>
            <button
              type='button'
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              id='furnished'
              value={false}
              onClick={onMutate}
              required
            >
              No
            </button>
          </div>

          <label htmlFor='' className='formLabel'>
            Address
          </label>
          <textarea
            name='formInputAddress'
            id='address'
            type='text'
            value={address}
            onChange={onMutate}
            required
          />

          {!geoLocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label htmlFor='' className='formLabel'>
                  Latitude
                </label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='latitude'
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label htmlFor='' className='formLabel'>
                  Longitude
                </label>
                <input
                  type='number'
                  className='formInputSmall'
                  id='longitude'
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}

          <label htmlFor='' className='formLabel'>
            Offer
          </label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={onMutate}
            >
              No
            </button>
          </div>

          <label htmlFor='' className='formLabel'>
            Regular Price
          </label>
          <div className='formPriceDiv'>
            <input
              type='number'
              className='formInputSmall'
              id='regularPrice'
              value={regularPrice}
              onChange={onMutate}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
          </div>

          {offer && (
            <>
              <label htmlFor='' className='formLabel'>
                Discounted Price
              </label>
              <input
                type='number'
                className='formInputSmall'
                id='discountedPrice'
                value={discountedPrice}
                onChange={onMutate}
                min='50'
                max='750000000'
                required
              />
            </>
          )}

          <label htmlFor='' className='formLabel'>
            Images
          </label>
          <p className='imagesInfo'>
            The first image will be the cover (max 6).
          </p>
          <input
            type='file'
            className='formInputFile'
            id='images'
            onChange={onMutate}
            max='6'
            accept='.JPG, .jpg, .png, .jpeg'
            multiple
            required
          />
          <button className='primaryButton createListingButton' type='submit'>
            Create Listing
          </button>
        </form>
      </main>
    </div>
  )
}

export default CreateListing
