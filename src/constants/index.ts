import { KnownArchivesEVM } from "@subsquid/archive-registry";
import { DataSource } from "@subsquid/evm-processor";
import { Archives, Range } from "../types";

// Archives(Network) are datalakses from which all the data come.
// setting up from which archive(Network) we need the data.
// KnownArchivesEVM is the type in which all the supported archives from subsquid exist.
export const NETWORK: KnownArchivesEVM | undefined = "eth-mainnet" as KnownArchivesEVM;
export const MULTICALL_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

const ETH_MAINNET = "eth-mainnet";
const ETH_GOERLI = "goerli";

const DATASOURCES: Archives<DataSource> = {
  [ETH_MAINNET]: {
    archive: `https://v2.archive.subsquid.io/network/ethereum-mainnet`,
    chain: "https://eth-mainnet.blastapi.io/34b74501-dba6-4774-bb89-06cc751687f0",
  },
  [ETH_GOERLI]: {
    archive: `https://v2.archive.subsquid.io/network/ethereum-goerli`,
    chain: "https://eth-goerli.blastapi.io/34b74501-dba6-4774-bb89-06cc751687f0",
  },
};

const ERC721_CONTRACT_ADDRESSES: Archives = {
  [ETH_MAINNET]: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B".toLowerCase(),
  [ETH_GOERLI]: "0x49cF6f5d44E70224e2E23fDcdd2C053F30aDA28B".toLowerCase(),
};

const BLOCK_RANGES: Archives<Range> = {
  [ETH_MAINNET]: { from: 13677664 },
  [ETH_GOERLI]: { from: 13677664 },
};

export const DATASOURCE = DATASOURCES[NETWORK]!;
export const ERC721_CONTRACT_ADDRESS = ERC721_CONTRACT_ADDRESSES[NETWORK]!;
export const BLOCKS_RANGE = BLOCK_RANGES[NETWORK]!;
