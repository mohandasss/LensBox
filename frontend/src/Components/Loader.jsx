import React from 'react'
import { FaSpinner } from 'react-icons/fa'
const Loader = () => {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
        <FaSpinner className='text-blue-500 animate-spin text-4xl' />
        <p className='ml-3 text-blue-500'>.</p>
    </div>
  )
}

export default Loader