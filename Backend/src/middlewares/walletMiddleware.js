import { TransactionType } from "../data/constants.js";
export { validatePagination } from "./paginationMiddleware.js";

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

export const validateWalletFilters = (req, res, next) => {
  const minB = req.query.minBalance;
  const maxB = req.query.maxBalance;

  const min = (minB !== undefined && minB !== '') ? parseFloat(minB) : undefined;
  const max = (maxB !== undefined && maxB !== '') ? parseFloat(maxB) : undefined;

  // Validate minBalance 
  if (min !== undefined && (isNaN(min) || min < 0)) {
    return res.status(400).json({
      success: false,
      error: "Invalid minBalance value. Must be a non-negative number."
    });
  }

  // Validate maxBalance
  if (max !== undefined && (isNaN(max) || max < 0)) {
    return res.status(400).json({
      success: false,
      error: "Invalid maxBalance value. Must be a non-negative number."
    });
  }

  // Validate range
  if (min !== undefined && max !== undefined && min > max) {
    return res.status(400).json({
      success: false,
      error: "minBalance cannot be greater than maxBalance."
    });
  }
  next();
};

export const validateTransactionFilters = (req, res, next) => {
  const { startDate, endDate, type } = req.query;

  if (startDate) {
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid startDate format. Use YYYY-MM-DD format."
      });
    }
  }
  if (endDate) {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid endDate format. Use YYYY-MM-DD format."
      });
    }
  }
  // Validate date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({
        success: false,
        error: "startDate must be before endDate."
      });
    }
  }
  // Validate transaction type if provided
  if (type) {
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    const validTypes = Object.values(TransactionType);

    if (!validTypes.includes(formattedType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid transaction type. Allowed values: ${validTypes.join(', ')}`
      });
    }
    req.query.type = formattedType;
  }
  next();
};
