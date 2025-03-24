'use client'

import React, { useState } from 'react'
import { isAddress } from 'viem'
import { TransferStatus } from '../hooks/useTokenData'

export interface TransferFromFormProps {
  onTransferFrom: (from: string, to: string, amount: string) => Promise<void>
  onApprove: (spender: string, amount: string) => Promise<void>
  transferStatus: TransferStatus
  resetStatus: () => void
}

export const TransferFromForm = ({ 
  onTransferFrom, 
  onApprove, 
  transferStatus, 
  resetStatus 
}: TransferFromFormProps) => {
  const [fromAddress, setFromAddress] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [isFormValid, setIsFormValid] = useState(false)
  const [mode, setMode] = useState<'transferFrom' | 'approve'>('transferFrom')

  const validateForm = () => {
    if (mode === 'transferFrom') {
      const isFromValid = isAddress(fromAddress)
      const isToValid = isAddress(toAddress)
      const isAmountValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
      const formValid = isFromValid && isToValid && isAmountValid
      setIsFormValid(formValid)
      return formValid
    } else {
      // Approve mode
      const isSpenderValid = isAddress(fromAddress)
      const isAmountValid = !isNaN(parseFloat(amount)) && parseFloat(amount) > 0
      const formValid = isSpenderValid && isAmountValid
      setIsFormValid(formValid)
      return formValid
    }
  }

  const handleFromAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromAddress(e.target.value)
    validateForm()
  }

  const handleToAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToAddress(e.target.value)
    validateForm()
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value)
    validateForm()
  }

  const handleModeChange = (newMode: 'transferFrom' | 'approve') => {
    setMode(newMode)
    resetStatus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      if (mode === 'transferFrom') {
        await onTransferFrom(fromAddress, toAddress, amount)
      } else {
        await onApprove(fromAddress, amount)
      }
    }
  }

  const resetForm = () => {
    setFromAddress('')
    setToAddress('')
    setAmount('')
    setIsFormValid(false)
    resetStatus()
  }

  // Show different UI based on transfer status
  if (transferStatus.isSuccess) {
    return (
      <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded mb-4">
        <h3 className="font-bold mb-2">
          {mode === 'transferFrom' ? 'Transfer Successful!' : 'Approval Successful!'}
        </h3>
        {transferStatus.hash && (
          <p className="mb-2">
            Transaction hash:{' '}
            <a
              href={`https://goerli.etherscan.io/tx/${transferStatus.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {transferStatus.hash}
            </a>
          </p>
        )}
        <button
          onClick={resetForm}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {mode === 'transferFrom' ? 'Make Another Transfer' : 'Make Another Approval'}
        </button>
      </div>
    )
  }

  if (transferStatus.isError) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        <h3 className="font-bold mb-2">
          {mode === 'transferFrom' ? 'Transfer Failed' : 'Approval Failed'}
        </h3>
        <p className="mb-2">{transferStatus.errorMessage}</p>
        <button
          onClick={resetStatus}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex mb-4">
        <button
          type="button"
          onClick={() => handleModeChange('transferFrom')}
          className={`flex-1 py-2 ${
            mode === 'transferFrom'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          } rounded-l`}
        >
          Transfer From
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('approve')}
          className={`flex-1 py-2 ${
            mode === 'approve'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          } rounded-r`}
        >
          Approve
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="fromAddress" className="block text-sm font-medium text-gray-700 mb-1">
          {mode === 'transferFrom' ? 'From Address (Owner)' : 'Spender Address'}
        </label>
        <input
          type="text"
          id="fromAddress"
          value={fromAddress}
          onChange={handleFromAddressChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0x..."
          disabled={transferStatus.isPending}
        />
      </div>
      
      {mode === 'transferFrom' && (
        <div className="mb-4">
          <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700 mb-1">
            To Address (Recipient)
          </label>
          <input
            type="text"
            id="toAddress"
            value={toAddress}
            onChange={handleToAddressChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0x..."
            disabled={transferStatus.isPending}
          />
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <input
          type="text"
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.0"
          disabled={transferStatus.isPending}
        />
      </div>
      
      <button
        type="submit"
        disabled={!isFormValid || transferStatus.isPending}
        className={`w-full px-4 py-2 rounded-md ${
          !isFormValid || transferStatus.isPending
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {transferStatus.isPending
          ? 'Processing...'
          : mode === 'transferFrom'
            ? 'Transfer From'
            : 'Approve'
        }
      </button>
    </form>
  )
}

export default TransferFromForm
