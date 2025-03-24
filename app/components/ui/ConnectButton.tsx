'use client'

import React from 'react'

export interface ConnectButtonProps {
  onClick: () => Promise<void>
}

export const ConnectButton = ({ onClick }: ConnectButtonProps) => {
  return (
    <button 
      onClick={onClick}
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  )
}

export default ConnectButton
