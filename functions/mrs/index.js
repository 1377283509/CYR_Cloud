// mRS 相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const mRSCollection = "mrs"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(mRSCollection).where({
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
                const addRes = await db.collection(mRSCollection).add({
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

    // 更新结果
    app.router("updateResult", async (ctx, next) => {
        try {
            await db.collection(mRSCollection).doc(event.id).update({
                result: event.result,
                doctorId: event.doctorId,
                doctorName: event.doctorName,
                startTime: event.startTime,
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
