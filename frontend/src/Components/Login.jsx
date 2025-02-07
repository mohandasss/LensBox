import React from 'react'

const Login = () => {
  return (
    <div className='flex justify-center items-center h-screen'>
        <div className="login-container bg-white shadow-md rounded-md p-4 w-96">
            <div className="login-form">
                <h1 className='text-2xl font-bold text-center mb-4'>Login</h1>
                <input type="text" placeholder="Email" className='w-full p-2 rounded-md border border-gray-300 mb-4' />
                <input type="password" placeholder="Password" className='w-full p-2 rounded-md border border-gray-300 mb-4' />

            </div>
            <div className="login-button">
                <button className='w-full p-2 rounded-md bg-blue-500 text-white'>Login</button>

            </div>
        </div>
    </div>
  )
}

export default Login
