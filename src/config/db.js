const moongoose = require("mongoose");

const connectToDb = async() => {
  try {
    let url = process.env.DB_URI;
    await moongoose.connect(url);
    console.log('Connected to Db successfully!');
    
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectToDb;