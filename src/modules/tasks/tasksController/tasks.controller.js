import moment from "moment/moment.js";
import tasksModel from "../../../../DB/models/tasksModel.js";
import userModel from "../../../../DB/models/userModel.js";
import { asyncHandler } from "../../../utils/errorHandling.js";
import cloudinary from "../../../utils/cloudinary.js";

const addTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignTo, deadline } = req.body;

  const assignee = await userModel.findOne({ _id: assignTo });
  if (!assignee) {
    return next(new Error("Assignee not found !", { cause: 400 }));
  }

  const newTask = await tasksModel.create({
    title,
    description,
    assignTo,
    deadline: new Date(`${deadline}`),
    userID: req.user.id,
  });
  if (!newTask) {
    return next(new Error("Failed to add task !", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done", task: newTask });
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { _id } = req.query;
  const { title, description, assignTo, status, deadline } = req.body;

  const findTask = await tasksModel.findOne({ userID: req.user.id, _id });
  if (!findTask) {
    return next(
      new Error("User is not the creator of the task or task not found !", {
        cause: 400,
      })
    );
  }

  const updatedTask = await tasksModel.findByIdAndUpdate(
    _id,
    { title, description, assignTo, status, deadline },
    { new: true }
  );

  if (!updatedTask) {
    return next(new Error("Failed to update task !", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done", newTask: updatedTask });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { _id } = req.query;

  const deletedTask = await tasksModel.findOneAndDelete({ userID: req.user.id, _id });
  if (!deletedTask) {
    return next(
        new Error("User is not the creator of the task or task not found", {
          cause: 400,
        })
      );
  }

  //Deleting Attachments : 

  for (const file of deletedTask.attachments) {
   await cloudinary.uploader
    .destroy(file.public_id)
    .then((result) => console.log(result));
  
  }

  // const updatedAssignee = await userModel.updateMany(
  //   { tasks: { $elemMatch: { $eq: _id } } },
  //   {
  //     $pull: { tasks: { $eq: _id } },
  //   }
  // );

  // if (!updatedAssignee) {
  //   return next(
  //     new Error("Failed to remove task from user/s !", { cause: 400 })
  //   );
  // }

  return res.status(200).json({ message: "Task deleted successfully !" });
});

const removeListOfTasks = asyncHandler(async (req, res, next) => {
  // Remove tasks created by the same person
  const tasks = await tasksModel.deleteMany({userID:req.user.id})
  if(!tasks){return next(new Error("Failed to delete tasks !" , {cause:400}))}
  return res.status(200).json({message:"Tasks have been deleted successfully!"})
});

const getAllTasksWithUser = asyncHandler(async (req, res, next) => {
  const tasks = await tasksModel
    .find()
    .populate({
      path: "userID",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    })
    .populate({
      path: "assignTo",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    });

  if (!tasks) {
    return next(new Error("No tasks found", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done", Tasks: tasks });
});

const getTasksOfOneUser = asyncHandler(async (req, res, next) => {
  const tasks = await tasksModel
    .find({ userID: req.user.id })
    .populate({
      path: "userID",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    })
    .populate({
      path: "assignTo",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    });

  if (!tasks) {
    return next(new Error("No tasks found", { cause: 400 }));
  }

  return res.status(200).json({ message: "Done", Tasks: tasks });
});

const getTasksOfaUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.params;

  const tasks = await tasksModel
    .find({ assignTo: _id })
    .populate({
      path: "assignTo",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    })
    .populate({
      path: "userID",
      select: ["userName", "firstName", "lastName", "age", "gender"],
    });

  if (!tasks) {
    return next(new Error("No Tasks were found !", { cause: 404 }));
  }
  return res.status(200).json({ message: "Done", Tasks: tasks });
});



const tasksAfterDeadline = asyncHandler(async (req, res, next) => {
  const tasks = await tasksModel.find({
    $or: [{ status: "toDo" }, { status: "doing" }],
  });
  if (!tasks) {
    return res.status(404).json({ message: "All tasks are done !" });
  }

  const currentDate = new Date();

  const finalTasks = tasks.filter((x) => {
    return (
      moment(currentDate.toISOString()).isAfter(
        x.deadline.toISOString().substring(0, 10)
      ) == true
    );
  });

  if (!finalTasks.length) {
    return res.status(404).json({ message: "No tasks after deadline !" });
  }

  return res.status(200).json({ message: "Done", Tasks: finalTasks });
});


const updateStatus = asyncHandler(async (req, res, next) => {
  const { _id } = req.query;
  const { status } = req.body;
  const user = await userModel.findById(req.user.id);
  const task = await tasksModel.findById(_id);
  if (task.assignTo != user._id) {
    return next(
      new Error("User can't update task's status ! ", { cause: 400 })
    );
  }

  const newTask = await tasksModel.findByIdAndUpdate(
    _id,
    { status },
    { new: true }
  );
  return res
    .status(200)
    .json({ message: "Status updated successfully !", Task: newTask });
});


const uploadAttachment = asyncHandler(async (req, res, next) => {
  const { _id } = req.query;
  const attachments = [];

  for (const file of req.files) {
    console.log(file.path);
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      { folder: `Trello/tasks/${_id}` }
    );

    attachments.push({
      secure_url: `${secure_url}`,
      public_id: `${public_id}`,
    });
  }
 

  const task = await tasksModel.findOneAndUpdate(
    { userID: req.user.id, _id },
    { $push: { attachments: [...attachments] } },
    { new: true }
  );
  if (!task) {
    return next(
      new Error("No tasks found or user is not the creator of the task !", {
        cause: 404,
      })
    );
  }
  return res
    .status(200)
    .json({ message: "Done", files: req.files, Task: task });
});

// const removeAttachments = asyncHandler(
//     async(req,res,next)=>{
//         const {_id} = req.query;

//         const task = await tasksModel.findById(_id)
//         if(task.userID != req.user.id){return next(new Error("User is not the creator of the task !" , {cause:400}))}

//         for (const file of task.attachments) {
//             fs.unlink(file , (err)=>{
//                 if(err){return next(new Error("Failed to delete file/s !" , {cause : 400}))}
//             })
//         }

//         await userModel.findByIdAndUpdate(req.user.id,{$set:{coverImages:[]}})
//         return res.status(200).json({message:"Cover images were successfully deleted !"})
//     }
// )

export {
  addTask,
  updateTask,
  deleteTask,
  getAllTasksWithUser,
  getTasksOfOneUser,
  tasksAfterDeadline,
  getTasksOfaUser,
  removeListOfTasks,
  uploadAttachment,
  updateStatus,
};
