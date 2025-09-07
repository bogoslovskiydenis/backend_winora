const { Router } = require("express");
const Service = require("./service");
const adminAuth = require("@/middleware/adminAuth");
const asyncHandler = require("@/helpers/asyncHandler");

const router = Router();
router.get(
  "/page/main",
  asyncHandler(async (req, res) => {
    const service = new Service();
    const response = await service.mainPage("main");
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      });
    else res.status(404).json({ status: "error" });
  })
);
router.get(
  "/page/:url",
  asyncHandler(async (req, res) => {
    const service = new Service();
    const response = await service.getPublicPostByUrl(req.params.url);
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      });
    else res.status(404).json({ status: "error" });
  })
);
router.post(
  "/admin/pages/update",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { data } = req.body;
    const service = new Service();
    const response = await service.update(data);
    res.status(200).json(response);
  })
);
router.post(
  "/admin/pages/:url",
  adminAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.params;
    const service = new Service();
    const response = await service.getPostById(url);
    if (response)
      res.status(200).json({
        status: "ok",
        body: response
      });
    else res.status(404).json({ status: "error" });
  })
);
router.post(
  "/admin/pages",
  adminAuth,
  asyncHandler(async (req, res) => {
    const service = new Service();
    const { lang, limit, offset } = req.body;
    const settings = { lang, limit, offset };
    const response = await service.indexAdmin(settings);
    res.status(200).json(response);
  })
);
module.exports = router;
