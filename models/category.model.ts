import { Schema, model, models } from "mongoose";

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const Category = models?.Brand || model("Category", categorySchema);

export default Category;
