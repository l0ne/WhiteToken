'use client'

import React from 'react'

// Custom hooks
import useTokenData from './hooks/useTokenData'

// UI components
import ErrorAlert from './ui/ErrorAlert'
import ConnectButton from './ui/ConnectButton'
import LoadingSkeleton from './ui/LoadingSkeleton'
import ContractInfo from './ui/ContractInfo'
import TokenInfoContent from './TokenInfoContent'

const TokenInfo = () => {
  const { 
    tokenData, 
    error, 
    isLoading, 
    connectWallet,
    disconnectWallet,
    customTokenAddress,
    inputTokenAddress,
    setInputTokenAddress,
    handleTokenAddressChange: updateTokenAddress,
    handleTransfer: transferTokens,
    handleTransferFrom: transferFromTokens,
    handleApprove: approveSpender,
    transferStatus,
    resetTransferStatus,
    // Network selection
    selectedNetwork,
    setSelectedNetwork,
    networks,
    // Custom decimals
    customDecimals,
    setCustomDecimals
  } = useTokenData();

  return (
    <div className="bg-white shadow-xl rounded-2xl w-full max-w-md overflow-hidden">
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600">
        <h2 className="text-xl font-bold text-white">WhiteToken (ERC-20)</h2>
        <p className="text-blue-100 text-sm">View token details and your balance</p>
        
        {/* Network Selector */}
        <div className="mt-3 bg-white/10 p-2 rounded-lg">
          <div className="text-white text-xs mb-1">Blockchain Network</div>
          <div className="flex gap-2">
            {Object.keys(networks).map((network) => (
              <button
                key={network}
                onClick={() => setSelectedNetwork(network as any)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors 
                  ${selectedNetwork === network 
                    ? 'bg-white text-blue-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {networks[network as keyof typeof networks].name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <TokenInfoContent 
            tokenData={tokenData} 
            isLoading={isLoading} 
            customTokenAddress={customTokenAddress}
            inputTokenAddress={inputTokenAddress}
            setInputTokenAddress={setInputTokenAddress}
            updateTokenAddress={updateTokenAddress}
            transferTokens={transferTokens}
            transferFromTokens={transferFromTokens}
            approveSpender={approveSpender}
            transferStatus={transferStatus}
            resetTransferStatus={resetTransferStatus}
            customDecimals={customDecimals}
            setCustomDecimals={setCustomDecimals}
          />
        )}
        
        {!tokenData.userAddress ? (
          <ConnectButton onClick={connectWallet} />
        ) : (
          <div className="flex gap-2 mt-4">
            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-md overflow-hidden text-ellipsis text-sm">
              {tokenData.userAddress}
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
      
      {error && <ErrorAlert message={error} />}
    </div>
  );
};

export default TokenInfo;
