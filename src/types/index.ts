import { KnownArchivesEVM } from "@subsquid/archive-registry";

export type Archives<T = string> = Partial<Record<KnownArchivesEVM, T>>;

/**
 * Closed range of numbers
 */
export interface Range {
  /**
   * Start of segment (inclusive)
   */
  from: number;
  /**
   * End of segment (inclusive). Defaults to infinity.
   */
  to?: number;
}

export interface TransferEventData {
  type: "Transfer";
  item: {
    id: string;
    from: string;
    to: string;
    tokenId: bigint;
    timestamp: Date;
    blockNumber: number;
    txHash: string;
  };
}

export interface User {
  id: string;
  balance: bigint;
  tokenIds: [bigint];
}

export type EventData = TransferEventData;
