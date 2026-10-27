export const withIdempotency = async (prisma, idempotencyKey, category, fn, options = {}) => {
  // throw error if idempotency key is not provided
  if (!idempotencyKey || !category) {
    throw new Error("Idempotency key and category are required");
  }

  // format result after execution method
  const formatResult = (txRecord) => {
    // validate existing transaction
    if (options.validateExisting) {
      options.validateExisting(txRecord);
    }

    const base = {
      success: true,
      alreadyProcessed: true,
      transaction: txRecord,
      wallet: txRecord.wallet,
      order: txRecord.order
    };

    if (txRecord.order) {
      return {
        ...txRecord.order,
        ...base,
        alreadyProcessed: true
      };
    }

    return base;
  };

  // fetch existing record method
  const fetchExisting = async () => {

    return await prisma.transaction.findUnique({
      where: {
        idempotencyKey_category: {
          idempotencyKey,
          category
        }
      },
      include: {
        wallet: true,
        order: { include: { items: true } }
      }
    });
  };

  // main logic
  // 1. Check for existing record
  const existing = await fetchExisting();
  if (existing) {
    return formatResult(existing);
  }

  // 2. Run fn inside the transaction, catch P2002 collision
  try {
    return await prisma.$transaction(async (tx) => {
      return await fn(tx);
    })
  } catch (error) {
    if (error.code === 'P2002') {
      const collisionRecord = await fetchExisting();
      if (collisionRecord) {
        return formatResult(collisionRecord);
      }
    }
    throw error;
  }
};
