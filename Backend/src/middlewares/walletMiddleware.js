export const validateIdempotency = (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ 
      success: false,
        error: "Transaction cannot be processed without a unique request ID." 
    });
  }
  next();
};