'use client'

import React from 'react'

export interface TokenInfoItemProps {
  label: string
  value: string | { text: string; symbol: string }
  coloredValue?: boolean
  color?: string
}

export const TokenInfoItem = ({ 
  label, 
  value, 
  coloredValue = false, 
  color = 'text-blue-500' 
}: TokenInfoItemProps) => {
  const valueContent = typeof value === 'string' ? value : (
    <>
      {value.text} <span className="text-gray-500">{value.symbol}</span>
    </>
  )

  return (
    <div className="flex justify-between py-2 border-b border-gray-200">
      <div className="font-medium text-gray-700">{label}</div>
      <div className={coloredValue ? color : 'text-gray-900'}>
        {valueContent}
      </div>
    </div>
  )
}

export default TokenInfoItem
