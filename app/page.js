'use client'
import axios from 'axios'
import React, { useState } from 'react'

export default function Page() {
  const [data, setData] = useState({
    name: "",
    number: "",
    amount: ""
  })

  const handleChange = (e) => {
    setData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value
    }))
  }

  const submitForm = async (e) => {
    e.preventDefault()

    try {
      const { name, number, amount } = data; // Destructure data
      const response = await axios.post('/api/payment', {
        name,
        mobileNumber: number,
        amount
      }, {
        headers: {
          'Content-Type': 'application/json' // Corrected header format
        }
      });

      console.log(response.data); // Log response or handle it as needed
      window.location.href = response.data.url
    } catch (error) {
      console.error("Error submitting form:", error); // Handle error appropriately
    }
  }

  return (
    <div>
      <h1 className='text-8xl font-bold text-center pt-20 pb-10'>PhonePe Integration</h1>
      
      <form className='w-[50%] m-auto py-10 px-10 mt-7 flex flex-col gap-9 border' onSubmit={submitForm}>
        <input 
          onChange={handleChange} 
          className='inline-block text-gray-700 px-7 py-3 rounded-md' 
          name="name" 
          type="text" 
          placeholder='Enter Your Name' 
          value={data.name} 
        />
        <input 
          onChange={handleChange} 
          className='inline-block text-gray-700 px-7 py-3 rounded-md' 
          name="number" 
          type="number" 
          placeholder='Enter Your Number' 
          value={data.number} 
        />
        <input 
          onChange={handleChange} 
          className='inline-block text-gray-700 px-7 py-3 rounded-md' 
          name="amount" 
          type="number" 
          placeholder='Enter Amount' 
          value={data.amount} 
        />
        <button type='submit' className='submitPayment'>Submit</button>
      </form>
    </div>
  )
}
