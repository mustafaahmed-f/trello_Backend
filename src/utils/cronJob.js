import schedule from "node-schedule";
import userModel from "../../DB/models/userModel.js";

export const deleteNonConfirmedUsers = () => {
  schedule.scheduleJob("* * * /1 *", async function () {
    const users = await userModel.find();

    for (const user of users) {
      if (user.confirmEmail == false) {
        await userModel.findByIdAndDelete(user._id);
      }
    }
  });
};
