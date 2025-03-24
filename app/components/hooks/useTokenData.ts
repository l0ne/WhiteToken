'use client'

import { useState, useEffect } from 'react'
import { formatEther, Address, isAddress, parseEther, formatUnits } from 'viem'
import { 
  publicClient,
  tokenAbi, 
  TOKEN_ADDRESS,
  encodeTokenTransfer,
  encodeTokenApprove,
  encodeTokenTransferFrom,
  NetworkType,
  DEFAULT_NETWORK,
  createClient,
  getNetworkConfig,
  NETWORK_CONFIGS
} from '../../lib/viem-client'

export interface TokenData {
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  userAddress: string
  userBalance: string
}

export interface TransferStatus {
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  errorMessage: string
  hash?: string
}

// Custom hook for token data fetching
export const useTokenData = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>(DEFAULT_NETWORK)
  const [client, setClient] = useState({ 
    publicClient
  })
  const [tokenData, setTokenData] = useState<TokenData>({
    name: 'Loading...',
    symbol: 'Loading...',
    decimals: 18,
    totalSupply: 'Loading...',
    userAddress: '',
    userBalance: 'Loading...',
  })
  const [customDecimals, setCustomDecimals] = useState<number>(18)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [customTokenAddress, setCustomTokenAddress] = useState<string>(TOKEN_ADDRESS)
  const [inputTokenAddress, setInputTokenAddress] = useState<string>(TOKEN_ADDRESS)
  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    isPending: false,
    isSuccess: false,
    isError: false,
    errorMessage: '',
  })

  // Update client when network changes
  useEffect(() => {
    const newClient = createClient(selectedNetwork)
    setClient({
      publicClient: newClient.publicClient
    })
  }, [selectedNetwork])

  const fetchTokenData = async (address?: string, tokenAddress: Address = customTokenAddress as Address) => {
    try {
      setIsLoading(true)
      setError(null)

      // Get token name
      const name = await client.publicClient.readContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'name',
      }) as string

      // Get token symbol
      const symbol = await client.publicClient.readContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'symbol',
      }) as string

      // Get token decimals from contract or use custom value
      let decimals;
      try {
        decimals = await client.publicClient.readContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'decimals',
        }) as number;
        
        // Update custom decimals to match contract
        setCustomDecimals(decimals);
      } catch (err) {
        console.warn('Could not get decimals from contract, using custom value:', customDecimals);
        decimals = customDecimals;
      }

      // Get total supply
      const supply = await client.publicClient.readContract({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'totalSupply',
      })
      const formattedSupply = formatUnits(supply as bigint, decimals)

      // Set user address and balance
      let userAddr = ''
      let balance = 'N/A'

      if (address) {
        userAddr = address
        const rawBalance = await client.publicClient.readContract({
          address: tokenAddress,
          abi: tokenAbi,
          functionName: 'balanceOf',
          args: [address as Address],
        })
        balance = formatUnits(rawBalance as bigint, decimals)
      } else {
        // Try to get connected account
        const accounts = await window.ethereum?.request({ 
          method: 'eth_accounts' 
        }).catch(() => [])
        
        if (accounts && accounts.length > 0) {
          userAddr = accounts[0]
          
          const rawBalance = await client.publicClient.readContract({
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'balanceOf',
            args: [accounts[0] as Address],
          })
          balance = formatUnits(rawBalance as bigint, decimals)
        }
      }

      setTokenData({
        name,
        symbol,
        decimals,
        totalSupply: formattedSupply,
        userAddress: userAddr,
        userBalance: balance,
      })
    } catch (err) {
      console.error('Error fetching token data:', err)
      setError('Failed to load token data. Verify that the token address is correct and the blockchain is accessible.')
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch basic token data without connecting wallet
        const name = await client.publicClient.readContract({
          address: customTokenAddress as Address,
          abi: tokenAbi,
          functionName: 'name',
        }) as string
        
        const symbol = await client.publicClient.readContract({
          address: customTokenAddress as Address,
          abi: tokenAbi,
          functionName: 'symbol',
        }) as string
        
        // Try to get decimals, but use custom value if it fails
        let decimals: number;
        try {
          decimals = await client.publicClient.readContract({
            address: customTokenAddress as Address,
            abi: tokenAbi,
            functionName: 'decimals',
          }) as number;
          
          // Update custom decimals to match contract
          setCustomDecimals(decimals);
        } catch (err) {
          console.warn('Could not get decimals from contract, using custom value:', customDecimals);
          decimals = customDecimals;
        }
        
        const totalSupply = await client.publicClient.readContract({
          address: customTokenAddress as Address,
          abi: tokenAbi,
          functionName: 'totalSupply',
        }) as bigint
        
        setTokenData(prev => ({
          ...prev,
          name,
          symbol,
          decimals,
          totalSupply: formatUnits(totalSupply, decimals),
        }))
        
        setIsLoading(false)
        
        // We no longer auto-connect to previously connected accounts
        // This ensures user must explicitly connect their wallet
      } catch (err) {
        console.error('Error fetching token data:', err)
        setError('Failed to fetch token data')
        setIsLoading(false)
      }
    }
    
    fetchInitialData()
    
    // Set up an event listener for when accounts change in MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // MetaMask is locked or user has no accounts
          disconnectWallet()
        }
      }
      
      // Use non-null assertion since we've checked for existence
      window.ethereum!.on('accountsChanged', handleAccountsChanged)
      
      // Clean up the event listener when component unmounts
      return () => {
        window.ethereum!.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [customTokenAddress, client.publicClient, customDecimals])

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed')
      return
    }

    try {
      setError(null)
      const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' })
      setTokenData(prev => ({ ...prev, userAddress: accounts[0] }))
      fetchTokenData(accounts[0], customTokenAddress as Address)
    } catch (err) {
      console.error('Error connecting wallet:', err)
      setError('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setTokenData(prev => ({
      ...prev,
      userAddress: '',
      userBalance: 'N/A'
    }))
  }

  const handleTokenAddressChange = async () => {
    if (!isAddress(inputTokenAddress)) {
      setError('Invalid Ethereum address format')
      return
    }
    
    setCustomTokenAddress(inputTokenAddress)
    
    // Reset status and fetch data with new token address
    setTransferStatus({
      isPending: false,
      isSuccess: false,
      isError: false,
      errorMessage: ''
    })
    
    // If we have a connected wallet, update user balance
    if (tokenData.userAddress) {
      fetchTokenData(tokenData.userAddress, inputTokenAddress as Address)
    }
  }

  const handleTransfer = async (to: string, amount: string) => {
    if (!tokenData.userAddress) {
      setError('Please connect your wallet first')
      return
    }
    
    if (!isAddress(to)) {
      setError('Invalid recipient address')
      return
    }
    
    try {
      // Parse the amount using the correct decimals
      const parsedAmount = parseEther(amount) // We still use parseEther for now as we're entering ETH format amount
      
      // Reset previous transfer status
      setTransferStatus({
        isPending: true,
        isSuccess: false,
        isError: false,
        errorMessage: ''
      })
      
      // Create the transaction data
      const data = encodeTokenTransfer(to as Address, parsedAmount)
      
      // Send transaction via MetaMask
      const hash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{
          from: tokenData.userAddress,
          to: customTokenAddress,
          data
        }]
      })
      
      setTransferStatus({
        isPending: false,
        isSuccess: true,
        isError: false,
        errorMessage: '',
        hash
      })
      
      // Refresh token data after transfer
      setTimeout(() => {
        fetchTokenData(tokenData.userAddress, customTokenAddress as Address)
      }, 2000) // Delay to allow transaction to process
      
    } catch (err) {
      console.error('Transfer error:', err)
      setTransferStatus({
        isPending: false,
        isSuccess: false,
        isError: true,
        errorMessage: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    }
  }

  const handleApprove = async (spender: string, amount: string) => {
    if (!tokenData.userAddress) {
      setError('Please connect your wallet first')
      return
    }
    
    if (!isAddress(spender)) {
      setError('Invalid spender address')
      return
    }
    
    try {
      const parsedAmount = parseEther(amount)
      
      // Reset previous transfer status
      setTransferStatus({
        isPending: true,
        isSuccess: false,
        isError: false,
        errorMessage: ''
      })
      
      // Create the transaction data
      const data = encodeTokenApprove(spender as Address, parsedAmount)
      
      // Send transaction via MetaMask
      const hash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{
          from: tokenData.userAddress,
          to: customTokenAddress,
          data
        }]
      })
      
      setTransferStatus({
        isPending: false,
        isSuccess: true,
        isError: false,
        errorMessage: '',
        hash
      })
      
    } catch (err) {
      console.error('Approval error:', err)
      setTransferStatus({
        isPending: false,
        isSuccess: false,
        isError: true,
        errorMessage: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    }
  }

  const handleTransferFrom = async (from: string, to: string, amount: string) => {
    if (!tokenData.userAddress) {
      setError('Please connect your wallet first')
      return
    }
    
    if (!isAddress(from) || !isAddress(to)) {
      setError('Invalid address format')
      return
    }
    
    try {
      const parsedAmount = parseEther(amount)
      
      // Reset previous transfer status
      setTransferStatus({
        isPending: true,
        isSuccess: false,
        isError: false,
        errorMessage: ''
      })
      
      // Create the transaction data
      const data = encodeTokenTransferFrom(from as Address, to as Address, parsedAmount)
      
      // Send transaction via MetaMask
      const hash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{
          from: tokenData.userAddress,
          to: customTokenAddress,
          data
        }]
      })
      
      setTransferStatus({
        isPending: false,
        isSuccess: true,
        isError: false,
        errorMessage: '',
        hash
      })
      
      // Refresh token data after transfer
      setTimeout(() => {
        fetchTokenData(tokenData.userAddress, customTokenAddress as Address)
      }, 2000) // Delay to allow transaction to process
      
    } catch (err) {
      console.error('TransferFrom error:', err)
      setTransferStatus({
        isPending: false,
        isSuccess: false,
        isError: true,
        errorMessage: err instanceof Error ? err.message : 'Unknown error occurred'
      })
    }
  }

  const resetTransferStatus = () => {
    setTransferStatus({
      isPending: false,
      isSuccess: false,
      isError: false,
      errorMessage: ''
    })
  }

  return {
    tokenData,
    error,
    isLoading,
    connectWallet,
    disconnectWallet,
    customTokenAddress,
    inputTokenAddress,
    setInputTokenAddress,
    handleTokenAddressChange,
    handleTransfer,
    handleApprove,
    handleTransferFrom,
    transferStatus,
    resetTransferStatus,
    // Network selection
    selectedNetwork,
    setSelectedNetwork,
    networks: NETWORK_CONFIGS,
    // Custom decimals
    customDecimals,
    setCustomDecimals
  }
}

export default useTokenData
