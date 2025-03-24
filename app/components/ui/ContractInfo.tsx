'use client'

import React from 'react'
import { TOKEN_ADDRESS } from '../../lib/viem-client'

export const ContractInfo = () => {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-medium mb-2">Contract Information</h3>
      <p>This is an ERC-20 token implementation on the Ethereum testnet.</p>
      <p className="mt-2">
        <strong>Default Token Address: </strong>
        <a
          href={`https://sepolia.etherscan.io/address/${TOKEN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {TOKEN_ADDRESS}
        </a>
      </p>
    </div>
  )
}

export default ContractInfo
