const { Router } = require("express")
const investmentChangesService = require("@/app/investment_changes/service")
const { createResponse } = require("@/helpers/functions")
const asyncHandler = require("@/helpers/asyncHandler")
const adminAuth = require("@/middleware/adminAuth")

const router = Router()

router.post(
    "/admin/investment-changes/filters/:url",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { url } = req.params
        const { editor, field, periodFrom, periodTo } = req.body
        const response = await investmentChangesService.filters(url, {
            field,
            editor,
            periodFrom,
            periodTo
        })
        res.status(200).json(createResponse(response))
    })
)

router.post(
    "/admin/investment-changes/report",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { id, admin, self } = req.body
        const response = {
            status: "ok",
            body: {
                test: "Test 1"
            }
        }
        response.body.path = await investmentChangesService.report(id, self, admin)
        res.status(200).json(createResponse(response))
    })
)

router.post(
    "/admin/investment-changes/distinct-admin/:url",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { url } = req.params
        const { id } = req.body
        const response = await investmentChangesService.getDistinctAdminByInvestmentId(
            url,
            id
        )
        res.status(200).json(createResponse(response))
    })
)

router.post(
    "/admin/investment-changes/distinct-fields/:url",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { url } = req.params
        const { id } = req.body
        const response =
            await investmentChangesService.getDistinctFieldsByInvestmentId(
                url,
                id
            )
        res.status(200).json(createResponse(response))
    })
)

router.post(
    "/admin/investment-changes/:url",
    adminAuth,
    asyncHandler(async (req, res) => {
        const { url } = req.params
        const { id } = req.body
        const response = await investmentChangesService.getPostByInvestmentId(url, id)
        res.status(200).json(createResponse(response))
    })
)

module.exports = router

