import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className=' mt-52'>
        <p className='text-5xl font-semibold text-red-400 text-center'>Payment Failure</p>
        <Link href={"/"}>Home</Link>
      
    </div>
  )
}

export default page
