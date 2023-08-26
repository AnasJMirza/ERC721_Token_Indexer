import * as CLONEX_ABI from "../abi/CloneX_ABI";
import { ERC721_CONTRACT_ADDRESS, MULTICALL_ADDRESS } from "../constants";
import { ProcessorContext } from "../processor";
import { EventData, TransferEventData } from "../types";
import { EntityManager } from "../utils/entityManager";
import { Transfer, User } from "../model";
import { last, uniq } from "lodash";
import { BlockContext } from "../abi/abi.support";
import { Multicall } from "../abi/multicall";
import axios from "axios";

export class PrefetchFactory {
  readonly blockCtx: BlockContext = { _chain: this.ctx._chain, block: last(this.ctx.blocks)!.header };
  eventsData: ReadonlyArray<EventData> = [];

  constructor(private ctx: ProcessorContext, private em: EntityManager) {}

  private getEventData<T extends EventData["type"]>(type: T) {
    return this.eventsData.filter((x) => x.type === type) as Extract<EventData, { type: T }>[];
  }

  async prefetch(): Promise<void> {
    this.eventsData = await this.processEventLogs();
    if (this.eventsData.length === 0) return;
    await Promise.all([this.prefetchTransfers(), this.prefetchUsers(), this.multicall()]);
  }

  // processing events data.
  async processEventLogs(): Promise<EventData[]> {
    return Promise.all(
      this.ctx.blocks.flatMap((block) =>
        block.logs.map(async (log) => {
          // do not get any other contract data.
          if (!ERC721_CONTRACT_ADDRESS.includes(log.address)) {
            return null as never;
          }
          // match logid and get the data of the transfer event.
          if (log.topics[0].toLowerCase() === CLONEX_ABI.events.Transfer.topic.toLowerCase()) {
            const { from, to, tokenId } = CLONEX_ABI.events.Transfer.decode(log);

            // const contract = new CLONEX_ABI.Contract(this.ctx, block.header, ERC721_CONTRACT_ADDRESS);
            // const metaData = await contract.tokenURI(tokenId)
            // console.log({ contract });
            const eventResponse: TransferEventData = {
              type: "Transfer",
              item: {
                id: log.id,
                tokenId,
                blockNumber: 34,
                from: from.toLowerCase(),
                to: to.toLowerCase(),
                timestamp: new Date(block.header.timestamp),
                txHash: log.transactionHash,
              },
            };
            return eventResponse;
          }
          return null as never;
        })
      )
    ).then((data) => data.filter((x) => x));
  }

  // prefetch Transfers
  async prefetchTransfers(): Promise<void> {
    // getting all the uniq ids of transfer events
    const transferIds = uniq(
      this.eventsData.flatMap((data) => {
        return data.item.id;
      })
    );

    // add all the ids in the entity manager
    this.em.defer(Transfer, ...transferIds);
    this.em.load(Transfer);

    // getting all uncashed ids
    const uncashedIds = transferIds.filter((id) => !this.em.has(Transfer, id));
    if (uncashedIds.length === 0) return;

    // 1. get the event data
    const transferData = this.getEventData("Transfer");
    if (!transferData) return;
    // create new trasnfers with uncashed ids
    for (const id of uncashedIds) {
      const transfer = transferData.find((x) => x.item.id === id);
      if (transfer) {
        const { blockNumber, from, id, timestamp, to, tokenId, txHash } = transfer.item;
        const newTransfer = new Transfer({
          id,
          blockNumber,
          from,
          to,
          tokenId,
          txHash,
          timestamp,
        });
        this.em.add(newTransfer);
      }
    }
  }

  // prefetch Users
  async prefetchUsers(): Promise<void> {
    // getting user ids from the event
    const userIds = uniq(
      this.eventsData.flatMap((data) => {
        return [data.item.from, data.item.to];
      })
    );

    // save the user to entity manager
    this.em.defer(User, ...userIds);
    this.em.load(User);

    // uncashed ids that are not in the events data
    const uncashedIds = userIds.filter((id) => !this.em.has(User, id));
    if (uncashedIds.length === 0) return;

    // create new users
    for (const id of uncashedIds) {
      const newUser = new User({
        id,
        balance: 0n,
      });
      this.em.add(newUser);
    }
  }

  async multicall(): Promise<void> {
    const tokenIds = this.getEventData("Transfer").map((x) => x.item.tokenId);

    // getting the data using multicall to improve performance
    let lastBatchBlockHeader = this.ctx.blocks[this.ctx.blocks.length - 1].header;
    let contract = new Multicall(this.ctx, lastBatchBlockHeader, MULTICALL_ADDRESS);

    let tokenURIs = await contract.aggregate(
      CLONEX_ABI.functions.tokenURI,
      ERC721_CONTRACT_ADDRESS,
      tokenIds.map((id) => [id]),
      50 // paginating to avoid RPC timeouts
    );

    // request to all the http urls and get the metadata.
    // const metadata = await Promise.all(tokenURIs.map(async (url) => await axios.get(url))).then((data) =>
    //   data.filter((x) => x)
    // );

    // for (let data of metadata) {
    //   console.log(data.data);
    // }
  }
}
