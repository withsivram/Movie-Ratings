const mongoose = require('mongoose');

// const movieSchema = mongoose.Schema({
//     movieName: String,
//     rating: {type: Number, min: 1, max: 10},
//     releaseYear: String,
//     genre: String,
//     summary: String
// }, {
//     timestamps: true
// });

// module.exports = mongoose.model('Movie', movieSchema);

const DataSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    movieName: String,
    rating: Number
  });
  
  const Data = mongoose.model('Data', DataSchema);
  
  module.exports = Data;