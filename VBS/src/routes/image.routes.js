const { Router, json } = require("express");
const { ACCEPTED } = require("http-status");
const multer = require("multer");
const {
  purgeTempController,
} = require("../controllers/image/purgeTemp.controller");
const { dummyAuthMiddleware } = require("../middlewares/dummyAuth.middleware");

const router = Router();

const multerDestination = `${__dirname}/../temp`;
const upload = multer({ dest: multerDestination });

router.use(json());

router.get("/ping", (req, res) => res.send("Successfully inside image routes"));

router.post(
  "/upload",
  dummyAuthMiddleware,
  upload.single("image"),
  (req, res) => {
    const { file } = req.file;
    // eslint-disable-next-line no-console
    console.log(file);
    res.status(ACCEPTED).json({ filename: file.filename });
  }
);

router.delete("/purge", dummyAuthMiddleware, purgeTempController);

module.exports = router;
