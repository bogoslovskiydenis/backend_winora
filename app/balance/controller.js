const { Router } = require("express")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")
const balanceService = require("@/app/balance/service")

const router = Router()

router.post(
    "/admin/balance/:operation",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { operation } = req.params
        const { id: editorId, userId, amount, currency, comment = "" } = req.body

        const payload = {
            operation,
            editorId,
            userId,
            amount,
            currency,
            comment
        }

        const { status, body, errors } = await balanceService.processOperation(payload)

        res.status(200).json(status === "ok" ? { status, body } : { status, errors })
    })
)

module.exports = router


