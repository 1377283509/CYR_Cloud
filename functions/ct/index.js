// CT相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const ctCollection = "ct"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(ctCollection).where({
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
                const addRes = await db.collection(ctCollection).add({
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
            console.log(error);
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }

    })

    // 更新照片信息
    app.router("setImages", async (ctx, next) => {
        try {
            await db.collection(ctCollection).doc(event.id).update({
                images: event.images
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

    // 开单
    app.router("updateOrderTime", async (ctx, next) => {
        try {
            await db.collection(ctCollection).doc(event.id).update({
                orderTime: event.orderTime,
                orderDoctorName: event.orderDoctorName,
                orderDoctorId: event.orderDoctorId
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新到达时间
    app.router("updateArriveTime", async (ctx, next) => {
        try {
            await db.collection(ctCollection).doc(event.id).update({
                arriveTime: event.arriveTime,
                doctorId: event.doctorId,
                doctorName: event.doctorName
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新图片
    app.router("setImages", async (ctx, next) => {
        try {
            await db.collection(ctCollection).doc(event.id).update({
                images: event.images,
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
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
            await db.collection(ctCollection).doc(event.id).update({
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

    return app.serve()

};