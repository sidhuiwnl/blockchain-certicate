/* Lightweight MetaMask helpers and read-only contract access */

import { toCertId } from './hash';
import { createPublicClient, createWalletClient, getContract, http, parseEther } from 'viem';
import { mainnet, goerli, sepolia } from 'viem/chains';
import { abi as REGISTRY_ABI } from './certRegistryAbi';

// Fallback dynamic import of JSON since TS can't import JSON without config tweaks
// Provide a tiny wrapper to load ABI at runtime
export async function loadRegistryAbi(): Promise<any> {
  const mod = await import('./CertRegistry.abi.json');
  return (mod as any).default ?? mod;
}

export function getContractAddress(): string | null {
  const addr = import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined;
  return addr || null;
}

export function getRpcUrl(): string | null {
  const url = import.meta.env.VITE_RPC_URL as string | undefined;
  return url || null;
}

export function getChain() {
  const url = getRpcUrl();
  if (!url) return mainnet;
  if (url.includes('goerli')) return goerli;
  if (url.includes('sepolia')) return sepolia;
  return mainnet;
}

export function getPublicClient() {
  const url = getRpcUrl();
  if (!url) return null;
  return createPublicClient({ transport: http(url), chain: getChain() });
}

export async function readOnChainCert(certIdHex32: `0x${string}`) {
  const client = getPublicClient();
  const address = getContractAddress();
  if (!client || !address) return null;
  const abi = await loadRegistryAbi();
  const contract = getContract({ address: address as `0x${string}`, abi, client });
  try {
    const result = await contract.read.get([certIdHex32]);
    return result as { contentHash: `0x${string}`; issuer: `0x${string}`; issuedAt: bigint; revoked: boolean; uri: string };
  } catch (e) {
    console.error('readOnChainCert error', e);
    return null;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function isEthereumAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function requestAccounts(): Promise<string[]> {
  if (!isEthereumAvailable()) return [];
  try {
    const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts;
  } catch (error) {
    console.error('eth_requestAccounts failed', error);
    return [];
  }
}

export async function getAccounts(): Promise<string[]> {
  if (!isEthereumAvailable()) return [];
  try {
    const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts;
  } catch (error) {
    console.error('eth_accounts failed', error);
    return [];
  }
}

export async function getChainId(): Promise<string | null> {
  if (!isEthereumAvailable()) return null;
  try {
    const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('eth_chainId failed', error);
    return null;
  }
}

export function shortenAddress(address?: string | null): string {
  if (!address) return '';
  return address.slice(0, 6) + '…' + address.slice(-4);
}

export function getWalletClient() {
  if (!isEthereumAvailable()) return null;
  return createWalletClient({
    transport: window.ethereum,
    chain: getChain(),
  });
}

export async function writeOnChainIssue(certIdHex32: `0x${string}`, contentHashHex32: `0x${string}`, uri: string) {
  const client = getWalletClient();
  const address = getContractAddress();
  if (!client || !address) return null;
  const abi = await loadRegistryAbi();
  const contract = getContract({ address: address as `0x${string}`, abi, client });
  try {
    const hash = await contract.write.issue([certIdHex32, contentHashHex32, uri]);
    return hash;
  } catch (e) {
    console.error('writeOnChainIssue error', e);
    return null;
  }
}

export { toCertId };


