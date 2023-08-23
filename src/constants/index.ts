import { KnownArchivesEVM } from "@subsquid/archive-registry";
import { DataSource } from "@subsquid/evm-processor";
import { Archives, Range } from "../types";

// Archives(Network) are datalakses from which all the data come.
// setting up from which archive(Network) we need the data.
// KnownArchivesEVM is the type in which all the supported archives from subsquid exist.
export const NETWORK: KnownArchivesEVM | undefined = process.env.ARCHIVE as KnownArchivesEVM;

const ETH_MAINNET = "eth-mainnet";
const ETH_GOERLI = "goerli";

const DATASOURCES: Archives<DataSource> = {
  [ETH_MAINNET]: {
    archive: `https://v2.archive.subsquid.io/network/ethereum-mainnet`,
    chain: "https://eth-mainnet.public.blastapi.io",
  },
  [ETH_GOERLI]: {
    archive: `https://v2.archive.subsquid.io/network/ethereum-goerli`,
    chain: "https://eth-goerli.public.blastapi.io",
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
