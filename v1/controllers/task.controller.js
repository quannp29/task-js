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
  try {
    const id = req.params.id;
  
    const task = await Task.findOne({
      _id: id,
      deleted: false,
    });
  
    res.json(task);
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tồn tại bản ghi"
    })    
  }
};

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;

    await Task.updateOne({
      _id: id
    }, {
      status: status
    });

    res.json({
      code: 200,
      message: "Cập nhật trạng thái thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tồn tại bản ghi!"
    });
  }
};

// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  const { ids, status } = req.body;

  const listStatus = ["initial", "doing", "finish", "pending", "notFinish"];

  if(!listStatus.includes(status)) {
    res.json({
      code: 400,
      message: `Trạng thái ${status} không hợp lệ!`
    });
    return;
  }

  try {
    await Task.updateMany({
      _id: { $in: ids }
    }, {
      status: status
    });
  
    res.json({
      code: 200,
      message: "Đổi trạng thái thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: `Đổi trạng thái không thành công!`
    });
  }
}

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  const task = new Task(req.body);
  await task.save();

  res.json({
    code: 200,
    message: "Tạo công việc thành công!"
  });
};

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  const id = req.params.id;
  const data = req.body;

  await Task.updateOne({
    _id: id
  }, data);

  res.json({
    code: 200,
    message: "Cập nhật công việc thành công!"
  });
};