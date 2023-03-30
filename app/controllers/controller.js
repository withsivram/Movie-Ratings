const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user.js');
const Data = require('../models/movie.model.js');
const cache = require('../../cache.js');

exports.register = async (req, res) => {
  const {username, password} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({username, password: hashedPassword});
  await user.save();
  res.send({message: 'User registered successfully'});
};

exports.login = async (req, res) => {
  const {username, password} = req.body;
  const user = await User.findOne({username});
  if (!user) {
    return res.status(400).send({message: 'Invalid username or password'});
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).send({message: 'Invalid username or password'});
  }
  const token = jwt.sign({userId: user._id}, 'mysecretkey');
  res.send({token});
};

exports.me = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({message: 'Unauthorized'});
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, 'mysecretkey');
      const user = await User.findById(payload.userId);
      res.send(user);
    } catch (err) {
      res.status(401).send({message: 'Unauthorized'});
    }
  };

exports.createData = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
    return res.status(401).send({message: 'Unauthorized'});
}
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, 'mysecretkey');
    let data;
    for(let i = 0; i < req.body.length; i++){
      let {movieName, rating} = req.body[i];
      data = new Data({userId: payload.userId, movieName, rating});
      await data.save();
      }
      res.send(data);
      console.log(data);
  } catch (err) {
      res.status(401).send({message: 'Unauthorized'});
    }
};
  

exports.getData = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message: 'Unauthorized'});
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, 'mysecretkey');

    // Get pagination and sorting parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'movieName';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination values
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Create cache key
    const cacheKey = `data:${payload.userId}:${page}:${limit}:${sortField}:${sortOrder}`;

    // Check if data is in cache
    let data = cache.get(cacheKey);
    if (!data) {
      // Find and sort data
      data = await Data.find({userId: payload.userId})
        .sort({[sortField]: sortOrder})
        .skip(startIndex)
        .limit(limit);
      for(let i=0;i<data.length;i++){
        data[i] = {movieName: data[i].movieName, rating: data[i].rating};
      }

      // Store data in cache
      cache.set(cacheKey, data);
    }

    // Create pagination object
    const pagination = {};
    if (endIndex < await Data.countDocuments({userId: payload.userId})) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.send({
      data,
      pagination
    });
  } catch (err) {
    res.status(401).send({message: 'Unauthorized'});
  }
};


exports.updateData = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({message: 'Unauthorized'});
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, 'mysecretkey');
      // const {movieName, rating} = req.body;
      const data = await Data.findOneAndUpdate({movieName: req.params.id, userId: payload.userId}, {movieName:req.body.movieName, rating: req.body.rating}, {new: true});
      if (!data) {
        return res.status(404).send({message: 'Data not found'});
      }
      res.send(data);
    } catch (err) {
      res.status(401).send({message: 'Unauthorized'});
    }
};

exports.deleteData = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message: 'Unauthorized'});
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, 'mysecretkey');
    const data = await Data.findOneAndDelete({movieName: req.params.id, userId: payload.userId});
    if (!data) {
      return res.status(404).send({message: 'Data not found'});
    }
    res.send(data);
  } catch (err) {
    res.status(401).send({message: 'Unauthorized'});
  }
};


