import TokenInfo from './components/TokenInfo'

export default function Page() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }} className="bg-blue-50">
      <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          WhiteToken Dashboard
        </h1>
        <p style={{ color: '#4b5563', maxWidth: '28rem', margin: '0 auto' }}>
          Your ERC20 token information portal. Check your balance, view token metrics, and connect your wallet.
        </p>
      </header>
      
      <main style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <TokenInfo />
      </main>
      
      <footer style={{ 
        marginTop: '2.5rem', 
        textAlign: 'center', 
        fontSize: '0.875rem', 
        color: '#6b7280' 
      }}>
        <p> {new Date().getFullYear()} WhiteToken. Built with Viem, Next.js and Tailwind CSS.</p>
      </footer>
    </div>
  )
}