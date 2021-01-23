const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

const evtCollection = "evt"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取血管内治疗内容
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(evtCollection).where({
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
                const addRes = await db.collection(evtCollection).add({
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

    // 更新开始知情时间
    app.router("setStartWitting", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
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
            await db.collection(evtCollection).doc(event.id).update({
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
            await db.collection(evtCollection).doc(event.id).update({
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
            await db.collection(evtCollection).doc(event.id).update({
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

    // 更新到达手术室时间
    app.router("setArriveTime", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                arriveTime: event.arriveTime
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

    // 更新手术开始时间
    app.router("setStartTime", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                startTime: event.startTime,
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

    // 更新责任评估时间
    app.router("setAssetsTime", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                assetsTime: event.assetsTime
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

    // 更新开始穿刺时间
    app.router("setPunctureTime", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                punctureTime: event.punctureTime
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

    // 更新造影完成时间
    app.router("setRadiographyTime", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                radiographyTime: event.radiographyTime
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

    // 更新 是否仅造影
    app.router("setOnlyRadiography", async (ctx, next) => {
        try {
            await db.collection(evtCollection).doc(event.id).update({
                onlyRadiography: event.onlyRadiography
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

    // 更新手术方法
    app.router("setMethods", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
                methods: event.methods
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

     // 更新手术再通时间
     app.router("setRevascularizationTime", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
                revascularizationTime: event.revascularizationTime
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

    // 更新手术完成时间
    app.router("setEndTime", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
                endTime: event.endTime,
                state: true
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

    // 更新mTICI分级信息
    app.router("setMTICI", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
                mTICI: event.mTICI
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

    // 更新治疗结果
    app.router("setResult", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
                result: event.result
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

    // 更新不良事件
    app.router("setAdverseReaction", async(ctx, next)=>{
        try {
            await db.collection(evtCollection).doc(event.id).update({
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

    return app.serve()

};
