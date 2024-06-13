const express = require("express");
const { copyS3Folder } = require("../config/aws");
const router = express.Router();

router.post("/create", async (req: any, res: any) => {
  const { replId, language } = req.body;
  console.log("project create req", replId, language);

  await copyS3Folder(`base/${language}`, `code/${replId}`);
  res.send("Project created");
});

module.exports = router;
export {};
