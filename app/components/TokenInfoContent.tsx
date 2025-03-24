'use client'

import React from 'react'
import { TokenData, TransferStatus } from './hooks/useTokenData'
import TokenInfoItem from './ui/TokenInfoItem'
import TokenAddressForm from './ui/TokenAddressForm'
import TransferFromForm from './ui/TransferFromForm'
import { shortenAddress } from './utils/addressUtils'

export interface TokenInfoContentProps {
  tokenData: TokenData
  isLoading: boolean
  customTokenAddress: string
  inputTokenAddress: string
  setInputTokenAddress: (address: string) => void
  updateTokenAddress: () => void
  transferTokens: (to: string, amount: string) => Promise<void>
  transferFromTokens: (from: string, to: string, amount: string) => Promise<void>
  approveSpender: (spender: string, amount: string) => Promise<void>
  transferStatus: TransferStatus
  resetTransferStatus: () => void
  customDecimals: number
  setCustomDecimals: (decimals: number) => void
}

export const TokenInfoContent = ({ 
  tokenData, 
  isLoading, 
  customTokenAddress,
  inputTokenAddress,
  setInputTokenAddress,
  updateTokenAddress,
  transferFromTokens,
  approveSpender,
  transferStatus,
  resetTransferStatus,
  customDecimals,
  setCustomDecimals
}: TokenInfoContentProps) => {
  
  if (isLoading) {
    return null // We'll handle loading state in the parent component
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{tokenData.name} ({tokenData.symbol})</h2>
        
        <div className="space-y-2">
          <TokenInfoItem 
            label="Total Supply" 
            value={{ text: tokenData.totalSupply, symbol: tokenData.symbol }} 
          />
          
          {tokenData.userAddress ? (
            <>
              <TokenInfoItem 
                label="Your Address" 
                value={shortenAddress(tokenData.userAddress)} 
              />
              <TokenInfoItem 
                label="Your Balance" 
                value={{ text: tokenData.userBalance, symbol: tokenData.symbol }}
                coloredValue={true}
              />
            </>
          ) : null}
        </div>
      </div>
      
      <TokenAddressForm
        currentAddress={customTokenAddress}
        inputAddress={inputTokenAddress}
        setInputAddress={setInputTokenAddress}
        onSubmit={updateTokenAddress}
        decimals={customDecimals}
        setDecimals={setCustomDecimals}
      />
      
      {tokenData.userAddress ? (
        <>
          <TransferFromForm
            onTransferFrom={transferFromTokens}
            onApprove={approveSpender}
            transferStatus={transferStatus}
            resetStatus={resetTransferStatus}
          />
        </>
      ) : null}
    </div>
  )
}

export default TokenInfoContent
