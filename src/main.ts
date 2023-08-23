import { TypeormDatabase } from "@subsquid/typeorm-store";
import { processor } from "./processor";
import { EntityManager } from "./utils/entityManager";
import { PrefetchFactory } from "./mappings/prefetchFactory";
import { Transfer, User } from "./model";

processor.run(new TypeormDatabase({ supportHotBlocks: true }), async (ctx) => {
  const em = new EntityManager(ctx.store);
  const factory = new PrefetchFactory(ctx, em);
  await factory.prefetch();

  if (!em.hasData()) return;

  for (const data of factory.eventsData) {
    const transfer = em.get(Transfer, data.item.id, false);
    let user = em.get(User, data.item.to, false);

    if (user && transfer) {
      user = new User({
        ...user,
        balance: user.balance + 1n,
        ownedToken: [...user.ownedToken, Number(transfer.tokenId)],
      });
      em.add(user);
    }
  }

  await ctx.store.save(em.values(Transfer));
  await ctx.store.save(em.values(User));
});
