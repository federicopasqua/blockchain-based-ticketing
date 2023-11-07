import { parseUnits, formatUnits } from 'ethers';
// 1 000 000 000 000 000 000
// 1 000 000 000
// 1
export function formatAmount(amount: string): string {
  const parsedAmount = parseUnits(amount.toString(), 'wei');
  if (amount.length > 15) {
    const remainder = parsedAmount % 1000000000000n;
    return `${+formatUnits(parsedAmount - remainder, 'ether')} Ξ`;
  } else if (amount.length > 6) {
    const remainder = parsedAmount % 100000n;
    return `${+formatUnits(parsedAmount - remainder, 'gwei')} Gwei`;
  }
  return `${+formatUnits(parsedAmount, 'wei')} wei`;
}
