import { DepositButton } from './DepositButton'
import { formatDistanceToNow } from 'date-fns'
import { Deposit } from '../chain/balance'

type Props = {
  address: `0x${string}`
  addressName: string
  balance: string
  deposits: Deposit[]
  refetch: () => void
}

export function DepositScreen({ address, addressName, balance, deposits, refetch }: Props) {
  return (
    <div className="w-full max-w-md space-y-8">
      {/* Balance */}
      <div className="text-center">
        <div className="text-5xl font-bold mb-2">
          ${Number(balance).toFixed(2)}
        </div>
      </div>

      {/* APY and ENS */}
      <div className="flex justify-between items-center text-gray-600">
        <div>6.14% APY</div>
        <div>{addressName}</div>
      </div>

      {/* Deposit Button */}
      <div className="flex justify-center">
        <DepositButton recipientAddr={address} refetch={refetch} />
      </div>

      {/* Recent Deposits */}
      {deposits.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recent Deposits</h3>
          <div className="space-y-2">
            {deposits.map((deposit, i) => (
              <a 
                key={i}
                href={deposit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div>
                  <div className="font-medium">${deposit.amountUsd}</div>
                  <div className="text-sm text-gray-500">
                    {formatDistanceToNow(deposit.timestamp * 1000, { addSuffix: true })}
                  </div>
                </div>
                <div className="text-gray-400">→</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 