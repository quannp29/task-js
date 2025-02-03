const Task = require("../models/task.model");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = {
    deleted: false,
  };

  // Filter Status
  if (req.query.status) {
    find.status = req.query.status;
  }
  // End Filter Status

  // Search
  if(req.query.keyword) {
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
  }
  // End Search

  // Sort
  const sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  // End Sort

  // Pagination
  const pagination = {
    limit: 5,
    page: 1,
  };

  if (req.query.page) pagination.page = parseInt(req.query.page);

  if (req.query.limit) pagination.limit = parseInt(req.query.limit);

  const skip = (pagination.page - 1) * pagination.limit;
  // End Pagination

  const tasks = await Task.find(find)
    .sort(sort)
    .limit(pagination.limit)
    .skip(skip);

  res.json(tasks);
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id;

  const task = await Task.findOne({
    _id: id,
    deleted: false,
  });

  res.json(task);
};
