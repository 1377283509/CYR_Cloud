// 二线医生相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const secondDoctorCollection = "secondline-doctor"
const doctorCollection = "doctors"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(secondDoctorCollection).where({
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
                const addRes = await db.collection(secondDoctorCollection).add({
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

    // 获取二线列表
    app.router("getSecondLineDoctors", async(ctx, next) => {
        try {
            const res = await db.collection(doctorCollection).where({
                department: "神经内科",
            }).get()

            ctx.body = {
                code: 1,
                data: res.data
            }

        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新通知信息
    app.router("setNotificationTime", async (ctx, next) => {
        try {
            await db.collection(secondDoctorCollection).doc(event.id).update({
                notificationTime: event.notificationTime,
                doctorName: event.doctorName,
                doctorId: event.doctorId,
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

    // 更新到达时间
    app.router("setArriveTime", async (ctx, next) => {
        try {
            await db.collection(secondDoctorCollection).doc(event.id).update({
                arriveTime: event.arriveTime,
                secondDoctorName: event.secondDoctorName,
                secondDoctorId: event.secondDoctorId,
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
