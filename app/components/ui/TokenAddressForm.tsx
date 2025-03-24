'use client'

import React from 'react'
import { isAddress } from 'viem'

export interface TokenAddressFormProps {
  currentAddress: string
  inputAddress: string
  setInputAddress: (address: string) => void
  onSubmit: () => void
  decimals: number
  setDecimals: (decimals: number) => void
}

export const TokenAddressForm = ({ 
  currentAddress, 
  inputAddress, 
  setInputAddress, 
  onSubmit,
  decimals,
  setDecimals
}: TokenAddressFormProps) => {
  const isValid = isAddress(inputAddress)
  const isUnchanged = inputAddress === currentAddress

  const handleDecimalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0 && value <= 36) {
      setDecimals(value)
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium">Token Address</div>
      </div>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter token contract address"
        />
        <button
          onClick={onSubmit}
          disabled={!isValid || isUnchanged}
          className={`px-4 py-2 rounded-md ${
            !isValid || isUnchanged
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Update
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <label htmlFor="decimals" className="text-sm text-gray-600">
          Decimals:
        </label>
        <input
          id="decimals"
          type="number"
          min="0"
          max="36"
          value={decimals}
          onChange={handleDecimalsChange}
          className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
        />
        <div className="text-xs text-gray-500">
          (Most ERC20 tokens use 18)
        </div>
      </div>
    </div>
  )
}

export default TokenAddressForm
