import mongoose from "mongoose";

const connectToDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      dbName: "testing-01",
      bufferCommands: true,
    });
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database: ", error);
  }
};

export default connectToDB;
