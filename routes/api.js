const express = require('express');
const router = express.Router();

const createError = require('http-errors');
const path = require('path');
const sharp = require('sharp');
const multer = require('multer');
const upload = multer({
	limits: {
		fileSize: 10 * 1024 * 1024	// Max 4MB
	}
});


const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


/* GET home page. */
router.get('/', function(req, res, next) {
 	res.json({
		"Hello": "World"
	});
});

// Avatar example
router.get("/avatar", function(req, res, next) {
	res.sendFile(path.resolve("cache/avatar.png"));
});

router.post("/avatar/upload", upload.single("avatar"), async function(req, res, next) {
	const filename = await sharp(req.file.buffer)
	.resize(300, 300, {
		fit: sharp.fit.inside,
		withoutEnlargement: true
	})
	.png()
	.toFile("cache/avatar.png");

	res.json({
		"success": true,
		"filename": filename
	});
});

// Collect all handler
router.all("*", function(req, res, next) {
	next(createError(404, "API Not Found"));
});

// Error processor
router.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.json({
		code: err.status || undefined,
		message: err.message || undefined,
		details: req.app.get('env') === "development" ?
			err.stack.split("\n") : undefined
	});
});

module.exports = router;
