// 心电图相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const ecgCollection = "ecg"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取心电图
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(ecgCollection).where({
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
                const addRes = await db.collection(ecgCollection).add({
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

    // 更新doctor
    app.router("setDoctor", async (ctx, next) => {
        try {
            await db.collection(ecgCollection).doc(event.id).update({
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


    // 更新照片信息
    app.router("setImages", async (ctx, next) => {
        try {
            await db.collection(ecgCollection).doc(event.id).update({
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

    // 更新完成时间
    app.router("setEndTime", async (ctx, next) => {
        try {
            await db.collection(ecgCollection).doc(event.id).update({
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
