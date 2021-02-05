const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init({
    env: "cyr-8gbthlqn6c4254da"
})
// 初始化数据库
const db = cloud.database()
const _ = db.command

const ivctCollection = "ivct"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取详情
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(ivctCollection).where({
                visitRecordId: event.visitRecordId
            }).get()
            // 存在返回
            if (res.data.length > 0) {
                ctx.body = {
                    code: 1,
                    data: res.data[0]
                }
            } else {
                // 不存在创建，返回id
                const addRes = await db.collection(ivctCollection).add({
                    visitRecordId: event.visitRecordId
                })
                ctx.body = {
                    code: 1,
                    data: {
                        _id: addRes.id,
                    }
                }
            }
        } catch (error) {
            console.error(error);
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }

    })

    // 更新风险评估
    app.router("setRiskAssessment", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                riskAssessment: event.riskAssessment,
                doctorId: event.doctorId,
                doctorName: event.doctorName
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新开始知情时间
    app.router("setStartWitting", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                startWitting: event.startWitting
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新签署知情时间
    app.router("setEndWitting", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                endWitting: event.endWitting
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新前NIHSS评分
    app.router("setBeforeNIHSS", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                beforeNIHSS: event.beforeNIHSS
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新后NIHSS评分
    app.router("setAfterNIHSS", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                afterNIHSS: event.afterNIHSS
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新溶栓开始时间
    app.router("setStartTime", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                startTime: event.startTime
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新溶栓用药信息
    app.router("setMedicineInfo", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                medicineInfo: event.medicineInfo
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新不良反应
    app.router("setAdverseReaction", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                adverseReaction: event.adverseReaction
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新完成时间
    app.router("setEndTime", async (ctx, next) => {
        try {
            await db.collection(ivctCollection).doc(event.id).update({
                endTime: event.endTime
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })


    return app.serve()

};
