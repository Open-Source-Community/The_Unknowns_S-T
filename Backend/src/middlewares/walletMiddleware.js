import { TransactionType } from "../data/constants.js";

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
  const skip = req.query.skip;
  const take = req.query.take;



if (skip !== undefined) {
  const skipInt = parseInt(skip);
  if (isNaN(skipInt) || skipInt < 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid skip value. Pagination starting index cannot be negative."
    });
  }
}


  // 2. Validate take
  if (take) {
    const takeInt = parseInt(take);
    if (isNaN(takeInt) || takeInt < 0 || takeInt > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid take value. Must be between 0 and 100."
      });
    }
    req.query.take = takeInt;
  }

  // Validate minBalance
  if (minB !== undefined && minB !== '' && (isNaN(parseFloat(minB)) || parseFloat(minB) < 0)) {
    return res.status(400).json({
      success: false,
      error: "Invalid minBalance value. Must be a non-negative number."
    });
  }
  // Validate maxBalance
  if (maxB !== undefined && maxB !== '' && (isNaN(parseFloat(maxB)) || parseFloat(maxB) < 0)) {
    return res.status(400).json({
      success: false,
      error: "Invalid maxBalance value. Must be a non-negative number."
    });
  }
  // Validate minBalance <= maxBalance
  if (
    minB !== undefined && minB !== '' &&
    maxB !== undefined && maxB !== '' &&
    parseFloat(minB) > parseFloat(maxB)
  ) {
    return res.status(400).json({
      success: false,
      error: "minBalance cannot be greater than maxBalance."
    });
  }
  next();
};


export const validateTransactionFilters = (req, res, next) => {
  const { skip,take,startDate, endDate, type } = req.query;

if (skip !== undefined) {
  const skipInt = parseInt(skip);
  if (isNaN(skipInt) || skipInt < 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid skip value. Pagination starting index cannot be negative."
    });
  }
}


  // 2. Validate take
  if (take) {
    const takeInt = parseInt(take);
    if (isNaN(takeInt) || takeInt < 0 || takeInt > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid take value. Must be between 0 and 100."
      });
    }
    req.query.take = takeInt;
  }


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
