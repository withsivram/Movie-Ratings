// module.exports = (app) => {
//     const movies = require('../controllers/movie.controller.js');

//     // Create a new listing
//     app.post('/movies', movies.create);

//     // Retrieve all listing
//     app.get('/movies', movies.findAll);

//     // Retrieve a single listing with listingID
//     app.get('/movies/:movieId', movies.findOne);

//     // Update a listing with listingId
//     app.put('/movies/:movieId', movies.update);

//     // Delete a Listing with lisitngId
//     app.delete('/movies/:movieId', movies.delete);
// }

const express = require('express');
const controller = require('../controllers/controller.js');

const router = express.Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/me', controller.me);
router.post('/data', controller.createData);
router.get('/data', controller.getData);
router.put('/data/:id', controller.updateData);
router.delete('/data/:id', controller.deleteData);

module.exports = router;

