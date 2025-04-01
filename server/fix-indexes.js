// Script to fix MongoDB indexes for direct messages

const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/test")
  .then(() => {
    console.log("Connected to MongoDB");
    fixIndexes();
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

async function fixIndexes() {
  try {
    console.log("Attempting to drop problematic indexes...");

    // Get a reference to the direct messages collection
    const db = mongoose.connection.db;
    const collection = db.collection("directmessages");

    // List all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", indexes);

    // Drop all problematic indexes - any that aren't using our snake_case fields
    const problemFields = [
      "senderId",
      "receiverId",
      "dm_id",
      "participants",
      "lastMessage",
    ];

    for (const index of indexes) {
      // Skip the _id index which is required
      if (index.name === "_id_") continue;

      // Check if this index contains any of our problem fields
      const hasProblemField = problemFields.some(
        (field) => index.key && field in index.key
      );

      // Or if any index keys are not in our schema's snake_case format
      const hasNonSnakeCaseField = Object.keys(index.key || {}).some(
        (field) =>
          field !== "_id" &&
          ![
            "sender_id",
            "receiver_id",
            "room_id",
            "content",
            "timestamp",
            "sender_name",
            "sender_pic",
            "read",
          ].includes(field)
      );

      if (hasProblemField || hasNonSnakeCaseField) {
        console.log("Found problematic index:", index.name);
        try {
          await collection.dropIndex(index.name);
          console.log("Successfully dropped index:", index.name);
        } catch (err) {
          console.error(`Error dropping index ${index.name}:`, err);
        }
      }
    }

    // Now create only the correct indexes we need
    console.log("Creating correct indexes...");

    // First remove any existing versions of our desired indexes to avoid conflicts
    try {
      await collection.dropIndex(
        "sender_id_1_receiver_id_1_content_1_timestamp_1"
      );
      console.log("Dropped existing compound index");
    } catch (err) {
      // Ignore if index doesn't exist
    }

    try {
      await collection.dropIndex("room_id_1_timestamp_1");
      console.log("Dropped existing room_id index");
    } catch (err) {
      // Ignore if index doesn't exist
    }

    try {
      await collection.dropIndex("receiver_id_1_read_1");
      console.log("Dropped existing receiver_id index");
    } catch (err) {
      // Ignore if index doesn't exist
    }

    // Create our desired indexes
    await collection.createIndex({ room_id: 1, timestamp: 1 });
    await collection.createIndex({ receiver_id: 1, read: 1 });
    await collection.createIndex(
      { sender_id: 1, receiver_id: 1, content: 1, timestamp: 1 },
      { unique: true }
    );

    console.log("Index repair completed successfully!");

    // Close connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing indexes:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}
