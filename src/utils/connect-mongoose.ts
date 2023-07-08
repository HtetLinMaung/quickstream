import mongoose from "mongoose";

export default async function connectMongoose() {
  return mongoose.connect(process.env.MONGODB_CONNECTION);
}
