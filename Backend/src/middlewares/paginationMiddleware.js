export const validatePagination = (req, res, next) => {
  const { skip, take } = req.query;
  const skipInt = (skip !== undefined && skip !== '') ? parseInt(skip, 10) : undefined;
  const takeInt = (take !== undefined && take !== '') ? parseInt(take, 10) : undefined;
  // Validate skip
  if (skipInt !== undefined && (isNaN(skipInt) || skipInt < 0)) {
    return res.status(400).json({
      success: false,
      error: "Invalid skip value. Pagination starting index cannot be negative."
    });
  }
  req.query.skip = skipInt;

  // Validate take
  if (takeInt !== undefined && (isNaN(takeInt) || takeInt < 0 || takeInt > 100)) {
    return res.status(400).json({
      success: false,
      error: "Invalid take value. Must be between 0 and 100."
    });
  }
  req.query.take = takeInt;

  next();
};
