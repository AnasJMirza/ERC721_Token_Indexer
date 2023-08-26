import {
  BlockHeader,
  DataHandlerContext,
  EvmBatchProcessor,
  EvmBatchProcessorFields,
  Log as _Log,
  Transaction as _Transaction,
} from "@subsquid/evm-processor";
import { BLOCKS_RANGE, DATASOURCE, ERC721_CONTRACT_ADDRESS, NETWORK } from "./constants";
import { Store } from "@subsquid/typeorm-store";
import * as CLONEX_ABI from "./abi/CloneX_ABI";

if (!NETWORK) {
  throw new Error(`'ARCHIVE' env variable is missing`);
}

if (!DATASOURCE) {
  throw new Error(`'${NETWORK}' sqd dataSource is not defined`);
}

export const processor = new EvmBatchProcessor()
  .setDataSource(DATASOURCE)
  .setFinalityConfirmation(10)
  .setBlockRange(BLOCKS_RANGE)
  .addLog({
    address: [ERC721_CONTRACT_ADDRESS],
    topic0: [CLONEX_ABI.events.Transfer.topic],
  })
  .setFields({
    log: {
      topics: true,
      data: true,
      transactionHash: true,
    },
  });

export type Fields = EvmBatchProcessorFields<typeof processor>;
export type Block = BlockHeader<Fields>;
export type Log = _Log<Fields>;
export type Transaction = _Transaction<Fields>;
export type ProcessorContext = DataHandlerContext<Store, Fields>;
